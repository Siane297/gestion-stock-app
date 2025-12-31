import { BasePdfService } from './BasePdfService.js';
import { RapportSessionDto } from '../caisseService.js';
import { logger } from '../../config/logger.js';
import { getCurrencyByCode, getCurrencyByCountry } from '../../utils/countryCurrency.js';
import fs from 'fs/promises';
import path from 'path';

export class CaissePdfService extends BasePdfService {
  /**
   * Génère le PDF du rapport de session de caisse
   */
  public static async generateSessionReport(
    rapport: RapportSessionDto,
    companyInfo: any
  ): Promise<Buffer> {
    try {
      // Déterminer la devise (même logique que ProformaPdfService)
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
        // Fallback discret
      }

      const data = {
        title: "Rapport de Session de Caisse",
        generationDate: new Date(), // Renommé pour éviter les conflits
        company: {
          ...companyInfo,
          logo: logoBase64,
          currencySymbol: currencySymbol // S'assurer du nom exact attendu par le template
        },
        rapport: {
          ...rapport,
          date_ouverture_fmt: this.formatDateTime(rapport.date_ouverture),
          date_fermeture_fmt: rapport.date_fermeture ? this.formatDateTime(rapport.date_fermeture) : 'En cours',
          statut_label: rapport.statut === 'OUVERTE' ? 'OUVERTE' : 'CLÔTURÉE',
          // Préparation des totaux pour l'affichage
          paiements: [
            { label: 'Espèces', montant: rapport.total_especes },
            { label: 'Carte Bancaire', montant: rapport.total_carte },
            { label: 'Mobile Money', montant: rapport.total_mobile },
            { label: 'Chèque', montant: rapport.total_cheque },
            { label: 'Autres / Virements', montant: rapport.total_autre }
          ].filter(p => p.montant > 0),
          produits: rapport.produits_vendus?.map(p => ({
            ...p,
            conditionnement: p.conditionnement,
            prix_total_fmt: p.prix_total
          })) || []
        }
      };

      return await this.generatePdf('session-caisse', data, 'session-caisse');
    } catch (error) {
      logger.error('Erreur CaissePdfService:', error);
      throw error;
    }
  }

  private static formatDateTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
