import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { submitService } from '../services/api';
import { TYPE_STAGE_LABELS } from '../types';
import type { TypeStage } from '../types';

export default function SubmitStagePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    titre: '',
    description: '',
    entreprise: '',
    ville: '',
    pays: 'Burkina Faso',
    type_stage: 'PFE' as TypeStage,
    technologies: '',
    annee_universitaire: '2025-2026',
    date_debut: '',
    date_fin: '',
    lien_entreprise: '',
    maitre_stage: '',
  });
  const [image, setImage] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('titre', form.titre);
      formData.append('description', form.description);
      formData.append('entreprise', form.entreprise);
      formData.append('ville', form.ville);
      formData.append('pays', form.pays);
      formData.append('type_stage', form.type_stage);
      formData.append('technologies', form.technologies);
      formData.append('annee_universitaire', form.annee_universitaire);
      if (form.date_debut) formData.append('date_debut', form.date_debut);
      if (form.date_fin) formData.append('date_fin', form.date_fin);
      if (form.lien_entreprise) formData.append('lien_entreprise', form.lien_entreprise);
      if (form.maitre_stage) formData.append('maitre_stage', form.maitre_stage);
      if (image) formData.append('image', image);

      await submitService.submitStage(formData);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: unknown) {
      const data =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: Record<string, unknown> } }).response?.data
          : undefined;

      if (data) {
        const msgs = Object.values(data).flat().join(' ');
        setError(msgs || 'Erreur lors de la soumission.');
      } else {
        setError('Erreur de connexion au serveur.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Stage soumis avec succès !</h2>
          <p className="text-gray-500 text-sm">Votre stage a été enregistré et est en attente de validation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Soumettre un stage</span>
          </nav>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Soumettre un nouveau stage</h1>
          <p className="text-gray-500 text-sm mb-6">Renseignez les informations sur votre stage en entreprise.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Titre */}
            <div>
              <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">Titre du stage *</label>
              <input id="titre" name="titre" required value={form.titre} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm" placeholder="Ex: Développement d'un portail web pour la gestion RH" />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea id="description" name="description" required rows={5} value={form.description} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm resize-none" placeholder="Décrivez les missions et objectifs du stage..." />
            </div>

            {/* Entreprise & Localisation */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Entreprise d'accueil</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="entreprise" className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise *</label>
                <input id="entreprise" name="entreprise" required value={form.entreprise} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm" placeholder="Ex: Orange Burkina" />
              </div>
              <div>
                <label htmlFor="maitre_stage" className="block text-sm font-medium text-gray-700 mb-1">Maître de stage</label>
                <input id="maitre_stage" name="maitre_stage" value={form.maitre_stage} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm" placeholder="Nom du maître de stage" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ville" className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                <input id="ville" name="ville" required value={form.ville} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm" placeholder="Ouagadougou" />
              </div>
              <div>
                <label htmlFor="pays" className="block text-sm font-medium text-gray-700 mb-1">Pays *</label>
                <input id="pays" name="pays" required value={form.pays} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm" placeholder="Burkina Faso" />
              </div>
            </div>

            <div>
              <label htmlFor="lien_entreprise" className="block text-sm font-medium text-gray-700 mb-1">Site web de l'entreprise</label>
              <input id="lien_entreprise" name="lien_entreprise" type="url" value={form.lien_entreprise} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm" placeholder="https://www.orange.bf" />
            </div>

            {/* Détails du stage */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Détails du stage</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type_stage" className="block text-sm font-medium text-gray-700 mb-1">Type de stage *</label>
                <select id="type_stage" name="type_stage" required value={form.type_stage} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm">
                  {(Object.keys(TYPE_STAGE_LABELS) as TypeStage[]).map((key) => (
                    <option key={key} value={key}>{TYPE_STAGE_LABELS[key]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="annee_universitaire" className="block text-sm font-medium text-gray-700 mb-1">Année universitaire *</label>
                <select id="annee_universitaire" name="annee_universitaire" required value={form.annee_universitaire} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm">
                  <option value="2025-2026">2025-2026</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2023-2024">2023-2024</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date_debut" className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                <input id="date_debut" name="date_debut" type="date" value={form.date_debut} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm" />
              </div>
              <div>
                <label htmlFor="date_fin" className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                <input id="date_fin" name="date_fin" type="date" value={form.date_fin} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm" />
              </div>
            </div>

            <div>
              <label htmlFor="technologies" className="block text-sm font-medium text-gray-700 mb-1">Technologies utilisées *</label>
              <input id="technologies" name="technologies" required value={form.technologies} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm" placeholder="React, Node.js, MySQL, Docker" />
              <p className="text-xs text-gray-400 mt-1">Séparez les technologies par des virgules</p>
            </div>

            {/* Image */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Image illustrative</label>
              <input id="image" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Link to="/dashboard" className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 shadow-md text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Soumission en cours...
                  </span>
                ) : 'Soumettre le stage'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
