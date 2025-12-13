/**
 * Index des services - Point d'entrée unique pour tous les services
 */

// Services métier
export { StockService } from './stockService.js';
export type { 
  CreateMouvementDto, 
  StockUpdateResult, 
  StockAlertResult,
  TypeMouvementStock 
} from './stockService.js';

export { ProduitService } from './produitService.js';
export type { 
  CreateProduitDto, 
  UpdateProduitDto, 
  ProduitFilters 
} from './produitService.js';

export { CategorieService } from './categorieService.js';
export type { 
  CreateCategorieDto, 
  UpdateCategorieDto 
} from './categorieService.js';

export { AchatService } from './achatService.js';
export type { 
  CreateAchatDto, 
  AchatDetailDto, 
  UpdateAchatStatutDto,
  StatutAchat 
} from './achatService.js';

export { VenteService } from './venteService.js';
export type { 
  CreateVenteDto, 
  VenteDetailDto, 
  UpdateVenteStatutDto,
  StatutVente,
  MethodePaiement 
} from './venteService.js';

export { ClientService } from './clientService.js';
export type { 
  CreateClientDto, 
  UpdateClientDto 
} from './clientService.js';

export { FournisseurService } from './fournisseurService.js';
export type { 
  CreateFournisseurDto, 
  UpdateFournisseurDto 
} from './fournisseurService.js';

export { MagasinService } from './magasinService.js';
export type { 
  CreateMagasinDto, 
  UpdateMagasinDto 
} from './magasinService.js';

export { AuditService } from './auditService.js';
export type { 
  AuditLogEntry, 
  AuditFilters,
  AuditAction,
  AuditEntity 
} from './auditService.js';

// Utilitaires de validation
export * from './validationService.js';

// Services existants
export * from './tenantService.js';
export { seedTenantData } from './tenantSeedService.js';
