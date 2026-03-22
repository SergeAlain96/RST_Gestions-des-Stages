from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import (
    Projet, Etudiant, Enseignant, Stage, Evaluation, GroupeProjet,
    Entreprise, OffreStage, Competence, CV, EtudiantAutorise,
)


# ── GroupeProjet ─────────────────────────────────────────

class GroupeProjetSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupeProjet
        fields = ['id', 'code', 'nom', 'description', 'couleur']


# ── Auth ─────────────────────────────────────────────────

class RegisterSerializer(serializers.Serializer):
    """Inscription d'un étudiant, d'un enseignant ou d'une entreprise."""
    # Commun
    role = serializers.ChoiceField(choices=['etudiant', 'enseignant', 'entreprise'])
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)

    # Étudiant (requis si role == 'etudiant')
    matricule = serializers.CharField(max_length=50, required=False, allow_blank=True)
    filiere = serializers.CharField(max_length=100, required=False, allow_blank=True)
    niveau = serializers.ChoiceField(choices=['L1', 'L2', 'L3', 'M1', 'M2'], required=False, allow_blank=True)
    promotion = serializers.IntegerField(required=False)

    # Enseignant (optionnel si role == 'enseignant')
    departement = serializers.CharField(max_length=100, required=False, allow_blank=True)
    specialite = serializers.CharField(max_length=200, required=False, allow_blank=True)
    telephone = serializers.CharField(max_length=20, required=False, allow_blank=True)

    # Entreprise (requis si role == 'entreprise')
    nom_entreprise = serializers.CharField(max_length=200, required=False, allow_blank=True)
    secteur = serializers.CharField(max_length=100, required=False, allow_blank=True)
    ville = serializers.CharField(max_length=100, required=False, allow_blank=True)
    tel_entreprise = serializers.CharField(max_length=20, required=False, allow_blank=True)
    site_web = serializers.URLField(required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password2": "Les mots de passe ne correspondent pas."})

        # Validations conditionnelles pour étudiant
        if attrs.get('role') == 'etudiant':
            if not attrs.get('matricule'):
                raise serializers.ValidationError({"matricule": "Le matricule est requis pour un étudiant."})
            if not attrs.get('filiere'):
                raise serializers.ValidationError({"filiere": "La filière est requise pour un étudiant."})
            if not attrs.get('niveau'):
                raise serializers.ValidationError({"niveau": "Le niveau est requis pour un étudiant."})
            if not attrs.get('promotion'):
                raise serializers.ValidationError({"promotion": "La promotion est requise pour un étudiant."})
            # Unicite du matricule
            if Etudiant.objects.filter(matricule=attrs['matricule']).exists():
                raise serializers.ValidationError({"matricule": "Ce matricule est déjà enregistré."})
            # Validation email institutionnel ESI
            email = attrs.get('email', '')
            if not email.endswith('@esi.unb.bf'):
                raise serializers.ValidationError(
                    {"email": "Les étudiants doivent utiliser leur email institutionnel (@esi.unb.bf)."}
                )

            # Validation contre la liste officielle (si elle est renseignée)
            if EtudiantAutorise.objects.exists():
                matricule = attrs.get('matricule')
                autorise = EtudiantAutorise.objects.filter(
                    matricule=matricule,
                    email_institutionnel__iexact=email,
                    actif=True,
                ).exists()
                if not autorise:
                    raise serializers.ValidationError({
                        "non_field_errors": [
                            "Inscription refusée : matricule/email non présents dans la liste des étudiants autorisés."
                        ]
                    })

        if attrs.get('role') == 'entreprise':
            if not attrs.get('nom_entreprise'):
                raise serializers.ValidationError({"nom_entreprise": "Le nom de l'entreprise est requis."})

        return attrs

    def create(self, validated_data):
        role = validated_data.pop('role')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )

        if role == 'etudiant':
            Etudiant.objects.create(
                user=user,
                matricule=validated_data['matricule'],
                filiere=validated_data['filiere'],
                niveau=validated_data['niveau'],
                promotion=validated_data['promotion'],
            )
        elif role == 'enseignant':
            Enseignant.objects.create(
                user=user,
                departement=validated_data.get('departement', ''),
                specialite=validated_data.get('specialite', ''),
                telephone=validated_data.get('telephone', ''),
            )
        elif role == 'entreprise':
            Entreprise.objects.create(
                user=user,
                nom=validated_data.get('nom_entreprise', ''),
                secteur=validated_data.get('secteur', ''),
                ville=validated_data.get('ville', 'Bobo-Dioulasso'),
                telephone=validated_data.get('tel_entreprise', ''),
                site_web=validated_data.get('site_web') or None,
                est_valide=False,
            )

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Profil complet de l'utilisateur connecté."""
    role = serializers.SerializerMethodField()
    etudiant = serializers.SerializerMethodField()
    enseignant = serializers.SerializerMethodField()
    entreprise = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'role', 'etudiant', 'enseignant', 'entreprise']

    def get_role(self, obj):
        if hasattr(obj, 'etudiant_profile'):
            return 'etudiant'
        if hasattr(obj, 'enseignant_profile'):
            return 'enseignant'
        if hasattr(obj, 'entreprise_profile'):
            return 'entreprise'
        if obj.is_staff:
            return 'admin'
        return 'visiteur'

    def get_etudiant(self, obj):
        if hasattr(obj, 'etudiant_profile'):
            e = obj.etudiant_profile
            return {
                'id': e.id,
                'matricule': e.matricule,
                'filiere': e.filiere,
                'niveau': e.niveau,
                'promotion': e.promotion,
            }
        return None

    def get_enseignant(self, obj):
        if hasattr(obj, 'enseignant_profile'):
            e = obj.enseignant_profile
            return {
                'id': e.id,
                'departement': e.departement,
                'specialite': e.specialite,
            }
        return None

    def get_entreprise(self, obj):
        if hasattr(obj, 'entreprise_profile'):
            e = obj.entreprise_profile
            return {
                'id': e.id,
                'nom': e.nom,
                'secteur': e.secteur,
                'ville': e.ville,
                'est_valide': e.est_valide,
            }
        return None


