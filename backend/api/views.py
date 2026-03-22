from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, api_view, permission_classes as perm_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from .models import Projet, Etudiant, Enseignant, Stage, Evaluation, GroupeProjet, Entreprise, OffreStage, CV, Competence
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
    GroupeProjetSerializer,
    EntrepriseSerializer,
    EntrepriseUpdateSerializer,
    OffreStageListSerializer,
    OffreStageDetailSerializer,
    OffreStageCreateSerializer,
    CVSerializer,
    CVUpsertSerializer,
    CompetenceSerializer,
)
from .filters import ProjetFilter, StageFilter
from .permissions import IsEtudiant, IsOwnerEtudiant, IsEnseignant, IsTuteurOfProjet, IsTuteurOfStage, IsEntreprise, IsEntrepriseValide


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
        projet = Projet.objects.select_related('tuteur__user').prefetch_related('etudiants__user').get(pk=pk)
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
        stage = Stage.objects.select_related('etudiant__user', 'tuteur_academique__user').get(pk=pk)
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
        projet = Projet.objects.select_related('tuteur__user').prefetch_related('etudiants__user').get(pk=pk)
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
        stage = Stage.objects.select_related('etudiant__user', 'tuteur_academique__user').get(pk=pk)
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
        evaluation = Evaluation.objects.select_related(
            'projet', 'stage', 'enseignant__user'
        ).get(pk=pk, enseignant=enseignant)
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


class GroupeProjetViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint pour les groupes de projets par filière.
    GET /api/groupes/       → Liste de tous les groupes
    GET /api/groupes/<id>/  → Détail avec projets associés
    """
    queryset = GroupeProjet.objects.all()
    serializer_class = GroupeProjetSerializer
    permission_classes = [AllowAny]


class EntrepriseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint public pour lister les entreprises validées.
    GET /api/entreprises/       → Liste des entreprises validées
    GET /api/entreprises/<id>/  → Détail d'une entreprise
    """
    queryset = Entreprise.objects.filter(est_valide=True).select_related('user')
    serializer_class = EntrepriseSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'secteur', 'ville']
    ordering_fields = ['nom', 'date_inscription']


class OffreStageViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour les offres de stage.
    GET /api/offres/        → Liste publique des offres ouvertes
    POST /api/offres/       → Créer une offre (entreprise validée)
    GET /api/offres/<id>/   → Détail d'une offre
    PUT/PATCH /api/offres/<id>/  → Modifier (entreprise propriétaire)
    DELETE /api/offres/<id>/     → Supprimer (entreprise propriétaire)
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titre', 'description', 'technologies', 'entreprise__nom', 'entreprise__ville']
    ordering_fields = ['date_creation', 'date_limite_candidature', 'titre']
    filterset_fields = ['type_stage', 'niveau_academique', 'statut']

    def get_queryset(self):
        qs = OffreStage.objects.select_related('entreprise__user')
        # Pour les propriétaires : voir leurs propres offres (tous statuts)
        if self.request.user.is_authenticated and hasattr(self.request.user, 'entreprise_profile'):
            return qs.filter(entreprise=self.request.user.entreprise_profile)
        # Public : uniquement les offres ouvertes d'entreprises validées
        return qs.filter(statut='OUVERT', entreprise__est_valide=True)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return OffreStageDetailSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return OffreStageCreateSerializer
        return OffreStageListSerializer

    def get_permissions(self):
        if self.action in ('create',):
            return [IsAuthenticated(), IsEntrepriseValide()]
        if self.action in ('update', 'partial_update', 'destroy'):
            return [IsAuthenticated(), IsEntreprise()]
        return [AllowAny()]

    def perform_destroy(self, instance):
        # Vérifier que c'est bien l'entreprise propriétaire
        if instance.entreprise != self.request.user.entreprise_profile:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous ne pouvez supprimer que vos propres offres.")
        instance.delete()

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsEntreprise])
    def fermer(self, request, pk=None):
        """Fermer une offre de stage."""
        offre = self.get_object()
        if offre.entreprise != request.user.entreprise_profile:
            return Response({'detail': 'Action non autorisée.'}, status=status.HTTP_403_FORBIDDEN)
        offre.statut = 'FERME'
        offre.save()
        return Response(OffreStageDetailSerializer(offre).data)

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsEntreprise])
    def rouvrir(self, request, pk=None):
        """Réouvrir une offre fermée."""
        offre = self.get_object()
        if offre.entreprise != request.user.entreprise_profile:
            return Response({'detail': 'Action non autorisée.'}, status=status.HTTP_403_FORBIDDEN)
        offre.statut = 'OUVERT'
        offre.save()
        return Response(OffreStageDetailSerializer(offre).data)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny], url_path='matching-profils')
    def matching_profils(self, request, pk=None):
        """Retourne des profils CV suggérés selon les compétences d'une offre."""
        offre = self.get_object()
        required = [t.strip().lower() for t in (offre.technologies or '').split(',') if t.strip()]

        niveau_map = {
            'LICENCE': ['L1', 'L2', 'L3'],
            'IT': ['L3', 'M1'],
            'MASTER': ['M1', 'M2'],
            'IC': ['M2'],
        }

        cvs_qs = CV.objects.select_related('etudiant__user').prefetch_related('competences').filter(
            disponible_pour_stage=True
        )
        if offre.niveau_academique in niveau_map:
            cvs_qs = cvs_qs.filter(etudiant__niveau__in=niveau_map[offre.niveau_academique])

        matches = []
        for cv in cvs_qs:
            cv_skills = {c.nom.strip().lower() for c in cv.competences.all()}
            matched = sorted([skill for skill in required if skill in cv_skills])
            score = 0.0 if not required else round((len(matched) / len(required)) * 100, 1)

            # Si l'offre n'a pas de techno renseignée, on retourne les profils disponibles avec score neutre
            if required or cv.disponible_pour_stage:
                matches.append({
                    'cv': CVSerializer(cv, context={'request': request}).data,
                    'score': score,
                    'matched_competences': matched,
                })

        matches.sort(key=lambda item: item['score'], reverse=True)
        limit = int(request.query_params.get('limit', 8))
        limited = matches[:max(1, min(limit, 30))]

        return Response({
            'offre_id': offre.id,
            'required_competences': required,
            'count': len(limited),
            'results': limited,
        })


class CompetenceViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint public des compétences."""
    queryset = Competence.objects.all()
    serializer_class = CompetenceSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'categorie']
    ordering_fields = ['nom', 'categorie']


class CVViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint public des profils CV étudiants.
    GET /api/cvs/       → Liste des CV publiés
    GET /api/cvs/<id>/  → Détail d'un CV
    """
    queryset = CV.objects.select_related('etudiant__user').prefetch_related('competences')
    serializer_class = CVSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['etudiant__filiere', 'etudiant__niveau', 'disponible_pour_stage', 'competences']
    search_fields = ['etudiant__user__first_name', 'etudiant__user__last_name', 'resume', 'competences__nom']
    ordering_fields = ['date_modification', 'date_creation']


