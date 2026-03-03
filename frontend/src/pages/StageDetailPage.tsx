import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Stage } from '../types';
import { stageService } from '../services/api';
import { TYPE_STAGE_LABELS, STATUT_STAGE_LABELS, STATUT_COLORS } from '../types';

export default function StageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [stage, setStage] = useState<Stage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStage = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await stageService.getById(Number(id));
        setStage(data);
      } catch {
        setError('Stage introuvable.');
      } finally {
        setLoading(false);
      }
    };
    fetchStage();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !stage) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Stage introuvable</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link to="/stages" className="text-emerald-600 hover:underline font-medium">← Retour aux stages</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fil d'Ariane */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-emerald-600">Accueil</Link>
            <span>/</span>
            <Link to="/stages" className="hover:text-emerald-600">Stages</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">{stage.titre}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Bannière */}
          <div className="h-48 bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
            {stage.image ? (
              <img src={stage.image} alt={stage.titre} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <svg className="w-16 h-16 text-emerald-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-emerald-500 font-medium">{stage.entreprise}</span>
              </div>
            )}
          </div>

          {/* Contenu */}
          <div className="p-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                {TYPE_STAGE_LABELS[stage.type_stage]}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUT_COLORS[stage.statut] ?? 'bg-gray-100 text-gray-800'}`}>
                {STATUT_STAGE_LABELS[stage.statut] ?? stage.statut}
              </span>
              <span className="text-sm text-gray-400">{stage.annee_universitaire}</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{stage.titre}</h1>

            {/* Entreprise info */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                </svg>
                <span className="font-medium">{stage.entreprise}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{stage.ville}, {stage.pays}</span>
              </div>
              {stage.date_debut && stage.date_fin && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {new Date(stage.date_debut).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                    {' → '}
                    {new Date(stage.date_fin).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-8 whitespace-pre-line">{stage.description}</p>

            {/* Technologies */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Technologies utilisées</h3>
              <div className="flex flex-wrap gap-2">
                {(stage.technologies_list ?? []).map((tech) => (
                  <span key={tech} className="px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-sm rounded-lg font-medium border border-emerald-100">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Lien entreprise */}
            {stage.lien_entreprise && (
              <div className="mb-8">
                <a
                  href={stage.lien_entreprise}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Site de l'entreprise
                </a>
              </div>
            )}

            {/* Personnes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
              {/* Stagiaire */}
              {stage.etudiant && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Stagiaire</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold">
                      {stage.etudiant.user.first_name[0]}{stage.etudiant.user.last_name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{stage.etudiant.user.first_name} {stage.etudiant.user.last_name}</p>
                      <p className="text-xs text-gray-500">{stage.etudiant.filiere} — {stage.etudiant.niveau}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tuteur académique */}
              {stage.tuteur_academique && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Tuteur académique</h3>
                  <p className="font-medium text-gray-900">
                    {stage.tuteur_academique.user.first_name} {stage.tuteur_academique.user.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{stage.tuteur_academique.specialite}</p>
                </div>
              )}

              {/* Maître de stage */}
              {stage.maitre_stage && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Maître de stage</h3>
                  <p className="font-medium text-gray-900">{stage.maitre_stage}</p>
                  <p className="text-sm text-gray-500">{stage.entreprise}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Retour */}
        <div className="mt-8">
          <Link to="/stages" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à la galerie des stages
          </Link>
        </div>
      </div>
    </div>
  );
}
