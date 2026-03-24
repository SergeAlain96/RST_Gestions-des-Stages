import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import esiLogo from '../../Logo_esi_best (1).jpg';

export default function LoginPage() {
const { login } = useAuth();
const navigate = useNavigate();
const [form, setForm] = useState({ username: '', password: '' });
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);

      const storedUserRaw = globalThis.localStorage.getItem('rst_user');
      const role = storedUserRaw
        ? (JSON.parse(storedUserRaw) as { role?: string }).role
        : undefined;

      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'enseignant') {
        navigate('/enseignant');
      } else if (role === 'entreprise') {
        navigate('/entreprise');
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const status =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;
      if (status === 401) {
        setError('Nom d\'utilisateur ou mot de passe incorrect.');
      } else {
        setError('Erreur de connexion. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white">
              <img src={esiLogo} alt="Logo ESI" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900">RST <span className="text-blue-600">Projets</span></h1>
              <p className="text-xs text-gray-500">Plateforme de Gestion</p>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Connexion</h2>
          <p className="text-gray-500 text-sm mb-6">Accédez à votre espace étudiant</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                placeholder="Votre nom d'utilisateur"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                placeholder="Votre mot de passe"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connexion...
                </span>
              ) : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 RST Projets — Université de Ouagadougou
        </p>
      </div>
    </div>
  );
}
