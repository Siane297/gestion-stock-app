import puppeteer, { Browser, PDFOptions } from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import chromium from '@sparticuz/chromium';

export type PdfOrientation = 'portrait' | 'landscape';
export type PdfFormat = 'A4' | 'A3' | 'Letter';

export interface PdfConfiguration {
  orientation: PdfOrientation;
  format: PdfFormat;
  margins?: {
    top?: string;
    right?: string; 
    bottom?: string;
    left?: string;
  };
}

export interface PdfGenerationOptions {
  tenantId?: string;
  userId?: string;
}

/**
 * Service de base pour génération PDF sécurisé et configurable
 */
export abstract class BasePdfService {
  private static browser: Browser | null = null;

  // Configurations prédéfinies par type de document
  protected static readonly PDF_CONFIGS: Record<string, PdfConfiguration> = {
    // Format paysage pour listes avec beaucoup de colonnes
    employees: {
      orientation: 'landscape',
      format: 'A4',
      margins: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    },
    // Format landscape pour pointages/attendances (colonnes Entrée/Sortie)
    attendance: {
      orientation: 'landscape', 
      format: 'A4',
      margins: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    },
    // Format portrait pour bilans (rapports textuels)
    bilan: {
      orientation: 'landscape',
      format: 'A4', 
      margins: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    },
    // Format portrait pour utilisateurs (listes et rapports)
    users: {
      orientation: 'portrait',
      format: 'A4',
      margins: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    }
  };

