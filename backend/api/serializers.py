from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Projet, Etudiant, Enseignant, Stage


# ── Auth ─────────────────────────────────────────────────

class RegisterSerializer(serializers.Serializer):
    """Inscription d'un étudiant."""
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)
    matricule = serializers.CharField(max_length=50)
    filiere = serializers.CharField(max_length=100)
    niveau = serializers.ChoiceField(choices=['L1', 'L2', 'L3', 'M1', 'M2'])
    promotion = serializers.IntegerField()

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def validate_matricule(self, value):
        if Etudiant.objects.filter(matricule=value).exists():
            raise serializers.ValidationError("Ce matricule est déjà enregistré.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password2": "Les mots de passe ne correspondent pas."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )
        Etudiant.objects.create(
            user=user,
            matricule=validated_data['matricule'],
            filiere=validated_data['filiere'],
            niveau=validated_data['niveau'],
            promotion=validated_data['promotion'],
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Profil complet de l'utilisateur connecté."""
    role = serializers.SerializerMethodField()
    etudiant = serializers.SerializerMethodField()
    enseignant = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'etudiant', 'enseignant']

    def get_role(self, obj):
        if hasattr(obj, 'etudiant_profile'):
            return 'etudiant'
        if hasattr(obj, 'enseignant_profile'):
            return 'enseignant'
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
            'maitre_stage',
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

    class Meta:
        model = Projet
        fields = [
            'id', 'titre', 'description', 'type_projet', 'statut',
            'technologies', 'technologies_list', 'annee_universitaire',
            'date_soumission', 'image', 'tuteur_nom', 'etudiants_noms',
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

    class Meta:
        model = Projet
        fields = [
            'id', 'titre', 'description', 'type_projet', 'statut',
            'technologies', 'technologies_list', 'annee_universitaire',
            'date_soumission', 'date_modification',
            'image', 'document', 'lien_github', 'lien_demo',
            'etudiants', 'tuteur',
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
        ]
