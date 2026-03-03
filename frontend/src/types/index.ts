// Types correspondant aux modèles Django

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Enseignant {
  id: number;
  user: User;
  nom_complet: string;
  departement: string;
  specialite: string;
  telephone: string;
}

export interface Etudiant {
  id: number;
  user: User;
  nom_complet: string;
  matricule: string;
  filiere: string;
  niveau: 'L1' | 'L2' | 'L3' | 'M1' | 'M2';
  promotion: number;
}

// ── Auth ────────────────────────────────────────────────

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'etudiant' | 'enseignant' | 'admin' | 'visiteur';
  etudiant: {
    id: number;
    matricule: string;
    filiere: string;
    niveau: string;
    promotion: number;
  } | null;
  enseignant: {
    id: number;
    departement: string;
    specialite: string;
  } | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  matricule: string;
  filiere: string;
  niveau: string;
  promotion: number;
}

export interface DashboardData {
  etudiant: Etudiant;
  stats: {
    total_projets: number;
    projets_en_cours: number;
    projets_termines: number;
    projets_en_attente: number;
    total_stages: number;
    stages_en_cours: number;
    stages_termines: number;
  };
  projets: Projet[];
  stages: Stage[];
}

export type TypeProjet = 'PFE' | 'PFA' | 'MINI' | 'STAGE';
export type StatutProjet = 'EN_ATTENTE' | 'VALIDE' | 'REFUSE' | 'EN_COURS' | 'TERMINE' | 'ARCHIVE';

export interface Projet {
  id: number;
  titre: string;
  description: string;
  type_projet: TypeProjet;
  statut: StatutProjet;
  technologies: string;
  technologies_list: string[];
  annee_universitaire: string;
  date_soumission: string;
  date_modification?: string;
  image: string | null;
  document?: string | null;
  lien_github?: string | null;
  lien_demo?: string | null;
  tuteur_nom?: string | null;
  etudiants_noms?: string[];
  // Détail complet
  tuteur?: Enseignant | null;
  etudiants?: Etudiant[];
}

// ── Stages ──────────────────────────────────────────────

export type TypeStage = 'OBSERVATION' | 'TECHNICIEN' | 'INGENIEUR' | 'PFE';
export type StatutStage = 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'ARCHIVE';

export interface Stage {
  id: number;
  titre: string;
  description: string;
  entreprise: string;
  ville: string;
  pays: string;
  type_stage: TypeStage;
  statut: StatutStage;
  technologies: string;
  technologies_list: string[];
  annee_universitaire: string;
  date_debut: string | null;
  date_fin: string | null;
  date_creation: string;
  image: string | null;
  rapport?: string | null;
  lien_entreprise?: string | null;
  etudiant_nom?: string;
  tuteur_nom?: string | null;
  maitre_stage?: string;
  // Détail complet
  etudiant?: Etudiant;
  tuteur_academique?: Enseignant | null;
}

// ── Pagination ──────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ── Labels ──────────────────────────────────────────────

export const TYPE_PROJET_LABELS: Record<TypeProjet, string> = {
  PFE: "Projet de Fin d'Études",
  PFA: "Projet de Fin d'Année",
  MINI: 'Mini Projet',
  STAGE: 'Stage',
};

export const STATUT_PROJET_LABELS: Record<StatutProjet, string> = {
  EN_ATTENTE: 'En attente',
  VALIDE: 'Validé',
  REFUSE: 'Refusé',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  ARCHIVE: 'Archivé',
};

export const STATUT_COLORS: Record<StatutProjet | StatutStage, string> = {
  EN_ATTENTE: 'bg-yellow-100 text-yellow-800',
  VALIDE: 'bg-green-100 text-green-800',
  REFUSE: 'bg-red-100 text-red-800',
  EN_COURS: 'bg-blue-100 text-blue-800',
  TERMINE: 'bg-purple-100 text-purple-800',
  ARCHIVE: 'bg-gray-100 text-gray-800',
};

export const TYPE_STAGE_LABELS: Record<TypeStage, string> = {
  OBSERVATION: "Stage d'observation",
  TECHNICIEN: 'Stage technicien',
  INGENIEUR: 'Stage ingénieur',
  PFE: 'Stage PFE',
};

export const STATUT_STAGE_LABELS: Record<StatutStage, string> = {
  EN_ATTENTE: 'En attente',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  ARCHIVE: 'Archivé',
};
