// Rôles utilisateur (doit correspondre au backend)
export enum TenantUserRole {
  ADMIN = 'ADMIN',
  STORE_MANAGER = 'STORE_MANAGER',
  STOCK_MANAGER = 'STOCK_MANAGER',
  SELLER = 'SELLER',
  ACCOUNTANT = 'ACCOUNTANT',
  USER = 'USER',
}

// Miroir des modules définis dans le backend
export enum Module {
  TABLEAU_DE_BORD = 'tableau_de_bord',
  PRODUITS = 'produits',
  STOCK = 'stock',
  ACHATS = 'achats',
  VENTES = 'ventes',
  CLIENTS = 'clients',
  FOURNISSEURS = 'fournisseurs',
  CAISSES = 'caisses',
  PERSONNEL = 'personnel',
  UTILISATEURS = 'utilisateurs',
  BOUTIQUES = 'boutiques',
  RAPPORTS = 'rapports',
  PARAMETRES = 'parametres',
  COMPTABILITE = 'comptabilite',
}

// Miroir des actions définies dans le backend
export enum Action {
  VOIR = 'voir',
  CREER = 'creer',
  MODIFIER = 'modifier',
  SUPPRIMER = 'supprimer',
  EXPORTER = 'exporter',
  VALIDER = 'valider',
}

// Matrice des permissions par rôle (Miroir de PermissionService.ts)
export const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  [TenantUserRole.ADMIN]: ['*'],
  
  [TenantUserRole.STORE_MANAGER]: [
    `${Module.TABLEAU_DE_BORD}:${Action.VOIR}`,
    `${Module.PRODUITS}:${Action.VOIR}`,
    `${Module.PRODUITS}:${Action.CREER}`,
    `${Module.PRODUITS}:${Action.MODIFIER}`,
    `${Module.PRODUITS}:${Action.SUPPRIMER}`,
    `${Module.STOCK}:${Action.VOIR}`,
    `${Module.STOCK}:${Action.CREER}`,
    `${Module.STOCK}:${Action.MODIFIER}`,
    `${Module.STOCK}:${Action.VALIDER}`,
    `${Module.ACHATS}:${Action.VOIR}`,
    `${Module.ACHATS}:${Action.CREER}`,
    `${Module.VENTES}:${Action.VOIR}`,
    `${Module.VENTES}:${Action.CREER}`,
    `${Module.VENTES}:${Action.MODIFIER}`,
    `${Module.VENTES}:${Action.SUPPRIMER}`,
    `${Module.VENTES}:${Action.EXPORTER}`,
    `${Module.CLIENTS}:${Action.VOIR}`,
    `${Module.CLIENTS}:${Action.CREER}`,
    `${Module.CLIENTS}:${Action.MODIFIER}`,
    `${Module.FOURNISSEURS}:${Action.VOIR}`,
    `${Module.CAISSES}:${Action.VOIR}`,
    `${Module.CAISSES}:${Action.CREER}`,
    `${Module.CAISSES}:${Action.MODIFIER}`,
    `${Module.CAISSES}:${Action.VALIDER}`,
    `${Module.PERSONNEL}:${Action.VOIR}`,
    `${Module.PERSONNEL}:${Action.MODIFIER}`,
    `${Module.BOUTIQUES}:${Action.VOIR}`,
    `${Module.BOUTIQUES}:${Action.MODIFIER}`,
    `${Module.RAPPORTS}:${Action.VOIR}`,
    `${Module.RAPPORTS}:${Action.EXPORTER}`,
    `${Module.PARAMETRES}:${Action.VOIR}`,
    `${Module.PARAMETRES}:${Action.MODIFIER}`,
  ],

  [TenantUserRole.STOCK_MANAGER]: [
    `${Module.TABLEAU_DE_BORD}:${Action.VOIR}`,
    `${Module.PRODUITS}:${Action.VOIR}`,
    `${Module.PRODUITS}:${Action.CREER}`,
    `${Module.PRODUITS}:${Action.MODIFIER}`,
    `${Module.PRODUITS}:${Action.SUPPRIMER}`,
    `${Module.STOCK}:${Action.VOIR}`,
    `${Module.STOCK}:${Action.CREER}`,
    `${Module.STOCK}:${Action.MODIFIER}`,
    `${Module.STOCK}:${Action.SUPPRIMER}`,
    `${Module.STOCK}:${Action.VALIDER}`,
    `${Module.ACHATS}:${Action.VOIR}`,
    `${Module.ACHATS}:${Action.CREER}`,
    `${Module.ACHATS}:${Action.MODIFIER}`,
    `${Module.ACHATS}:${Action.SUPPRIMER}`,
    `${Module.ACHATS}:${Action.VALIDER}`,
    `${Module.VENTES}:${Action.VOIR}`,
    `${Module.CLIENTS}:${Action.VOIR}`,
    `${Module.FOURNISSEURS}:${Action.VOIR}`,
    `${Module.FOURNISSEURS}:${Action.CREER}`,
    `${Module.FOURNISSEURS}:${Action.MODIFIER}`,
    `${Module.FOURNISSEURS}:${Action.SUPPRIMER}`,
    `${Module.BOUTIQUES}:${Action.VOIR}`,
    `${Module.RAPPORTS}:${Action.VOIR}`,
    `${Module.RAPPORTS}:${Action.EXPORTER}`,
    `${Module.PARAMETRES}:${Action.VOIR}`,
  ],

  [TenantUserRole.SELLER]: [
    `${Module.TABLEAU_DE_BORD}:${Action.VOIR}`,
    `${Module.PRODUITS}:${Action.VOIR}`,
    `${Module.STOCK}:${Action.VOIR}`,
    `${Module.VENTES}:${Action.VOIR}`,
    `${Module.VENTES}:${Action.CREER}`,
    `${Module.VENTES}:${Action.MODIFIER}`,
    `${Module.VENTES}:${Action.SUPPRIMER}`,
    `${Module.CLIENTS}:${Action.VOIR}`,
    `${Module.CLIENTS}:${Action.CREER}`,
    `${Module.CLIENTS}:${Action.MODIFIER}`,
    `${Module.CAISSES}:${Action.VOIR}`,
    `${Module.BOUTIQUES}:${Action.VOIR}`,
    `${Module.RAPPORTS}:${Action.VOIR}`,
  ],

  [TenantUserRole.ACCOUNTANT]: [
    `${Module.TABLEAU_DE_BORD}:${Action.VOIR}`,
    `${Module.PRODUITS}:${Action.VOIR}`,
    `${Module.STOCK}:${Action.VOIR}`,
    `${Module.ACHATS}:${Action.VOIR}`,
    `${Module.VENTES}:${Action.VOIR}`,
    `${Module.VENTES}:${Action.EXPORTER}`,
    `${Module.CLIENTS}:${Action.VOIR}`,
    `${Module.FOURNISSEURS}:${Action.VOIR}`,
    `${Module.CAISSES}:${Action.VOIR}`,
    `${Module.CAISSES}:${Action.EXPORTER}`,
    `${Module.BOUTIQUES}:${Action.VOIR}`,
    `${Module.RAPPORTS}:${Action.VOIR}`,
    `${Module.RAPPORTS}:${Action.EXPORTER}`,
    `${Module.PARAMETRES}:${Action.VOIR}`,
  ],

  [TenantUserRole.USER]: [
    `${Module.TABLEAU_DE_BORD}:${Action.VOIR}`,
    `${Module.PRODUITS}:${Action.VOIR}`,
    `${Module.STOCK}:${Action.VOIR}`,
    `${Module.VENTES}:${Action.VOIR}`,
    `${Module.BOUTIQUES}:${Action.VOIR}`,
  ],
};

