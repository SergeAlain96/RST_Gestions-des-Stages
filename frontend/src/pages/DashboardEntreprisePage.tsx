import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { entrepriseService, offreService } from '../services/api';
import type { EntrepriseDashboardData } from '../services/api';
import type { OffreStage } from '../types';
import { STATUT_OFFRE_COLORS, TYPE_OFFRE_LABELS } from '../types';

// â”€â”€ Carte stat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ── Carte stat ───────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-xl p-5 text-white ${color}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm opacity-90 mt-1">{label}</p>
    </div>
  );
}

// â”€â”€ Ligne offre â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function OffreLigne({
  offre,
  onFermer,
  onRouvrir,
  onSupprimer,
}: {
  offre: OffreStage;
  onFermer: (id: number) => void;
  onRouvrir: (id: number) => void;
  onSupprimer: (id: number) => void;
}) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4">
        <Link to={`/offres/${offre.id}`} className="font-medium text-gray-900 hover:text-green-700">
          {offre.titre}
        </Link>
        <p className="text-xs text-gray-400 mt-0.5">{TYPE_OFFRE_LABELS[offre.type_stage]} Â· {offre.duree} mois</p>
      </td>
      <td className="py-3 px-4">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUT_OFFRE_COLORS[offre.statut]}`}>
          {offre.statut === 'OUVERT' ? 'Ouvert' : offre.statut === 'FERME' ? 'FermÃ©' : 'ArchivÃ©'}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-gray-500">
        {offre.date_limite_candidature
          ? new Date(offre.date_limite_candidature).toLocaleDateString('fr-FR')
          : 'â€”'}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <Link
            to={`/entreprise/offres/${offre.id}/modifier`}
            className="text-xs text-blue-600 hover:underline"
          >
            Modifier
          </Link>
          {offre.statut === 'OUVERT' ? (
            <button
              onClick={() => onFermer(offre.id)}
              className="text-xs text-orange-500 hover:underline"
            >
              Fermer
            </button>
          ) : offre.statut === 'FERME' ? (
            <button
              onClick={() => onRouvrir(offre.id)}
              className="text-xs text-green-600 hover:underline"
            >
              Rouvrir
            </button>
          ) : null}
          <button
            onClick={() => onSupprimer(offre.id)}
            className="text-xs text-red-500 hover:underline"
          >
            Supprimer
          </button>
        </div>
      </td>
    </tr>
  );
}

// â”€â”€ Page Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function DashboardEntreprisePage() {
  const { user } = useAuth();
  const [data, setData] = useState<EntrepriseDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await entrepriseService.getDashboard();
      setData(d);
    } catch {
      setError("Impossible de charger le dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleFermer = async (id: number) => {
    try { await offreService.fermer(id); await load(); } catch { /* ignore */ }
  };
  const handleRouvrir = async (id: number) => {
    try { await offreService.rouvrir(id); await load(); } catch { /* ignore */ }
  };
  const handleSupprimer = async (id: number) => {
    if (!confirm('Supprimer cette offre dÃ©finitivement ?')) return;
    try { await offreService.delete(id); await load(); } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-red-500 mb-4">{error ?? 'Erreur inconnue'}</p>
        {!data?.entreprise.est_valide && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-sm text-yellow-800">
            <strong>Compte en attente de validation.</strong><br />
            Votre compte entreprise doit Ãªtre validÃ© par un administrateur avant de pouvoir publier des offres.
          </div>
        )}
      </div>
    );
  }

  const { entreprise, stats, offres } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* En-tÃªte */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">
            Bienvenue, <span className="font-medium text-green-700">{entreprise.nom}</span>
          </p>
        </div>
        <Link
          to="/entreprise/offres/nouvelle"
          className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle offre
        </Link>
      </div>

      {/* Alerte si non validÃ© */}
      {!entreprise.est_valide && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6 text-sm text-yellow-800 flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <strong>Compte en attente de validation.</strong> Un administrateur doit valider votre compte avant que vous puissiez publier des offres visibles par les Ã©tudiants.
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total offres" value={stats.total_offres} color="bg-gray-700" />
        <StatCard label="Offres ouvertes" value={stats.offres_ouvertes} color="bg-green-700" />
        <StatCard label="Offres fermÃ©es" value={stats.offres_fermees} color="bg-orange-500" />
        <StatCard label="ArchivÃ©es" value={stats.offres_archivees} color="bg-gray-400" />
      </div>

      {/* Profil rapide */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Profil entreprise</h2>
          <Link to="/entreprise/profil" className="text-xs text-green-700 hover:underline">Modifier</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div><span className="text-gray-400">Secteur</span><p className="font-medium text-gray-800">{entreprise.secteur || 'â€”'}</p></div>
          <div><span className="text-gray-400">Ville</span><p className="font-medium text-gray-800">{entreprise.ville || 'â€”'}</p></div>
          <div><span className="text-gray-400">Site web</span>
            {entreprise.site_web
              ? <a href={entreprise.site_web} target="_blank" rel="noreferrer" className="font-medium text-green-700 hover:underline truncate block">{entreprise.site_web}</a>
              : <p className="font-medium text-gray-400">â€”</p>}
          </div>
          <div><span className="text-gray-400">Email</span><p className="font-medium text-gray-800">{user?.email || 'â€”'}</p></div>
          <div><span className="text-gray-400">Statut</span>
            <p className={`font-medium ${entreprise.est_valide ? 'text-green-600' : 'text-yellow-600'}`}>
              {entreprise.est_valide ? 'ValidÃ©' : 'En attente'}
            </p>
          </div>
        </div>
      </div>

      {/* Mes offres */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Mes offres de stage</h2>
          <Link to="/entreprise/offres/nouvelle" className="text-xs text-green-700 hover:underline">
            + Ajouter une offre
          </Link>
        </div>

        {offres.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Aucune offre publiÃ©e pour le moment.</p>
            <Link to="/entreprise/offres/nouvelle" className="mt-3 inline-block text-sm text-green-700 hover:underline">
              Publier votre premiÃ¨re offre â†’
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="py-3 px-4 text-left">Offre</th>
                  <th className="py-3 px-4 text-left">Statut</th>
                  <th className="py-3 px-4 text-left">Date limite</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offres.map((offre) => (
                  <OffreLigne
                    key={offre.id}
                    offre={offre}
                    onFermer={handleFermer}
                    onRouvrir={handleRouvrir}
                    onSupprimer={handleSupprimer}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

