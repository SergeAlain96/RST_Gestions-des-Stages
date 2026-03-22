import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile, LoginCredentials, RegisterData } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
  isEtudiant: boolean;
  isEnseignant: boolean;
  isEntreprise: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur depuis le localStorage au démarrage
  useEffect(() => {
    const init = async () => {
      const storedUser = authService.getStoredUser();
      const tokens = authService.getStoredTokens();

      if (storedUser && tokens) {
        setUser(storedUser);
        // Rafraîchir le profil en arrière-plan
        try {
          const freshProfile = await authService.getProfile();
          setUser(freshProfile);
          localStorage.setItem('rst_user', JSON.stringify(freshProfile));
        } catch {
          // Token expiré → déconnecter
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { user: profile } = await authService.login(credentials);
    setUser(profile);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const { user: profile } = await authService.register(data);
    setUser(profile);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await authService.getProfile();
    setUser(profile);
    localStorage.setItem('rst_user', JSON.stringify(profile));
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshProfile,
    isAuthenticated: !!user,
    isEtudiant: user?.role === 'etudiant',
    isEnseignant: user?.role === 'enseignant',
    isEntreprise: user?.role === 'entreprise',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}
