import ProjectList from '../components/ProjectList';

export default function ProjetsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête de page */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Tous les Projets</h1>
          <p className="text-gray-500 mt-2">
            Parcourez l'ensemble des projets académiques réalisés par nos étudiants.
          </p>
        </div>
      </div>
      <ProjectList />
    </div>
  );
}
