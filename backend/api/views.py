from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, api_view, permission_classes as perm_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from .models import Projet, Etudiant, Enseignant, Stage, Evaluation
from .serializers import (
    ProjetListSerializer,
    ProjetDetailSerializer,
    EtudiantSerializer,
    EnseignantSerializer,
    StageListSerializer,
    StageDetailSerializer,
    RegisterSerializer,
    UserProfileSerializer,
    ProjetSubmitSerializer,
    StageSubmitSerializer,
    EvaluationSerializer,
    EvaluationCreateSerializer,
    ProjetValidationSerializer,
    StageValidationSerializer,
)
from .filters import ProjetFilter, StageFilter
from .permissions import IsEtudiant, IsOwnerEtudiant, IsEnseignant, IsTuteurOfProjet, IsTuteurOfStage


# ── Auth Views ───────────────────────────────────────────

@api_view(['POST'])
@perm_classes([AllowAny])
def register_view(request):
    """Inscription d'un nouvel étudiant."""
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    # Générer les tokens JWT
    refresh = RefreshToken.for_user(user)
    return Response({
        'message': 'Inscription réussie !',
        'user': UserProfileSerializer(user).data,
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@perm_classes([IsAuthenticated])
def profile_view(request):
    """Retourne le profil de l'utilisateur connecté."""
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)


@api_view(['PATCH'])
@perm_classes([IsAuthenticated])
def update_profile_view(request):
    """Met à jour le profil de l'utilisateur connecté."""
    user = request.user
    data = request.data

    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'email' in data:
        user.email = data['email']
    user.save()

    # Mise à jour des champs étudiant si applicable
    if hasattr(user, 'etudiant_profile') and any(k in data for k in ['filiere', 'niveau']):
        etudiant = user.etudiant_profile
        if 'filiere' in data:
            etudiant.filiere = data['filiere']
        if 'niveau' in data:
            etudiant.niveau = data['niveau']
        etudiant.save()

    return Response(UserProfileSerializer(user).data)


# ── Dashboard Étudiant ───────────────────────────────────

@api_view(['GET'])
@perm_classes([IsAuthenticated, IsEtudiant])
def dashboard_etudiant(request):
    """Retourne les statistiques et données du dashboard étudiant."""
    etudiant = request.user.etudiant_profile

    projets = Projet.objects.filter(etudiants=etudiant).select_related('tuteur__user')
    stages = Stage.objects.filter(etudiant=etudiant).select_related('tuteur_academique__user')

    return Response({
        'etudiant': EtudiantSerializer(etudiant).data,
        'stats': {
            'total_projets': projets.count(),
            'projets_en_cours': projets.filter(statut='EN_COURS').count(),
            'projets_termines': projets.filter(statut='TERMINE').count(),
            'projets_en_attente': projets.filter(statut='EN_ATTENTE').count(),
            'total_stages': stages.count(),
            'stages_en_cours': stages.filter(statut='EN_COURS').count(),
            'stages_termines': stages.filter(statut='TERMINE').count(),
        },
        'projets': ProjetListSerializer(projets, many=True).data,
        'stages': StageListSerializer(stages, many=True).data,
    })


# ── Soumission Projet/Stage ─────────────────────────────

@api_view(['POST'])
@perm_classes([IsAuthenticated, IsEtudiant])
def submit_projet(request):
    """Soumission d'un nouveau projet par un étudiant."""
    serializer = ProjetSubmitSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    projet = serializer.save()
    return Response(
        ProjetDetailSerializer(projet).data,
        status=status.HTTP_201_CREATED
    )


@api_view(['POST'])
@perm_classes([IsAuthenticated, IsEtudiant])
def submit_stage(request):
    """Soumission d'un nouveau stage par un étudiant."""
    serializer = StageSubmitSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    stage = serializer.save()
    return Response(
        StageDetailSerializer(stage).data,
        status=status.HTTP_201_CREATED
    )


# ── Dashboard Enseignant ─────────────────────────────────

@api_view(['GET'])
@perm_classes([IsAuthenticated, IsEnseignant])
def dashboard_enseignant(request):
    """Retourne les statistiques et données du dashboard enseignant."""
    enseignant = request.user.enseignant_profile

    projets = Projet.objects.filter(tuteur=enseignant).select_related('tuteur__user').prefetch_related('etudiants__user')
    stages = Stage.objects.filter(tuteur_academique=enseignant).select_related('etudiant__user', 'tuteur_academique__user')
    evaluations = Evaluation.objects.filter(enseignant=enseignant).select_related('projet', 'stage')

    return Response({
        'enseignant': EnseignantSerializer(enseignant).data,
        'stats': {
            'total_projets': projets.count(),
            'projets_en_attente': projets.filter(statut='EN_ATTENTE').count(),
            'projets_en_cours': projets.filter(statut='EN_COURS').count(),
            'projets_termines': projets.filter(statut='TERMINE').count(),
            'projets_valides': projets.filter(statut='VALIDE').count(),
            'projets_refuses': projets.filter(statut='REFUSE').count(),
            'total_stages': stages.count(),
            'stages_en_cours': stages.filter(statut='EN_COURS').count(),
            'stages_termines': stages.filter(statut='TERMINE').count(),
            'total_evaluations': evaluations.count(),
        },
        'projets': ProjetListSerializer(projets, many=True).data,
        'stages': StageListSerializer(stages, many=True).data,
    })


# ── Validation Projet/Stage (PATCH statut) ───────────────

@api_view(['PATCH'])
@perm_classes([IsAuthenticated, IsEnseignant])
def validate_projet(request, pk):
    """Valider/refuser un projet. Seul le tuteur ou un admin peut changer le statut."""
    try:
        projet = Projet.objects.get(pk=pk)
    except Projet.DoesNotExist:
        return Response({'detail': 'Projet non trouvé.'}, status=status.HTTP_404_NOT_FOUND)

    # Vérifier que l'enseignant est le tuteur du projet
    enseignant = request.user.enseignant_profile
    if projet.tuteur != enseignant and not request.user.is_staff:
        return Response(
            {'detail': "Vous n'êtes pas le tuteur de ce projet."},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = ProjetValidationSerializer(projet, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(ProjetDetailSerializer(projet).data)


@api_view(['PATCH'])
@perm_classes([IsAuthenticated, IsEnseignant])
def validate_stage(request, pk):
    """Changer le statut d'un stage. Seul le tuteur académique ou un admin peut le faire."""
    try:
        stage = Stage.objects.get(pk=pk)
    except Stage.DoesNotExist:
        return Response({'detail': 'Stage non trouvé.'}, status=status.HTTP_404_NOT_FOUND)

    enseignant = request.user.enseignant_profile
    if stage.tuteur_academique != enseignant and not request.user.is_staff:
        return Response(
            {'detail': "Vous n'êtes pas le tuteur académique de ce stage."},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = StageValidationSerializer(stage, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(StageDetailSerializer(stage).data)


# ── Assign tuteur (enseignant s'assigne à un projet/stage) ──

@api_view(['POST'])
@perm_classes([IsAuthenticated, IsEnseignant])
def assign_tuteur_projet(request, pk):
    """Un enseignant s'assigne comme tuteur d'un projet."""
    try:
        projet = Projet.objects.get(pk=pk)
    except Projet.DoesNotExist:
        return Response({'detail': 'Projet non trouvé.'}, status=status.HTTP_404_NOT_FOUND)

    if projet.tuteur is not None:
        return Response(
            {'detail': f'Ce projet a déjà un tuteur : {projet.tuteur}.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    enseignant = request.user.enseignant_profile
    projet.tuteur = enseignant
    projet.save()
    return Response(ProjetDetailSerializer(projet).data)


@api_view(['POST'])
@perm_classes([IsAuthenticated, IsEnseignant])
def assign_tuteur_stage(request, pk):
    """Un enseignant s'assigne comme tuteur académique d'un stage."""
    try:
        stage = Stage.objects.get(pk=pk)
    except Stage.DoesNotExist:
        return Response({'detail': 'Stage non trouvé.'}, status=status.HTTP_404_NOT_FOUND)

    if stage.tuteur_academique is not None:
        return Response(
            {'detail': f'Ce stage a déjà un tuteur académique : {stage.tuteur_academique}.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    enseignant = request.user.enseignant_profile
    stage.tuteur_academique = enseignant
    stage.save()
    return Response(StageDetailSerializer(stage).data)


# ── Évaluations ──────────────────────────────────────────

@api_view(['GET', 'POST'])
@perm_classes([IsAuthenticated, IsEnseignant])
def evaluation_list_create(request):
    """
    GET  → Liste des évaluations de l'enseignant connecté.
    POST → Créer une nouvelle évaluation.
    """
    enseignant = request.user.enseignant_profile

    if request.method == 'GET':
        evaluations = Evaluation.objects.filter(enseignant=enseignant).select_related(
            'projet', 'stage', 'enseignant__user'
        )
        return Response(EvaluationSerializer(evaluations, many=True).data)

    # POST
    serializer = EvaluationCreateSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    evaluation = serializer.save()
    return Response(EvaluationSerializer(evaluation).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@perm_classes([IsAuthenticated, IsEnseignant])
def evaluation_detail(request, pk):
    """
    GET    → Détail d'une évaluation.
    PUT    → Modifier une évaluation existante.
    DELETE → Supprimer une évaluation.
    """
    enseignant = request.user.enseignant_profile

    try:
        evaluation = Evaluation.objects.get(pk=pk, enseignant=enseignant)
    except Evaluation.DoesNotExist:
        return Response({'detail': 'Évaluation non trouvée.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(EvaluationSerializer(evaluation).data)

    if request.method == 'PUT':
        serializer = EvaluationCreateSerializer(evaluation, data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(EvaluationSerializer(evaluation).data)

    # DELETE
    evaluation.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


class ProjetViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint pour consulter les projets.
    GET /api/projets/              → Liste paginée avec filtres
    GET /api/projets/<id>/         → Détail d'un projet
    GET /api/projets/annees/       → Liste des années disponibles
    GET /api/projets/technologies/ → Liste des technologies disponibles
    """
    queryset = Projet.objects.select_related('tuteur__user').prefetch_related('etudiants__user').all()
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProjetFilter
    search_fields = ['titre', 'description', 'technologies', 'annee_universitaire']
    ordering_fields = ['date_soumission', 'titre', 'annee_universitaire']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjetDetailSerializer
        return ProjetListSerializer

    @action(detail=False, methods=['get'])
    def annees(self, request):
        """Retourne la liste des années universitaires disponibles."""
        annees = Projet.objects.values_list('annee_universitaire', flat=True).distinct().order_by('-annee_universitaire')
        return Response(list(annees))

    @action(detail=False, methods=['get'])
    def technologies(self, request):
        """Retourne la liste de toutes les technologies utilisées."""
        all_techs = Projet.objects.values_list('technologies', flat=True)
        techs_set = set()
        for techs_str in all_techs:
            for tech in techs_str.split(','):
                tech = tech.strip()
                if tech:
                    techs_set.add(tech)
        return Response(sorted(techs_set))


class StageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint pour consulter les stages.
    GET /api/stages/       → Liste paginée avec filtres
    GET /api/stages/<id>/  → Détail d'un stage
    """
    queryset = Stage.objects.select_related('etudiant__user', 'tuteur_academique__user').all()
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = StageFilter
    search_fields = ['titre', 'description', 'entreprise', 'technologies', 'ville']
    ordering_fields = ['date_creation', 'titre', 'entreprise', 'annee_universitaire']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return StageDetailSerializer
        return StageListSerializer

    @action(detail=False, methods=['get'])
    def entreprises(self, request):
        """Retourne la liste des entreprises disponibles."""
        entreprises = Stage.objects.values_list('entreprise', flat=True).distinct().order_by('entreprise')
        return Response(list(entreprises))


class EtudiantViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint pour consulter les étudiants."""
    queryset = Etudiant.objects.select_related('user').all()
    serializer_class = EtudiantSerializer
    permission_classes = [AllowAny]


class EnseignantViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint pour consulter les enseignants."""
    queryset = Enseignant.objects.select_related('user').all()
    serializer_class = EnseignantSerializer
    permission_classes = [AllowAny]
