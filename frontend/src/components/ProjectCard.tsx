import { Link } from 'react-router-dom';
import type { Projet } from '../types';
import {
  TYPE_PROJET_LABELS,
  STATUT_PROJET_LABELS,
  STATUT_COLORS,
} from '../types';

interface ProjectCardProps {
  projet: Projet;
}

export default function ProjectCard({ projet }: ProjectCardProps) {
  return (
    <Link
      to={`/projets/${projet.id}`}
      className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="h-44 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
        {projet.image ? (
          <img
            src={projet.image}
            alt={projet.titre}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${projet.statut === 'ARCHIVE' ? 'grayscale opacity-70' : ''}`}
          />
        ) : (
          <div className="text-center">
            <svg className="w-12 h-12 text-blue-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs text-blue-400 font-medium">
              {TYPE_PROJET_LABELS[projet.type_projet]}
            </span>
          </div>
        )}
        {/* Badge statut */}
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUT_COLORS[projet.statut] ?? 'bg-gray-100 text-gray-800'}`}>
          {STATUT_PROJET_LABELS[projet.statut] ?? projet.statut}
        </span>
        {/* Overlay archivé */}
        {projet.statut === 'ARCHIVE' && (
          <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
            <span className="bg-gray-800/80 text-white text-sm font-bold px-4 py-2 rounded-lg backdrop-blur-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Archivé
            </span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            {TYPE_PROJET_LABELS[projet.type_projet]}
          </span>
          <span className="text-xs text-gray-400">
            {projet.annee_universitaire}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
          {projet.titre}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
          {projet.description}
        </p>

        {/* Technologies */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(projet.technologies_list ?? []).slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium"
            >
              {tech}
            </span>
          ))}
          {(projet.technologies_list ?? []).length > 4 && (
            <span className="px-2 py-0.5 text-gray-400 text-xs">
              +{projet.technologies_list.length - 4}
            </span>
          )}
        </div>

        {/* Auteurs */}
        {projet.tuteur_nom && (
          <div className="text-xs text-gray-400 border-t border-gray-100 pt-3 mt-auto">
            <span className="font-medium text-gray-500">Tuteur :</span> {projet.tuteur_nom}
          </div>
        )}
      </div>
    </Link>
  );
}
