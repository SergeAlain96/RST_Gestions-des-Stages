import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { RegisterData } from '../types';

const FILIERES = [
  'Informatique',
  'Réseaux & Télécommunications',
  'Génie Logiciel',
  'Systèmes Embarqués',
  'Sécurité Informatique',
  'Data Science',
  'Génie Électrique',
];

const DEPARTEMENTS = [
  'Informatique',
  'Mathématiques',
  'Physique',
  'Génie Électrique',
  'Télécommunications',
  'Génie Civil',
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterData>({
    role: 'etudiant',
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    // Étudiant
    matricule: '',
    filiere: '',
    niveau: '',
    promotion: new Date().getFullYear(),
    // Enseignant
    departement: '',
    specialite: '',
    telephone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEtudiant = form.role === 'etudiant';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'promotion' ? Number(value) : value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    setErrors({});
    setLoading(true);
    try {
      await register(form);
      navigate(isEtudiant ? '/dashboard' : '/enseignant');
    } catch (err: any) {
      if (err.response?.data) {
        const data = err.response.data;
        const fieldErrors: Record<string, string> = {};
        for (const [key, val] of Object.entries(data)) {
          if (Array.isArray(val)) {
            fieldErrors[key] = val.join(' ');
          } else if (typeof val === 'string') {
            fieldErrors[key] = val;
          }
        }
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          setGlobalError("Erreur lors de l'inscription.");
        }
      } else {
        setGlobalError('Erreur de connexion au serveur.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900">RST <span className="text-blue-600">Projets</span></h1>
              <p className="text-xs text-gray-500">Plateforme de Gestion</p>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Inscription</h2>
          <p className="text-gray-500 text-sm mb-6">Créez votre compte sur la plateforme</p>

          {globalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {globalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ─── Choix du rôle ─── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Je suis :</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, role: 'etudiant' }))}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    isEtudiant
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className="text-2xl">🎓</span>
                  <div className="text-left">
                    <p className={`font-semibold text-sm ${isEtudiant ? 'text-blue-700' : 'text-gray-700'}`}>Étudiant</p>
                    <p className="text-xs text-gray-500">Soumettre des projets & stages</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, role: 'enseignant' }))}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    !isEtudiant
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className="text-2xl">👨‍🏫</span>
                  <div className="text-left">
                    <p className={`font-semibold text-sm ${!isEtudiant ? 'text-purple-700' : 'text-gray-700'}`}>Enseignant</p>
                    <p className="text-xs text-gray-500">Encadrer & évaluer</p>
                  </div>
                </button>
              </div>
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
            </div>

            {/* ─── Identité ─── */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input id="first_name" name="first_name" required value={form.first_name} onChange={handleChange} className={inputClass('first_name')} placeholder="Abdoulaye" />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input id="last_name" name="last_name" required value={form.last_name} onChange={handleChange} className={inputClass('last_name')} placeholder="Ouédraogo" />
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
              </div>
            </div>

            {/* ─── Compte ─── */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
              <input id="username" name="username" required value={form.username} onChange={handleChange} className={inputClass('username')} placeholder="a.ouedraogo" />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} className={inputClass('email')} placeholder={isEtudiant ? 'abdoulaye@univ-ouaga.bf' : 'prof.diallo@univ-ouaga.bf'} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* ─── Mots de passe ─── */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <input id="password" name="password" type="password" required value={form.password} onChange={handleChange} className={inputClass('password')} placeholder="••••••••" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-1">Confirmer</label>
                <input id="password2" name="password2" type="password" required value={form.password2} onChange={handleChange} className={inputClass('password2')} placeholder="••••••••" />
                {errors.password2 && <p className="text-red-500 text-xs mt-1">{errors.password2}</p>}
              </div>
            </div>

            {/* ─── Champs conditionnels : Étudiant ─── */}
            {isEtudiant && (
              <>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">🎓 Informations académiques</p>
                </div>

                <div>
                  <label htmlFor="matricule" className="block text-sm font-medium text-gray-700 mb-1">Matricule</label>
                  <input id="matricule" name="matricule" required value={form.matricule} onChange={handleChange} className={inputClass('matricule')} placeholder="ETU-2026-001" />
                  {errors.matricule && <p className="text-red-500 text-xs mt-1">{errors.matricule}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="filiere" className="block text-sm font-medium text-gray-700 mb-1">Filière</label>
                    <select id="filiere" name="filiere" required value={form.filiere} onChange={handleChange} className={inputClass('filiere')}>
                      <option value="">Choisir...</option>
                      {FILIERES.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                    {errors.filiere && <p className="text-red-500 text-xs mt-1">{errors.filiere}</p>}
                  </div>
                  <div>
                    <label htmlFor="niveau" className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                    <select id="niveau" name="niveau" required value={form.niveau} onChange={handleChange} className={inputClass('niveau')}>
                      <option value="">Choisir...</option>
                      <option value="L1">Licence 1</option>
                      <option value="L2">Licence 2</option>
                      <option value="L3">Licence 3</option>
                      <option value="M1">Master 1</option>
                      <option value="M2">Master 2</option>
                    </select>
                    {errors.niveau && <p className="text-red-500 text-xs mt-1">{errors.niveau}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="promotion" className="block text-sm font-medium text-gray-700 mb-1">Promotion</label>
                  <input id="promotion" name="promotion" type="number" required min={2020} max={2035} value={form.promotion} onChange={handleChange} className={inputClass('promotion')} />
                  {errors.promotion && <p className="text-red-500 text-xs mt-1">{errors.promotion}</p>}
                </div>
              </>
            )}

            {/* ─── Champs conditionnels : Enseignant ─── */}
            {!isEtudiant && (
              <>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3">👨‍🏫 Informations professionnelles</p>
                </div>

                <div>
                  <label htmlFor="departement" className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                  <select id="departement" name="departement" value={form.departement} onChange={handleChange} className={inputClass('departement')}>
                    <option value="">Choisir...</option>
                    {DEPARTEMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.departement && <p className="text-red-500 text-xs mt-1">{errors.departement}</p>}
                </div>

                <div>
                  <label htmlFor="specialite" className="block text-sm font-medium text-gray-700 mb-1">Spécialité</label>
                  <input id="specialite" name="specialite" value={form.specialite} onChange={handleChange} className={inputClass('specialite')} placeholder="Réseaux, Intelligence Artificielle..." />
                  {errors.specialite && <p className="text-red-500 text-xs mt-1">{errors.specialite}</p>}
                </div>

                <div>
                  <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input id="telephone" name="telephone" type="tel" value={form.telephone} onChange={handleChange} className={inputClass('telephone')} placeholder="+226 70 00 00 00" />
                  {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md ${
                isEtudiant
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Inscription...
                </span>
              ) : (
                `Créer mon compte ${isEtudiant ? 'étudiant' : 'enseignant'}`
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
