from django.db import models
from django.contrib.auth.models import User


class GroupeProjet(models.Model):
    """Groupe pédagogique auquel appartient un projet (filière)."""

    GROUPE_CHOICES = [
        ('SI', 'Systèmes D_Information'),
        ('RS', 'Réseaux et Systèmes'),
        ('ADMIN_RESEAUX', 'Administration Réseaux'),
        ('SUPERVISION', 'Supervision'),
        ('SECURITE', 'Sécurité'),
        ('AUTRES', 'Autres'),
    ]

    code = models.CharField(max_length=20, choices=GROUPE_CHOICES, unique=True)
    nom = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    couleur = models.CharField(
        max_length=20, default='blue',
        help_text="Couleur d'affichage (ex: blue, green, red)"
    )

    class Meta:
        verbose_name = 'Groupe de Projet'
        verbose_name_plural = 'Groupes de Projets'
        ordering = ['code']

    def __str__(self):
        return self.nom


class Enseignant(models.Model):
    """Modèle représentant un enseignant/tuteur."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='enseignant_profile')
    departement = models.CharField(max_length=100, blank=True)
    specialite = models.CharField(max_length=200, blank=True)
    telephone = models.CharField(max_length=20, blank=True)

    class Meta:
        verbose_name = 'Enseignant'
        verbose_name_plural = 'Enseignants'
        ordering = ['user__last_name']

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"


class Etudiant(models.Model):
    """Modèle représentant un étudiant."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='etudiant_profile')
    matricule = models.CharField(max_length=50, unique=True)
    filiere = models.CharField(max_length=100)
    niveau = models.CharField(max_length=50, choices=[
        ('L1', 'Licence 1'),
        ('L2', 'Licence 2'),
        ('L3', 'Licence 3'),
        ('M1', 'Master 1'),
        ('M2', 'Master 2'),
    ])
    promotion = models.IntegerField(help_text="Année de la promotion (ex: 2026)")

    class Meta:
        verbose_name = 'Étudiant'
        verbose_name_plural = 'Étudiants'
        ordering = ['user__last_name']

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.matricule})"


class EtudiantAutorise(models.Model):
    """Référentiel des étudiants autorisés à s'inscrire (phase 6)."""

    matricule = models.CharField(max_length=50, unique=True)
    email_institutionnel = models.EmailField(unique=True)
    nom = models.CharField(max_length=100, blank=True)
    prenom = models.CharField(max_length=100, blank=True)
    actif = models.BooleanField(default=True)
    date_ajout = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Étudiant Autorisé'
        verbose_name_plural = 'Étudiants Autorisés'
        ordering = ['matricule']

    def __str__(self):
        return f"{self.matricule} - {self.email_institutionnel}"


class Projet(models.Model):
    """Modèle représentant un projet de fin d'études ou un travail académique."""

    TYPE_CHOICES = [
        ('PFE', "Projet de Fin d'Études"),
        ('PFA', "Projet de Fin d'Année"),
        ('MINI', 'Mini Projet'),
        ('STAGE', 'Stage'),
    ]

    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente de validation'),
        ('VALIDE', 'Validé'),
        ('REFUSE', 'Refusé'),
        ('EN_COURS', 'En cours'),
        ('TERMINE', 'Terminé'),
        ('ARCHIVE', 'Archivé'),
    ]

    titre = models.CharField(max_length=300)
    description = models.TextField()
    type_projet = models.CharField(max_length=10, choices=TYPE_CHOICES, default='PFE')
    statut = models.CharField(max_length=15, choices=STATUT_CHOICES, default='EN_ATTENTE')
    technologies = models.CharField(
        max_length=500,
        help_text="Technologies utilisées, séparées par des virgules (ex: React, Django, PostgreSQL)"
    )
    annee_universitaire = models.CharField(
        max_length=9,
        help_text="Format: 2025-2026"
    )
    date_soumission = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    image = models.ImageField(upload_to='projets/images/', blank=True, null=True)
    document = models.FileField(upload_to='projets/documents/', blank=True, null=True)
    lien_github = models.URLField(blank=True, null=True)
    lien_demo = models.URLField(blank=True, null=True)

    # Relations
    groupe = models.ForeignKey(
        GroupeProjet,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='projets',
        verbose_name='Groupe / Filière'
    )
    etudiants = models.ManyToManyField(Etudiant, related_name='projets', blank=True)
    tuteur = models.ForeignKey(
        Enseignant,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='projets_tutores'
    )

    class Meta:
        verbose_name = 'Projet'
        verbose_name_plural = 'Projets'
        ordering = ['-date_soumission']

    def __str__(self):
        return f"{self.titre} ({self.annee_universitaire})"

    @property
    def technologies_list(self):
        """Retourne la liste des technologies sous forme de liste Python."""
        return [tech.strip() for tech in self.technologies.split(',') if tech.strip()]


