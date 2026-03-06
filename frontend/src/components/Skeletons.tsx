/**
 * Skeleton de chargement pour les cartes projet/stage.
 * Affiche un placeholder animé pendant le chargement des données.
 */
export function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col animate-pulse">
      {/* Image placeholder */}
      <div className="h-44 bg-gray-200" />

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-20 bg-gray-200 rounded skeleton" />
          <div className="h-5 w-16 bg-gray-200 rounded skeleton" />
        </div>
        <div className="h-6 w-3/4 bg-gray-200 rounded skeleton mb-2" />
        <div className="h-4 w-full bg-gray-200 rounded skeleton mb-1" />
        <div className="h-4 w-2/3 bg-gray-200 rounded skeleton mb-4" />
        <div className="flex gap-2 mt-auto">
          <div className="h-6 w-14 bg-gray-200 rounded skeleton" />
          <div className="h-6 w-14 bg-gray-200 rounded skeleton" />
          <div className="h-6 w-14 bg-gray-200 rounded skeleton" />
        </div>
      </div>
    </div>
  );
}

export function StageCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col animate-pulse">
      <div className="h-44 bg-gray-200" />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-24 bg-gray-200 rounded skeleton" />
          <div className="h-5 w-16 bg-gray-200 rounded skeleton" />
        </div>
        <div className="h-6 w-3/4 bg-gray-200 rounded skeleton mb-2" />
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-24 bg-gray-200 rounded skeleton" />
          <div className="h-4 w-16 bg-gray-200 rounded skeleton" />
        </div>
        <div className="h-4 w-full bg-gray-200 rounded skeleton mb-1" />
        <div className="h-4 w-2/3 bg-gray-200 rounded skeleton mb-4" />
        <div className="flex gap-2 mt-auto">
          <div className="h-6 w-14 bg-gray-200 rounded skeleton" />
          <div className="h-6 w-14 bg-gray-200 rounded skeleton" />
        </div>
      </div>
    </div>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-8 w-8 bg-gray-200 rounded skeleton" />
        <div className="h-10 w-12 bg-gray-200 rounded skeleton" />
      </div>
      <div className="h-4 w-20 bg-gray-200 rounded skeleton" />
    </div>
  );
}
