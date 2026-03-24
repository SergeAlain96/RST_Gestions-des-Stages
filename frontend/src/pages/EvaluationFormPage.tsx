import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { evaluationService, projetService, stageService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import type { EvaluationFormData } from '../types';

export default function EvaluationFormPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type') as 'projet' | 'stage' | null;
  const id = searchParams.get('id');
  const editId = searchParams.get('edit'); // si on modifie une évaluation existante

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [targetTitle, setTargetTitle] = useState('');
  const { addToast } = useToast();

  const [form, setForm] = useState<EvaluationFormData>({
    projet: type === 'projet' && id ? Number(id) : null,
    stage: type === 'stage' && id ? Number(id) : null,
    note_rapport: null,
    note_soutenance: null,
    note_technique: null,
    note_comportement: null,
    commentaire: '',
  });

  useEffect(() => {
    const fetchTarget = async () => {
      try {
        if (editId) {
          const evaluation = await evaluationService.getById(Number(editId));
          setForm({
            projet: evaluation.projet,
            stage: evaluation.stage,
            note_rapport: evaluation.note_rapport,
            note_soutenance: evaluation.note_soutenance,
            note_technique: evaluation.note_technique,
            note_comportement: evaluation.note_comportement,
            commentaire: evaluation.commentaire,
          });
          if (evaluation.projet) {
            const p = await projetService.getById(evaluation.projet);
            setTargetTitle(p.titre);
          } else if (evaluation.stage) {
            const s = await stageService.getById(evaluation.stage);
            setTargetTitle(s.titre);
          }
        } else if (type === 'projet' && id) {
          const p = await projetService.getById(Number(id));
          setTargetTitle(p.titre);
        } else if (type === 'stage' && id) {
          const s = await stageService.getById(Number(id));
          setTargetTitle(s.titre);
        }
      } catch {
        setError('Impossible de charger les informations.');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchTarget();
  }, [type, id, editId]);

  const handleNoteChange = (field: keyof EvaluationFormData, value: string) => {
    const num = value === '' ? null : parseFloat(value);
    setForm({ ...form, [field]: num });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (editId) {
        await evaluationService.update(Number(editId), form);
        addToast('Évaluation modifiée avec succès !', 'success');
      } else {
        await evaluationService.create(form);
        addToast('Évaluation enregistrée avec succès !', 'success');
      }
      setSuccess(true);
      setTimeout(() => navigate('/enseignant/evaluations'), 2000);
    } catch (err: unknown) {
      const data =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: Record<string, unknown> } }).response?.data
          : undefined;

      if (data) {
        const msgs = Object.values(data).flat();
        setError(msgs.map(String).join(' ') || 'Erreur lors de la soumission.');
      } else {
        setError('Erreur de connexion au serveur.');
      }
    } finally {
      setLoading(false);
    }
  };

  const notes = [form.note_rapport, form.note_soutenance, form.note_technique, form.note_comportement].filter((n): n is number => n !== null);
  const moyenne = notes.length > 0 ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(2) : '—';
  let submitLabel = 'Enregistrer l\'évaluation';
  if (editId) {
    submitLabel = 'Modifier l\'évaluation';
  }
  if (loading) {
    submitLabel = 'Enregistrement...';
  }

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {editId ? 'Évaluation modifiée !' : 'Évaluation enregistrée !'}
          </h2>
          <p className="text-gray-500 text-sm">Redirection vers la liste des évaluations...</p>
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
            <Link to="/enseignant" className="hover:text-indigo-600">Dashboard Enseignant</Link>
            <span>/</span>
            <Link to="/enseignant/evaluations" className="hover:text-indigo-600">Évaluations</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{editId ? 'Modifier' : 'Nouvelle évaluation'}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {editId ? 'Modifier l\'évaluation' : 'Grille d\'évaluation'}
              </h1>
              {targetTitle && (
                <p className="text-gray-500 text-sm">
                  {type === 'projet' ? '📋 Projet' : '🏢 Stage'} : <span className="font-medium text-gray-700">{targetTitle}</span>
                </p>
              )}
            </div>
            {/* Moyenne en temps réel */}
            <div className="text-center bg-indigo-50 rounded-xl px-5 py-3 border border-indigo-200">
              <p className="text-xs text-indigo-600 font-medium uppercase">Moyenne</p>
              <p className="text-3xl font-bold text-indigo-700">{moyenne}</p>
              <p className="text-xs text-indigo-400">/20</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grille de notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NoteInput label="Rapport écrit" value={form.note_rapport} onChange={(v) => handleNoteChange('note_rapport', v)} icon="📄" />
              <NoteInput label="Soutenance" value={form.note_soutenance} onChange={(v) => handleNoteChange('note_soutenance', v)} icon="🎤" />
              <NoteInput label="Technique" value={form.note_technique} onChange={(v) => handleNoteChange('note_technique', v)} icon="⚙️" />
              <NoteInput label="Comportement / Assiduité" value={form.note_comportement} onChange={(v) => handleNoteChange('note_comportement', v)} icon="🤝" />
            </div>

            {/* Commentaire */}
            <div>
              <label htmlFor="commentaire" className="block text-sm font-medium text-gray-700 mb-1">
                Commentaire général
              </label>
              <textarea
                id="commentaire"
                rows={5}
                value={form.commentaire}
                onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm resize-none"
                placeholder="Observations, points forts, axes d'amélioration..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Link
                to="/enseignant"
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 shadow-md text-sm"
              >
                {submitLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function NoteInput({ label, value, onChange, icon }: Readonly<{ label: string; value: number | null; onChange: (v: string) => void; icon: string }>) {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <span>{icon}</span> {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          step="0.5"
          min="0"
          max="20"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-center font-semibold text-lg"
          placeholder="—"
        />
        <span className="text-gray-400 text-sm font-medium">/20</span>
      </div>
    </div>
  );
}
