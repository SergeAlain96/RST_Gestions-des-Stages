import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Projet } from '../types';
import { projetService } from '../services/api';
import {
  TYPE_PROJET_LABELS,
  STATUT_PROJET_LABELS,
  STATUT_COLORS,
} from '../types';

export default function ProjetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [projet, setProjet] = useState<Projet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjet = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await projetService.getById(Number(id));
        setProjet(data);
      } catch {
        setError('Projet introuvable.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjet();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !projet) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Projet introuvable</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link to="/projets" className="text-blue-600 hover:underline font-medium">
          ← Retour aux projets
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fil d'Ariane */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-blue-600">Accueil</Link>
            <span>/</span>
            <Link to="/projets" className="hover:text-blue-600">Projets</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">{projet.titre}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Image */}
          <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            {projet.image ? (
              <img src={projet.image} alt={projet.titre} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <svg className="w-16 h-16 text-blue-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-blue-400 font-medium">{TYPE_PROJET_LABELS[projet.type_projet]}</span>
              </div>
            )}
          </div>

          {/* Contenu */}
          <div className="p-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                {TYPE_PROJET_LABELS[projet.type_projet]}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUT_COLORS[projet.statut] ?? 'bg-gray-100 text-gray-800'}`}>
                {STATUT_PROJET_LABELS[projet.statut] ?? projet.statut}
              </span>
              <span className="text-sm text-gray-400">{projet.annee_universitaire}</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{projet.titre}</h1>

            <p className="text-gray-600 leading-relaxed mb-8 whitespace-pre-line">
              {projet.description}
            </p>

            {/* Technologies */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Technologies utilisées
              </h3>
              <div className="flex flex-wrap gap-2">
                {(projet.technologies_list ?? []).map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm rounded-lg font-medium border border-blue-100"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Liens */}
            {(projet.lien_github || projet.lien_demo) && (
              <div className="flex flex-wrap gap-3 mb-8">
                {projet.lien_github && (
                  <a
                    href={projet.lien_github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </a>
                )}
                {projet.lien_demo && (
                  <a
                    href={projet.lien_demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Démo en ligne
                  </a>
                )}
              </div>
            )}

            {/* Infos du projet */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
              {/* Tuteur */}
              {projet.tuteur && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                    Tuteur
                  </h3>
                  <p className="font-medium text-gray-900">
                    {projet.tuteur.user.first_name} {projet.tuteur.user.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{projet.tuteur.departement}</p>
                  <p className="text-sm text-gray-500">{projet.tuteur.specialite}</p>
                </div>
              )}

              {/* Étudiants */}
              {projet.etudiants && projet.etudiants.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                    Étudiant{projet.etudiants.length > 1 ? 's' : ''}
                  </h3>
                  <ul className="space-y-2">
                    {projet.etudiants.map((etud) => (
                      <li key={etud.id} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                          {etud.user.first_name[0]}{etud.user.last_name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {etud.user.first_name} {etud.user.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{etud.filiere} — {etud.niveau}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex gap-6 text-xs text-gray-400">
              <span>
                Soumis le {new Date(projet.date_soumission).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </span>
              {projet.date_modification && (
                <span>
                  Mis à jour le {new Date(projet.date_modification).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Retour */}
        <div className="mt-8">
          <Link
            to="/projets"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à la liste des projets
          </Link>
        </div>
      </div>
    </div>
  );
}
