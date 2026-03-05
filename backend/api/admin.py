from django.contrib import admin
from .models import Projet, Etudiant, Enseignant, Stage, Evaluation


@admin.register(Enseignant)
class EnseignantAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'departement', 'specialite')
    search_fields = ('user__first_name', 'user__last_name', 'departement')


@admin.register(Etudiant)
class EtudiantAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'matricule', 'filiere', 'niveau', 'promotion')
    list_filter = ('filiere', 'niveau', 'promotion')
    search_fields = ('user__first_name', 'user__last_name', 'matricule')


@admin.register(Projet)
class ProjetAdmin(admin.ModelAdmin):
    list_display = ('titre', 'type_projet', 'statut', 'annee_universitaire', 'tuteur', 'date_soumission')
    list_filter = ('type_projet', 'statut', 'annee_universitaire')
    search_fields = ('titre', 'description', 'technologies')
    filter_horizontal = ('etudiants',)
    readonly_fields = ('date_soumission', 'date_modification')


@admin.register(Stage)
class StageAdmin(admin.ModelAdmin):
    list_display = ('titre', 'entreprise', 'ville', 'type_stage', 'statut', 'annee_universitaire', 'etudiant')
    list_filter = ('type_stage', 'statut', 'annee_universitaire', 'ville')
    search_fields = ('titre', 'description', 'entreprise', 'technologies')
    readonly_fields = ('date_creation',)


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'enseignant', 'note_moyenne', 'date_evaluation')
    list_filter = ('enseignant', 'date_evaluation')
    search_fields = ('commentaire', 'projet__titre', 'stage__titre')
    readonly_fields = ('date_evaluation', 'date_modification')
