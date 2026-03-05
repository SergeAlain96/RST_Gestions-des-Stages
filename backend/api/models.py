from django.db import models
from django.contrib.auth.models import User


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

    titre = models.CharField(max_length=300)
    description = models.TextField()
    entreprise = models.CharField(max_length=200)
    ville = models.CharField(max_length=100)
    pays = models.CharField(max_length=100, default='Burkina Faso')
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
