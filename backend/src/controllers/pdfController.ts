import { Request, Response } from 'express';
import { ReceiptPdfService } from '../services/pdf/ReceiptPdfService.js';
import { ProformaPdfService } from '../services/pdf/ProformaPdfService.js';
import { InventairePdfService } from '../services/pdf/InventairePdfService.js';
import { CaissePdfService } from '../services/pdf/CaissePdfService.js';
import { CaisseService } from '../services/caisseService.js';
import { prismaPublic } from '../services/tenantService.js';

/**
 * Contrôleur pour la génération de PDF tenant-aware et sécurisé
 */
export class PdfController {
  
  /**
   * Générer le ticket de caisse PDF pour une vente
   */
  public static async generateReceiptPdf(req: Request, res: Response): Promise<void> {
    try {
      console.log('📄 [PDF-Controller] Début génération ticket de caisse');
      
      if (!req.tenantPrisma) {
        res.status(400).json({ 
          success: false, 
          message: 'Contexte tenant manquant.' 
        });
        return;
      }

      const venteId = req.params.id;
      const userId = req.user?.userId;
      const companyId = req.user?.companyId;

      if (!userId || !companyId) {
        res.status(401).json({ 
          success: false, 
          message: 'Authentification requise.' 
        });
        return;
      }

      console.log(`🧾 [PDF-Controller] Génération ticket pour vente: ${venteId}`);

      // Récupérer vente + relations
      const [vente, company] = await Promise.all([
        Promise.race([
          req.tenantPrisma.vente.findUnique({
            where: { id: venteId },
            include: {
              details: { 
                include: { 
                  produit: { select: { nom: true } },
                  conditionnement: { select: { nom: true } }
                } 
              },
              client: { select: { nom: true } },
              magasin: { select: { nom: true } },
              utilisateur: { 
                include: { 
                  employee: { select: { fullName: true } } 
                } 
              }
            }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: Récupération vente')), 10000)
          )
        ]) as Promise<any>,
        
        Promise.race([
          prismaPublic.company.findUnique({
            where: { id: companyId },
            select: { 
              name: true, 
              address: true, 
              telephoneOrganisation: true, 
              logo: true,
              currency: true,
              country: true
            }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: Récupération entreprise')), 10000)
          )
        ]) as Promise<any>
      ]);

      if (!vente) {
        res.status(404).json({ 
          success: false, 
          message: 'Vente non trouvée.' 
        });
        return;
      }

      const companyInfo = {
        name: company?.name || 'Entreprise',
        address: company?.address,
        phone: company?.telephoneOrganisation,
        logo: company?.logo,
        currency: company?.currency,
        country: company?.country || 'Comoros'
      };

      // Générer le PDF
      const pdfBuffer = await ReceiptPdfService.generateReceipt(
        vente, 
        companyInfo, 
        { tenantId: companyId, userId }
      );

      const segments = (vente.numero_vente || '').split('-');
      const sequence = segments[segments.length - 1] || vente.id.substring(0, 8);
      const filename = `Ticket-${sequence}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      res.send(pdfBuffer);
      console.log(`✅ [PDF-Controller] Ticket généré: ${filename}`);

    } catch (error) {
      console.error('❌ [PDF-Controller] Erreur génération ticket:', error);
      const isTimeoutError = error instanceof Error && error.message.includes('Timeout');
      const errorMessage = isTimeoutError 
        ? 'La génération du ticket a pris trop de temps. Veuillez réessayer.'
        : 'Erreur lors de la génération du ticket.';
      
      res.status(500).json({ 
        success: false, 
        message: errorMessage 
      });
    }
  }

  /**
   * Générer une facture proforma PDF pour une vente
   */
  public static async generateProformaPdf(req: Request, res: Response): Promise<void> {
    try {
      console.log('📄 [PDF-Controller] Début génération facture proforma');
      
      if (!req.tenantPrisma) {
        res.status(400).json({ success: false, message: 'Contexte tenant manquant.' });
        return;
      }

      const venteId = req.params.id;
      const userId = req.user?.userId;
      const companyId = req.user?.companyId;

      if (!userId || !companyId) {
        res.status(401).json({ success: false, message: 'Authentification requise.' });
        return;
      }

      // Récupérer vente + relations
      const [vente, company] = await Promise.all([
        req.tenantPrisma.vente.findUnique({
          where: { id: venteId },
          include: {
            details: { 
              include: { 
                produit: { select: { nom: true } },
                conditionnement: { select: { nom: true } }
              } 
            },
            client: { select: { nom: true, telephone: true, adresse: true } },
            magasin: { select: { nom: true } },
            utilisateur: { 
              include: { 
                employee: { select: { fullName: true } } 
              } 
            }
          }
        }),
        prismaPublic.company.findUnique({
          where: { id: companyId },
          select: { 
            name: true, 
            address: true, 
            telephoneOrganisation: true, 
            emailOrganisation: true,
            logo: true,
            currency: true,
            country: true
          }
        })
      ]);

      if (!vente) {
        res.status(404).json({ success: false, message: 'Vente non trouvée.' });
        return;
      }

      const companyInfo = {
        name: company?.name || 'Entreprise',
        address: company?.address || undefined,
        phone: company?.telephoneOrganisation || undefined,
        email: company?.emailOrganisation || undefined,
        logo: company?.logo || undefined,
        currency: company?.currency || undefined,
        country: company?.country || 'Comoros'
      };

      // Générer le PDF
      const pdfBuffer = await ProformaPdfService.generateProforma(
        vente, 
        companyInfo, 
        { tenantId: companyId, userId }
      );

      const segments = (vente.numero_vente || '').split('-');
      const sequence = segments[segments.length - 1] || vente.id.substring(0, 8);
      const filename = `Facture-${sequence}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);

      console.log(`✅ [PDF-Controller] Proforma générée: ${filename}`);

    } catch (error) {
      console.error('❌ [PDF-Controller] Erreur génération proforma:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la génération de la proforma.' 
      });
    }
  }