@api_view(['GET', 'POST', 'PATCH'])
@perm_classes([IsAuthenticated, IsEtudiant])
def my_cv(request):
    """
    Gestion du CV de l'étudiant connecté.
    GET   /api/cv/me/   → Lire mon CV
    POST  /api/cv/me/   → Créer mon CV (si absent)
    PATCH /api/cv/me/   → Mettre à jour mon CV
    """
    etudiant = request.user.etudiant_profile
    cv = CV.objects.filter(etudiant=etudiant).first()

    if request.method == 'GET':
        if not cv:
            return Response({'detail': 'Aucun CV trouvé.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(CVSerializer(cv, context={'request': request}).data)

    if request.method == 'POST':
        if cv:
            return Response({'detail': 'Un CV existe déjà. Utilisez PATCH pour le modifier.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = CVUpsertSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        created = serializer.save()
        return Response(CVSerializer(created, context={'request': request}).data, status=status.HTTP_201_CREATED)

    if not cv:
        return Response({'detail': 'Aucun CV trouvé. Utilisez POST pour créer votre CV.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = CVUpsertSerializer(cv, data=request.data, partial=True, context={'request': request})
    serializer.is_valid(raise_exception=True)
    updated = serializer.save()
    return Response(CVSerializer(updated, context={'request': request}).data)

# ── Dashboard Entreprise ─────────────────────────────────────

@api_view(['GET'])
@perm_classes([IsAuthenticated, IsEntreprise])
def dashboard_entreprise(request):
    """Retourne les statistiques et données du dashboard entreprise."""
    entreprise = request.user.entreprise_profile
    offres = OffreStage.objects.filter(entreprise=entreprise)

    return Response({
        'entreprise': EntrepriseSerializer(entreprise, context={'request': request}).data,
        'stats': {
            'total_offres': offres.count(),
            'offres_ouvertes': offres.filter(statut='OUVERT').count(),
            'offres_fermees': offres.filter(statut='FERME').count(),
            'offres_archivees': offres.filter(statut='ARCHIVE').count(),
        },
        'offres': OffreStageListSerializer(offres, many=True, context={'request': request}).data,
    })


@api_view(['PATCH'])
@perm_classes([IsAuthenticated, IsEntreprise])
def update_entreprise_profile(request):
    """Met à jour le profil de l'entreprise connectée."""
    entreprise = request.user.entreprise_profile
    serializer = EntrepriseUpdateSerializer(
        entreprise, data=request.data, partial=True,
        context={'request': request}
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(EntrepriseSerializer(entreprise, context={'request': request}).data)


# ── Dashboard Admin / Modération ────────────────────────

@api_view(['GET'])
@perm_classes([IsAuthenticated, IsAdminUser])
def dashboard_admin(request):
    """Statistiques globales et files d'attente de modération pour l'admin."""
    projets_en_attente = Projet.objects.filter(statut='EN_ATTENTE').select_related('tuteur__user').prefetch_related('etudiants__user')
    stages_en_attente = Stage.objects.filter(statut='EN_ATTENTE').select_related('etudiant__user', 'tuteur_academique__user')
    entreprises_en_attente = Entreprise.objects.filter(est_valide=False).select_related('user')

    return Response({
        'stats': {
            'total_etudiants': Etudiant.objects.count(),
            'total_enseignants': Enseignant.objects.count(),
            'total_entreprises': Entreprise.objects.count(),
            'total_projets': Projet.objects.count(),
            'total_stages': Stage.objects.count(),
            'projets_en_attente': projets_en_attente.count(),
            'stages_en_attente': stages_en_attente.count(),
            'entreprises_en_attente': entreprises_en_attente.count(),
        },
        'projets_en_attente': ProjetListSerializer(projets_en_attente[:20], many=True).data,
        'stages_en_attente': StageListSerializer(stages_en_attente[:20], many=True).data,
        'entreprises_en_attente': EntrepriseSerializer(
            entreprises_en_attente[:20], many=True, context={'request': request}
        ).data,
    })


@api_view(['PATCH'])
@perm_classes([IsAuthenticated, IsAdminUser])
def admin_validate_entreprise(request, pk):
    """Valider/refuser une entreprise par l'admin."""
    try:
        entreprise = Entreprise.objects.select_related('user').get(pk=pk)
    except Entreprise.DoesNotExist:
        return Response({'detail': 'Entreprise non trouvée.'}, status=status.HTTP_404_NOT_FOUND)

    est_valide = request.data.get('est_valide', True)
    entreprise.est_valide = bool(est_valide)
    entreprise.save(update_fields=['est_valide'])
    return Response(EntrepriseSerializer(entreprise, context={'request': request}).data)


@api_view(['PATCH'])
@perm_classes([IsAuthenticated, IsAdminUser])
def admin_moderate_projet(request, pk):
    """Modérer le statut d'un projet (admin)."""
    try:
        projet = Projet.objects.select_related('tuteur__user').prefetch_related('etudiants__user').get(pk=pk)
    except Projet.DoesNotExist:
        return Response({'detail': 'Projet non trouvé.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ProjetValidationSerializer(projet, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(ProjetDetailSerializer(projet).data)


@api_view(['PATCH'])
@perm_classes([IsAuthenticated, IsAdminUser])
def admin_moderate_stage(request, pk):
    """Modérer le statut d'un stage (admin)."""
    try:
        stage = Stage.objects.select_related('etudiant__user', 'tuteur_academique__user').get(pk=pk)
    except Stage.DoesNotExist:
        return Response({'detail': 'Stage non trouvé.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = StageValidationSerializer(stage, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(StageDetailSerializer(stage).data)
