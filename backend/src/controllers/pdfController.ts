import { Request, Response } from 'express';
import { EmployeePdfService } from '../services/pdf/EmployeePdfService.js';
import { AttendancePdfService } from '../services/pdf/AttendancePdfService.js'; 
import { BilanPdfService } from '../services/pdf/BilanPdfService.js';
import { UserPdfService } from '../services/pdf/UserPdfService.js';
import { CongePdfService } from '../services/pdf/CongePdfService.js';
import { ReceiptPdfService } from '../services/pdf/ReceiptPdfService.js';
import { ProformaPdfService } from '../services/pdf/ProformaPdfService.js';
import { prismaPublic } from '../services/tenantService.js';

/**
 * Contrôleur pour la génération de PDF tenant-aware et sécurisé
 */
export class PdfController {
  
  /**
   * Générer PDF de la liste des employés du tenant
   */
  public static async generateEmployeesPdf(req: Request, res: Response): Promise<void> {
    try {
      console.log('📄 [PDF-Controller] Début génération PDF employés');
      
      // Vérifier que tenantPrisma est disponible (middleware tenant requis)
      if (!req.tenantPrisma) {
        res.status(400).json({
          success: false,
          message: 'Contexte tenant manquant. Middleware tenant requis.',
        });
        return;
      }

      // Extraire l'utilisateur depuis le token JWT (middleware auth requis)
      const userId = req.user?.userId;
      const userEmail = req.user?.email;
      const companyId = req.user?.companyId;

      if (!userId || !companyId) {
        res.status(401).json({
          success: false,
          message: 'Authentification requise pour générer le PDF.',
        });
        return;
      }

      console.log(`🏢 [PDF-Controller] Génération pour tenant: ${companyId}, User: ${userEmail}`);

      // Récupérer les informations de l'entreprise avec timeout (schéma public)
      const companyPromise = prismaPublic.company.findUnique({
        where: { id: companyId },
        select: {
          name: true,
          country: true,
          emailOrganisation: true,
          telephoneOrganisation: true,
          address: true,
          logo: true,
          pdfHeader: true,
        },
      });

      // Récupérer les employés du tenant avec timeout
      const employeesPromise = req.tenantPrisma.employee.findMany({
        include: {
          department: {
            select: { name: true },
          },
          position: {
            select: { name: true },
          },
        },
        orderBy: [
          { isActive: 'desc' }, // Actifs en premier
          { fullName: 'asc' },  // Puis par nom
        ],
      });

      // Exécuter les requêtes en parallèle avec timeout
      const [company, employees] = await Promise.all([
        Promise.race([
          companyPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: Récupération entreprise')), 10000)
          ),
        ]) as Promise<any>,
        Promise.race([
          employeesPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: Récupération employés')), 15000)
          ),
        ]) as Promise<any[]>,
      ]);

      console.log(`👥 [PDF-Controller] ${employees.length} employés trouvés pour génération PDF`);

