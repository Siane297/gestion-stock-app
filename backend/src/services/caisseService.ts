import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';

// Types
export type StatutCaisse = 'ACTIVE' | 'INACTIVE' | 'EN_MAINTENANCE';
export type StatutSessionCaisse = 'OUVERTE' | 'FERMEE' | 'SUSPENDUE';

// DTOs
export interface CreateCaisseDto {
  code: string;
  nom: string;
  magasin_id: string;
  description?: string;
}

export interface UpdateCaisseDto {
  code?: string;
  nom?: string;
  description?: string;
  statut?: StatutCaisse;
}

export interface OuvrirSessionDto {
  caisse_id: string;
  utilisateur_id: string;
  fond_initial: number;
  notes?: string;
}

export interface OuvrirSessionParPinDto {
  caisse_id: string;
  pin: string;
  fond_initial: number;
  notes?: string;
}

export interface FermerSessionDto {
  fond_final: number;
  notes?: string;
}

export interface RapportSessionDto {
  id: string;
  caisse: { id: string; nom: string; code: string };
  utilisateur: { id: string; email: string; fullName?: string };
  fond_initial: number;
  fond_final: number | null;
  total_especes: number;
  total_carte: number;
  total_mobile: number;
  total_cheque: number;
  total_autre: number;
  ecart: number | null;
  nombre_ventes: number;
  chiffre_affaires: number;
  statut: StatutSessionCaisse;
  date_ouverture: Date;
  date_fermeture: Date | null;
  notes_ouverture?: string;
  notes_fermeture?: string;
}

/**
 * Service pour la gestion des caisses et sessions
 */
