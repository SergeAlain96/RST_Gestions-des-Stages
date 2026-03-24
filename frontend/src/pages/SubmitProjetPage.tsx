import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { submitService } from '../services/api';
import { TYPE_PROJET_LABELS } from '../types';
import type { TypeProjet } from '../types';

export default function SubmitProjetPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    titre: '',
    description: '',
    type_projet: 'PFE' as TypeProjet,
    technologies: '',
    annee_universitaire: '2025-2026',
    lien_github: '',
    lien_demo: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [document, setDocument] = useState<File | null>(null);

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
      formData.append('type_projet', form.type_projet);
      formData.append('technologies', form.technologies);
      formData.append('annee_universitaire', form.annee_universitaire);
      if (form.lien_github) formData.append('lien_github', form.lien_github);
      if (form.lien_demo) formData.append('lien_demo', form.lien_demo);
      if (image) formData.append('image', image);
      if (document) formData.append('document', document);

      await submitService.submitProjet(formData);
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Projet soumis avec succès !</h2>
          <p className="text-gray-500 text-sm">Votre projet est en attente de validation par un tuteur.</p>
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
            <span className="text-gray-900 font-medium">Soumettre un projet</span>
          </nav>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Soumettre un nouveau projet</h1>
          <p className="text-gray-500 text-sm mb-6">Remplissez les informations sur votre projet académique.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">Titre du projet *</label>
              <input id="titre" name="titre" required value={form.titre} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="Ex: Plateforme E-Learning avec IA" />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea id="description" name="description" required rows={5} value={form.description} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none" placeholder="Décrivez votre projet en détail..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="type_projet" className="block text-sm font-medium text-gray-700 mb-1">Type de projet *</label>
                <select id="type_projet" name="type_projet" required value={form.type_projet} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm">
                  {(Object.keys(TYPE_PROJET_LABELS) as TypeProjet[]).map((key) => (
                    <option key={key} value={key}>{TYPE_PROJET_LABELS[key]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="annee_universitaire" className="block text-sm font-medium text-gray-700 mb-1">Année universitaire *</label>
                <select id="annee_universitaire" name="annee_universitaire" required value={form.annee_universitaire} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm">
                  <option value="2025-2026">2025-2026</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2023-2024">2023-2024</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="technologies" className="block text-sm font-medium text-gray-700 mb-1">Technologies utilisées *</label>
              <input id="technologies" name="technologies" required value={form.technologies} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="React, Django, PostgreSQL, Docker" />
              <p className="text-xs text-gray-400 mt-1">Séparez les technologies par des virgules</p>
            </div>

            {/* Liens */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="lien_github" className="block text-sm font-medium text-gray-700 mb-1">Lien GitHub</label>
                <input id="lien_github" name="lien_github" type="url" value={form.lien_github} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="https://github.com/..." />
              </div>
              <div>
                <label htmlFor="lien_demo" className="block text-sm font-medium text-gray-700 mb-1">Lien démo</label>
                <input id="lien_demo" name="lien_demo" type="url" value={form.lien_demo} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="https://demo.example.com" />
              </div>
            </div>

            {/* Fichiers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Image du projet</label>
                <input id="image" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              <div>
                <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">Document (PDF)</label>
                <input id="document" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setDocument(e.target.files?.[0] ?? null)} className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Link to="/dashboard" className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-md text-sm"
              >
                {loading ? 'Soumission en cours...' : 'Soumettre le projet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
