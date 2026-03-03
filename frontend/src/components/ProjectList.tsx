import { useState, useEffect } from 'react';
import type { Projet, TypeProjet, StatutProjet } from '../types';
import { TYPE_PROJET_LABELS, STATUT_PROJET_LABELS } from '../types';
import { projetService } from '../services/api';
import ProjectCard from './ProjectCard';

interface ProjectListProps {
  showTitle?: boolean;
}

export default function ProjectList({ showTitle = true }: ProjectListProps) {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  // Filtres
  const [typeProjet, setTypeProjet] = useState('');
  const [statut, setStatut] = useState('');
  const [annee, setAnnee] = useState('');
  const [techno, setTechno] = useState('');

  // Options dynamiques
  const [annees, setAnnees] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Charger les options de filtres
  useEffect(() => {
    projetService.getAnnees().then(setAnnees).catch(() => {});
    projetService.getTechnologies().then(setTechnologies).catch(() => {});
  }, []);

  // Charger les projets
  useEffect(() => {
    const fetchProjets = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await projetService.getAll({
          search: search || undefined,
          type_projet: typeProjet || undefined,
          statut: statut || undefined,
          annee_universitaire: annee || undefined,
          technologies: techno || undefined,
        });
        setProjets(data?.results ?? []);
        setTotalCount(data?.count ?? 0);
      } catch (err) {
        console.error('Erreur lors du chargement des projets:', err);
        setError('Impossible de charger les projets. Vérifiez que le serveur backend est démarré.');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchProjets, 300);
    return () => clearTimeout(debounce);
  }, [search, typeProjet, statut, annee, techno]);

  const activeFiltersCount = [typeProjet, statut, annee, techno].filter(Boolean).length;

  const clearFilters = () => {
    setTypeProjet('');
    setStatut('');
    setAnnee('');
    setTechno('');
    setSearch('');
  };

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        {showTitle && (
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Projets Académiques</h2>
            <p className="text-gray-500 mt-1">
              {totalCount} projet{totalCount > 1 ? 's' : ''} disponible{totalCount > 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Barre de recherche + bouton filtres */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
              showFilters || activeFiltersCount > 0
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtres
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Panneau de filtres */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Type</label>
                <select
                  value={typeProjet}
                  onChange={(e) => setTypeProjet(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Tous les types</option>
                  {(Object.keys(TYPE_PROJET_LABELS) as TypeProjet[]).map((key) => (
                    <option key={key} value={key}>{TYPE_PROJET_LABELS[key]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Statut</label>
                <select
                  value={statut}
                  onChange={(e) => setStatut(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Tous les statuts</option>
                  {(Object.keys(STATUT_PROJET_LABELS) as StatutProjet[]).map((key) => (
                    <option key={key} value={key}>{STATUT_PROJET_LABELS[key]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Année</label>
                <select
                  value={annee}
                  onChange={(e) => setAnnee(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Toutes les années</option>
                  {annees.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Technologie</label>
                <select
                  value={techno}
                  onChange={(e) => setTechno(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Toutes les technologies</option>
                  {technologies.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>
        )}

        {/* État de chargement */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Chargement des projets...</p>
            </div>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <svg className="w-10 h-10 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={clearFilters} className="mt-3 text-sm text-red-600 hover:text-red-800 underline">
              Réessayer
            </button>
          </div>
        )}

        {/* Liste des projets */}
        {!loading && !error && projets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projets.map((projet) => (
              <ProjectCard key={projet.id} projet={projet} />
            ))}
          </div>
        )}

        {/* Aucun résultat */}
        {!loading && !error && projets.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun projet trouvé</h3>
            <p className="text-gray-500 text-sm mb-4">
              {search || activeFiltersCount > 0
                ? 'Essayez avec d\'autres critères de recherche.'
                : 'Aucun projet n\'a encore été ajouté.'}
            </p>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
