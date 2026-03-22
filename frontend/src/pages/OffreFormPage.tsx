import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { offreService } from '../services/api';
import type { OffreStageFormData, TypeOffre, NiveauOffre } from '../types';

const TYPES: { value: TypeOffre; label: string }[] = [
  { value: 'OBSERVATION', label: "Stage d'observation" },
  { value: 'TECHNICIEN', label: 'Stage technicien' },
  { value: 'INGENIEUR', label: 'Stage ingénieur' },
  { value: 'PFE', label: 'Stage PFE' },
];

const NIVEAUX: { value: NiveauOffre; label: string }[] = [
  { value: 'LICENCE', label: 'Licence' },
  { value: 'IT', label: 'IT (Ingénieur des Travaux)' },
  { value: 'MASTER', label: 'Master' },
  { value: 'IC', label: 'IC (Ingénieur Concepteur)' },
];

export default function OffreFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<OffreStageFormData>({
    titre: '',
    description: '',
    type_stage: 'PFE',
    niveau_academique: 'MASTER',
    duree: 6,
    technologies: '',
    date_debut: '',
    date_limite_candidature: '',
    remuneration: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(isEdit);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Charger l'offre si mode édition
  useEffect(() => {
    if (!isEdit || !id) return;
    offreService.getById(Number(id)).then((offre) => {
      setForm({
        titre: offre.titre,
        description: offre.description,
        type_stage: offre.type_stage,
        niveau_academique: offre.niveau_academique,
        duree: offre.duree,
        technologies: offre.technologies,
        date_debut: offre.date_debut ?? '',
        date_limite_candidature: offre.date_limite_candidature ?? '',
        remuneration: offre.remuneration ?? '',
      });
      setLoadingInit(false);
    }).catch(() => setLoadingInit(false));
  }, [id, isEdit]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.titre.trim()) e.titre = 'Le titre est requis.';
    if (!form.description.trim()) e.description = 'La description est requise.';
    if (!form.technologies.trim()) e.technologies = 'Les technologies sont requises.';
    if (form.duree < 1 || form.duree > 24) e.duree = 'La durée doit être entre 1 et 24 mois.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError(null);
    try {
      const payload = {
        ...form,
        date_debut: form.date_debut || undefined,
        date_limite_candidature: form.date_limite_candidature || undefined,
        remuneration: form.remuneration || undefined,
      };
      if (isEdit && id) {
        await offreService.update(Number(id), payload);
      } else {
        await offreService.create(payload);
      }
      navigate('/entreprise');
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } };
      if (e.response?.data) {
        const msg = Object.values(e.response.data).flat().join(' ');
        setServerError(msg);
      } else {
        setServerError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const set = (field: keyof OffreStageFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  if (loadingInit) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/entreprise')}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3"
        >
          ← Retour au dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Modifier l\'offre' : 'Publier une offre de stage'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
            {serverError}
          </div>
        )}

        {/* Titre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre de l'offre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.titre}
            onChange={set('titre')}
            placeholder="Ex: Stage PFE Développement Web"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.titre ? 'border-red-300' : 'border-gray-300'}`}
          />
          {errors.titre && <p className="text-xs text-red-500 mt-1">{errors.titre}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={set('description')}
            rows={5}
            placeholder="Décrivez le stage, les missions, le profil recherché..."
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        {/* Type + Niveau */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de stage <span className="text-red-500">*</span>
            </label>
            <select
              value={form.type_stage}
              onChange={set('type_stage')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Niveau académique <span className="text-red-500">*</span>
            </label>
            <select
              value={form.niveau_academique}
              onChange={set('niveau_academique')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              {NIVEAUX.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
            </select>
          </div>
        </div>

        {/* Technologies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Technologies / Compétences requises <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.technologies}
            onChange={set('technologies')}
            placeholder="Ex: Python, Django, React, PostgreSQL"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.technologies ? 'border-red-300' : 'border-gray-300'}`}
          />
          <p className="text-xs text-gray-400 mt-1">Séparez les technologies par des virgules.</p>
          {errors.technologies && <p className="text-xs text-red-500 mt-1">{errors.technologies}</p>}
        </div>

        {/* Durée */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Durée (en mois) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={form.duree}
            onChange={set('duree')}
            min={1}
            max={24}
            className={`w-32 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.duree ? 'border-red-300' : 'border-gray-300'}`}
          />
          {errors.duree && <p className="text-xs text-red-500 mt-1">{errors.duree}</p>}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <input
              type="date"
              value={form.date_debut}
              onChange={set('date_debut')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date limite de candidature</label>
            <input
              type="date"
              value={form.date_limite_candidature}
              onChange={set('date_limite_candidature')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Rémunération */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rémunération</label>
          <input
            type="text"
            value={form.remuneration}
            onChange={set('remuneration')}
            placeholder="Ex: 75 000 FCFA / mois"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Boutons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Publier l\'offre'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/entreprise')}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
