import { Link } from 'react-router-dom';
import esiLogo from '../../Logo_esi_best (1).jpg';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* Identité ESI */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-gray-700 bg-white">
                <img src={esiLogo} alt="Logo ESI" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white font-semibold leading-tight">École Supérieure d'Informatique</p>
                <p className="text-xs text-gray-500">Université Nazi Boni — Bobo-Dioulasso</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              Plateforme de gestion des projets et stages académiques de l'ESI — UNB.
            </p>
          </div>

          {/* Adresses institutionnelles */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Nous contacter</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-green-400 font-medium mb-1">ESI — École Supérieure d'Informatique</p>
                <p>01 BP 1091 Bobo-Dioulasso 01</p>
                <p>Bobo-Dioulasso, Burkina Faso</p>
                <p className="mt-1">
                  <a href="mailto:contact@esi.unb.bf" className="hover:text-green-400 transition-colors">
                    contact@esi.unb.bf
                  </a>
                </p>
              </div>
              <div>
                <p className="text-green-400 font-medium mb-1">UNB — Université Nazi Boni</p>
                <p>01 BP 1091 Bobo-Dioulasso 01</p>
                <p>Burkina Faso</p>
                <p className="mt-1">
                  <a href="https://unb.bf" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">
                    www.unb.bf
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Plan du site */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Plan du site</h3>
            <nav className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <Link to="/" className="hover:text-green-400 transition-colors">Accueil</Link>
              <Link to="/projets" className="hover:text-green-400 transition-colors">Projets</Link>
              <Link to="/stages" className="hover:text-green-400 transition-colors">Stages & Emplois</Link>
              <Link to="/login" className="hover:text-green-400 transition-colors">Connexion</Link>
              <Link to="/register" className="hover:text-green-400 transition-colors">Inscription</Link>
              <a href="mailto:contact@esi.unb.bf" className="hover:text-green-400 transition-colors">Contact</a>
            </nav>
          </div>

        </div>

        {/* Barre de bas */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} ESI — Université Nazi Boni. Tous droits réservés.</p>
          <div className="flex gap-4">
            <a href="https://unb.bf" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">UNB</a>
            <span className="text-gray-700">|</span>
            <a href="mailto:contact@esi.unb.bf" className="hover:text-gray-300 transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

