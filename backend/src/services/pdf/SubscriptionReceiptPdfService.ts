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
}

interface OrganizationInfo {
  name: string;
  email?: string;
  phone?: string;
  country?: string;
}

interface PaymentInfo {
  id: string;
  numero: string;
  amount: number;
  durationMonths: number;
  date: Date | string;
  startDate: Date | string;
  endDate: Date | string;
  currency: string;
}

/**
 * Service spécialisé pour la génération de reçus d'abonnement PDF
 */
export class SubscriptionReceiptPdfService extends BasePdfService {
  /**
   * Générer un reçu d'abonnement PDF
   */
  public static async generateReceipt(
    payment: PaymentInfo,
    organization: OrganizationInfo,
    company: CompanyInfo,
    options: PdfGenerationOptions = {}
  ): Promise<Buffer> {
    console.log(`🧾 [SubscriptionPDF] Génération reçu #${payment.numero}`);

    // Déterminer la devise
    const currency = getCurrencyByCode(payment.currency) || getCurrencyByCountry(organization.country || 'Comoros');
    const currencySymbol = currency?.symbol || 'KMF';

    // Charger le logo en Base64 si disponible localement
    let logoBase64 = company.logo;
    try {
      const logoPath = path.join(process.cwd(), 'templates', 'logo', 'logo-2.png');
      const logoBuffer = await fs.readFile(logoPath);
      const extension = path.extname(logoPath).substring(1);
      logoBase64 = `data:image/${extension};base64,${logoBuffer.toString('base64')}`;
    } catch (error) {
      console.log('⚠️ [SubscriptionPDF] Impossible de charger le logo local logo-2.png');
    }

    // Préparer les données pour le template
    const data = {
      company: {
        ...company,
        logo: logoBase64,
        currencySymbol
      },
      organization,
      payment: {
        ...payment,
        amount: payment.amount.toLocaleString('fr-FR'),
        method: 'Virement / Paiement Direct',
        currencySymbol
      }
    };

    // Générer le PDF avec la configuration "subscription-receipt"
    return this.generatePdf('subscription-receipt', data, 'subscription-receipt', options);
  }
}
