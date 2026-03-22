import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { offreService } from '../services/api';
import type { OffreStage, ProfilMatchingResult } from '../types';
import { TYPE_OFFRE_LABELS, NIVEAU_OFFRE_LABELS, STATUT_OFFRE_COLORS } from '../types';

export default function OffreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [offre, setOffre] = useState<OffreStage | null>(null);
  const [matches, setMatches] = useState<ProfilMatchingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const offerId = Number(id);
    Promise.all([
      offreService.getById(offerId),
      offreService.getMatchingProfils(offerId, 6),
    ])
      .then(([offreData, matchData]) => {
        setOffre(offreData);
        setMatches(matchData);
      })
      .catch(() => setError('Offre introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !offre) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-red-500">{error ?? 'Offre introuvable.'}</p>
        <Link to="/offres" className="mt-4 inline-block text-green-700 hover:underline text-sm">
          ← Retour aux offres
        </Link>
      </div>
    );
  }

  const technos = offre.technologies_list?.filter(Boolean) ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/offres" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6">
        ← Toutes les offres
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header entreprise */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start gap-4">
            {offre.entreprise_logo ? (
              <img
                src={offre.entreprise_logo}
                alt={offre.entreprise_nom}
                className="w-16 h-16 object-contain rounded-lg border border-gray-100 bg-gray-50 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3M9 7h1m-1 4h1m4-4h1m-1 4h1M9 15h6" />
                </svg>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{offre.titre}</h1>
                  <p className="text-green-700 font-medium mt-0.5">{offre.entreprise_nom}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {offre.entreprise_ville}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUT_OFFRE_COLORS[offre.statut]}`}>
                  {offre.statut === 'OUVERT' ? 'Offre ouverte' : offre.statut === 'FERME' ? 'Offre fermée' : 'Archivée'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-2">
          <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
            {TYPE_OFFRE_LABELS[offre.type_stage]}
          </span>
          <span className="text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium">
            {NIVEAU_OFFRE_LABELS[offre.niveau_academique]}
          </span>
          <span className="text-sm bg-orange-50 text-orange-700 px-3 py-1 rounded-full font-medium">
            {offre.duree} mois
          </span>
          {offre.remuneration && (
            <span className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">
              {offre.remuneration}
            </span>
          )}
        </div>

        {/* Corps */}
        <div className="p-6 space-y-6">
          <div>
            <h2 className="font-semibold text-gray-800 mb-2">Description du stage</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{offre.description}</p>
          </div>

          {technos.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-800 mb-2">Technologies & compétences</h2>
              <div className="flex flex-wrap gap-2">
                {technos.map((t) => (
                  <span key={t} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-lg">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            {offre.date_debut && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Date de début</p>
                <p className="text-sm font-medium text-gray-800">
                  {new Date(offre.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}
            {offre.date_limite_candidature && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Date limite de candidature</p>
                <p className="text-sm font-medium text-gray-800">
                  {new Date(offre.date_limite_candidature).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>

          {/* Contact entreprise */}
          {offre.entreprise?.email && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h2 className="font-semibold text-green-800 mb-2">Comment candidater ?</h2>
              <p className="text-sm text-green-700">
                Envoyez votre CV et lettre de motivation à :{' '}
                <a href={`mailto:${offre.entreprise.email}`} className="font-medium underline">
                  {offre.entreprise.email}
                </a>
              </p>
              {offre.entreprise.telephone && (
                <p className="text-sm text-green-700 mt-1">
                  Téléphone : <span className="font-medium">{offre.entreprise.telephone}</span>
                </p>
              )}
            </div>
          )}

          {/* Matching profils */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h2 className="font-semibold text-gray-800">Profils suggérés</h2>
              <Link to="/profils-etudiants" className="text-xs text-blue-600 hover:underline">
                Voir toute la base →
              </Link>
            </div>

            {matches.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun profil pertinent trouvé pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {matches.map((m) => (
                  <div key={m.cv.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">
                        {m.cv.etudiant.user.first_name} {m.cv.etudiant.user.last_name}
                      </p>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700">
                        Match {m.score}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {m.cv.etudiant.filiere} • {m.cv.etudiant.niveau}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.matched_competences.length > 0 ? (
                        m.matched_competences.map((c) => (
                          <span key={c} className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 border border-green-100">
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">Compétences non précisées sur l'offre ou le CV.</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