/**
 * Calcule les permissions effectives basées sur le rôle et les customPermissions
 */
export function getEffectivePermissions(role: string, customPermissions: string[] = []): string[] {
  const roleBase = ROLE_DEFAULT_PERMISSIONS[role] || [];
  
  if (roleBase.includes('*')) return ['*'];

  // 1. Démarrer avec les permissions du rôle
  let result = [...roleBase];

  // 2. Appliquer les additions
  customPermissions.forEach(p => {
    if (!p.startsWith('-') && !result.includes(p)) {
      result.push(p);
    }
  });

  // 3. Appliquer les soustractions (prioritaires)
  customPermissions.forEach(p => {
    if (p.startsWith('-')) {
      const pToRemove = p.substring(1);
      result = result.filter(item => item !== pToRemove);
    }
  });

  return result;
}

/**
 * Calcule la différence (le strict nécessaire à envoyer) par rapport au rôle
 */
export function calculatePermissionsDiff(role: string, targetPermissions: string[]): string[] {
  const roleBase = ROLE_DEFAULT_PERMISSIONS[role] || [];
  
  // Si le rôle n'a pas accès à tout, calcul simple additions/soustractions
  if (!roleBase.includes('*')) {
    const additions = targetPermissions.filter(p => !roleBase.includes(p));
    const subtractions = roleBase.filter(p => !targetPermissions.includes(p)).map(p => `-${p}`);
    return [...additions, ...subtractions];
  }

  // Si le rôle est ADMIN (*), on ne peut qu'ajouter (inutile) ou soustraire.
  // Mais si targetPermissions contient toujours *, il n'y a aucun diff à envoyer.
  if (targetPermissions.includes('*')) return [];

  // Ici, l'utilisateur a désactivé le mode "Full Admin" ou a décoché des choses.
  // Pour un ADMIN, on considère que tout ce qui n'est pas dans targetPermissions est une soustraction.
  // Note: On se base sur la liste des modules connus pour identifier les retraits
  const allPossible: string[] = [];
  Object.values(Module).forEach(m => {
    Object.values(Action).forEach(a => {
      allPossible.push(`${m}:${a}`);
    });
  });

  return allPossible.filter(p => !targetPermissions.includes(p)).map(p => `-${p}`);
}
