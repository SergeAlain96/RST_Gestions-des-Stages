# Generated manually on 2026-03-13

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_evaluation'),
    ]

    operations = [
        # Création du modèle GroupeProjet
        migrations.CreateModel(
            name='GroupeProjet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(
                    max_length=20,
                    unique=True,
                    choices=[
                        ('SI', 'Systèmes Informatiques'),
                        ('RS', 'Réseaux et Systèmes'),
                        ('ADMIN_RESEAUX', 'Administration Réseaux'),
                        ('SUPERVISION', 'Supervision'),
                        ('SECURITE', 'Sécurité'),
                        ('AUTRES', 'Autres'),
                    ]
                )),
                ('nom', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('couleur', models.CharField(
                    default='blue', max_length=20,
                    help_text="Couleur d'affichage (ex: blue, green, red)"
                )),
            ],
            options={
                'verbose_name': 'Groupe de Projet',
                'verbose_name_plural': 'Groupes de Projets',
                'ordering': ['code'],
            },
        ),
        # Ajout du champ groupe à Projet
        migrations.AddField(
            model_name='projet',
            name='groupe',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='projets',
                to='api.groupeprojet',
                verbose_name='Groupe / Filière',
            ),
        ),
        # Ajout de niveau_academique à Stage
        migrations.AddField(
            model_name='stage',
            name='niveau_academique',
            field=models.CharField(
                blank=True,
                max_length=10,
                choices=[
                    ('LICENCE', 'Licence'),
                    ('IT', 'IT (Ingénieur des Travaux)'),
                    ('MASTER', 'Master'),
                    ('IC', 'IC (Ingénieur Concepteur)'),
                ],
                help_text='Niveau académique requis pour ce stage',
            ),
        ),
        # Ajout de duree à Stage
        migrations.AddField(
            model_name='stage',
            name='duree',
            field=models.PositiveSmallIntegerField(
                blank=True,
                null=True,
                help_text='Durée du stage en semaines',
            ),
        ),
    ]
