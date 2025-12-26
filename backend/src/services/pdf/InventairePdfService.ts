import { BasePdfService, PdfGenerationOptions } from './BasePdfService.js';
import { getCurrencyByCode, getCurrencyByCountry } from '../../utils/countryCurrency.js';
import fs from 'fs/promises';
import path from 'path';

interface CompanyInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  currency?: string;
  country?: string;
}

/**
 * Service spécialisé pour la génération de rapports d'inventaire PDF (A4)
 */
export class InventairePdfService extends BasePdfService {
  /**
   * Générer un rapport d'inventaire PDF
   */
  public static async generateInventaire(
    inventaire: any,
    companyInfo: CompanyInfo,
    options: PdfGenerationOptions = {}
  ): Promise<Buffer> {
    console.log(`📄 [InventairePDF] Début génération rapport pour l'inventaire ${inventaire.numero}`);

    // Déterminer la devise
    const currency = companyInfo.currency 
      ? getCurrencyByCode(companyInfo.currency) 
      : getCurrencyByCountry(companyInfo.country || 'Comoros');
    
    const currencySymbol = currency?.symbol || 'KMF';

    // Charger le logo en Base64 si disponible localement
    let logoBase64 = companyInfo.logo;
    try {
      const logoPath = path.join(process.cwd(), 'templates', 'logo', 'logo-2.png');
      const logoBuffer = await fs.readFile(logoPath);
      const extension = path.extname(logoPath).substring(1);
      logoBase64 = `data:image/${extension};base64,${logoBuffer.toString('base64')}`;
    } catch (error) {
      console.log('⚠️ [InventairePDF] Impossible de charger le logo local logo-2.png');
    }

    // Préparer les données pour le template
    const data = {
      company: {
        name: companyInfo.name,
        address: companyInfo.address || '',
        phone: companyInfo.phone || '',
        email: companyInfo.email || '',
        logo: logoBase64,
        currencySymbol
      },
      inventaire: {
        numero: inventaire.numero,
        magasin: inventaire.magasin?.nom || 'Magasin inconnu',
        statut: inventaire.statut,
        dateCreation: inventaire.date_creation,
        dateDebut: inventaire.date_debut,
        dateFin: inventaire.date_fin,
        dateValidation: inventaire.date_validation,
        commentaire: inventaire.commentaire,
        utilisateurDebut: inventaire.utilisateur_debut?.employee?.fullName || inventaire.utilisateur_debut?.email || 'N/A',
        utilisateurValidation: inventaire.utilisateur_validation?.employee?.fullName || inventaire.utilisateur_validation?.email || 'N/A',
        stats: {
            totalProduits: inventaire.stats?.total_produits || 0,
            produitsComptes: inventaire.stats?.produits_comptes || 0,
            ecartTotal: inventaire.stats?.ecart_total || 0,
            valeurEcartPositif: (inventaire.stats?.valeur_ecart_positif || 0).toLocaleString('fr-FR'),
            valeurEcartNegatif: (inventaire.stats?.valeur_ecart_negatif || 0).toLocaleString('fr-FR'),
            valeurEcartNette: ((inventaire.stats?.valeur_ecart_positif || 0) + (inventaire.stats?.valeur_ecart_negatif || 0)).toLocaleString('fr-FR')
        },
        details: (inventaire.details || []).map((d: any) => ({
          produit: d.produit?.nom || 'Produit',
          codeBarre: d.produit?.code_barre || '',
          unite: d.produit?.unite?.nom || '',
          lot: d.lot?.numero_lot || '',
          quantiteTheorique: d.quantite_theorique,
          quantiteComptee: d.est_compte ? d.quantite_comptee : 'Non compté',
          ecart: d.est_compte ? d.ecart : '-',
          valeurEcart: d.est_compte ? (d.valeur_ecart || 0).toLocaleString('fr-FR') : '-',
          statusClass: d.ecart > 0 ? 'text-success' : (d.ecart < 0 ? 'text-danger' : '')
        }))
      },
      currencySymbol
    };

    console.log(`📝 [InventairePDF] Rapport #${inventaire.numero} - ${data.inventaire.details.length} lignes`);

    // Générer le PDF avec la configuration "inventaire" (A4)
    return this.generatePdf('inventaire', data, 'inventaire', options);
  }
}
