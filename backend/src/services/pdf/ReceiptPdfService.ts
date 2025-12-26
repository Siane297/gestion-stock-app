import { BasePdfService, PdfGenerationOptions } from './BasePdfService.js';
import { getCurrencyByCode, getCurrencyByCountry } from '../../utils/countryCurrency.js';

interface CompanyInfo {
  name: string;
  address?: string;
  phone?: string;
  logo?: string;
  currency?: string;
  country?: string;
}

/**
 * Service spécialisé pour la génération de tickets de caisse PDF
 */
export class ReceiptPdfService extends BasePdfService {
  /**
   * Générer un ticket de caisse PDF
   */
  public static async generateReceipt(
    vente: any,
    companyInfo: CompanyInfo,
    options: PdfGenerationOptions = {}
  ): Promise<Buffer> {
    console.log('🧾 [ReceiptPDF] Début génération ticket de caisse');

    // Déterminer la devise
    const currency = companyInfo.currency 
      ? getCurrencyByCode(companyInfo.currency) 
      : getCurrencyByCountry(companyInfo.country || 'Comoros');
    
    const currencySymbol = currency?.symbol || 'KMF';

    // Préparer les données pour le template
    const data = {
      company: {
        name: companyInfo.name,
        address: companyInfo.address || '',
        phone: companyInfo.phone || '',
        logo: companyInfo.logo || '',
        currencySymbol
      },
      vente: {
        numeroVente: (() => {
          const segments = (vente.numero_vente || '').split('-');
          const sequence = segments[segments.length - 1] || vente.id.substring(0, 8);
          return `TC-${sequence}`;
        })(),
        date: vente.date_creation ? new Date(vente.date_creation) : new Date(),
        client: vente.client 
          ? { 
              nom: `${vente.client.nom || ''}`.trim() || 'Client anonyme'
            }
          : { nom: 'Client anonyme' },
        vendeur: vente.utilisateur?.employee?.fullName || 'Caisse',
        magasin: vente.magasin?.nom || 'N/A',
        details: (vente.details || []).map((d: any) => ({
          produit: d.produit?.nom || 'Produit',
          conditionnement: d.conditionnement?.nom || '',
          quantite: d.quantite,
          prixUnitaire: d.prix_unitaire.toFixed(2),
          total: d.prix_total.toFixed(2)
        })),
        montantTotal: vente.montant_total.toFixed(2),
        montantPaye: vente.montant_paye?.toFixed(2) || vente.montant_total.toFixed(2),
        rendu: vente.montant_rendu?.toFixed(2) || '0.00',
        modePaiement: this.formatModePaiement(vente.methode_paiement),
        currencySymbol
      }
    };

    console.log(`📝 [ReceiptPDF] Ticket #${data.vente.numeroVente} - ${data.vente.details.length} articles`);

    // Générer le PDF avec la configuration "receipt"
    return this.generatePdf('receipt', data, 'receipt', options);
  }

  /**
   * Formater le mode de paiement pour affichage
   */
  private static formatModePaiement(mode: string): string {
    const modes: Record<string, string> = {
      'ESPECES': 'Espèces',
      'CARTE': 'Carte Bancaire',
      'MOBILE_MONEY': 'Mobile Money',
      'MOBILE': 'Mobile Money',
      'CHEQUE': 'Chèque',
      'VIREMENT': 'Virement',
      'CREDIT': 'À crédit',
      'AUTRE': 'Autre'
    };
    return modes[mode] || mode;
  }
}
