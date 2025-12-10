import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Liste des départements courants dans une entreprise
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

// Liste des postes courants
const postes = [
  // Direction
  'Directeur Général',
  'Directeur Adjoint',
  'Chef de Département',
  'Responsable de Service',
  
  // Ressources Humaines
  'DRH',
  'Responsable RH',
  'Chargé de Recrutement',
  'Gestionnaire de Paie',
  'Assistant RH',
  
  // Informatique
  'Directeur Informatique',
  'Chef de Projet IT',
  'Développeur',
  'Développeur Web',
  'Développeur Mobile',
  'Administrateur Système',
  'Technicien Informatique',
  'Analyste Programmeur',
  
  // Finance & Comptabilité
  'Directeur Financier',
  'Comptable',
  'Assistant Comptable',
  'Contrôleur de Gestion',
  'Auditeur',
  'Trésorier',
  
  // Marketing & Communication
  'Directeur Marketing',
  'Chef de Produit',
  'Chargé de Marketing',
  'Community Manager',
  'Graphiste',
  'Responsable Communication',
  
  // Commercial & Ventes
  'Directeur Commercial',
  'Commercial',
  'Responsable des Ventes',
  'Technico-Commercial',
  'Chef des Ventes',
  
  // Production & Logistique
  'Directeur de Production',
  'Responsable Production',
  'Chef d\'Équipe',
  'Opérateur',
  'Technicien',
  'Responsable Logistique',
  'Agent Logistique',
  'Magasinier',
  
  // Achats & Qualité
  'Responsable Achats',
  'Acheteur',
  'Responsable Qualité',
  'Technicien Qualité',
  
  // Service Client
  'Responsable Service Client',
  'Conseiller Client',
  'Chargé de Clientèle',
  'Support Client',
  
  // Administration
  'Secrétaire',
  'Assistant de Direction',
  'Réceptionniste',
  'Agent d\'Accueil',
  
  // Autres
  'Stagiaire',
  'Alternant',
  'Consultant'
];

async function main() {
  console.log('🌱 Démarrage du seed...');

  // Créer les départements
  console.log('📦 Création des départements...');
  for (const name of departements) {
    await prisma.departement.upsert({
      where: { name },
      update: {},
      create: {
        name,
        isActive: true
      }
    });
  }
  console.log(`✅ ${departements.length} départements créés`);

  // Créer les postes
  console.log('💼 Création des postes...');
  for (const name of postes) {
    await prisma.poste.upsert({
      where: { name },
      update: {},
      create: {
        name,
        isActive: true
      }
    });
  }
  console.log(`✅ ${postes.length} postes créés`);

  console.log('🎉 Seed terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
