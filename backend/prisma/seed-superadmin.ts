#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Connexion au schéma public
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || '',
    },
  },
});

async function main() {
  console.log('🌱 Création du compte Super Administrateur...');

  // Informations du super admin depuis les variables d'environnement
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@zawadicom.com';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

  // Validation sécurisée du mot de passe
  if (!superAdminPassword) {
    throw new Error('❌ ERREUR CRITIQUE: SUPER_ADMIN_PASSWORD est requis dans les variables d\'environnement!');
  }

  if (superAdminPassword.length < 8) {
    throw new Error('❌ ERREUR CRITIQUE: SUPER_ADMIN_PASSWORD doit contenir au moins 8 caractères!');
  }

  // Vérifier la complexité du mot de passe
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  if (!passwordRegex.test(superAdminPassword)) {
    throw new Error('❌ ERREUR CRITIQUE: SUPER_ADMIN_PASSWORD doit contenir au moins : une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)!');
  }

  // Vérifier si le super admin existe déjà
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (existingSuperAdmin) {
    console.log('✅ Super Admin existe déjà:', superAdminEmail);
    console.log('   Utilisez ce compte pour vous connecter.');
  } else {
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

    // Créer le super admin
    const superAdmin = await prisma.user.create({
      data: {
        name: 'Super Administrateur',
        email: superAdminEmail,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
        emailVerified: true,
        // Pas de companyId pour le SUPER_ADMIN
      },
    });

    console.log('✅ Super Admin créé avec succès!');
    console.log('📧 Email:', superAdminEmail);
    console.log('🔑 Mot de passe: [CONFIGURÉ VIA VARIABLE D\'ENVIRONNEMENT]');
    console.log('⚠️  IMPORTANT: Changez le mot de passe après la première connexion!');
  }

  console.log('🎉 Terminé!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
