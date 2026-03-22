import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cvService } from '../services/api';
import type { CV } from '../types';

export default function ProfilsEtudiantsPage() {
  const [profiles, setProfiles] = useState<CV[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await cvService.getAll({ search: search || undefined });
        setProfiles(data.results || []);
      } catch {
        setError('Impossible de charger les profils étudiants.');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profils Étudiants</h1>
        <p className="text-gray-500 mt-1">Base de talents de l'ESI.</p>
      </div>

      <div className="mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un nom, une compétence..."
          className="w-full md:w-96 border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {profiles.map((cv) => (
            <div key={cv.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 text-lg">
                {cv.etudiant.user.first_name} {cv.etudiant.user.last_name}
              </h3>
              <p className="text-sm text-gray-500 mb-2">
                {cv.etudiant.filiere} • {cv.etudiant.niveau}
              </p>
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">{cv.resume || 'Aucun résumé.'}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(cv.competences || []).slice(0, 5).map((c) => (
                  <span key={c.id} className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100">
                    {c.nom}
                  </span>
                ))}
              </div>
              {cv.cv_pdf && (
                <a href={cv.cv_pdf} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                  Télécharger le CV PDF
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && !error && profiles.length === 0 && (
        <div className="text-center text-gray-500 py-10">Aucun profil trouvé.</div>
      )}

      <div className="mt-10">
        <Link to="/offres" className="text-blue-600 hover:underline">Voir les offres de stage →</Link>
      </div>
    </div>
  );
}
