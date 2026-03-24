import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import esiLogo from '../../Logo_esi_best (1).jpg';

export default function Header() {
  const { user, isAuthenticated, isEtudiant, isEnseignant, isEntreprise, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Titre ESI */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow border border-gray-200 bg-white">
              <img src={esiLogo} alt="Logo ESI" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                <span className="text-green-700">ESI</span> Portail
              </h1>
              <p className="text-xs text-gray-500 -mt-0.5">École Supérieure d’Informatique — UNB</p>
            </div>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors">
              Accueil
            </Link>
            <Link to="/projets" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors">
              Projets
            </Link>
            <Link to="/stages" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors">
              Stages &amp; Emplois
            </Link>
            <Link to="/offres" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors">
              Offres de Stage
            </Link>
            <Link to="/profils-etudiants" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors">
              Profils Étudiants
            </Link>
          </nav>

          {/* Auth desktop */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated && user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {user.first_name}
                  </span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    {isEtudiant && (
                      <>
                        <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <span>📊</span> Mon Dashboard
                        </Link>
                        <Link to="/submit/projet" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <span>📝</span> Déposer un projet
                        </Link>
                        <Link to="/submit/stage" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <span>🏢</span> Déposer un stage
                        </Link>
                        <Link to="/profil-etudiant" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <span>📄</span> Mon CV
                        </Link>
                      </>
                    )}
                    {isEnseignant && (
                      <>
                        <Link to="/enseignant" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <span>📊</span> Mon Dashboard
                        </Link>
                        <Link to="/enseignant/evaluations" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <span>📝</span> Mes évaluations
                        </Link>
                      </>
                    )}
                    {isEntreprise && (
                      <>
                        <Link to="/entreprise" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <span>📊</span> Mon Dashboard
                        </Link>
                        <Link to="/entreprise/offres/nouvelle" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <span>➕</span> Publier une offre
                        </Link>
                      </>
                    )}
                    {user?.role === 'admin' && (
                      <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <span>🛠️</span> Administration
                      </Link>
                    )}
                    <div className="border-t border-gray-100">
                      <button
                        onClick={() => { setMenuOpen(false); logout(); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <span>🚪</span> Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors">
                  Connexion
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-green-700 hover:bg-green-800 rounded-lg transition-colors shadow-sm">
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Bouton mobile */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white pb-4">
          <div className="px-4 pt-2 space-y-1">
            <Link to="/" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-green-50 rounded-lg">Accueil</Link>
            <Link to="/projets" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-green-50 rounded-lg">Projets</Link>
            <Link to="/stages" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-green-50 rounded-lg">Stages &amp; Emplois</Link>
            <Link to="/offres" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-green-50 rounded-lg">Offres de Stage</Link>
            <Link to="/profils-etudiants" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-green-50 rounded-lg">Profils Étudiants</Link>
          </div>
          <div className="mt-3 px-4 pt-3 border-t border-gray-100 space-y-1">
            {isAuthenticated && user ? (
              <>
                <div className="px-4 py-2 text-sm font-semibold text-gray-900">{user.first_name} {user.last_name}</div>
                {isEtudiant && (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">📊 Mon Dashboard</Link>
                    <Link to="/submit/projet" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">📝 Déposer un projet</Link>
                    <Link to="/submit/stage" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">🏢 Déposer un stage</Link>
                    <Link to="/profil-etudiant" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">📄 Mon CV</Link>
                  </>
                )}
                {isEnseignant && (
                  <>
                    <Link to="/enseignant" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">📊 Mon Dashboard</Link>
                    <Link to="/enseignant/evaluations" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">📝 Mes évaluations</Link>
                  </>
                )}
                {isEntreprise && (
                  <>
                    <Link to="/entreprise" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">📊 Mon Dashboard</Link>
                    <Link to="/entreprise/offres/nouvelle" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">➕ Publier une offre</Link>
                  </>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">🛠️ Administration</Link>
                )}
                <button onClick={() => { setMobileOpen(false); logout(); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                  🚪 Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-green-50 rounded-lg">Connexion</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm font-medium text-white bg-green-700 hover:bg-green-800 rounded-lg text-center">Inscription</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