  /**
   * Générer un rapport d'inventaire PDF
   */
  public static async generateInventairePdf(req: Request, res: Response): Promise<void> {
    try {
      console.log('📄 [PDF-Controller] Début génération rapport inventaire');
      
      if (!req.tenantPrisma) {
        res.status(400).json({ success: false, message: 'Contexte tenant manquant.' });
        return;
      }

      const inventaireId = req.params.id;
      const userId = req.user?.userId;
      const companyId = req.user?.companyId;

      if (!userId || !companyId) {
        res.status(401).json({ success: false, message: 'Authentification requise.' });
        return;
      }

      // Récupérer inventaire + relations
      const [inventaire, company] = await Promise.all([
        req.tenantPrisma.inventaire.findUnique({
          where: { id: inventaireId },
          include: {
            magasin: { select: { nom: true } },
            utilisateur_debut: { include: { employee: { select: { fullName: true } } } },
            utilisateur_validation: { include: { employee: { select: { fullName: true } } } },
            details: {
              include: {
                produit: {
                  include: { unite: { select: { nom: true } } }
                },
                lot: { select: { numero_lot: true } }
              }
            }
          }
        }),
        prismaPublic.company.findUnique({
          where: { id: companyId },
          select: { 
            name: true, 
            address: true, 
            telephoneOrganisation: true, 
            emailOrganisation: true,
            logo: true,
            currency: true,
            country: true
          }
        })
      ]);

      if (!inventaire) {
        res.status(404).json({ success: false, message: 'Inventaire non trouvé.' });
        return;
      }

      // Calculer les stats si nécessaire (normalement déjà calculées par le service inventaire avant validation)
      // Mais on prépare un objet stats propre
      const stats = {
          total_produits: inventaire.details.length,
          produits_comptes: inventaire.details.filter((d: any) => d.est_compte).length,
          ecart_total: inventaire.details.reduce((acc: number, d: any) => acc + (d.ecart || 0), 0),
          valeur_ecart_positif: inventaire.details.filter((d: any) => (d.ecart || 0) > 0).reduce((acc: number, d: any) => acc + (d.valeur_ecart || 0), 0),
          valeur_ecart_negatif: inventaire.details.filter((d: any) => (d.ecart || 0) < 0).reduce((acc: number, d: any) => acc + (d.valeur_ecart || 0), 0)
      };

      const companyInfo = {
        name: company?.name || 'Entreprise',
        address: company?.address || undefined,
        phone: company?.telephoneOrganisation || undefined,
        email: company?.emailOrganisation || undefined,
        logo: company?.logo || undefined,
        currency: company?.currency || undefined,
        country: company?.country || 'Comoros'
      };

      // Générer le PDF
      const pdfBuffer = await InventairePdfService.generateInventaire(
        { ...inventaire, stats }, 
        companyInfo, 
        { tenantId: companyId, userId }
      );

      const filename = `Inventaire-${inventaire.numero}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);

      console.log(`✅ [PDF-Controller] Rapport inventaire généré: ${filename}`);

    } catch (error) {
      console.error('❌ [PDF-Controller] Erreur génération rapport inventaire:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la génération du rapport inventaire.' 
      });
    }
  }

  /**
   * Générer un rapport de session de caisse PDF
   */
  public static async generateSessionPdf(req: Request, res: Response): Promise<void> {
    try {
      console.log('📄 [PDF-Controller] Début génération rapport session');
      
      if (!req.tenantPrisma) {
        res.status(400).json({ success: false, message: 'Contexte tenant manquant.' });
        return;
      }

      const sessionId = req.params.id;
      const userId = req.user?.userId;
      const companyId = req.user?.companyId;

      if (!sessionId) {
        res.status(400).json({ success: false, message: 'ID de session manquant.' });
        return;
      }

      if (!userId || !companyId) {
        res.status(401).json({ success: false, message: 'Authentification requise.' });
        return;
      }

      // 1. Récupérer le rapport de session via CaisseService
      const caisseService = new CaisseService(req.tenantPrisma);
      const rapport = await caisseService.getSessionDetail(sessionId as string);

      // 2. Récupérer les informations de l'entreprise
      const company = await prismaPublic.company.findUnique({
        where: { id: companyId },
        select: { 
          name: true, 
          address: true, 
          telephoneOrganisation: true, 
          emailOrganisation: true,
          logo: true,
          currency: true,
          country: true
        }
      });

      const companyInfo = {
        name: company?.name || 'Entreprise',
        address: company?.address || undefined,
        phone: company?.telephoneOrganisation || undefined,
        email: company?.emailOrganisation || undefined,
        logo: company?.logo || undefined,
        currencySymbol: company?.currency || 'FC', // On s'assure d'avoir un symbole par défaut
        country: company?.country || 'Comoros'
      };

      // 3. Générer le PDF
      const pdfBuffer = await CaissePdfService.generateSessionReport(
        rapport, 
        companyInfo
      );

      const filename = `Session-Caisse-${rapport.caisse.code}-${new Date(rapport.date_ouverture).toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);

      console.log(`✅ [PDF-Controller] Rapport session généré: ${filename}`);

    } catch (error: any) {
      console.error('❌ [PDF-Controller] Erreur génération rapport session:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la génération du rapport de session: ' + (error.message || '')
      });
    }
  }
}
