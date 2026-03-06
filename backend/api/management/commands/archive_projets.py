"""
Commande de gestion Django pour l'archivage annuel des projets et stages.
Usage:
    python manage.py archive_projets                          # Archiver l'année précédente
    python manage.py archive_projets --annee 2024-2025        # Archiver une année spécifique
    python manage.py archive_projets --dry-run                # Simuler sans modifier
    python manage.py archive_projets --include-en-cours       # Archiver aussi les projets en cours
"""
import csv
import os
from datetime import datetime

from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.db.models import Q

from api.models import Projet, Stage


class Command(BaseCommand):
    help = (
        "Archive les projets et stages terminés d'une année universitaire donnée. "
        "Change leur statut en 'ARCHIVE' et génère un rapport CSV optionnel."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--annee',
            type=str,
            default=None,
            help="Année universitaire à archiver (ex: 2024-2025). Par défaut : l'année précédente.",
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help="Affiche ce qui serait archivé sans modifier la base de données.",
        )
        parser.add_argument(
            '--include-en-cours',
            action='store_true',
            help="Archive aussi les projets/stages encore marqués 'EN_COURS'.",
        )
        parser.add_argument(
            '--export-csv',
            action='store_true',
            help="Génère un rapport CSV des éléments archivés dans le dossier media/archives/.",
        )

    def handle(self, *args, **options):
        annee = options['annee']
        dry_run = options['dry_run']
        include_en_cours = options['include_en_cours']
        export_csv = options['export_csv']

        # Déterminer l'année à archiver
        if not annee:
            current_year = datetime.now().year
            current_month = datetime.now().month
            # Si on est entre janvier et août, l'année précédente est (year-2)-(year-1)
            # Si on est entre septembre et décembre, c'est (year-1)-year
            if current_month >= 9:
                annee = f"{current_year - 1}-{current_year}"
            else:
                annee = f"{current_year - 2}-{current_year - 1}"

        self.stdout.write(self.style.NOTICE(
            f"\n{'=' * 60}\n"
            f"  📦 ARCHIVAGE — Année universitaire : {annee}\n"
            f"  {'🔍 MODE SIMULATION (dry-run)' if dry_run else '⚡ MODE EXÉCUTION'}\n"
            f"{'=' * 60}\n"
        ))

        # ── Projets ──
        statuts_projet = ['TERMINE']
        if include_en_cours:
            statuts_projet.append('EN_COURS')

        projets_to_archive = Projet.objects.filter(
            annee_universitaire=annee,
            statut__in=statuts_projet,
        ).select_related('tuteur__user').prefetch_related('etudiants__user')

        self.stdout.write(self.style.WARNING(
            f"\n📋 PROJETS à archiver : {projets_to_archive.count()}"
        ))

        for p in projets_to_archive:
            etudiants = ', '.join(str(e) for e in p.etudiants.all()) or 'Aucun'
            tuteur = str(p.tuteur) if p.tuteur else 'Aucun'
            self.stdout.write(
                f"   • [{p.statut:>10}] {p.titre}\n"
                f"     Tuteur: {tuteur} | Étudiants: {etudiants}"
            )

        # ── Stages ──
        statuts_stage = ['TERMINE']
        if include_en_cours:
            statuts_stage.append('EN_COURS')

        stages_to_archive = Stage.objects.filter(
            annee_universitaire=annee,
            statut__in=statuts_stage,
        ).select_related('etudiant__user', 'tuteur_academique__user')

        self.stdout.write(self.style.WARNING(
            f"\n🏢 STAGES à archiver : {stages_to_archive.count()}"
        ))

        for s in stages_to_archive:
            tuteur = str(s.tuteur_academique) if s.tuteur_academique else 'Aucun'
            self.stdout.write(
                f"   • [{s.statut:>10}] {s.titre} — {s.entreprise}\n"
                f"     Stagiaire: {s.etudiant} | Tuteur: {tuteur}"
            )

        total = projets_to_archive.count() + stages_to_archive.count()

        if total == 0:
            self.stdout.write(self.style.SUCCESS(
                f"\n✅ Rien à archiver pour l'année {annee}."
            ))
            return

        # ── Export CSV ──
        if export_csv and not dry_run:
            self._export_csv(annee, projets_to_archive, stages_to_archive)

        # ── Appliquer l'archivage ──
        if dry_run:
            self.stdout.write(self.style.NOTICE(
                f"\n🔍 DRY-RUN : {total} éléments seraient archivés. "
                f"Relancez sans --dry-run pour appliquer."
            ))
        else:
            nb_projets = projets_to_archive.update(statut='ARCHIVE')
            nb_stages = stages_to_archive.update(statut='ARCHIVE')

            self.stdout.write(self.style.SUCCESS(
                f"\n✅ Archivage terminé !\n"
                f"   📋 {nb_projets} projet(s) archivé(s)\n"
                f"   🏢 {nb_stages} stage(s) archivé(s)\n"
                f"   📅 Année : {annee}"
            ))

    def _export_csv(self, annee, projets, stages):
        """Génère un rapport CSV dans media/archives/."""
        archive_dir = os.path.join(settings.MEDIA_ROOT, 'archives')
        os.makedirs(archive_dir, exist_ok=True)

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"archive_{annee}_{timestamp}.csv"
        filepath = os.path.join(archive_dir, filename)

        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f, delimiter=';')

            # En-tête
            writer.writerow([
                'Type', 'ID', 'Titre', 'Statut précédent', 'Année',
                'Technologies', 'Tuteur', 'Étudiants/Stagiaire',
                'Entreprise', 'Date soumission/création',
            ])

            for p in projets:
                etudiants = ', '.join(str(e) for e in p.etudiants.all())
                writer.writerow([
                    'Projet', p.id, p.titre, p.statut, p.annee_universitaire,
                    p.technologies, str(p.tuteur) if p.tuteur else '',
                    etudiants, '', p.date_soumission.strftime('%Y-%m-%d'),
                ])

            for s in stages:
                writer.writerow([
                    'Stage', s.id, s.titre, s.statut, s.annee_universitaire,
                    s.technologies, str(s.tuteur_academique) if s.tuteur_academique else '',
                    str(s.etudiant), s.entreprise,
                    s.date_creation.strftime('%Y-%m-%d'),
                ])

        self.stdout.write(self.style.SUCCESS(
            f"\n📄 Rapport CSV exporté : {filepath}"
        ))
