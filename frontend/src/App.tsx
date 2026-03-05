import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
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

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Routes>
          {/* Pages auth (sans Header/Footer) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Pages avec layout complet */}
          <Route path="/*" element={
            <div className="min-h-screen flex flex-col bg-gray-50">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/projets" element={<ProjetsPage />} />
                  <Route path="/projets/:id" element={<ProjetDetailPage />} />
                  <Route path="/stages" element={<StagesPage />} />
                  <Route path="/stages/:id" element={<StageDetailPage />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute requiredRole="etudiant">
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/submit/projet" element={
                    <ProtectedRoute requiredRole="etudiant">
                      <SubmitProjetPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/submit/stage" element={
                    <ProtectedRoute requiredRole="etudiant">
                      <SubmitStagePage />
                    </ProtectedRoute>
                  } />
                  {/* Espace enseignant */}
                  <Route path="/enseignant" element={
                    <ProtectedRoute requiredRole="enseignant">
                      <DashboardEnseignantPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/enseignant/evaluer" element={
                    <ProtectedRoute requiredRole="enseignant">
                      <EvaluationFormPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/enseignant/evaluations" element={
                    <ProtectedRoute requiredRole="enseignant">
                      <EvaluationsListPage />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              <Footer />
            </div>
          } />
        </Routes>
      </ErrorBoundary>
    </AuthProvider>
  )
}

export default App
