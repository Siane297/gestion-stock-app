/**
 * Service PDF de fallback pour les environnements avec restrictions (Render, etc.)
 * Utilise une approche alternative si Puppeteer ne fonctionne pas
 */

import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

export class FallbackPdfService {
  
  /**
   * Générer un PDF via une API externe (HTML to PDF service)
   * Cette méthode est utilisée quand Puppeteer ne peut pas s'initialiser
   */
  static async generatePdfFallback(
    templateName: string,
    data: any,
    companyData: any
  ): Promise<Buffer> {
    console.log('🔄 [FALLBACK-PDF] Utilisation du service de fallback');
    
    try {
      // Lire et compiler le template
      const templatePath = path.join(process.cwd(), 'templates', templateName);
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const template = handlebars.compile(templateContent);
      
      // Générer le HTML
      const html = template({
        ...data,
        company: companyData,
        generatedAt: new Date().toLocaleDateString('fr-FR')
      });
      
      console.log('✅ [FALLBACK-PDF] HTML généré, longueur:', html.length);
      
      // Pour l'instant, on retourne une erreur explicite qui indique le problème
      // En production, on pourrait utiliser une API externe comme HTMLtoPDF.io
      throw new Error(
        'Service PDF temporairement indisponible sur cette plateforme. ' +
        'Veuillez réessayer plus tard ou contacter le support technique.'
      );
      
    } catch (error) {
      console.error('❌ [FALLBACK-PDF] Erreur:', error);
      throw error;
    }
  }
  
  /**
   * Vérifier si Puppeteer est disponible sur la plateforme actuelle
   */
  static async isPuppeteerAvailable(): Promise<boolean> {
    try {
      const puppeteer = await import('puppeteer');
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        timeout: 10000
      });
      await browser.close();
      return true;
    } catch (error) {
      console.log('⚠️  [FALLBACK-PDF] Puppeteer non disponible:', error instanceof Error ? error.message : 'Erreur inconnue');
      return false;
    }
  }
}