export class CaisseService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // ============================================
  // GESTION DES CAISSES
  // ============================================

  /**
   * Créer une nouvelle caisse
   */
  async createCaisse(data: CreateCaisseDto): Promise<any> {
    // Vérifier que le magasin existe
    const magasin = await this.prisma.magasin.findUnique({
      where: { id: data.magasin_id }
    });
    if (!magasin) throw new Error('Magasin non trouvé');

    // Vérifier l'unicité du code dans le magasin
    const existing = await this.prisma.caisse.findFirst({
      where: { magasin_id: data.magasin_id, code: data.code }
    });
    if (existing) throw new Error(`Une caisse avec le code "${data.code}" existe déjà dans ce magasin`);

    const caisse = await this.prisma.caisse.create({
      data: {
        code: data.code,
        nom: data.nom,
        magasin_id: data.magasin_id,
        description: data.description
      },
      include: { magasin: { select: { nom: true } } }
    });

    logger.info(`Caisse créée: ${caisse.code} - ${caisse.nom} (Magasin: ${magasin.nom})`);
    return caisse;
  }

  /**
   * Récupérer toutes les caisses (tous magasins)
   */
  async getAllCaisses(): Promise<any[]> {
    return this.prisma.caisse.findMany({
      include: {
        magasin: { select: { nom: true } },
        sessions: {
          where: { statut: 'OUVERTE' },
          take: 1,
          include: {
            utilisateur: { select: { email: true, employee: { select: { fullName: true } } } }
          }
        }
      },
      orderBy: { code: 'asc' }
    });
  }

  /**
   * Récupérer toutes les caisses d'un magasin
   */
  async getCaissesByMagasin(magasinId: string): Promise<any[]> {
    return this.prisma.caisse.findMany({
      where: { magasin_id: magasinId },
      include: {
        magasin: { select: { nom: true } },
        sessions: {
          where: { statut: 'OUVERTE' },
          take: 1,
          include: {
            utilisateur: { select: { email: true, employee: { select: { fullName: true } } } }
          }
        }
      },
      orderBy: { code: 'asc' }
    });
  }

  /**
   * Récupérer une caisse par ID
   */
  async getCaisseById(id: string): Promise<any> {
    const caisse = await this.prisma.caisse.findUnique({
      where: { id },
      include: {
        magasin: { select: { nom: true } },
        sessions: {
          orderBy: { date_ouverture: 'desc' },
          take: 10,
          include: {
            utilisateur: { select: { email: true, employee: { select: { fullName: true } } } }
          }
        }
      }
    });
    if (!caisse) throw new Error('Caisse non trouvée');
    return caisse;
  }

  /**
   * Modifier une caisse
   */
  async updateCaisse(id: string, data: UpdateCaisseDto): Promise<any> {
    const existing = await this.prisma.caisse.findUnique({ where: { id } });
    if (!existing) throw new Error('Caisse non trouvée');

    // Si on change le code, vérifier l'unicité
    if (data.code && data.code !== existing.code) {
      const duplicate = await this.prisma.caisse.findFirst({
        where: { magasin_id: existing.magasin_id, code: data.code, NOT: { id } }
      });
      if (duplicate) throw new Error(`Une caisse avec le code "${data.code}" existe déjà dans ce magasin`);
    }

    return this.prisma.caisse.update({
      where: { id },
      data: {
        code: data.code,
        nom: data.nom,
        description: data.description,
        statut: data.statut
      },
      include: { magasin: { select: { nom: true } } }
    });
  }

  /**
   * Supprimer une caisse
   */
  async deleteCaisse(id: string): Promise<void> {
    const existing = await this.prisma.caisse.findUnique({
      where: { id },
      include: { sessions: { where: { statut: 'OUVERTE' } } }
    });
    if (!existing) throw new Error('Caisse non trouvée');

    // Ne pas supprimer si une session est ouverte
    if (existing.sessions.length > 0) {
      throw new Error('Impossible de supprimer une caisse avec une session ouverte');
    }

    await this.prisma.caisse.delete({ where: { id } });
    logger.info(`Caisse supprimée: ${existing.code}`);
  }

  // ============================================
  // GESTION DES SESSIONS DE CAISSE
  // ============================================

  /**
   * Ouvrir une nouvelle session de caisse
   */
  async ouvrirSession(data: OuvrirSessionDto): Promise<any> {
    // Vérifier que la caisse existe et est active
    const caisse = await this.prisma.caisse.findUnique({
      where: { id: data.caisse_id }
    });
    if (!caisse) throw new Error('Caisse non trouvée');
    if (caisse.statut !== 'ACTIVE') throw new Error('Cette caisse n\'est pas active');

    // Vérifier qu'il n'y a pas déjà une session ouverte sur cette caisse
    const sessionOuverte = await this.prisma.session_caisse.findFirst({
      where: { caisse_id: data.caisse_id, statut: 'OUVERTE' }
    });
    if (sessionOuverte) {
      throw new Error('Une session est déjà ouverte sur cette caisse. Fermez-la d\'abord.');
    }

    // Vérifier que l'utilisateur n'a pas déjà une session ouverte sur une autre caisse
    const autreSessionUtilisateur = await this.prisma.session_caisse.findFirst({
      where: { utilisateur_id: data.utilisateur_id, statut: 'OUVERTE' },
      include: { caisse: { select: { nom: true } } }
    });
    if (autreSessionUtilisateur) {
      throw new Error(`Vous avez déjà une session ouverte sur la caisse "${autreSessionUtilisateur.caisse.nom}"`);
    }

    const session = await this.prisma.session_caisse.create({
      data: {
        caisse_id: data.caisse_id,
        utilisateur_id: data.utilisateur_id,
        fond_initial: data.fond_initial,
        notes_ouverture: data.notes
      },
      include: {
        caisse: { select: { id: true, nom: true, code: true } },
        utilisateur: { select: { email: true, employee: { select: { fullName: true } } } }
      }
    });

    logger.info(`Session ouverte: Caisse ${caisse.code} par ${session.utilisateur.email}, Fond: ${data.fond_initial}`);
    return session;
  }

  /**
   * Vérifier un PIN et retourner l'utilisateur correspondant
   */
  async verifierPin(pin: string): Promise<any> {
    if (!pin || pin.length < 4) {
      throw new Error('PIN invalide (minimum 4 chiffres)');
    }

    const utilisateur = await this.prisma.tenantUser.findFirst({
      where: { pin, isBlocked: false },
      include: {
        employee: { select: { fullName: true } }
      }
    });

    if (!utilisateur) {
      throw new Error('PIN incorrect ou utilisateur bloqué');
    }

    return utilisateur;
  }

  /**
   * Ouvrir une session de caisse via PIN (authentification caissier)
   */
  async ouvrirSessionParPin(data: OuvrirSessionParPinDto): Promise<any> {
    // 1. Vérifier le PIN et récupérer l'utilisateur
    const utilisateur = await this.verifierPin(data.pin);

    // 2. Déléguer à la méthode standard avec l'ID utilisateur
    return this.ouvrirSession({
      caisse_id: data.caisse_id,
      utilisateur_id: utilisateur.id,
      fond_initial: data.fond_initial,
      notes: data.notes
    });
  }

  /**
   * Fermer (clôturer) une session de caisse
   */
  async fermerSession(sessionId: string, data: FermerSessionDto): Promise<RapportSessionDto> {
    const session = await this.prisma.session_caisse.findUnique({
      where: { id: sessionId },
      include: {
        caisse: { select: { id: true, nom: true, code: true } },
        utilisateur: { select: { id: true, email: true, employee: { select: { fullName: true } } } },
        ventes: true
      }
    });

    if (!session) throw new Error('Session non trouvée');
    if (session.statut === 'FERMEE') throw new Error('Cette session est déjà fermée');

    // Calculer les totaux par méthode de paiement
    const ventesPayees = session.ventes.filter(v => v.statut === 'PAYEE');
    
    const totaux = {
      ESPECES: 0,
      CARTE: 0,
      MOBILE_MONEY: 0,
      CHEQUE: 0,
      VIREMENT: 0,
      AUTRE: 0
    };

    for (const vente of ventesPayees) {
      const method = vente.methode_paiement as keyof typeof totaux;
      if (totaux[method] !== undefined) {
        totaux[method] += vente.montant_total;
      }
    }

    // Calcul de l'écart : fond_final - (fond_initial + espèces reçues)
    // L'écart positif = surplus, négatif = manque
    const esperesTheorique = session.fond_initial + totaux.ESPECES;
    const ecart = data.fond_final - esperesTheorique;

    // Chiffre d'affaires total
    const chiffreAffaires = ventesPayees.reduce((sum, v) => sum + v.montant_total, 0);

    // Mettre à jour la session
    const sessionFermee = await this.prisma.session_caisse.update({
      where: { id: sessionId },
      data: {
        fond_final: data.fond_final,
        total_especes: totaux.ESPECES,
        total_carte: totaux.CARTE,
        total_mobile: totaux.MOBILE_MONEY,
        total_cheque: totaux.CHEQUE,
        total_autre: totaux.VIREMENT + totaux.AUTRE,
        ecart: ecart,
        statut: 'FERMEE',
        date_fermeture: new Date(),
        notes_fermeture: data.notes
      },
      include: {
        caisse: { select: { id: true, nom: true, code: true } },
        utilisateur: { select: { id: true, email: true, employee: { select: { fullName: true } } } }
      }
    });

    logger.info(`Session fermée: Caisse ${sessionFermee.caisse.code}, CA: ${chiffreAffaires}, Écart: ${ecart}`);

    return {
      id: sessionFermee.id,
      caisse: sessionFermee.caisse,
      utilisateur: {
        id: sessionFermee.utilisateur.id,
        email: sessionFermee.utilisateur.email,
        fullName: sessionFermee.utilisateur.employee?.fullName
      },
      fond_initial: sessionFermee.fond_initial,
      fond_final: sessionFermee.fond_final,
      total_especes: sessionFermee.total_especes,
      total_carte: sessionFermee.total_carte,
      total_mobile: sessionFermee.total_mobile,
      total_cheque: sessionFermee.total_cheque,
      total_autre: sessionFermee.total_autre,
      ecart: sessionFermee.ecart,
      nombre_ventes: ventesPayees.length,
      chiffre_affaires: chiffreAffaires,
      statut: sessionFermee.statut as StatutSessionCaisse,
      date_ouverture: sessionFermee.date_ouverture,
      date_fermeture: sessionFermee.date_fermeture,
      notes_ouverture: sessionFermee.notes_ouverture || undefined,
      notes_fermeture: sessionFermee.notes_fermeture || undefined
    };
  }

  /**
   * Récupérer la session active d'une caisse
   */
  async getSessionActive(caisseId: string): Promise<any | null> {
    return this.prisma.session_caisse.findFirst({
      where: { caisse_id: caisseId, statut: 'OUVERTE' },
      include: {
        caisse: { select: { id: true, nom: true, code: true } },
        utilisateur: { select: { email: true, employee: { select: { fullName: true } } } },
        ventes: {
          where: { statut: 'PAYEE' },
          select: { id: true, montant_total: true, methode_paiement: true }
        }
      }
    });
  }

  /**
   * Récupérer la session active de l'utilisateur (peu importe la caisse)
   */
  async getSessionActiveUtilisateur(utilisateurId: string): Promise<any | null> {
    return this.prisma.session_caisse.findFirst({
      where: { utilisateur_id: utilisateurId, statut: 'OUVERTE' },
      include: {
        caisse: { select: { id: true, nom: true, code: true, magasin_id: true } },
        utilisateur: { select: { email: true, employee: { select: { fullName: true } } } }
      }
    });
  }

  /**
   * Récupérer l'historique des sessions d'une caisse
   */
  async getHistoriqueSessions(caisseId: string, limit = 30): Promise<any[]> {
    return this.prisma.session_caisse.findMany({
      where: { caisse_id: caisseId },
      include: {
        utilisateur: { select: { email: true, employee: { select: { fullName: true } } } },
        _count: { select: { ventes: true } }
      },
      orderBy: { date_ouverture: 'desc' },
      take: limit
    });
  }

  /**
   * Récupérer le détail d'une session (rapport complet)
   */
  async getSessionDetail(sessionId: string): Promise<RapportSessionDto> {
    const session = await this.prisma.session_caisse.findUnique({
      where: { id: sessionId },
      include: {
        caisse: { select: { id: true, nom: true, code: true } },
        utilisateur: { select: { id: true, email: true, employee: { select: { fullName: true } } } },
        ventes: { where: { statut: 'PAYEE' } }
      }
    });

    if (!session) throw new Error('Session non trouvée');

    const ventesPayees = session.ventes;
    const chiffreAffaires = ventesPayees.reduce((sum, v) => sum + v.montant_total, 0);

    return {
      id: session.id,
      caisse: session.caisse,
      utilisateur: {
        id: session.utilisateur.id,
        email: session.utilisateur.email,
        fullName: session.utilisateur.employee?.fullName
      },
      fond_initial: session.fond_initial,
      fond_final: session.fond_final,
      total_especes: session.total_especes,
      total_carte: session.total_carte,
      total_mobile: session.total_mobile,
      total_cheque: session.total_cheque,
      total_autre: session.total_autre,
      ecart: session.ecart,
      nombre_ventes: ventesPayees.length,
      chiffre_affaires: chiffreAffaires,
      statut: session.statut as StatutSessionCaisse,
      date_ouverture: session.date_ouverture,
      date_fermeture: session.date_fermeture,
      notes_ouverture: session.notes_ouverture || undefined,
      notes_fermeture: session.notes_fermeture || undefined
    };
  }
}

export default CaisseService;
