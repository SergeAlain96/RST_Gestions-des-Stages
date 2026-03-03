export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-white font-semibold">RST Projets</span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-center">
            © {new Date().getFullYear()} RST — Plateforme de Gestion de Projets.
            Tous droits réservés.
          </p>

          {/* Liens */}
          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">À propos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
