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

    await tenantPrisma.$disconnect();
    
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`✅ Seed terminé pour ${schemaName}: ${departements.length} départements, ${postes.length} postes et ${typesConges.length} types de congés créés`);
    }

  } catch (error) {
    logger.error(`❌ Erreur lors du seed du tenant ${schemaName}:`, error);
    throw error;
  }
};
