import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';

/**
 * Seed des données de base pour un nouveau tenant
 * Crée les départements et postes par défaut dans le schéma tenant
 */
export const seedTenantData = async (schemaName: string): Promise<void> => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Début du seed pour le tenant: ${schemaName}`);
    }

    // Créer une connexion Prisma pour ce schéma spécifique
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL non configurée');
    }

    // Ajouter le paramètre schema à l'URL
    const url = new URL(databaseUrl);
    url.searchParams.set('schema', schemaName);

    const tenantPrisma = new PrismaClient({
      datasources: {
        db: {
          url: url.toString(),
        },
      },
    });

    // Liste des départements
    const departements = [
      'Direction Générale',
      'Ressources Humaines',
      'Informatique',
      'Finance',
      'Comptabilité',
      'Marketing',
      'Communication',
      'Commercial',
      'Ventes',
      'Production',
      'Logistique',
      'Achats',
      'Qualité',
      'Recherche et Développement',
      'Service Client',
      'Juridique',
      'Administration',
      'Maintenance'
    ];

    // Liste des postes
    const postes = [
      'Directeur Général',
      'Directeur Adjoint',
      'Chef de Département',
      'Responsable de Service',
      'DRH',
      'Responsable RH',
      'Chargé de Recrutement',
      'Gestionnaire de Paie',
      'Assistant RH',
      'Directeur Informatique',
      'Chef de Projet IT',
      'Développeur',
      'Développeur Web',
      'Développeur Mobile',
      'Administrateur Système',
      'Technicien Informatique',
      'Analyste Programmeur',
      'Directeur Financier',
      'Comptable',
      'Assistant Comptable',
      'Contrôleur de Gestion',
      'Auditeur',
      'Trésorier',
      'Directeur Marketing',
      'Chef de Produit',
      'Chargé de Marketing',
      'Community Manager',
      'Graphiste',
      'Responsable Communication',
      'Directeur Commercial',
      'Commercial',
      'Responsable des Ventes',
      'Technico-Commercial',
      'Chef des Ventes',
      'Directeur de Production',
      'Responsable Production',
      'Chef d\'Équipe',
      'Opérateur',
      'Technicien',
      'Responsable Logistique',
      'Agent Logistique',
      'Magasinier',
      'Responsable Achats',
      'Acheteur',
      'Responsable Qualité',
      'Technicien Qualité',
      'Responsable Service Client',
      'Conseiller Client',
      'Chargé de Clientèle',
      'Support Client',
      'Secrétaire',
      'Assistant de Direction',
      'Réceptionniste',
      'Agent d\'Accueil',
      'Stagiaire',
      'Alternant',
      'Consultant'
    ];

    // Créer les départements
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Création de ${departements.length} départements...`);
    }
    for (const name of departements) {
      await tenantPrisma.departement.create({
        data: {
          name,
          isActive: true
        }
      });
    }

    // Créer les postes
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Création de ${postes.length} postes...`);
    }
    for (const name of postes) {
      await tenantPrisma.poste.create({
        data: {
          name,
          isActive: true
        }
      });
    }

    // Liste des types de congés (basés sur la législation française)
    const typesConges = [
      { 
        nom: 'Congés Payés', 
        description: 'Congés annuels réglementaires (5 semaines/an)', 
        estPaye: true, 
        necessiteDocument: false, 
        couleur: '#10B981' 
      },
      { 
        nom: 'RTT', 
        description: 'Réduction du Temps de Travail', 
        estPaye: true, 
        necessiteDocument: false, 
        couleur: '#3B82F6' 
      },
      { 
        nom: 'Congé Maladie', 
        description: 'Arrêt maladie non professionnel', 
        estPaye: true, 
        necessiteDocument: true, 
        couleur: '#EF4444' 
      },
      { 
        nom: 'Congé Maternité', 
        description: 'Congé maternité réglementaire', 
        estPaye: true, 
        necessiteDocument: true, 
        couleur: '#EC4899' 
      },
      { 
        nom: 'Congé Paternité', 
        description: 'Congé paternité et d\'accueil de l\'enfant', 
        estPaye: true, 
        necessiteDocument: true, 
        couleur: '#6366F1' 
      },
      { 
        nom: 'Congé Parental', 
        description: 'Congé parental d\'éducation', 
        estPaye: false, 
        necessiteDocument: true, 
        couleur: '#8B5CF6' 
      },
      { 
        nom: 'Formation Professionnelle', 
        description: 'Congé de formation', 
        estPaye: true, 
        necessiteDocument: false, 
        couleur: '#F59E0B' 
      },
      { 
        nom: 'Congé pour Événement Familial', 
        description: 'Mariage, naissance, décès, etc.', 
        estPaye: true, 
        necessiteDocument: false, 
        couleur: '#14B8A6' 
      },
      { 
        nom: 'Congé Sans Solde', 
        description: 'Congé non rémunéré', 
        estPaye: false, 
        necessiteDocument: false, 
        couleur: '#6B7280' 
      },
      { 
        nom: 'Congé Sabbatique', 
        description: 'Congé sabbatique (6-11 mois)', 
        estPaye: false, 
        necessiteDocument: false, 
        couleur: '#84CC16' 
      },
      { 
        nom: 'Congé Proche Aidant', 
        description: 'Pour accompagner un proche en perte d\'autonomie', 
        estPaye: false, 
        necessiteDocument: true, 
        couleur: '#06B6D4' 
      },
      { 
        nom: 'AT/MP', 
        description: 'Accident du Travail / Maladie Professionnelle', 
        estPaye: true, 
        necessiteDocument: true, 
        couleur: '#DC2626' 
      },
    ];

    // Créer les types de congés
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Création de ${typesConges.length} types de congés...`);
    }
    for (const type of typesConges) {
      await tenantPrisma.typeConge.create({
        data: {
          nom: type.nom,
          description: type.description,
          estPaye: type.estPaye,
          necessiteDocument: type.necessiteDocument,
          couleur: type.couleur,
          estActif: true
        }
      });
    }

    await tenantPrisma.$disconnect();
    
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`✅ Seed terminé pour ${schemaName}: ${departements.length} départements, ${postes.length} postes et ${typesConges.length} types de congés créés`);
    }

  } catch (error) {
    logger.error(`❌ Erreur lors du seed du tenant ${schemaName}:`, error);
    throw error;
  }
};
