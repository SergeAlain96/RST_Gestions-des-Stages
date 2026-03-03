import StageList from '../components/StageList';

export default function StagesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Galerie des Stages</h1>
          <p className="text-gray-500 mt-2">
            Découvrez les expériences professionnelles de nos étudiants en entreprise.
          </p>
        </div>
      </div>
      <StageList />
    </div>
  );
}
