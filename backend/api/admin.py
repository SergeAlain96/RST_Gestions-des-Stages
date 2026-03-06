import csv
from django.contrib import admin
from django.http import HttpResponse
from django.utils import timezone
from .models import Projet, Etudiant, Enseignant, Stage, Evaluation


# ── Actions d'export CSV réutilisables ───────────────────

def export_projets_csv(modeladmin, request, queryset):
    """Exporte les projets sélectionnés au format CSV."""
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = (
        f'attachment; filename="projets_export_{timezone.now().strftime("%Y%m%d")}.csv"'
    )
    response.write('\ufeff')  # BOM UTF-8 pour Excel

    writer = csv.writer(response, delimiter=';')
    writer.writerow([
        'ID', 'Titre', 'Type', 'Statut', 'Année', 'Technologies',
        'Tuteur', 'Étudiants', 'Date soumission', 'Lien GitHub', 'Lien Démo',
    ])

    for p in queryset.select_related('tuteur__user').prefetch_related('etudiants__user'):
        etudiants = ', '.join(
            f"{e.user.first_name} {e.user.last_name}" for e in p.etudiants.all()
        )
        tuteur = f"{p.tuteur.user.first_name} {p.tuteur.user.last_name}" if p.tuteur else ''
        writer.writerow([
            p.id, p.titre, p.get_type_projet_display(), p.get_statut_display(),
            p.annee_universitaire, p.technologies, tuteur, etudiants,
            p.date_soumission.strftime('%d/%m/%Y %H:%M'), p.lien_github or '', p.lien_demo or '',
        ])

    return response

export_projets_csv.short_description = "📄 Exporter en CSV"


def export_stages_csv(modeladmin, request, queryset):
    """Exporte les stages sélectionnés au format CSV."""
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = (
        f'attachment; filename="stages_export_{timezone.now().strftime("%Y%m%d")}.csv"'
    )
    response.write('\ufeff')

    writer = csv.writer(response, delimiter=';')
    writer.writerow([
        'ID', 'Titre', 'Entreprise', 'Ville', 'Pays', 'Type', 'Statut', 'Année',
        'Technologies', 'Stagiaire', 'Tuteur académique', 'Maître de stage',
        'Début', 'Fin', 'Date création',
    ])

    for s in queryset.select_related('etudiant__user', 'tuteur_academique__user'):
        stagiaire = f"{s.etudiant.user.first_name} {s.etudiant.user.last_name}"
        tuteur = (
            f"{s.tuteur_academique.user.first_name} {s.tuteur_academique.user.last_name}"
            if s.tuteur_academique else ''
        )
        writer.writerow([
            s.id, s.titre, s.entreprise, s.ville, s.pays,
            s.get_type_stage_display(), s.get_statut_display(), s.annee_universitaire,
            s.technologies, stagiaire, tuteur, s.maitre_stage,
            s.date_debut.strftime('%d/%m/%Y') if s.date_debut else '',
            s.date_fin.strftime('%d/%m/%Y') if s.date_fin else '',
            s.date_creation.strftime('%d/%m/%Y %H:%M'),
        ])

    return response

export_stages_csv.short_description = "📄 Exporter en CSV"


def export_evaluations_csv(modeladmin, request, queryset):
    """Exporte les évaluations sélectionnées au format CSV."""
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = (
        f'attachment; filename="evaluations_export_{timezone.now().strftime("%Y%m%d")}.csv"'
    )
    response.write('\ufeff')

    writer = csv.writer(response, delimiter=';')
    writer.writerow([
        'ID', 'Cible', 'Titre cible', 'Enseignant',
        'Note Rapport', 'Note Soutenance', 'Note Technique', 'Note Comportement',
        'Moyenne', 'Commentaire', 'Date évaluation',
    ])

    for ev in queryset.select_related('projet', 'stage', 'enseignant__user'):
        cible_type = 'Projet' if ev.projet else 'Stage'
        cible_titre = ev.projet.titre if ev.projet else (ev.stage.titre if ev.stage else '—')
        enseignant = f"{ev.enseignant.user.first_name} {ev.enseignant.user.last_name}"
        writer.writerow([
            ev.id, cible_type, cible_titre, enseignant,
            ev.note_rapport or '', ev.note_soutenance or '',
            ev.note_technique or '', ev.note_comportement or '',
            ev.note_moyenne or '', ev.commentaire,
            ev.date_evaluation.strftime('%d/%m/%Y %H:%M'),
        ])

    return response