  private static readonly BROWSER_OPTIONS = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=ScriptStreaming',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-default-apps',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-field-trial-config',
      '--disable-back-forward-cache',
      '--disable-ipc-flooding-protection',
      '--max_old_space_size=4096',
    ],
    timeout: 30000, // Réduit pour la vitesse
    ignoreDefaultArgs: ['--disable-extensions'],
    dumpio: false,
  };

  /**
   * Obtenir la configuration PDF pour un type donné
   */
  protected static getConfiguration(configType: string): PdfConfiguration {
    const config = this.PDF_CONFIGS[configType];
    if (!config) {
      throw new Error(`Configuration PDF non trouvée pour le type: ${configType}`);
    }
    return config;
  }

  /**
   * Obtenir une instance de navigateur (singleton avec réutilisation)
   */
  private static async getBrowser(): Promise<Browser> {
    // Vérifier si le navigateur existant est toujours connecté
    if (this.browser && this.browser.isConnected()) {
      return this.browser;
    }
    
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (error) {
        console.log('⚠️  [PDF] Erreur fermeture ancien navigateur:', error instanceof Error ? error.message : 'Erreur inconnue');
      }
    }
    
    console.log('🚀 [PDF] Initialisation nouveau navigateur Puppeteer (optimisé)');
      
    // Configuration spéciale pour environnements de déploiement (Render, Docker, etc.)
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Configuration @sparticuz/chromium pour Render
    const isRender = process.env.RENDER || process.env.RENDER_SERVICE_NAME || process.env.RENDER_EXTERNAL_HOSTNAME;
    let renderConfig;
    if (isProduction && isRender) {
      console.log('🎯 [PDF] Utilisation de @sparticuz/chromium pour Render');
      try {
        const executablePath = await chromium.executablePath();
        console.log('🔍 [PDF] Chemin Chromium @sparticuz:', executablePath);
        
        renderConfig = {
          headless: true,
          executablePath,
          args: [
            ...chromium.args,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process',
            '--disable-gpu',
            '--hide-scrollbars',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--run-all-compositor-stages-before-draw',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-images',
            '--disable-javascript',
            '--disable-default-apps'
          ],
          timeout: 30000 // Réduit pour la vitesse
        };
        console.log('✅ [PDF] Configuration @sparticuz/chromium créée');
      } catch (error) {
        console.log('⚠️  [PDF] Erreur @sparticuz/chromium:', error instanceof Error ? error.message : 'Erreur inconnue');
        renderConfig = null;
      }
    }
    
    // Configuration fallback classique
    if (!renderConfig) {
      console.log('🔄 [PDF] Utilisation configuration Puppeteer classique');
      
      let executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      if (!executablePath) {
        try {
          // @ts-ignore
          executablePath = puppeteer.executablePath();
          console.log('📍 [PDF] Chemin exécutable Puppeteer détecté:', executablePath);
        } catch (e) {
          console.log('⚠️ [PDF] Impossible de détecter le chemin exécutable Puppeteer:', e);
        }
      }

      renderConfig = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-images',
          '--disable-extensions'
        ],
        timeout: 30000,
        executablePath: executablePath
      };
    }

    // Essayer plusieurs configurations en cas d'échec
    const configurations = [
      renderConfig,
      { // Configuration de fallback
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--single-process'
        ],
        timeout: 20000
      },
      { // Configuration minimale
        headless: true,
        args: ['--no-sandbox', '--single-process'],
        timeout: 15000
      }
    ];

    for (let i = 0; i < configurations.length; i++) {
      try {
        console.log(`🔄 [PDF] Tentative ${i + 1}/${configurations.length} de lancement Puppeteer`);
        this.browser = await puppeteer.launch(configurations[i]);
        console.log('✅ [PDF] Navigateur Puppeteer initialisé avec succès');
        return this.browser;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
        console.log(`❌ [PDF] Échec tentative ${i + 1}: ${errorMsg}`, error);
        
        if (i === configurations.length - 1) {
          throw new Error(`Impossible de lancer Puppeteer après ${configurations.length} tentatives: ${errorMsg}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (!this.browser) {
      throw new Error('Impossible d\'initialiser le navigateur Puppeteer');
    }
    return this.browser;
  }

  /**
   * Générer un PDF avec configuration personnalisée (optimisé pour vitesse)
   */
  protected static async generatePdf(
    templateName: string,
    data: any,
    configType: string,
    options: PdfGenerationOptions = {}
  ): Promise<Buffer> {
    const startTime = Date.now();
    console.log(`📄 [PDF] Début génération: ${templateName} (${configType})`);

    try {
      // Obtenir la configuration pour ce type de document
      const config = this.getConfiguration(configType);

      // Charger et compiler le template
      const templatePath = path.join(process.cwd(), 'templates', `${templateName}.html`);
      const templateContent = await fs.readFile(templatePath, 'utf8');
      const template = handlebars.compile(templateContent);

      // Enregistrer les helpers Handlebars
      this.registerHandlebarsHelpers();

      // Générer le HTML avec les données
      let html = template(data);
      
      // Injection CSS inline pour éviter les problèmes de chargement
      console.log('🎨 [PDF] Injection CSS inline pour garantir le chargement');
      
      const cssPath = path.join(process.cwd(), 'templates', 'styles.css');
      try {
        const cssContent = await fs.readFile(cssPath, 'utf8');
        html = html.replace(
          /<link rel="stylesheet" href="styles\.css">/,
          `<style>${cssContent}</style>`
        );
        console.log('✅ [PDF] CSS inline injecté avec succès');
      } catch (error) {
        console.log('⚠️  [PDF] Erreur lecture CSS:', error instanceof Error ? error.message : 'Erreur inconnue');
      }

      // Obtenir le navigateur et créer une page
      const browser = await this.getBrowser();
      const page = await browser.newPage();

      // Bloquer toutes les requêtes externes pour la performance
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const url = request.url();
        if (url.startsWith('data:') || url.startsWith('about:blank')) {
          request.continue();
        } else {
          request.abort();
        }
      });

      // Charger le HTML dans la page (optimisé)
      console.log('📄 [PDF] Chargement HTML dans la page...');
      await page.setContent(html, {
        waitUntil: 'domcontentloaded',
        timeout: 20000 // Réduit pour la vitesse
      });

      // Attente minimale pour les styles
      console.log('🎨 [PDF] Attente chargement des styles...');
      await new Promise(resolve => setTimeout(resolve, 150)); // Réduit à 150ms

      // Options PDF optimisées
      const pdfOptions: PDFOptions = {
        format: config.format,
        landscape: config.orientation === 'landscape',
        printBackground: true,
        margin: config.margins || { top: '10mm', right: '8mm', bottom: '10mm', left: '8mm' },
        timeout: 15000, // Réduit pour la vitesse
        preferCSSPageSize: true,
        omitBackground: false
      };

      // Générer le PDF
      const pdfBuffer = Buffer.from(await page.pdf(pdfOptions));
      await page.close();

      const duration = Date.now() - startTime;
      console.log(`✅ [PDF] Génération réussie: ${templateName} (${duration}ms, ${config.orientation})`);

      // Log d'audit pour traçabilité
      if (options.tenantId && options.userId) {
        console.log(`📊 [AUDIT] PDF généré - Template: ${templateName}, Type: ${configType}, Tenant: ${options.tenantId}, User: ${options.userId}`);
      }

      return pdfBuffer;

    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ [PDF] Erreur génération ${templateName} (${duration}ms):`, error);
      throw new Error(`Impossible de générer le PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Enregistrer les helpers Handlebars globaux
   */
  private static registerHandlebarsHelpers(): void {
    // Helper pour formater les dates
    handlebars.registerHelper('formatDate', (date: Date | string) => {
      if (!date) return '-';
      const d = new Date(date);
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      });
    });

    // Helper pour formater les heures
    handlebars.registerHelper('formatTime', (date: Date | string) => {
      if (!date) return '-';
      const d = new Date(date);
      return d.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    });

    // Helper pour formater les durées (en minutes)
    handlebars.registerHelper('formatDuration', (minutes: number) => {
      if (!minutes || minutes === 0) return '-';
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h${mins.toString().padStart(2, '0')}`;
    });

    // Helper conditionnel
    handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    handlebars.registerHelper('ne', (a: any, b: any) => a !== b);
    handlebars.registerHelper('gt', (a: number, b: number) => a > b);
    handlebars.registerHelper('lt', (a: number, b: number) => a < b);

    // Helpers pour alternance de lignes
    handlebars.registerHelper('isEven', (index: number) => index % 2 === 0);
    handlebars.registerHelper('isOdd', (index: number) => index % 2 !== 0);
    
    // Helper pour numérotation des lignes (commence à 1)
    handlebars.registerHelper('inc', (index: number) => index + 1);
  }

  /**
   * Fermer le navigateur 
   */
  public static async closeBrowser(): Promise<void> {
    if (this.browser) {
      console.log('🔄 [PDF] Fermeture du service PDF...');
      await this.browser.close();
      this.browser = null;
      console.log('✅ [PDF] Service PDF fermé');
    }
  }
}
