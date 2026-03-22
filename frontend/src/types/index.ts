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

// ── Groupes de Projets ────────────────────────────────────

export type CodeGroupe = 'SI' | 'RS' | 'ADMIN_RESEAUX' | 'SUPERVISION' | 'SECURITE' | 'AUTRES';

export interface GroupeProjet {
  id: number;
  code: CodeGroupe;
  nom: string;
  description: string;
  couleur: string;
}

export const GROUPE_LABELS: Record<CodeGroupe, string> = {
  SI: 'Systèmes Informatiques',
  RS: 'Réseaux et Systèmes',
  ADMIN_RESEAUX: 'Administration Réseaux',
  SUPERVISION: 'Supervision',
  SECURITE: 'Sécurité',
  AUTRES: 'Autres',
};

export const GROUPE_COLORS: Record<CodeGroupe, string> = {
  SI: 'bg-blue-100 text-blue-800',
  RS: 'bg-green-100 text-green-800',
  ADMIN_RESEAUX: 'bg-purple-100 text-purple-800',
  SUPERVISION: 'bg-orange-100 text-orange-800',
  SECURITE: 'bg-red-100 text-red-800',
  AUTRES: 'bg-gray-100 text-gray-800',
};

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
  role: 'etudiant' | 'enseignant' | 'entreprise' | 'admin' | 'visiteur';
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
  entreprise: {
    id: number;
    nom: string;
    secteur: string;
    ville: string;
    est_valide: boolean;
  } | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  role: 'etudiant' | 'enseignant' | 'entreprise';
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  // Étudiant
  matricule?: string;
  filiere?: string;
  niveau?: string;
  promotion?: number;
  // Enseignant
  departement?: string;
  specialite?: string;
  telephone?: string;
  // Entreprise
  nom_entreprise?: string;
  secteur?: string;
  ville?: string;
  tel_entreprise?: string;
  site_web?: string;
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

// ── Évaluations ─────────────────────────────────────────

export interface Evaluation {
  id: number;
  projet: number | null;
  stage: number | null;
  enseignant: number;
  enseignant_nom: string;
  note_rapport: number | null;
  note_soutenance: number | null;
  note_technique: number | null;
  note_comportement: number | null;
  note_moyenne: number | null;
  commentaire: string;
  date_evaluation: string;
  date_modification: string;
}

export interface EvaluationFormData {
  projet?: number | null;
  stage?: number | null;
  note_rapport: number | null;
  note_soutenance: number | null;
  note_technique: number | null;
  note_comportement: number | null;
  commentaire: string;
}

export interface EnseignantDashboardData {
  enseignant: Enseignant;
  stats: {
    total_projets: number;
    projets_en_attente: number;
    projets_en_cours: number;
    projets_termines: number;
    projets_valides: number;
    projets_refuses: number;
    total_stages: number;
    stages_en_cours: number;
    stages_termines: number;
    total_evaluations: number;
  };
  projets: Projet[];
  stages: Stage[];
}

export interface AdminDashboardData {
  stats: {
    total_etudiants: number;
    total_enseignants: number;
    total_entreprises: number;
    total_projets: number;
    total_stages: number;
    projets_en_attente: number;
    stages_en_attente: number;
    entreprises_en_attente: number;
  };
  projets_en_attente: Projet[];
  stages_en_attente: Stage[];
  entreprises_en_attente: Entreprise[];
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
  groupe?: GroupeProjet | null;
  // Détail complet
  tuteur?: Enseignant | null;
  etudiants?: Etudiant[];
}

// ── Stages ──────────────────────────────────────────────

export type TypeStage = 'OBSERVATION' | 'TECHNICIEN' | 'INGENIEUR' | 'PFE';
export type StatutStage = 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'ARCHIVE';

export type NiveauAcademique = 'LICENCE' | 'IT' | 'MASTER' | 'IC';

export const NIVEAU_ACADEMIQUE_LABELS: Record<NiveauAcademique, string> = {
  LICENCE: 'Licence',
  IT: 'IT (Ingénieur des Travaux)',
  MASTER: 'Master',
  IC: 'IC (Ingénieur Concepteur)',
};

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
  niveau_academique?: NiveauAcademique | '';
  duree?: number | null;
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

// ── Entreprises & Offres de Stage ────────────────────────

export interface Entreprise {
  id: number;
  nom: string;
  secteur: string;
  description: string;
  adresse: string;
  ville: string;
  pays: string;
  telephone: string;
  site_web: string;
  logo: string | null;
  email: string;
  est_valide: boolean;
  nb_offres: number;
  date_inscription: string;
}

export type TypeOffre = 'OBSERVATION' | 'TECHNICIEN' | 'INGENIEUR' | 'PFE';
export type NiveauOffre = 'LICENCE' | 'IT' | 'MASTER' | 'IC';
export type StatutOffre = 'OUVERT' | 'FERME' | 'ARCHIVE';

export interface OffreStage {
  id: number;
  entreprise: Entreprise;
  entreprise_nom: string;
  entreprise_ville: string;
  entreprise_logo: string | null;
  titre: string;
  description: string;
  type_stage: TypeOffre;
  niveau_academique: NiveauOffre;
  duree: number;
  technologies: string;
  technologies_list: string[];
  date_debut: string | null;
  date_limite_candidature: string | null;
  remuneration: string;
  statut: StatutOffre;
  date_creation: string;
  date_modification: string;
}

export interface OffreStageFormData {
  titre: string;
  description: string;
  type_stage: TypeOffre;
  niveau_academique: NiveauOffre;
  duree: number;
  technologies: string;
  date_debut?: string;
  date_limite_candidature?: string;
  remuneration?: string;
}

export const TYPE_OFFRE_LABELS: Record<TypeOffre, string> = {
  OBSERVATION: "Stage d'observation",
  TECHNICIEN: 'Stage technicien',
  INGENIEUR: 'Stage ingénieur',
  PFE: 'Stage PFE',
};

export const STATUT_OFFRE_LABELS: Record<StatutOffre, string> = {
  OUVERT: 'Ouvert',
  FERME: 'Fermé',
  ARCHIVE: 'Archivé',
};

export const STATUT_OFFRE_COLORS: Record<StatutOffre, string> = {
  OUVERT: 'bg-green-100 text-green-800',
  FERME: 'bg-red-100 text-red-800',
  ARCHIVE: 'bg-gray-100 text-gray-800',
};

export const NIVEAU_OFFRE_LABELS: Record<NiveauOffre, string> = {
  LICENCE: 'Licence',
  IT: 'IT (Ingénieur des Travaux)',
  MASTER: 'Master',
  IC: 'IC (Ingénieur Concepteur)',
};

// ── CV Étudiant ─────────────────────────────────────────

export interface Competence {
  id: number;
  nom: string;
  categorie: string;
}

export interface CV {
  id: number;
  etudiant: Etudiant;
  titre: string;
  resume: string;
  competences: Competence[];
  cv_pdf: string | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
  disponible_pour_stage: boolean;
  date_creation: string;
  date_modification: string;
}

export interface ProfilMatchingResult {
  cv: CV;
  score: number;
  matched_competences: string[];
}
