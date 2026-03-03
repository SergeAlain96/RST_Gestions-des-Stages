import { Link } from 'react-router-dom';
import type { Stage } from '../types';
import { TYPE_STAGE_LABELS, STATUT_STAGE_LABELS, STATUT_COLORS } from '../types';

interface StageCardProps {
  stage: Stage;
}

export default function StageCard({ stage }: StageCardProps) {
  return (
    <Link
      to={`/stages/${stage.id}`}
      className="group bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="h-44 bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center relative overflow-hidden">
        {stage.image ? (
          <img
            src={stage.image}
            alt={stage.titre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-center">
            <svg className="w-12 h-12 text-emerald-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-xs text-emerald-500 font-medium">{stage.entreprise}</span>
          </div>
        )}
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUT_COLORS[stage.statut] ?? 'bg-gray-100 text-gray-800'}`}>
          {STATUT_STAGE_LABELS[stage.statut] ?? stage.statut}
        </span>
      </div>

      {/* Contenu */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            {TYPE_STAGE_LABELS[stage.type_stage]}
          </span>
          <span className="text-xs text-gray-400">{stage.annee_universitaire}</span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-2">
          {stage.titre}
        </h3>

        {/* Entreprise & Ville */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
          </svg>
          <span className="font-medium">{stage.entreprise}</span>
          <span className="text-gray-300">•</span>
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{stage.ville}</span>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
          {stage.description}
        </p>

        {/* Technologies */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(stage.technologies_list ?? []).slice(0, 4).map((tech) => (
            <span key={tech} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
              {tech}
            </span>
          ))}
          {(stage.technologies_list ?? []).length > 4 && (
            <span className="px-2 py-0.5 text-gray-400 text-xs">+{stage.technologies_list.length - 4}</span>
          )}
        </div>

        {/* Étudiant */}
        {stage.etudiant_nom && (
          <div className="text-xs text-gray-400 border-t border-gray-100 pt-3 mt-auto">
            <span className="font-medium text-gray-500">Stagiaire :</span> {stage.etudiant_nom}
          </div>
        )}
      </div>
    </Link>
  );
}
