 import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService } from '../services/api';
import type { DashboardData } from '../types';
import { TYPE_PROJET_LABELS, STATUT_PROJET_LABELS, STATUT_COLORS, TYPE_STAGE_LABELS, STATUT_STAGE_LABELS } from '../types';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const dashboard = await dashboardService.getEtudiantDashboard();
        setData(dashboard);
      } catch {
        setError('Impossible de charger le dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
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
      {/* En-tête Dashboard */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  Bonjour, {user?.first_name} {user?.last_name} !
                </h1>
                <p className="text-blue-200 text-sm">
                  {user?.etudiant?.filiere} — {user?.etudiant?.niveau} — Matricule : {user?.etudiant?.matricule}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to="/submit/projet"
                className="px-5 py-2.5 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition text-sm shadow-md"
              >
                + Nouveau projet
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
        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Projets" value={stats?.total_projets ?? 0} icon="📋" color="blue" />
          <StatCard label="En cours" value={stats?.projets_en_cours ?? 0} icon="🔄" color="amber" />
          <StatCard label="Terminés" value={stats?.projets_termines ?? 0} icon="✅" color="green" />
          <StatCard label="Stages" value={stats?.total_stages ?? 0} icon="🏢" color="emerald" />
        </div>

        {/* Mes Projets */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Mes Projets</h2>
            <Link to="/submit/projet" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              + Soumettre un projet
            </Link>
          </div>

          {data?.projets && data.projets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.projets.map((projet) => (
                <Link
                  key={projet.id}
                  to={`/projets/${projet.id}`}
                  className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {TYPE_PROJET_LABELS[projet.type_projet] ?? projet.type_projet}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUT_COLORS[projet.statut] ?? 'bg-gray-100 text-gray-800'}`}>
                      {STATUT_PROJET_LABELS[projet.statut] ?? projet.statut}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{projet.titre}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{projet.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {(projet.technologies_list ?? []).slice(0, 3).map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium">{t}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 mb-3">Vous n'avez pas encore soumis de projet.</p>
              <Link to="/submit/projet" className="text-blue-600 hover:underline font-medium text-sm">
                Soumettre votre premier projet →
              </Link>
            </div>
          )}
        </section>

        {/* Mes Stages */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Mes Stages</h2>
          </div>

          {data?.stages && data.stages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.stages.map((stage) => (
                <Link
                  key={stage.id}
                  to={`/stages/${stage.id}`}
                  className="bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all p-5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      {TYPE_STAGE_LABELS[stage.type_stage] ?? stage.type_stage}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUT_COLORS[stage.statut] ?? 'bg-gray-100 text-gray-800'}`}>
                      {STATUT_STAGE_LABELS[stage.statut] ?? stage.statut}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{stage.titre}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                    <span className="font-medium">{stage.entreprise}</span>
                    <span className="text-gray-300">•</span>
                    <span>{stage.ville}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(stage.technologies_list ?? []).slice(0, 3).map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium">{t}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
              <p className="text-gray-500">Aucun stage enregistré pour le moment.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ── Composant Stat Card ──

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    amber: 'bg-amber-50 border-amber-200',
    green: 'bg-green-50 border-green-200',
    emerald: 'bg-emerald-50 border-emerald-200',
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