class Stage(models.Model):
    """Modèle représentant un stage en entreprise."""

    TYPE_STAGE_CHOICES = [
        ('OBSERVATION', 'Stage d\'observation'),
        ('TECHNICIEN', 'Stage technicien'),
        ('INGENIEUR', 'Stage ingénieur'),
        ('PFE', 'Stage PFE'),
    ]

    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('EN_COURS', 'En cours'),
        ('TERMINE', 'Terminé'),
        ('ARCHIVE', 'Archivé'),
    ]

    NIVEAU_CHOICES = [
        ('LICENCE', 'Licence'),
        ('IT', 'IT (Ingénieur des Travaux)'),
        ('MASTER', 'Master'),
        ('IC', 'IC (Ingénieur Concepteur)'),
    ]

    titre = models.CharField(max_length=300)
    description = models.TextField()
    entreprise = models.CharField(max_length=200)
    ville = models.CharField(max_length=100)
    pays = models.CharField(max_length=100, default='Burkina Faso')
    niveau_academique = models.CharField(
        max_length=10, choices=NIVEAU_CHOICES, blank=True,
        help_text='Niveau académique requis pour ce stage'
    )
    duree = models.PositiveSmallIntegerField(
        null=True, blank=True,
        help_text='Durée du stage en semaines'
    )
    type_stage = models.CharField(max_length=15, choices=TYPE_STAGE_CHOICES, default='PFE')
    statut = models.CharField(max_length=15, choices=STATUT_CHOICES, default='EN_COURS')
    technologies = models.CharField(
        max_length=500,
        help_text="Technologies utilisées, séparées par des virgules"
    )
    annee_universitaire = models.CharField(max_length=9, help_text="Format: 2025-2026")
    date_debut = models.DateField(blank=True, null=True)
    date_fin = models.DateField(blank=True, null=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='stages/images/', blank=True, null=True)
    rapport = models.FileField(upload_to='stages/rapports/', blank=True, null=True)
    lien_entreprise = models.URLField(blank=True, null=True)

    # Relations
    etudiant = models.ForeignKey(
        Etudiant,
        on_delete=models.CASCADE,
        related_name='stages'
    )
    tuteur_academique = models.ForeignKey(
        Enseignant,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stages_tutores'
    )
    maitre_stage = models.CharField(max_length=200, blank=True, help_text="Nom du maître de stage en entreprise")

    class Meta:
        verbose_name = 'Stage'
        verbose_name_plural = 'Stages'
        ordering = ['-date_creation']

    def __str__(self):
        return f"{self.titre} — {self.entreprise} ({self.annee_universitaire})"

    @property
    def technologies_list(self):
        return [tech.strip() for tech in self.technologies.split(',') if tech.strip()]


class Evaluation(models.Model):
    """Modèle représentant une évaluation / notation par un enseignant."""

    # Lien vers le projet OU le stage évalué (un seul rempli)
    projet = models.ForeignKey(
        Projet,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='evaluations'
    )
    stage = models.ForeignKey(
        Stage,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='evaluations'
    )
    enseignant = models.ForeignKey(
        Enseignant,
        on_delete=models.CASCADE,
        related_name='evaluations'
    )

    # Grille de notation (/20 chacune)
    note_rapport = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True,
        help_text="Note du rapport écrit (/20)"
    )
    note_soutenance = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True,
        help_text="Note de la soutenance (/20)"
    )
    note_technique = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True,
        help_text="Note technique (/20)"
    )
    note_comportement = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True,
        help_text="Note de comportement / assiduité (/20)"
    )

    commentaire = models.TextField(blank=True, help_text="Commentaire général de l'évaluateur")
    date_evaluation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Évaluation'
        verbose_name_plural = 'Évaluations'
        ordering = ['-date_evaluation']
        # Un enseignant ne peut évaluer un projet/stage qu'une seule fois
        constraints = [
            models.UniqueConstraint(
                fields=['projet', 'enseignant'],
                condition=models.Q(projet__isnull=False),
                name='unique_evaluation_projet_enseignant'
            ),
            models.UniqueConstraint(
                fields=['stage', 'enseignant'],
                condition=models.Q(stage__isnull=False),
                name='unique_evaluation_stage_enseignant'
            ),
        ]

    def __str__(self):
        cible = self.projet or self.stage
        return f"Évaluation de {cible} par {self.enseignant}"

    @property
    def note_moyenne(self):
        """Calcule la moyenne des notes renseignées."""
        notes = [n for n in [self.note_rapport, self.note_soutenance,
                             self.note_technique, self.note_comportement] if n is not None]
        if not notes:
            return None
        return round(sum(notes) / len(notes), 2)


