import { useState, useEffect } from 'react';
import type { Stage, TypeStage, StatutStage } from '../types';
import { TYPE_STAGE_LABELS, STATUT_STAGE_LABELS } from '../types';
import { stageService } from '../services/api';
import StageCard from './StageCard';
import { StageCardSkeleton } from './Skeletons';

export default function StageList() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  // Filtres
  const [typeStage, setTypeStage] = useState('');
  const [statut, setStatut] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Options dynamiques
  const [entreprises, setEntreprises] = useState<string[]>([]);

  useEffect(() => {
    stageService.getEntreprises().then(setEntreprises).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await stageService.getAll({
          search: search || undefined,
          type_stage: typeStage || undefined,
          statut: statut || undefined,
          entreprise: entreprise || undefined,
        });
        setStages(data?.results ?? []);
        setTotalCount(data?.count ?? 0);
      } catch (err) {
        console.error('Erreur lors du chargement des stages:', err);
        setError('Impossible de charger les stages. Vérifiez que le serveur backend est démarré.');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchStages, 300);
    return () => clearTimeout(debounce);
  }, [search, typeStage, statut, entreprise]);

  const activeFiltersCount = [typeStage, statut, entreprise].filter(Boolean).length;

  const clearFilters = () => {
    setTypeStage('');
    setStatut('');
    setEntreprise('');
    setSearch('');
  };

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Galerie des Stages</h2>
          <p className="text-gray-500 mt-1">
            {totalCount} stage{totalCount > 1 ? 's' : ''} disponible{totalCount > 1 ? 's' : ''}
          </p>
        </div>

        {/* Recherche + Filtres */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un stage, une entreprise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
              showFilters || activeFiltersCount > 0
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtres
            {activeFiltersCount > 0 && (
              <span className="bg-emerald-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Type de stage</label>
                <select
                  value={typeStage}
                  onChange={(e) => setTypeStage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  <option value="">Tous les types</option>
                  {(Object.keys(TYPE_STAGE_LABELS) as TypeStage[]).map((key) => (
                    <option key={key} value={key}>{TYPE_STAGE_LABELS[key]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Statut</label>
                <select
                  value={statut}
                  onChange={(e) => setStatut(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  <option value="">Tous les statuts</option>
                  {(Object.keys(STATUT_STAGE_LABELS) as StatutStage[]).map((key) => (
                    <option key={key} value={key}>{STATUT_STAGE_LABELS[key]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Entreprise</label>
                <select
                  value={entreprise}
                  onChange={(e) => setEntreprise(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  <option value="">Toutes les entreprises</option>
                  {entreprises.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Réinitialiser
                </button>
              </div>
            )}
          </div>
        )}

        {/* Chargement - Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <StageCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={clearFilters} className="mt-3 text-sm text-red-600 hover:text-red-800 underline">Réessayer</button>
          </div>
        )}

        {/* Grille */}
        {!loading && !error && stages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stages.map((stage) => (
              <StageCard key={stage.id} stage={stage} />
            ))}
          </div>
        )}

        {/* Vide */}
        {!loading && !error && stages.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun stage trouvé</h3>
            <p className="text-gray-500 text-sm mb-4">
              {search || activeFiltersCount > 0 ? 'Essayez d\'autres critères.' : 'Aucun stage enregistré.'}
            </p>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
