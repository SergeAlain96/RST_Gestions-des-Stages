import axios from 'axios';
import type {
  Projet, Stage, PaginatedResponse,
  AuthTokens, UserProfile, LoginCredentials, RegisterData, DashboardData,
  EnseignantDashboardData, Evaluation, EvaluationFormData,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Intercepteur : injecter le token JWT automatiquement ──
api.interceptors.request.use((config) => {
  const tokens = localStorage.getItem('rst_tokens');
  if (tokens) {
    const { access } = JSON.parse(tokens) as AuthTokens;
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// ── Intercepteur : refresh automatique si 401 ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const tokens = localStorage.getItem('rst_tokens');
        if (tokens) {
          const { refresh } = JSON.parse(tokens) as AuthTokens;
          const res = await axios.post('/api/auth/refresh/', { refresh });
          const newTokens: AuthTokens = { access: res.data.access, refresh };
          localStorage.setItem('rst_tokens', JSON.stringify(newTokens));
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('rst_tokens');
        localStorage.removeItem('rst_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth Service ────────────────────────────────────────

export const authService = {
  login: async (credentials: LoginCredentials): Promise<{ user: UserProfile; tokens: AuthTokens }> => {
    // 1. Obtenir les tokens
    const tokenRes = await api.post<AuthTokens>('/auth/login/', credentials);
    const tokens = tokenRes.data;
    localStorage.setItem('rst_tokens', JSON.stringify(tokens));

    // 2. Récupérer le profil
    const profileRes = await api.get<UserProfile>('/auth/profile/');
    const user = profileRes.data;
    localStorage.setItem('rst_user', JSON.stringify(user));

    return { user, tokens };
  },

  register: async (data: RegisterData): Promise<{ user: UserProfile; tokens: AuthTokens }> => {
    const res = await api.post<{ user: UserProfile; tokens: AuthTokens }>('/auth/register/', data);
    localStorage.setItem('rst_tokens', JSON.stringify(res.data.tokens));
    localStorage.setItem('rst_user', JSON.stringify(res.data.user));
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('rst_tokens');
    localStorage.removeItem('rst_user');
  },

  getProfile: async (): Promise<UserProfile> => {
    const res = await api.get<UserProfile>('/auth/profile/');
    return res.data;
  },

  getStoredUser: (): UserProfile | null => {
    const raw = localStorage.getItem('rst_user');
    return raw ? JSON.parse(raw) : null;
  },

  getStoredTokens: (): AuthTokens | null => {
    const raw = localStorage.getItem('rst_tokens');
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('rst_tokens');
  },
};

// ── Dashboard Service ───────────────────────────────────

export const dashboardService = {
  getEtudiantDashboard: async (): Promise<DashboardData> => {
    const res = await api.get<DashboardData>('/dashboard/etudiant/');
    return res.data;
  },

  getEnseignantDashboard: async (): Promise<EnseignantDashboardData> => {
    const res = await api.get<EnseignantDashboardData>('/dashboard/enseignant/');
    return res.data;
  },
};

// ── Enseignant Service (validation, assignation) ────────

export const enseignantService = {
  /** Valider/refuser un projet */
  validateProjet: async (id: number, statut: string): Promise<Projet> => {
    const res = await api.patch<Projet>(`/enseignant/projets/${id}/validate/`, { statut });
    return res.data;
  },

  /** Changer le statut d'un stage */
  validateStage: async (id: number, statut: string): Promise<Stage> => {
    const res = await api.patch<Stage>(`/enseignant/stages/${id}/validate/`, { statut });
    return res.data;
  },

  /** S'assigner comme tuteur d'un projet */
  assignProjet: async (id: number): Promise<Projet> => {
    const res = await api.post<Projet>(`/enseignant/projets/${id}/assign/`);
    return res.data;
  },

  /** S'assigner comme tuteur d'un stage */
  assignStage: async (id: number): Promise<Stage> => {
    const res = await api.post<Stage>(`/enseignant/stages/${id}/assign/`);
    return res.data;
  },
};

// ── Evaluation Service ──────────────────────────────────

export const evaluationService = {
  /** Liste des évaluations de l'enseignant */
  getAll: async (): Promise<Evaluation[]> => {
    const res = await api.get<Evaluation[]>('/evaluations/');
    return res.data;
  },

  /** Détail d'une évaluation */
  getById: async (id: number): Promise<Evaluation> => {
    const res = await api.get<Evaluation>(`/evaluations/${id}/`);
    return res.data;
  },

  /** Créer une évaluation */
  create: async (data: EvaluationFormData): Promise<Evaluation> => {
    const res = await api.post<Evaluation>('/evaluations/', data);
    return res.data;
  },

  /** Modifier une évaluation */
  update: async (id: number, data: EvaluationFormData): Promise<Evaluation> => {
    const res = await api.put<Evaluation>(`/evaluations/${id}/`, data);
    return res.data;
  },

  /** Supprimer une évaluation */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/evaluations/${id}/`);
  },
};

// ── Submission Service ──────────────────────────────────

export const submitService = {
  submitProjet: async (data: FormData): Promise<Projet> => {
    const res = await api.post<Projet>('/submit/projet/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  submitStage: async (data: FormData): Promise<Stage> => {
    const res = await api.post<Stage>('/submit/stage/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export const projetService = {
  /** Liste paginée des projets avec filtres */
  getAll: async (params?: {
    page?: number;
    search?: string;
    ordering?: string;
    type_projet?: string;
    statut?: string;
    annee_universitaire?: string;
    technologies?: string;
  }): Promise<PaginatedResponse<Projet>> => {
    const response = await api.get<PaginatedResponse<Projet>>('/projets/', { params });
    return response.data;
  },

  /** Détail d'un projet */
  getById: async (id: number): Promise<Projet> => {
    const response = await api.get<Projet>(`/projets/${id}/`);
    return response.data;
  },

  /** Liste des années universitaires disponibles */
  getAnnees: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/projets/annees/');
    return response.data;
  },

  /** Liste des technologies disponibles */
  getTechnologies: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/projets/technologies/');
    return response.data;
  },
};

export const stageService = {
  /** Liste paginée des stages avec filtres */
  getAll: async (params?: {
    page?: number;
    search?: string;
    ordering?: string;
    type_stage?: string;
    statut?: string;
    annee_universitaire?: string;
    entreprise?: string;
    ville?: string;
  }): Promise<PaginatedResponse<Stage>> => {
    const response = await api.get<PaginatedResponse<Stage>>('/stages/', { params });
    return response.data;
  },

  /** Détail d'un stage */
  getById: async (id: number): Promise<Stage> => {
    const response = await api.get<Stage>(`/stages/${id}/`);
    return response.data;
  },

  /** Liste des entreprises disponibles */
  getEntreprises: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/stages/entreprises/');
    return response.data;
  },
};

export default api;