# ── Soumission de Projet par Étudiant ────────────────────

class ProjetSubmitSerializer(serializers.ModelSerializer):
    """Serializer pour la soumission de projet par un étudiant."""

    class Meta:
        model = Projet
        fields = [
            'titre', 'description', 'type_projet', 'technologies',
            'annee_universitaire', 'image', 'document',
            'lien_github', 'lien_demo',
        ]

    def create(self, validated_data):
        request = self.context['request']
        etudiant = request.user.etudiant_profile
        projet = Projet.objects.create(**validated_data, statut='EN_ATTENTE')
        projet.etudiants.add(etudiant)
        return projet


# ── Soumission de Stage par Étudiant ─────────────────────

class StageSubmitSerializer(serializers.ModelSerializer):
    """Serializer pour la soumission de stage par un étudiant."""

    class Meta:
        model = Stage
        fields = [
            'titre', 'description', 'entreprise', 'ville', 'pays',
            'type_stage', 'technologies', 'annee_universitaire',
            'date_debut', 'date_fin', 'image', 'lien_entreprise',
            'maitre_stage', 'niveau_academique', 'duree',
        ]

    def create(self, validated_data):
        request = self.context['request']
        etudiant = request.user.etudiant_profile
        stage = Stage.objects.create(**validated_data, etudiant=etudiant, statut='EN_ATTENTE')
        return stage


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class EnseignantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    nom_complet = serializers.SerializerMethodField()

    class Meta:
        model = Enseignant
        fields = ['id', 'user', 'nom_complet', 'departement', 'specialite', 'telephone']

    def get_nom_complet(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"


class EtudiantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    nom_complet = serializers.SerializerMethodField()

    class Meta:
        model = Etudiant
        fields = ['id', 'user', 'nom_complet', 'matricule', 'filiere', 'niveau', 'promotion']

    def get_nom_complet(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"


class ProjetListSerializer(serializers.ModelSerializer):
    """Serializer allégé pour la liste des projets."""
    tuteur_nom = serializers.SerializerMethodField()
    etudiants_noms = serializers.SerializerMethodField()
    technologies_list = serializers.ReadOnlyField()
    groupe = GroupeProjetSerializer(read_only=True)

    class Meta:
        model = Projet
        fields = [
            'id', 'titre', 'description', 'type_projet', 'statut',
            'technologies', 'technologies_list', 'annee_universitaire',
            'date_soumission', 'image', 'tuteur_nom', 'etudiants_noms', 'groupe',
        ]

    def get_tuteur_nom(self, obj):
        if obj.tuteur:
            return f"{obj.tuteur.user.first_name} {obj.tuteur.user.last_name}"
        return None

    def get_etudiants_noms(self, obj):
        return [
            f"{e.user.first_name} {e.user.last_name}"
            for e in obj.etudiants.all()
        ]


class ProjetDetailSerializer(serializers.ModelSerializer):
    """Serializer complet pour le détail d'un projet."""
    tuteur = EnseignantSerializer(read_only=True)
    etudiants = EtudiantSerializer(many=True, read_only=True)
    technologies_list = serializers.ReadOnlyField()
    groupe = GroupeProjetSerializer(read_only=True)

    class Meta:
        model = Projet
        fields = [
            'id', 'titre', 'description', 'type_projet', 'statut',
            'technologies', 'technologies_list', 'annee_universitaire',
            'date_soumission', 'date_modification',
            'image', 'document', 'lien_github', 'lien_demo',
            'etudiants', 'tuteur', 'groupe',
        ]


# ── Stages ──────────────────────────────────────────────

class StageListSerializer(serializers.ModelSerializer):
    """Serializer allégé pour la liste des stages."""
    etudiant_nom = serializers.SerializerMethodField()
    tuteur_nom = serializers.SerializerMethodField()
    technologies_list = serializers.ReadOnlyField()

    class Meta:
        model = Stage
        fields = [
            'id', 'titre', 'description', 'entreprise', 'ville', 'pays',
            'type_stage', 'statut', 'technologies', 'technologies_list',
            'annee_universitaire', 'date_debut', 'date_fin', 'date_creation',
            'image', 'etudiant_nom', 'tuteur_nom', 'maitre_stage',
            'niveau_academique', 'duree',
        ]

    def get_etudiant_nom(self, obj):
        return f"{obj.etudiant.user.first_name} {obj.etudiant.user.last_name}"

    def get_tuteur_nom(self, obj):
        if obj.tuteur_academique:
            return f"{obj.tuteur_academique.user.first_name} {obj.tuteur_academique.user.last_name}"
        return None


class StageDetailSerializer(serializers.ModelSerializer):
    """Serializer complet pour le détail d'un stage."""
    etudiant = EtudiantSerializer(read_only=True)
    tuteur_academique = EnseignantSerializer(read_only=True)
    technologies_list = serializers.ReadOnlyField()

    class Meta:
        model = Stage
        fields = [
            'id', 'titre', 'description', 'entreprise', 'ville', 'pays',
            'type_stage', 'statut', 'technologies', 'technologies_list',
            'annee_universitaire', 'date_debut', 'date_fin', 'date_creation',
            'image', 'rapport', 'lien_entreprise',
            'etudiant', 'tuteur_academique', 'maitre_stage',
            'niveau_academique', 'duree',
        ]


# ── Évaluations ─────────────────────────────────────────

class EvaluationSerializer(serializers.ModelSerializer):
    """Serializer complet pour une évaluation."""
    enseignant_nom = serializers.SerializerMethodField()
    note_moyenne = serializers.ReadOnlyField()

    class Meta:
        model = Evaluation
        fields = [
            'id', 'projet', 'stage', 'enseignant', 'enseignant_nom',
            'note_rapport', 'note_soutenance', 'note_technique', 'note_comportement',
            'note_moyenne', 'commentaire', 'date_evaluation', 'date_modification',
        ]
        read_only_fields = ['id', 'enseignant', 'date_evaluation', 'date_modification']

    def get_enseignant_nom(self, obj):
        return f"{obj.enseignant.user.first_name} {obj.enseignant.user.last_name}"


class EvaluationCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création/mise à jour d'une évaluation par un enseignant."""

    class Meta:
        model = Evaluation
        fields = [
            'projet', 'stage',
            'note_rapport', 'note_soutenance', 'note_technique', 'note_comportement',
            'commentaire',
        ]

    def validate(self, attrs):
        projet = attrs.get('projet')
        stage = attrs.get('stage')
        if not projet and not stage:
            raise serializers.ValidationError("Vous devez spécifier un projet ou un stage à évaluer.")
        if projet and stage:
            raise serializers.ValidationError("Vous ne pouvez évaluer qu'un projet OU un stage, pas les deux.")
        return attrs

    def create(self, validated_data):
        request = self.context['request']
        enseignant = request.user.enseignant_profile
        return Evaluation.objects.create(**validated_data, enseignant=enseignant)


# ── Dashboard Enseignant ─────────────────────────────────

class ProjetValidationSerializer(serializers.ModelSerializer):
    """Serializer pour valider/refuser un projet (PATCH statut)."""

    class Meta:
        model = Projet
        fields = ['statut']

    def validate_statut(self, value):
        allowed = ['VALIDE', 'REFUSE', 'EN_COURS', 'TERMINE']
        if value not in allowed:
            raise serializers.ValidationError(
                f"Statut invalide. Valeurs autorisées : {', '.join(allowed)}"
            )
        return value


class StageValidationSerializer(serializers.ModelSerializer):
    """Serializer pour valider/changer le statut d'un stage (PATCH statut)."""

    class Meta:
        model = Stage
        fields = ['statut']

    def validate_statut(self, value):
        allowed = ['EN_COURS', 'TERMINE', 'ARCHIVE']
        if value not in allowed:
            raise serializers.ValidationError(
                f"Statut invalide. Valeurs autorisées : {', '.join(allowed)}"
            )
        return value

# ── Entreprise & Offres de Stage ───────────────────────────────

class EntrepriseSerializer(serializers.ModelSerializer):
    """Profil public d'une entreprise."""
    email = serializers.SerializerMethodField()
    nb_offres = serializers.SerializerMethodField()

    class Meta:
        model = Entreprise
        fields = [
            'id', 'nom', 'secteur', 'description', 'adresse',
            'ville', 'pays', 'telephone', 'site_web', 'logo',
            'est_valide', 'date_inscription', 'email', 'nb_offres',
        ]

    def get_email(self, obj):
        return obj.user.email

    def get_nb_offres(self, obj):
        return obj.offres.filter(statut='OUVERT').count()


class EntrepriseUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour la mise à jour du profil entreprise."""

    class Meta:
        model = Entreprise
        fields = [
            'nom', 'secteur', 'description', 'adresse',
            'ville', 'pays', 'telephone', 'site_web', 'logo',
        ]


class OffreStageListSerializer(serializers.ModelSerializer):
    """Serializer allégé pour la liste des offres."""
    entreprise_nom = serializers.SerializerMethodField()
    entreprise_ville = serializers.SerializerMethodField()
    entreprise_logo = serializers.SerializerMethodField()
    technologies_list = serializers.ReadOnlyField()

    class Meta:
        model = OffreStage
        fields = [
            'id', 'titre', 'description', 'type_stage', 'niveau_academique',
            'duree', 'technologies', 'technologies_list', 'date_debut',
            'date_limite_candidature', 'remuneration', 'statut', 'date_creation',
            'entreprise_nom', 'entreprise_ville', 'entreprise_logo',
        ]

    def get_entreprise_nom(self, obj):
        return obj.entreprise.nom

    def get_entreprise_ville(self, obj):
        return obj.entreprise.ville

    def get_entreprise_logo(self, obj):
        if obj.entreprise.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.entreprise.logo.url)
        return None


class OffreStageDetailSerializer(serializers.ModelSerializer):
    """Serializer complet pour le détail d'une offre."""
    entreprise = EntrepriseSerializer(read_only=True)
    technologies_list = serializers.ReadOnlyField()

    class Meta:
        model = OffreStage
        fields = [
            'id', 'titre', 'description', 'type_stage', 'niveau_academique',
            'duree', 'technologies', 'technologies_list', 'date_debut',
            'date_limite_candidature', 'remuneration', 'statut',
            'date_creation', 'date_modification', 'entreprise',
        ]


class OffreStageCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer/modifier une offre (entreprise connectée)."""

    class Meta:
        model = OffreStage
        fields = [
            'titre', 'description', 'type_stage', 'niveau_academique',
            'duree', 'technologies', 'date_debut',
            'date_limite_candidature', 'remuneration',
        ]

    def create(self, validated_data):
        request = self.context['request']
        entreprise = request.user.entreprise_profile
        return OffreStage.objects.create(**validated_data, entreprise=entreprise, statut='OUVERT')

    def update(self, instance, validated_data):
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance


# ── CV Étudiant ─────────────────────────────────────────

class CompetenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Competence
        fields = ['id', 'nom', 'categorie']


class CVSerializer(serializers.ModelSerializer):
    etudiant = EtudiantSerializer(read_only=True)
    competences = CompetenceSerializer(many=True, read_only=True)

    class Meta:
        model = CV
        fields = [
            'id', 'etudiant', 'titre', 'resume', 'competences',
            'cv_pdf', 'linkedin', 'github', 'portfolio',
            'disponible_pour_stage', 'date_creation', 'date_modification',
        ]


class CVUpsertSerializer(serializers.ModelSerializer):
    competence_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        required=False,
        allow_empty=True,
        write_only=True,
    )

    class Meta:
        model = CV
        fields = [
            'titre', 'resume', 'cv_pdf', 'linkedin', 'github', 'portfolio',
            'disponible_pour_stage', 'competence_ids',
        ]

    def validate_competence_ids(self, value):
        if not value:
            return []
        found = set(Competence.objects.filter(id__in=value).values_list('id', flat=True))
        missing = [cid for cid in value if cid not in found]
        if missing:
            raise serializers.ValidationError(f"Compétences inexistantes: {missing}")
        return value

    def create(self, validated_data):
        competence_ids = validated_data.pop('competence_ids', [])
        etudiant = self.context['request'].user.etudiant_profile
        cv = CV.objects.create(etudiant=etudiant, **validated_data)
        if competence_ids:
            cv.competences.set(competence_ids)
        return cv

    def update(self, instance, validated_data):
        competence_ids = validated_data.pop('competence_ids', None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        if competence_ids is not None:
            instance.competences.set(competence_ids)
        return instance