export_evaluations_csv.short_description = "📄 Exporter en CSV"


def archiver_selection(modeladmin, request, queryset):
    """Archive les éléments sélectionnés (met le statut à ARCHIVE)."""
    updated = queryset.exclude(statut='ARCHIVE').update(statut='ARCHIVE')
    modeladmin.message_user(request, f"✅ {updated} élément(s) archivé(s).")

archiver_selection.short_description = "📦 Archiver la sélection"


# ── Admin Models ─────────────────────────────────────────

@admin.register(Enseignant)
class EnseignantAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'departement', 'specialite', 'telephone', 'nb_projets', 'nb_stages')
    list_filter = ('departement', 'specialite')
    search_fields = ('user__first_name', 'user__last_name', 'departement', 'specialite')
    list_per_page = 25

    def nb_projets(self, obj):
        return obj.projets_tutores.count()
    nb_projets.short_description = 'Projets tutorés'

    def nb_stages(self, obj):
        return obj.stages_tutores.count()
    nb_stages.short_description = 'Stages tutorés'


@admin.register(Etudiant)
class EtudiantAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'matricule', 'filiere', 'niveau', 'promotion', 'nb_projets', 'nb_stages')
    list_filter = ('filiere', 'niveau', 'promotion')
    search_fields = ('user__first_name', 'user__last_name', 'matricule', 'filiere')
    list_per_page = 25

    def nb_projets(self, obj):
        return obj.projets.count()
    nb_projets.short_description = 'Projets'

    def nb_stages(self, obj):
        return obj.stages.count()
    nb_stages.short_description = 'Stages'


@admin.register(Projet)
class ProjetAdmin(admin.ModelAdmin):
    list_display = (
        'titre', 'type_projet', 'statut', 'annee_universitaire',
        'tuteur', 'nb_etudiants', 'date_soumission',
    )
    list_filter = ('type_projet', 'statut', 'annee_universitaire', 'tuteur')
    search_fields = ('titre', 'description', 'technologies', 'etudiants__user__last_name')
    filter_horizontal = ('etudiants',)
    readonly_fields = ('date_soumission', 'date_modification')
    list_per_page = 25
    actions = [export_projets_csv, archiver_selection]
    date_hierarchy = 'date_soumission'

    def nb_etudiants(self, obj):
        return obj.etudiants.count()
    nb_etudiants.short_description = 'Étudiants'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'tuteur__user'
        ).prefetch_related('etudiants__user')


@admin.register(Stage)
class StageAdmin(admin.ModelAdmin):
    list_display = (
        'titre', 'entreprise', 'ville', 'type_stage', 'statut',
        'annee_universitaire', 'etudiant', 'tuteur_academique',
    )
    list_filter = ('type_stage', 'statut', 'annee_universitaire', 'ville', 'entreprise')
    search_fields = ('titre', 'description', 'entreprise', 'technologies', 'etudiant__user__last_name')
    readonly_fields = ('date_creation',)
    list_per_page = 25
    actions = [export_stages_csv, archiver_selection]
    date_hierarchy = 'date_creation'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'etudiant__user', 'tuteur_academique__user'
        )


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = (
        '__str__', 'enseignant', 'cible_type', 'cible_titre',
        'note_rapport', 'note_soutenance', 'note_technique', 'note_comportement',
        'note_moyenne', 'date_evaluation',
    )
    list_filter = ('enseignant', 'date_evaluation')
    search_fields = ('commentaire', 'projet__titre', 'stage__titre', 'enseignant__user__last_name')
    readonly_fields = ('date_evaluation', 'date_modification')
    list_per_page = 25
    actions = [export_evaluations_csv]
    date_hierarchy = 'date_evaluation'

    def cible_type(self, obj):
        return 'Projet' if obj.projet else 'Stage'
    cible_type.short_description = 'Type'

    def cible_titre(self, obj):
        if obj.projet:
            return obj.projet.titre
        if obj.stage:
            return obj.stage.titre
        return '—'
    cible_titre.short_description = 'Titre évalué'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'projet', 'stage', 'enseignant__user'
        )
