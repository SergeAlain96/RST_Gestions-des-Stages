from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    ProjetViewSet, StageViewSet, EtudiantViewSet, EnseignantViewSet,
    register_view, profile_view, update_profile_view,
    dashboard_etudiant, submit_projet, submit_stage,
    dashboard_enseignant, validate_projet, validate_stage,
    assign_tuteur_projet, assign_tuteur_stage,
    evaluation_list_create, evaluation_detail,
)

router = DefaultRouter()
router.register(r'projets', ProjetViewSet, basename='projet')
router.register(r'stages', StageViewSet, basename='stage')
router.register(r'etudiants', EtudiantViewSet, basename='etudiant')
router.register(r'enseignants', EnseignantViewSet, basename='enseignant')

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
]
