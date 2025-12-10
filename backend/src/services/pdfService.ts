import puppeteer, { Browser, Page } from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

/**
 * Service de génération PDF sécurisé et optimisé pour multi-tenant
 */
export class PdfService {
  private static browser: Browser | null = null;
  private static readonly PDF_OPTIONS = {
    format: 'A4' as const,
    landscape: true, // Mode paysage pour plus de colonnes
    printBackground: true,
    margin: {
      top: '15mm',
      right: '15mm',
      bottom: '15mm',
      left: '15mm',
    },
    timeout: 45000, // 45 secondes max pour génération PDF
  };

  private static readonly BROWSER_OPTIONS = {
    headless: true, // Mode headless
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
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
    timeout: 60000,
    ignoreDefaultArgs: ['--disable-extensions'],
    dumpio: false, // Désactiver les logs pour éviter les conflits
  };

  /**
   * Obtenir une instance de navigateur (singleton pour performance)
   */
  private static async getBrowser(): Promise<Browser> {
    if (!this.browser || !this.browser.isConnected()) {
      console.log('🚀 [PDF] Initialisation nouveau navigateur Puppeteer');
      
      // Essayer plusieurs configurations en cas d'échec
      const configurations = [
        this.BROWSER_OPTIONS, // Configuration principale
        { // Configuration de fallback plus simple
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
          ],
          timeout: 30000
        },
        { // Configuration minimale en dernier recours
          headless: true,
          args: ['--no-sandbox'],
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
          console.log(`❌ [PDF] Échec tentative ${i + 1}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
          if (i === configurations.length - 1) {
            throw new Error(`Impossible de lancer Puppeteer après ${configurations.length} tentatives`);
          }
          // Attendre un peu avant la prochaine tentative
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (!this.browser) {
      throw new Error('Impossible d\'initialiser le navigateur Puppeteer');
    }
    return this.browser;
  }

  /**
   * Fermer le navigateur (à appeler lors de l'arrêt du serveur)
   */
  public static async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('🔒 [PDF] Navigateur Puppeteer fermé');
    }
  }

  /**
   * Enregistrer les helpers Handlebars utiles
   */
  private static registerHandlebarsHelpers(): void {
    // Helper pour formater les dates
    handlebars.registerHelper('formatDate', (date: string | Date) => {
      if (!date) return 'Non définie';
      const d = new Date(date);
      return d.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    });

    // Helper pour conditions
    handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    handlebars.registerHelper('gt', (a: number, b: number) => a > b);
    
    // Helper pour capitaliser
    handlebars.registerHelper('capitalize', (str: string) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    });
  }

  /**
   * Valider et nettoyer les données avant injection dans le template
   */
  private static sanitizeTemplateData(data: any): any {
    // Fonction récursive pour nettoyer les objets
    const sanitizeValue = (value: any): any => {
      if (typeof value === 'string') {
        // Échapper les caractères HTML dangereux
        return value
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      }
      
      if (Array.isArray(value)) {
        return value.map(sanitizeValue);
      }
      
      if (value && typeof value === 'object') {
        const sanitized: any = {};
        for (const [key, val] of Object.entries(value)) {
          sanitized[key] = sanitizeValue(val);
        }
        return sanitized;
      }
      
      return value;
    };

    return sanitizeValue(data);
  }

  /**
   * Générer un PDF à partir d'un template et de données
   */
  public static async generatePdf(
    templateName: string,
    data: any,
    options: {
      filename?: string;
      tenantId?: string;
      userId?: string;
    } = {}
  ): Promise<Buffer> {
    let page: Page | null = null;
    const startTime = Date.now();
    
    try {
      console.log(`📄 [PDF] Début génération: ${templateName}`);
      
      // Enregistrer les helpers Handlebars
      this.registerHandlebarsHelpers();
      
      // Nettoyer les données pour sécurité
      const sanitizedData = this.sanitizeTemplateData(data);
      
      // Lire le template
      const templatePath = path.join(process.cwd(), 'templates', `${templateName}.html`);
      const templateContent = await fs.readFile(templatePath, 'utf8');
      
      // Compiler le template avec Handlebars
      const template = handlebars.compile(templateContent);
      const html = template(sanitizedData);
      
      // Obtenir le navigateur
      const browser = await this.getBrowser();
      page = await browser.newPage();
      
      // Configuration sécurisée de la page
      await page.setViewport({ width: 1200, height: 800 });
      
      // Bloquer les ressources externes non nécessaires pour sécurité
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const url = request.url();
        
        // Autoriser seulement Tailwind CSS CDN et ressources locales
        if (
          url.includes('cdn.tailwindcss.com') ||
          url.startsWith('data:') ||
          url.startsWith('file:')
        ) {
          request.continue();
        } else {
          console.log(`🚫 [PDF] Requête bloquée: ${url}`);
          request.abort();
        }
      });
      
      // Charger le HTML dans la page
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });
      
      // Attendre que Tailwind soit chargé
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Générer le PDF
      const pdfBuffer = Buffer.from(await page.pdf(this.PDF_OPTIONS));
      
      const duration = Date.now() - startTime;
      console.log(`✅ [PDF] Génération réussie: ${templateName} (${duration}ms)`);
      
      // Log d'audit pour traçabilité
      if (options.tenantId && options.userId) {
        console.log(`📊 [AUDIT] PDF généré - Template: ${templateName}, Tenant: ${options.tenantId}, User: ${options.userId}`);
      }
      
      return pdfBuffer;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ [PDF] Erreur génération ${templateName} (${duration}ms):`, error);
      throw new Error(`Impossible de générer le PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      
    } finally {
      // Toujours fermer la page pour éviter les fuites mémoire
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Générer le PDF de la liste des employés (fonction spécialisée)
   */
  public static async generateEmployeesPdf(
    employees: any[],
    companyInfo: any,
    options: {
      tenantId?: string;
      userId?: string;
    } = {}
  ): Promise<Buffer> {
    // Calculer les statistiques
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.isActive).length;
    const inactiveEmployees = totalEmployees - activeEmployees;
    
    // Compter les départements uniques
    const departments = new Set(
      employees.map(emp => 
        emp.department?.name || emp.department || 'Non défini'
      )
    );
    const departmentCount = departments.size;
    
    // Préparer les données pour le template
    const templateData = {
      company: {
        name: companyInfo.name || 'Entreprise',
        country: companyInfo.country || 'France',
        address: companyInfo.address,
        phone: companyInfo.phone,
        email: companyInfo.email,
        logo: companyInfo.logo, // URL du logo si disponible
      },
      employees,
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      departmentCount,
      generatedAt: new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    
    return this.generatePdf('employees-list', templateData, {
      filename: `employees-${Date.now()}.pdf`,
      ...options,
    });
  }
}

// Fermer le navigateur lors de l'arrêt du processus
process.on('SIGINT', async () => {
  console.log('🔄 [PDF] Fermeture du service PDF...');
  await PdfService.closeBrowser();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 [PDF] Fermeture du service PDF...');
  await PdfService.closeBrowser();
  process.exit(0);
});
