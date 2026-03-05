import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { evaluationService, projetService, stageService } from '../services/api';
import type { Evaluation } from '../types';

export default function EvaluationsListPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [titles, setTitles] = useState<Record<string, string>>({});

  const fetchEvaluations = async () => {
    try {
      const data = await evaluationService.getAll();
      setEvaluations(data);

      // Récupérer les titres des projets/stages
      const titlesMap: Record<string, string> = {};
      for (const ev of data) {
        if (ev.projet) {
          const key = `projet-${ev.projet}`;
          if (!titlesMap[key]) {
            try {
              const p = await projetService.getById(ev.projet);
              titlesMap[key] = p.titre;
            } catch { titlesMap[key] = `Projet #${ev.projet}`; }
          }
        }
        if (ev.stage) {
          const key = `stage-${ev.stage}`;
          if (!titlesMap[key]) {
            try {
              const s = await stageService.getById(ev.stage);
              titlesMap[key] = s.titre;
            } catch { titlesMap[key] = `Stage #${ev.stage}`; }
          }
        }
      }
      setTitles(titlesMap);
    } catch {
      setError('Impossible de charger les évaluations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvaluations(); }, []);

  const handleDelete = async (id: number) => {
    try {
      await evaluationService.delete(id);
      setEvaluations((prev) => prev.filter((e) => e.id !== id));
      setDeleteId(null);
    } catch {
      setError('Erreur lors de la suppression.');
    }
  };

  const getTitle = (ev: Evaluation) => {
    if (ev.projet) return titles[`projet-${ev.projet}`] || `Projet #${ev.projet}`;
    if (ev.stage) return titles[`stage-${ev.stage}`] || `Stage #${ev.stage}`;
    return 'Inconnu';
  };

  const getType = (ev: Evaluation) => ev.projet ? 'projet' : 'stage';

  const getNoteColor = (note: number | null) => {
    if (note === null) return 'text-gray-400';
    if (note >= 16) return 'text-green-600 font-bold';
    if (note >= 12) return 'text-blue-600 font-semibold';
    if (note >= 10) return 'text-amber-600 font-semibold';
    return 'text-red-600 font-bold';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/enseignant" className="hover:text-indigo-600">Dashboard Enseignant</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Mes évaluations</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">📝 Mes évaluations</h1>
          <span className="text-sm text-gray-500">{evaluations.length} évaluation(s)</span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {evaluations.length > 0 ? (
          <div className="space-y-4">
            {evaluations.map((ev) => (
              <div key={ev.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${getType(ev) === 'projet' ? 'text-indigo-600 bg-indigo-50' : 'text-emerald-600 bg-emerald-50'}`}>
                        {getType(ev) === 'projet' ? '📋 Projet' : '🏢 Stage'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(ev.date_evaluation).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 line-clamp-1">{getTitle(ev)}</p>

                    {/* Notes en ligne */}
                    <div className="flex flex-wrap gap-3 mt-2 text-sm">
                      <span>📄 <span className={getNoteColor(ev.note_rapport)}>{ev.note_rapport ?? '—'}</span></span>
                      <span>🎤 <span className={getNoteColor(ev.note_soutenance)}>{ev.note_soutenance ?? '—'}</span></span>
                      <span>⚙️ <span className={getNoteColor(ev.note_technique)}>{ev.note_technique ?? '—'}</span></span>
                      <span>🤝 <span className={getNoteColor(ev.note_comportement)}>{ev.note_comportement ?? '—'}</span></span>
                    </div>

                    {ev.commentaire && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2 italic">« {ev.commentaire} »</p>
                    )}
                  </div>

                  {/* Moyenne + Actions */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center bg-indigo-50 rounded-xl px-4 py-2 border border-indigo-200">
                      <p className="text-xs text-indigo-500 font-medium">Moy.</p>
                      <p className={`text-2xl font-bold ${getNoteColor(ev.note_moyenne)}`}>
                        {ev.note_moyenne ?? '—'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Link
                        to={`/enseignant/evaluer?edit=${ev.id}&type=${getType(ev)}&id=${ev.projet || ev.stage}`}
                        className="px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
                      >
                        ✏️ Modifier
                      </Link>
                      <button
                        onClick={() => setDeleteId(ev.id)}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                </div>

                {/* Modal de confirmation suppression */}
                {deleteId === ev.id && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                    <p className="text-sm text-red-700">Supprimer cette évaluation ?</p>
                    <div className="flex gap-2">
                      <button onClick={() => setDeleteId(null)} className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100">
                        Annuler
                      </button>
                      <button onClick={() => handleDelete(ev.id)} className="px-3 py-1 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700">
                        Confirmer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <span className="text-4xl block mb-3">📝</span>
            <p className="text-gray-500 mb-3">Vous n'avez pas encore effectué d'évaluation.</p>
            <Link to="/enseignant" className="text-indigo-600 hover:underline font-medium text-sm">
              ← Retour au dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