# ── Espace Entreprises ───────────────────────────────────

class Entreprise(models.Model):
    """Compte entreprise pouvant proposer des offres de stages."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='entreprise_profile')
    nom = models.CharField(max_length=200, help_text="Raison sociale de l'entreprise")
    secteur = models.CharField(max_length=100, blank=True, help_text="Secteur d'activité")
    description = models.TextField(blank=True)
    adresse = models.CharField(max_length=300, blank=True)
    ville = models.CharField(max_length=100, blank=True, default='Bobo-Dioulasso')
    pays = models.CharField(max_length=100, default='Burkina Faso')
    telephone = models.CharField(max_length=20, blank=True)
    site_web = models.URLField(blank=True, null=True)
    logo = models.ImageField(upload_to='entreprises/logos/', blank=True, null=True)
    est_valide = models.BooleanField(
        default=False,
        help_text="Compte validé par un administrateur avant publication des offres"
    )
    date_inscription = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Entreprise'
        verbose_name_plural = 'Entreprises'
        ordering = ['nom']

    def __str__(self):
        return self.nom


class OffreStage(models.Model):
    """Offre de stage publiée par une entreprise."""

    TYPE_CHOICES = [
        ('OBSERVATION', "Stage d'observation"),
        ('TECHNICIEN', 'Stage technicien'),
        ('INGENIEUR', 'Stage ingénieur'),
        ('PFE', 'Stage PFE'),
    ]

    NIVEAU_CHOICES = [
        ('LICENCE', 'Licence'),
        ('IT', 'IT (Ingénieur des Travaux)'),
        ('MASTER', 'Master'),
        ('IC', 'IC (Ingénieur Concepteur)'),
    ]

    STATUT_CHOICES = [
        ('OUVERT', 'Ouvert'),
        ('FERME', 'Fermé'),
        ('ARCHIVE', 'Archivé'),
    ]

    titre = models.CharField(max_length=300)
    description = models.TextField()
    type_stage = models.CharField(max_length=15, choices=TYPE_CHOICES, default='PFE')
    niveau_academique = models.CharField(max_length=10, choices=NIVEAU_CHOICES, blank=True)
    duree = models.PositiveSmallIntegerField(
        null=True, blank=True,
        help_text='Durée du stage en semaines'
    )
    technologies = models.CharField(
        max_length=500, blank=True,
        help_text="Technologies requises, séparées par des virgules"
    )
    date_debut = models.DateField(null=True, blank=True)
    date_limite_candidature = models.DateField(null=True, blank=True)
    remuneration = models.CharField(
        max_length=100, blank=True,
        help_text="Rémunération mensuelle (ex: 50 000 FCFA)"
    )
    statut = models.CharField(max_length=10, choices=STATUT_CHOICES, default='OUVERT')
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    entreprise = models.ForeignKey(
        Entreprise,
        on_delete=models.CASCADE,
        related_name='offres'
    )

    class Meta:
        verbose_name = "Offre de Stage"
        verbose_name_plural = "Offres de Stage"
        ordering = ['-date_creation']

    def __str__(self):
        return f"{self.titre} — {self.entreprise.nom}"

    @property
    def technologies_list(self):
        return [t.strip() for t in self.technologies.split(',') if t.strip()]


# ── Espace Étudiant & CV ───────────────────────────────

class Competence(models.Model):
    """Compétence technique/soft skill d'un étudiant."""

    nom = models.CharField(max_length=100, unique=True)
    categorie = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name = 'Compétence'
        verbose_name_plural = 'Compétences'
        ordering = ['nom']

    def __str__(self):
        return self.nom


class CV(models.Model):
    """CV d'un étudiant (profil public + fichier PDF)."""

    etudiant = models.OneToOneField(
        Etudiant,
        on_delete=models.CASCADE,
        related_name='cv'
    )
    titre = models.CharField(max_length=200, default='CV Étudiant')
    resume = models.TextField(blank=True)
    competences = models.ManyToManyField(Competence, blank=True, related_name='cvs')
    cv_pdf = models.FileField(upload_to='cvs/', blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    github = models.URLField(blank=True, null=True)
    portfolio = models.URLField(blank=True, null=True)
    disponible_pour_stage = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'CV'
        verbose_name_plural = 'CV'
        ordering = ['-date_modification']

    def __str__(self):
        return f"CV de {self.etudiant.user.first_name} {self.etudiant.user.last_name}"

