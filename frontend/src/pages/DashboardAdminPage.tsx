import { useEffect, useState } from 'react';
import { dashboardService, adminService } from '../services/api';
import type { AdminDashboardData } from '../types';

export default function DashboardAdminPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getAdminDashboard();
      setData(res);
    } catch {
      setError('Impossible de charger le dashboard admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleValidateEntreprise = async (id: number, value: boolean) => {
    try {
      await adminService.validateEntreprise(id, value);
      await load();
    } catch {
      setError('Erreur lors de la validation entreprise.');
    }
  };

  const handleModerateProjet = async (id: number, statut: string) => {
    try {
      await adminService.moderateProjet(id, statut);
      await load();
    } catch {
      setError('Erreur lors de la modération du projet.');
    }
  };

  const handleModerateStage = async (id: number, statut: string) => {
    try {
      await adminService.moderateStage(id, statut);
      await load();
    } catch {
      setError('Erreur lors de la modération du stage.');
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-10">Chargement...</div>;
  if (error) return <div className="max-w-7xl mx-auto px-4 py-10 text-red-600">{error}</div>;
  if (!data) return null;

  const { stats } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administration</h1>
        <p className="text-gray-500 mt-1">Supervision globale, validation des entreprises et modération.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <Stat label="Étudiants" value={stats.total_etudiants} />
        <Stat label="Enseignants" value={stats.total_enseignants} />
        <Stat label="Entreprises" value={stats.total_entreprises} />
        <Stat label="Projets" value={stats.total_projets} />
        <Stat label="Stages" value={stats.total_stages} />
        <Stat label="Proj. attente" value={stats.projets_en_attente} warning />
        <Stat label="Stages attente" value={stats.stages_en_attente} warning />
        <Stat label="Entr. attente" value={stats.entreprises_en_attente} warning />
      </div>

      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Entreprises en attente</h2>
        {data.entreprises_en_attente.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune entreprise en attente.</p>
        ) : (
          <div className="space-y-3">
            {data.entreprises_en_attente.map((e) => (
              <div key={e.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                <div>
                  <p className="font-medium text-gray-900">{e.nom}</p>
                  <p className="text-xs text-gray-500">{e.email} • {e.ville}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleValidateEntreprise(e.id, true)} className="px-3 py-1.5 text-xs rounded bg-green-600 text-white hover:bg-green-700">
                    Valider
                  </button>
                  <button onClick={() => handleValidateEntreprise(e.id, false)} className="px-3 py-1.5 text-xs rounded bg-gray-200 text-gray-700 hover:bg-gray-300">
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Stages en attente de modération</h2>
        {data.stages_en_attente.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun stage en attente.</p>
        ) : (
          <div className="space-y-3">
            {data.stages_en_attente.map((s) => (
              <div key={s.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                <div>
                  <p className="font-medium text-gray-900">{s.titre}</p>
                  <p className="text-xs text-gray-500">{s.entreprise} • {s.annee_universitaire}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleModerateStage(s.id, 'EN_COURS')} className="px-3 py-1.5 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">
                    Approuver
                  </button>
                  <button onClick={() => handleModerateStage(s.id, 'ARCHIVE')} className="px-3 py-1.5 text-xs rounded bg-red-600 text-white hover:bg-red-700">
                    Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Projets en attente de modération</h2>
        {data.projets_en_attente.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun projet en attente.</p>
        ) : (
          <div className="space-y-3">
            {data.projets_en_attente.map((p) => (
              <div key={p.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                <div>
                  <p className="font-medium text-gray-900">{p.titre}</p>
                  <p className="text-xs text-gray-500">{p.type_projet} • {p.annee_universitaire}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleModerateProjet(p.id, 'VALIDE')} className="px-3 py-1.5 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">
                    Valider
                  </button>
                  <button onClick={() => handleModerateProjet(p.id, 'REFUSE')} className="px-3 py-1.5 text-xs rounded bg-red-600 text-white hover:bg-red-700">
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, warning = false }: Readonly<{ label: string; value: number; warning?: boolean }>) {
  return (
    <div className={`rounded-lg border p-3 ${warning ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
