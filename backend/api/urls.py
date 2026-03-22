from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    ProjetViewSet, StageViewSet, EtudiantViewSet, EnseignantViewSet,
    GroupeProjetViewSet, EntrepriseViewSet, OffreStageViewSet,
    CompetenceViewSet, CVViewSet,
    register_view, profile_view, update_profile_view,
    dashboard_etudiant, submit_projet, submit_stage,
    dashboard_enseignant, validate_projet, validate_stage,
    assign_tuteur_projet, assign_tuteur_stage,
    evaluation_list_create, evaluation_detail,
    dashboard_entreprise, update_entreprise_profile, my_cv,
    dashboard_admin, admin_validate_entreprise, admin_moderate_projet, admin_moderate_stage,
)

router = DefaultRouter()
router.register(r'projets', ProjetViewSet, basename='projet')
router.register(r'stages', StageViewSet, basename='stage')
router.register(r'etudiants', EtudiantViewSet, basename='etudiant')
router.register(r'enseignants', EnseignantViewSet, basename='enseignant')
router.register(r'groupes', GroupeProjetViewSet, basename='groupe')
router.register(r'entreprises', EntrepriseViewSet, basename='entreprise')
router.register(r'offres', OffreStageViewSet, basename='offre')
router.register(r'competences', CompetenceViewSet, basename='competence')
router.register(r'cvs', CVViewSet, basename='cv')

urlpatterns = [
    # Router DRF
    path('', include(router.urls)),

    # Auth JWT
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', register_view, name='register'),

    # Profil
    path('auth/profile/', profile_view, name='profile'),
    path('auth/profile/update/', update_profile_view, name='profile-update'),
    path('cv/me/', my_cv, name='cv-me'),

    # Dashboard étudiant
    path('dashboard/etudiant/', dashboard_etudiant, name='dashboard-etudiant'),

    # Dashboard enseignant
    path('dashboard/enseignant/', dashboard_enseignant, name='dashboard-enseignant'),

    # Soumission
    path('submit/projet/', submit_projet, name='submit-projet'),
    path('submit/stage/', submit_stage, name='submit-stage'),

    # Validation (enseignant)
    path('enseignant/projets/<int:pk>/validate/', validate_projet, name='validate-projet'),
    path('enseignant/stages/<int:pk>/validate/', validate_stage, name='validate-stage'),

    # Assignation tuteur
    path('enseignant/projets/<int:pk>/assign/', assign_tuteur_projet, name='assign-tuteur-projet'),
    path('enseignant/stages/<int:pk>/assign/', assign_tuteur_stage, name='assign-tuteur-stage'),

    # Évaluations
    path('evaluations/', evaluation_list_create, name='evaluation-list-create'),
    path('evaluations/<int:pk>/', evaluation_detail, name='evaluation-detail'),

    # Dashboard entreprise
    path('dashboard/entreprise/', dashboard_entreprise, name='dashboard-entreprise'),
    path('entreprise/profil/update/', update_entreprise_profile, name='entreprise-profil-update'),

    # Dashboard admin
    path('dashboard/admin/', dashboard_admin, name='dashboard-admin'),
    path('admin/entreprises/<int:pk>/validate/', admin_validate_entreprise, name='admin-validate-entreprise'),
    path('admin/projets/<int:pk>/moderate/', admin_moderate_projet, name='admin-moderate-projet'),
    path('admin/stages/<int:pk>/moderate/', admin_moderate_stage, name='admin-moderate-stage'),
]