      if (employees.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Aucun employé trouvé pour générer le PDF.',
        });
        return;
      }

      // Préparer les informations de l'entreprise
      const companyInfo = {
        name: company?.name || 'Entreprise',
        country: company?.country || 'France',
        email: company?.emailOrganisation,
        phone: company?.telephoneOrganisation,
        address: company?.address,
        logo: company?.logo,
        pdfHeader: company?.pdfHeader,
      };

      // Générer le PDF avec les données récupérées (format paysage)
      const pdfBuffer = await EmployeePdfService.generateEmployeesList(
        employees,
        companyInfo,
        { tenantId: companyId, userId }
      );

      // Configuration des headers pour téléchargement sécurisé
      const filename = `Liste-des-Employes-${companyInfo.name.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Headers de sécurité additionnels
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Log d'audit pour traçabilité
      console.log(`✅ [AUDIT] PDF Employés généré - User: ${userEmail}, Tenant: ${companyId}, File: ${filename}`);

      // Envoyer le PDF
      res.end(pdfBuffer);

    } catch (error) {
      console.error('❌ [PDF-Controller] Erreur génération PDF employés:', error);
      
      // Réponse d'erreur sécurisée (ne pas exposer les détails techniques)
      const isTimeoutError = error instanceof Error && error.message.includes('Timeout');
      const errorMessage = isTimeoutError 
        ? 'La génération du PDF a pris trop de temps. Veuillez réessayer.'
        : 'Erreur lors de la génération du PDF. Veuillez contacter le support.';

      res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  /**
   * Générer PDF de l'historique des pointages (exemple pour réutilisabilité)
   */
  public static async generateAttendancesPdf(req: Request, res: Response): Promise<void> {
    try {
      console.log('📄 [PDF-Controller] Début génération PDF pointages');
      
      if (!req.tenantPrisma) {
        res.status(400).json({
          success: false,
          message: 'Contexte tenant manquant.',
        });
        return;
      }

      const userId = req.user?.userId;
      const companyId = req.user?.companyId;

      if (!userId || !companyId) {
        res.status(401).json({
          success: false,
          message: 'Authentification requise.',
        });
        return;
      }

      // TODO: Implémenter la génération PDF pour les pointages
      // Exemple de structure pour réutilisabilité :
      // 1. Récupérer les données (attendances + company)
      // 2. Préparer les données pour le template
      // 3. Appeler AttendancePdfService.generateAttendanceList avec format PORTRAIT
      // 4. Retourner le PDF

      res.status(501).json({
        success: false,
        message: 'Génération PDF pointages - À implémenter',
      });

    } catch (error) {
      console.error('❌ [PDF-Controller] Erreur génération PDF pointages:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération du PDF pointages.',
      });
    }
  }

  /**
   * Générer PDF des utilisateurs du tenant (exemple pour réutilisabilité)
   */
  public static async generateUsersPdf(req: Request, res: Response): Promise<void> {
    console.log('📄 [PDF-Controller] Début génération PDF utilisateurs');
    console.log('🌍 [PDF-Controller] Environnement:', process.env.NODE_ENV);
    console.log('🖥️  [PDF-Controller] Plateforme:', process.platform);
    console.log('🎯 [PDF-Controller] Render:', process.env.RENDER ? 'Oui' : 'Non');

    try { 
      if (!req.tenantPrisma) {
        res.status(400).json({
          success: false,
          message: 'Contexte tenant manquant.',
        });
        return;
      }

      const userId = req.user?.userId;
      const companyId = req.user?.companyId;

      if (!userId || !companyId) {
        res.status(401).json({
          success: false,
          message: 'Authentification requise.',
        });
        return;
      }

      // Récupération des données (parallèle pour optimiser)
      const [users, company] = await Promise.all([
        req.tenantPrisma.tenantUser.findMany({
          include: {
            employee: {
              select: {
                fullName: true,
                matricule: true
              }
            }
          },
          orderBy: { email: 'asc' }
        }),
        prismaPublic.company.findUnique({
          where: { id: companyId },
          select: {
            name: true,
            country: true,
            emailOrganisation: true,
            telephoneOrganisation: true,
            address: true,
            logo: true,
            pdfHeader: true
          }
        })
      ]);

      // Préparer les informations de l'entreprise
      const companyInfo = {
        name: company?.name || 'Entreprise',
        country: company?.country || 'France',
        email: company?.emailOrganisation,
        phone: company?.telephoneOrganisation,
        address: company?.address,
        logo: company?.logo,
        pdfHeader: company?.pdfHeader,
      };

      // Générer le PDF avec le service spécialisé (format portrait)
      const pdfBuffer = await UserPdfService.generateUsersList(
        users,
        companyInfo,
        { tenantId: companyId, userId }
      );

      // Configuration des headers pour téléchargement sécurisé
      const filename = `Liste-des-Utilisateurs-${companyInfo.name.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Headers de sécurité additionnels
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Envoyer le PDF
      res.send(pdfBuffer);
      
      console.log('✅ [PDF-Controller] PDF utilisateurs généré avec succès');

    } catch (error) {
      console.error('❌ [PDF-Controller] Erreur génération PDF utilisateurs:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération du PDF utilisateurs.',
      });
    }
  }

  /**
   * Générer un PDF de la liste des pointages
   */
  public static async generateAttendancePdf(req: Request, res: Response): Promise<void> {
    try {
      console.log('📄 [PDF-Controller] Début génération PDF pointages');
      
      if (!req.tenantPrisma) {
        res.status(400).json({
          success: false,
          message: 'Contexte tenant manquant.',
        });
        return;
      }

      const userId = req.user?.userId;
      const companyId = req.user?.companyId;

      if (!userId || !companyId) {
        res.status(401).json({
          success: false,
          message: 'Authentification requise.',
        });
        return;
      }

      // Récupération des données avec timeout
      const [attendances, company] = await Promise.all([
        Promise.race([
          req.tenantPrisma.attendance.findMany({
            include: {
              employee: {
                select: {
                  fullName: true,
                  phoneNumber: true,
                  matricule: true
                }
              }
            },
            orderBy: { heurePointage: 'desc' }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: recherche pointages')), 15000)
          )
        ]) as Promise<any[]>,
        
        Promise.race([
          prismaPublic.company.findUnique({
            where: { id: companyId },
            select: {
              name: true,
              country: true,
              emailOrganisation: true,
              telephoneOrganisation: true,
              address: true,
              logo: true,
              pdfHeader: true
            }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: recherche entreprise')), 10000)
          )
        ]) as Promise<any>
      ]);

      if (!attendances) {
        res.status(404).json({
          success: false,
          message: 'Aucun pointage trouvé.',
        });
        return;
      }

      // Préparer les informations de l'entreprise
      const companyInfo = {
        name: company?.name || 'Entreprise',
        country: company?.country || 'France',
        email: company?.emailOrganisation,
        phone: company?.telephoneOrganisation,
        address: company?.address,
        logo: company?.logo,
        pdfHeader: company?.pdfHeader,
      };

      // Mapper les données au format attendu par le service
      const formattedAttendances = attendances.map(att => ({
        id: att.id,
        employee: {
          fullName: att.employee?.fullName || 'Inconnu',
          phoneNumber: att.employee?.phoneNumber || null,
          matricule: att.employee?.matricule || null
        },
        type: att.type as 'ENTREE' | 'SORTIE',
        heurePointage: new Date(att.heurePointage),
        location: att.location || null,
        notes: att.notes || null
      }));

      // Générer le PDF avec le service spécialisé
      const pdfBuffer = await AttendancePdfService.generateAttendanceList(
        formattedAttendances,
        companyInfo,
        { tenantId: companyId, userId }
      );

      // Configuration des headers pour téléchargement sécurisé
      const date = new Date().toISOString().split('T')[0];
      const filename = `Rapport-Pointage-${companyInfo.name.replace(/[^a-zA-Z0-9]/g, '-')}-${date}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Headers de sécurité additionnels
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Envoyer le PDF
      res.send(pdfBuffer);
      
      console.log('✅ [PDF-Controller] PDF pointages généré avec succès');

    } catch (error) {
      console.error('❌ [PDF-Controller] Erreur génération PDF pointages:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération du PDF pointages.',
      });
    }
  }

  /**
   * Générer un PDF de la liste des bilans de présence
   */
  public static async generateBilanPdf(req: Request, res: Response): Promise<void> {
    try {
      console.log('📄 [PDF-Controller] Début génération PDF bilans');
      
      if (!req.tenantPrisma) {
        res.status(400).json({
          success: false,
          message: 'Contexte tenant manquant.',
        });
        return;
      }

      const userId = req.user?.userId;
      const companyId = req.user?.companyId;

      if (!userId || !companyId) {
        res.status(401).json({
          success: false,
          message: 'Authentification requise.',
        });
        return;
      }

      // Récupération des données avec timeout
      const [bilans, company] = await Promise.all([
        Promise.race([
          req.tenantPrisma.bilanPresence.findMany({
            include: {
              employee: {
                select: {
                  matricule: true,
                  fullName: true,
                  department: true,
                  position: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: recherche bilans')), 15000)
          )
        ]) as Promise<any[]>,
        
        Promise.race([
          prismaPublic.company.findUnique({
            where: { id: companyId },
            select: {
              name: true,
              country: true,
              emailOrganisation: true,
              telephoneOrganisation: true,
              address: true,
              logo: true,
              pdfHeader: true
            }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: recherche entreprise')), 10000)
          )
        ]) as Promise<any>
      ]);

      if (!bilans) {
        res.status(404).json({
          success: false,
          message: 'Aucun bilan trouvé.',
        });
        return;
      }

      // Préparer les informations de l'entreprise
      const companyInfo = {
        name: company?.name || 'Entreprise',
        country: company?.country || 'France',
        email: company?.emailOrganisation,
        phone: company?.telephoneOrganisation,
        address: company?.address,
        logo: company?.logo,
        pdfHeader: company?.pdfHeader,
      };

      // Mapper les données au format attendu par le service
      const formattedBilans = bilans.map(bilan => ({
        id: bilan.id,
        date: bilan.createdAt,
        employe: {
          matricule: bilan.employee?.matricule || 'N/A',
          fullName: bilan.employee?.fullName || 'Inconnu',
          department: bilan.employee?.department || 'N/A',
          position: bilan.employee?.position || 'N/A'
        },
        statut: bilan.statut as 'A_L_HEURE' | 'EN_RETARD' | 'ABSENT' | 'INCOMPLET',
        heureEntree: bilan.heureEntree,
        heureSortie: bilan.heureSortie,
        dureeTravailMinutes: bilan.dureeTravailMinutes || 0,
        retardMinutes: bilan.retardMinutes || 0,
        notes: bilan.notes
      }));

      // Générer le PDF avec le service spécialisé
      const pdfBuffer = await BilanPdfService.generateBilanList(
        formattedBilans,
        companyInfo,
        { tenantId: companyId, userId }
      );

      // Configuration des headers pour téléchargement sécurisé
      const date = new Date().toISOString().split('T')[0];
      const filename = `Bilan-Presence-${companyInfo.name.replace(/[^a-zA-Z0-9]/g, '-')}-${date}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Headers de sécurité additionnels
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Envoyer le PDF
      res.send(pdfBuffer);
      
      console.log('✅ [PDF-Controller] PDF bilans généré avec succès');

    } catch (error) {
      console.error('❌ [PDF-Controller] Erreur génération PDF bilans:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération du PDF bilans.',
      });
    }
  }

  /**
   * Générer PDF de la liste des congés
   */
  public static async generateCongesPdf(req: Request, res: Response): Promise<void> {
    try {
      console.log('📄 [PDF-Controller] Début génération PDF congés');
      
      if (!req.tenantPrisma) {
        res.status(400).json({
          success: false,
          message: 'Contexte tenant manquant.',
        });
        return;
      }

      const userId = req.user?.userId;
      const companyId = req.user?.companyId;

      if (!userId || !companyId) {
        res.status(401).json({
          success: false,
          message: 'Authentification requise pour générer le PDF.',
        });
        return;
      }

      console.log(`🏢 [PDF-Controller] Génération pour tenant: ${companyId}`);

      // Récupérer les informations de l'entreprise
      const companyPromise = prismaPublic.company.findUnique({
        where: { id: companyId },
        select: {
          name: true,
          country: true,
          emailOrganisation: true,
          telephoneOrganisation: true,
          address: true,
          logo: true,
          pdfHeader: true,
        },
      });

      // Récupérer les congés avec relations
      const congesPromise = req.tenantPrisma.conge.findMany({
        include: {
          employe: {
            select: {
              matricule: true,
              fullName: true,
            },
          },
          typeConge: {
            select: {
              nom: true,
              couleur: true,
            },
          },
        },
        orderBy: [
          { dateDebut: 'desc' },
        ],
      });

      const [company, conges] = await Promise.all([
        Promise.race([
          companyPromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout: Récupération entreprise')), 10000)
          ),
        ]) as Promise<any>,
        Promise.race([
          congesPromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout: Récupération congés')), 15000)
          ),
        ]) as Promise<any[]>,
      ]);

      console.log(`📅 [PDF-Controller] ${conges.length} congés trouvés pour génération PDF`);

      if (conges.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Aucun congé trouvé pour générer le PDF.',
        });
        return;
      }

      const companyInfo = {
        name: company?.name || 'Entreprise',
        country: company?.country || 'France',
        email: company?.emailOrganisation,
        phone: company?.telephoneOrganisation,
        address: company?.address,
        logo: company?.logo,
        pdfHeader: company?.pdfHeader,
      };

      const pdfBuffer = await CongePdfService.generateCongeList(
        conges,
        companyInfo,
        { tenantId: companyId, userId }
      );

      const filename = `Liste-des-Conges-${companyInfo.name.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      console.log(`✅ [AUDIT] PDF Congés généré - User: ${userId}, Tenant: ${companyId}, File: ${filename}`);

      res.send(pdfBuffer);

    } catch (error) {
      console.error('❌ [PDF-Controller] Erreur génération PDF congés:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération du PDF.',
      });
    }
  }

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

      const filename = `Ticket-${vente.numero_vente || vente.id.substring(0, 8)}.pdf`;
      
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

      const filename = `Proforma-${vente.numero_vente || vente.id.substring(0, 8)}.pdf`;
      
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
