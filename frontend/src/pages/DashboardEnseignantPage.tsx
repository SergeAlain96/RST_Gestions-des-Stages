import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService, enseignantService } from '../services/api';
import type { EnseignantDashboardData, Projet, Stage } from '../types';
import { TYPE_PROJET_LABELS, STATUT_PROJET_LABELS, STATUT_COLORS, TYPE_STAGE_LABELS, STATUT_STAGE_LABELS } from '../types';

type Tab = 'projets' | 'stages';

export default function DashboardEnseignantPage() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<EnseignantDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('projets');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionMsg, setActionMsg] = useState('');

  const fetchData = async () => {
    try {
      const dashboard = await dashboardService.getEnseignantDashboard();
      setData(dashboard);
    } catch {
      setError('Impossible de charger le dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleValidation = async (type: 'projet' | 'stage', id: number, statut: string) => {
    setActionLoading(id);
    setActionMsg('');
    try {
      if (type === 'projet') {
        await enseignantService.validateProjet(id, statut);
      } else {
        await enseignantService.validateStage(id, statut);
      }
      setActionMsg(`Statut mis à jour avec succès.`);
      await fetchData();
    } catch {
      setActionMsg('Erreur lors de la mise à jour.');
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  Pr. {user?.first_name} {user?.last_name}
                </h1>
                <p className="text-indigo-200 text-sm">
                  {user?.enseignant?.departement && `${user.enseignant.departement} — `}
                  {user?.enseignant?.specialite || 'Enseignant'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to="/enseignant/evaluations"
                className="px-5 py-2.5 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition text-sm shadow-md"
              >
                📝 Mes évaluations
              </Link>
              <button
                onClick={logout}
                className="px-5 py-2.5 border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition text-sm"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toast */}
        {actionMsg && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${actionMsg.includes('Erreur') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {actionMsg}
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Projets tutorés" value={stats?.total_projets ?? 0} icon="📋" color="indigo" />
          <StatCard label="En attente" value={stats?.projets_en_attente ?? 0} icon="⏳" color="amber" />
          <StatCard label="Validés" value={stats?.projets_valides ?? 0} icon="✅" color="green" />
          <StatCard label="Stages" value={stats?.total_stages ?? 0} icon="🏢" color="emerald" />
          <StatCard label="Évaluations" value={stats?.total_evaluations ?? 0} icon="📝" color="purple" />
        </div>

        {/* Onglets */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg border border-gray-200 p-1 w-fit">
          <button
            onClick={() => setTab('projets')}
            className={`px-5 py-2 text-sm font-medium rounded-md transition ${tab === 'projets' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Projets ({data?.projets.length ?? 0})
          </button>
          <button
            onClick={() => setTab('stages')}
            className={`px-5 py-2 text-sm font-medium rounded-md transition ${tab === 'stages' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Stages ({data?.stages.length ?? 0})
          </button>
        </div>

        {/* Projets */}
        {tab === 'projets' && (
          <section>
            {data?.projets && data.projets.length > 0 ? (
              <div className="space-y-4">
                {data.projets.map((projet) => (
                  <ProjetCard
                    key={projet.id}
                    projet={projet}
                    onValidate={(statut) => handleValidation('projet', projet.id, statut)}
                    loading={actionLoading === projet.id}
                  />
                ))}
              </div>
            ) : (
              <EmptyState text="Aucun projet ne vous est assigné comme tuteur." icon="📋" />
            )}
          </section>
        )}

        {/* Stages */}
        {tab === 'stages' && (
          <section>
            {data?.stages && data.stages.length > 0 ? (
              <div className="space-y-4">
                {data.stages.map((stage) => (
                  <StageCard
                    key={stage.id}
                    stage={stage}
                    onValidate={(statut) => handleValidation('stage', stage.id, statut)}
                    loading={actionLoading === stage.id}
                  />
                ))}
              </div>
            ) : (
              <EmptyState text="Aucun stage ne vous est assigné comme tuteur académique." icon="🏢" />
            )}
          </section>
        )}
      </div>
    </div>
  );
}

// ── Sous-composants ──

function StatCard({ label, value, icon, color }: Readonly<{ label: string; value: number; icon: string; color: string }>) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 border-indigo-200',
    amber: 'bg-amber-50 border-amber-200',
    green: 'bg-green-50 border-green-200',
    emerald: 'bg-emerald-50 border-emerald-200',
    purple: 'bg-purple-50 border-purple-200',
  };
  return (
    <div className={`rounded-xl border p-5 ${colorMap[color] ?? 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-bold text-gray-900">{value}</span>
      </div>
      <p className="text-sm text-gray-600 font-medium">{label}</p>
    </div>
  );
}

function ProjetCard({ projet, onValidate, loading }: Readonly<{ projet: Projet; onValidate: (statut: string) => void; loading: boolean }>) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {TYPE_PROJET_LABELS[projet.type_projet] ?? projet.type_projet}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUT_COLORS[projet.statut] ?? 'bg-gray-100 text-gray-800'}`}>
              {STATUT_PROJET_LABELS[projet.statut] ?? projet.statut}
            </span>
            <span className="text-xs text-gray-400">{projet.annee_universitaire}</span>
          </div>
          <Link to={`/projets/${projet.id}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition line-clamp-1">
            {projet.titre}
          </Link>
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{projet.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {(projet.technologies_list ?? []).slice(0, 4).map((t) => (
              <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium">{t}</span>
            ))}
          </div>
          {projet.etudiants_noms && projet.etudiants_noms.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              👤 {projet.etudiants_noms.join(', ')}
            </p>
          )}
        </div>

        {/* Boutons de validation */}
        <div className="flex flex-col gap-2 md:ml-4 shrink-0">
          {projet.statut === 'EN_ATTENTE' && (
            <>
              <button
                onClick={() => onValidate('VALIDE')}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                ✅ Valider
              </button>
              <button
                onClick={() => onValidate('REFUSE')}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                ❌ Refuser
              </button>
            </>
          )}
          {projet.statut === 'VALIDE' && (
            <button
              onClick={() => onValidate('EN_COURS')}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              🔄 Lancer
            </button>
          )}
          {projet.statut === 'EN_COURS' && (
            <button
              onClick={() => onValidate('TERMINE')}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              🏁 Terminer
            </button>
          )}
          <Link
            to={`/enseignant/evaluer?type=projet&id=${projet.id}`}
            className="px-4 py-2 border border-indigo-300 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-50 transition text-center"
          >
            📝 Évaluer
          </Link>
        </div>
      </div>
    </div>
  );
}

function StageCard({ stage, onValidate, loading }: Readonly<{ stage: Stage; onValidate: (statut: string) => void; loading: boolean }>) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              {TYPE_STAGE_LABELS[stage.type_stage] ?? stage.type_stage}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUT_COLORS[stage.statut] ?? 'bg-gray-100 text-gray-800'}`}>
              {STATUT_STAGE_LABELS[stage.statut] ?? stage.statut}
            </span>
            <span className="text-xs text-gray-400">{stage.annee_universitaire}</span>
          </div>
          <Link to={`/stages/${stage.id}`} className="font-semibold text-gray-900 hover:text-emerald-600 transition line-clamp-1">
            {stage.titre}
          </Link>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
            <span className="font-medium">{stage.entreprise}</span>
            <span className="text-gray-300">•</span>
            <span>{stage.ville}</span>
          </div>
          {stage.etudiant_nom && (
            <p className="text-xs text-gray-400 mt-2">👤 {stage.etudiant_nom}</p>
          )}
        </div>

        {/* Boutons */}
        <div className="flex flex-col gap-2 md:ml-4 shrink-0">
          {stage.statut === 'EN_COURS' && (
            <button
              onClick={() => onValidate('TERMINE')}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              🏁 Terminer
            </button>
          )}
          {stage.statut === 'TERMINE' && (
            <button
              onClick={() => onValidate('ARCHIVE')}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
            >
              📦 Archiver
            </button>
          )}
          <Link
            to={`/enseignant/evaluer?type=stage&id=${stage.id}`}
            className="px-4 py-2 border border-emerald-300 text-emerald-600 text-sm font-medium rounded-lg hover:bg-emerald-50 transition text-center"
          >
            📝 Évaluer
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text, icon }: Readonly<{ text: string; icon: string }>) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
      <span className="text-4xl block mb-3">{icon}</span>
      <p className="text-gray-500">{text}</p>
    </div>
  );
}
