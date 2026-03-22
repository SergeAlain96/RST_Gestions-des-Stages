import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import ErrorBoundary from './components/ErrorBoundary'
import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import ProjetsPage from './pages/ProjetsPage'
import ProjetDetailPage from './pages/ProjetDetailPage'
import StagesPage from './pages/StagesPage'
import StageDetailPage from './pages/StageDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import SubmitProjetPage from './pages/SubmitProjetPage'
import SubmitStagePage from './pages/SubmitStagePage'
import DashboardEnseignantPage from './pages/DashboardEnseignantPage'
import EvaluationFormPage from './pages/EvaluationFormPage'
import EvaluationsListPage from './pages/EvaluationsListPage'
import OffresPage from './pages/OffresPage'
import OffreDetailPage from './pages/OffreDetailPage'
import DashboardEntreprisePage from './pages/DashboardEntreprisePage'
import OffreFormPage from './pages/OffreFormPage'
import ProfilEtudiantPage from './pages/ProfilEtudiantPage'
import ProfilsEtudiantsPage from './pages/ProfilsEtudiantsPage'
import DashboardAdminPage from './pages/DashboardAdminPage'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ErrorBoundary>
          <Routes>
            {/* Pages auth (sans Header/Footer) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Pages avec layout complet */}
            <Route
              path="/*"
              element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      {/* Public */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/projets" element={<ProjetsPage />} />
                      <Route path="/projets/:id" element={<ProjetDetailPage />} />
                      <Route path="/stages" element={<StagesPage />} />
                      <Route path="/stages/:id" element={<StageDetailPage />} />
                      <Route path="/offres" element={<OffresPage />} />
                      <Route path="/offres/:id" element={<OffreDetailPage />} />
                      <Route path="/profils-etudiants" element={<ProfilsEtudiantsPage />} />

                      {/* Espace étudiant */}
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute requiredRole="etudiant">
                            <DashboardPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/submit/projet"
                        element={
                          <ProtectedRoute requiredRole="etudiant">
                            <SubmitProjetPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/submit/stage"
                        element={
                          <ProtectedRoute requiredRole="etudiant">
                            <SubmitStagePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/profil-etudiant"
                        element={
                          <ProtectedRoute requiredRole="etudiant">
                            <ProfilEtudiantPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Espace enseignant */}
                      <Route
                        path="/enseignant"
                        element={
                          <ProtectedRoute requiredRole="enseignant">
                            <DashboardEnseignantPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/enseignant/evaluer"
                        element={
                          <ProtectedRoute requiredRole="enseignant">
                            <EvaluationFormPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/enseignant/evaluations"
                        element={
                          <ProtectedRoute requiredRole="enseignant">
                            <EvaluationsListPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Espace entreprise */}
                      <Route
                        path="/entreprise"
                        element={
                          <ProtectedRoute requiredRole="entreprise">
                            <DashboardEntreprisePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/entreprise/offres/nouvelle"
                        element={
                          <ProtectedRoute requiredRole="entreprise">
                            <OffreFormPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/entreprise/offres/:id/modifier"
                        element={
                          <ProtectedRoute requiredRole="entreprise">
                            <OffreFormPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Espace admin */}
                      <Route
                        path="/admin/dashboard"
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <DashboardAdminPage />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </ErrorBoundary>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
