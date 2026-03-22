import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { offreService } from '../services/api';
import type { OffreStage, TypeOffre, NiveauOffre } from '../types';
import {
  TYPE_OFFRE_LABELS,
  NIVEAU_OFFRE_LABELS,
  STATUT_OFFRE_COLORS,
} from '../types';

// ── Carte d'une offre ────────────────────────────────────

function OffreCard({ offre }: { offre: OffreStage }) {
  const technos = offre.technologies_list?.filter(Boolean) ?? [];

  return (
    <Link
      to={`/offres/${offre.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-green-300 transition-all"
    >
      <div className="flex items-start gap-4">
        {offre.entreprise_logo ? (
          <img
            src={offre.entreprise_logo}
            alt={offre.entreprise_nom}
            className="w-14 h-14 object-contain rounded-lg border border-gray-100 bg-gray-50 shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3M9 7h1m-1 4h1m4-4h1m-1 4h1M9 15h6" />
            </svg>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-base leading-tight">{offre.titre}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUT_OFFRE_COLORS[offre.statut]}`}>
              {offre.statut === 'OUVERT' ? 'Ouvert' : offre.statut === 'FERME' ? 'Fermé' : 'Archivé'}
            </span>
          </div>

          <p className="text-sm text-green-700 font-medium mt-0.5">{offre.entreprise_nom}</p>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {offre.entreprise_ville}
          </p>

          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {TYPE_OFFRE_LABELS[offre.type_stage]}
            </span>
            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
              {NIVEAU_OFFRE_LABELS[offre.niveau_academique]}
            </span>
            <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
              {offre.duree} mois
            </span>
          </div>

          {technos.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {technos.slice(0, 4).map((t) => (
                <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {t}
                </span>
              ))}
              {technos.length > 4 && (
                <span className="text-xs text-gray-400 px-1 py-0.5">+{technos.length - 4}</span>
              )}
            </div>
          )}

          {offre.date_limite_candidature && (
            <p className="text-xs text-gray-400 mt-2">
              Date limite :{' '}
              <span className="font-medium text-gray-600">
                {new Date(offre.date_limite_candidature).toLocaleDateString('fr-FR')}
              </span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Page principale ──────────────────────────────────────

export default function OffresPage() {
  const [offres, setOffres] = useState<OffreStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeOffre | ''>('');
  const [niveauFilter, setNiveauFilter] = useState<NiveauOffre | ''>('');
  const [count, setCount] = useState(0);

  const fetchOffres = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await offreService.getAll({
        search: search || undefined,
        type_stage: typeFilter || undefined,
        niveau_academique: niveauFilter || undefined,
        statut: 'OUVERT',
        ordering: '-date_creation',
      });
      setOffres(res.results ?? (res as unknown as OffreStage[]));
      setCount(res.count ?? (res as unknown as OffreStage[]).length);
    } catch {
      setError('Impossible de charger les offres de stage.');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, niveauFilter]);

  useEffect(() => {
    const t = setTimeout(() => fetchOffres(), 300);
    return () => clearTimeout(t);
  }, [fetchOffres]);

  const types: { value: TypeOffre | ''; label: string }[] = [
    { value: '', label: 'Tous les types' },
    { value: 'OBSERVATION', label: "Stage d'observation" },
    { value: 'TECHNICIEN', label: 'Stage technicien' },
    { value: 'INGENIEUR', label: 'Stage ingénieur' },
    { value: 'PFE', label: 'Stage PFE' },
  ];

  const niveaux: { value: NiveauOffre | ''; label: string }[] = [
    { value: '', label: 'Tous les niveaux' },
    { value: 'LICENCE', label: 'Licence' },
    { value: 'IT', label: 'IT (Ing. des Travaux)' },
    { value: 'MASTER', label: 'Master' },
    { value: 'IC', label: 'IC (Ing. Concepteur)' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Offres de Stage</h1>
        <p className="text-gray-500 mt-1">
          Découvrez les opportunités de stage proposées par nos entreprises partenaires.
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher une offre, entreprise, technologie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TypeOffre | '')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select
          value={niveauFilter}
          onChange={(e) => setNiveauFilter(e.target.value as NiveauOffre | '')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          {niveaux.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
        </select>
      </div>

      {/* Résultats */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">{error}</div>
      ) : offres.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">Aucune offre disponible pour le moment.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{count} offre{count > 1 ? 's' : ''} disponible{count > 1 ? 's' : ''}</p>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {offres.map((offre) => (
              <OffreCard key={offre.id} offre={offre} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
