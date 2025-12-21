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
 * Service spécialisé pour la génération de factures proforma PDF (A4)
 */
export class ProformaPdfService extends BasePdfService {
  /**
   * Générer une facture proforma PDF
   */
  public static async generateProforma(
    vente: any,
    companyInfo: CompanyInfo,
    options: PdfGenerationOptions = {}
  ): Promise<Buffer> {
    console.log('📄 [ProformaPDF] Début génération facture proforma');

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
      console.log('⚠️ [ProformaPDF] Impossible de charger le logo local logo-2.png, utilisation du logo de base');
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
      vente: {
        numeroVente: vente.numero_vente || `PROFORMA-${vente.id.substring(0, 8)}`,
        date: vente.date_creation ? new Date(vente.date_creation) : new Date(),
        client: vente.client 
          ? { 
              nom: `${vente.client.nom || ''}`.trim() || 'Client anonyme',
              adresse: vente.client.adresse || '',
              telephone: vente.client.telephone || ''
            }
          : { nom: 'Client anonyme' },
        vendeur: vente.utilisateur?.employee?.fullName || 'ZawadiCom',
        details: (vente.details || []).map((d: any) => ({
          produit: d.produit?.nom || 'Produit',
          conditionnement: d.conditionnement?.nom || '',
          quantite: d.quantite,
          prixUnitaire: d.prix_unitaire.toLocaleString('fr-FR'),
          total: d.prix_total.toLocaleString('fr-FR')
        })),
        montantTotal: vente.montant_total.toLocaleString('fr-FR'),
        currencySymbol
      }
    };

    console.log(`📝 [ProformaPDF] Proforma #${data.vente.numeroVente} - ${data.vente.details.length} articles`);

    // Générer le PDF avec la configuration "proforma" (A4)
    return this.generatePdf('proforma', data, 'proforma', options);
  }
}
