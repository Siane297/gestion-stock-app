import { Request, Response } from 'express';
import { ReceiptPdfService } from '../services/pdf/ReceiptPdfService.js';
import { ProformaPdfService } from '../services/pdf/ProformaPdfService.js';
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
}
