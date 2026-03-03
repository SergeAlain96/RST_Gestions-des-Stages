"""
Script pour peupler la base de données avec des données de démonstration.
Usage: python manage.py shell < seed_data.py
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from django.contrib.auth.models import User
from api.models import Enseignant, Etudiant, Projet, Stage


def seed():
    print("🌱 Création des données de démonstration...")

    # --- Enseignants ---
    enseignants_data = [
        {'username': 'prof.ouedraogo', 'first_name': 'Abdoulaye', 'last_name': 'Ouédraogo',
         'email': 'a.ouedraogo@univ.bf', 'departement': 'Informatique', 'specialite': 'Intelligence Artificielle'},
        {'username': 'prof.sawadogo', 'first_name': 'Mariam', 'last_name': 'Sawadogo',
         'email': 'm.sawadogo@univ.bf', 'departement': 'Informatique', 'specialite': 'Génie Logiciel'},
        {'username': 'prof.kabore', 'first_name': 'Issouf', 'last_name': 'Kaboré',
         'email': 'i.kabore@univ.bf', 'departement': 'Informatique', 'specialite': 'Réseaux et Sécurité'},
    ]

    enseignants = []
    for data in enseignants_data:
        user, created = User.objects.get_or_create(
            username=data['username'],
            defaults={
                'first_name': data['first_name'],
                'last_name': data['last_name'],
                'email': data['email'],
            }
        )
        if created:
            user.set_password('enseignant123')
            user.save()
        ens, _ = Enseignant.objects.get_or_create(
            user=user,
            defaults={
                'departement': data['departement'],
                'specialite': data['specialite'],
            }
        )
        enseignants.append(ens)

    # --- Étudiants ---
    etudiants_data = [
        {'username': 'etud.compaore', 'first_name': 'Wendkouni', 'last_name': 'Compaoré',
         'email': 'w.compaore@etud.bf', 'matricule': 'ETU2024001', 'filiere': 'Informatique', 'niveau': 'M2', 'promotion': 2026},
        {'username': 'etud.zongo', 'first_name': 'Aminata', 'last_name': 'Zongo',
         'email': 'a.zongo@etud.bf', 'matricule': 'ETU2024002', 'filiere': 'Informatique', 'niveau': 'M2', 'promotion': 2026},
        {'username': 'etud.traore', 'first_name': 'Moussa', 'last_name': 'Traoré',
         'email': 'm.traore@etud.bf', 'matricule': 'ETU2024003', 'filiere': 'Informatique', 'niveau': 'L3', 'promotion': 2026},
        {'username': 'etud.barry', 'first_name': 'Fatimata', 'last_name': 'Barry',
         'email': 'f.barry@etud.bf', 'matricule': 'ETU2024004', 'filiere': 'Informatique', 'niveau': 'L3', 'promotion': 2026},
        {'username': 'etud.sankara', 'first_name': 'Rasmané', 'last_name': 'Sankara',
         'email': 'r.sankara@etud.bf', 'matricule': 'ETU2024005', 'filiere': 'Informatique', 'niveau': 'M1', 'promotion': 2027},
        {'username': 'etud.ilboudo', 'first_name': 'Awa', 'last_name': 'Ilboudo',
         'email': 'a.ilboudo@etud.bf', 'matricule': 'ETU2024006', 'filiere': 'Informatique', 'niveau': 'M1', 'promotion': 2027},
    ]

    etudiants = []
    for data in etudiants_data:
        user, created = User.objects.get_or_create(
            username=data['username'],
            defaults={
                'first_name': data['first_name'],
                'last_name': data['last_name'],
                'email': data['email'],
            }
        )
        if created:
            user.set_password('etudiant123')
            user.save()
        etud, _ = Etudiant.objects.get_or_create(
            user=user,
            defaults={
                'matricule': data['matricule'],
                'filiere': data['filiere'],
                'niveau': data['niveau'],
                'promotion': data['promotion'],
            }
        )
        etudiants.append(etud)

    # --- Projets ---
    projets_data = [
        {
            'titre': 'Plateforme E-Learning avec IA',
            'description': "Développement d'une plateforme d'apprentissage en ligne intégrant un système de recommandation basé sur l'intelligence artificielle pour personnaliser le parcours de chaque étudiant. Le système analyse les performances et suggère des ressources adaptées.",
            'type_projet': 'PFE',
            'statut': 'TERMINE',
            'technologies': 'React, Django, TensorFlow, PostgreSQL, Docker',
            'annee_universitaire': '2024-2025',
            'tuteur': enseignants[0],
            'etudiants': [etudiants[0], etudiants[1]],
        },
        {
            'titre': 'Application Mobile de Covoiturage Universitaire',
            'description': "Application mobile permettant aux étudiants et au personnel universitaire de partager des trajets quotidiens. Inclut la géolocalisation en temps réel, un système de notation et un chat intégré.",
            'type_projet': 'PFE',
            'statut': 'TERMINE',
            'technologies': 'React Native, Node.js, MongoDB, Socket.io, Google Maps API',
            'annee_universitaire': '2024-2025',
            'tuteur': enseignants[1],
            'etudiants': [etudiants[2], etudiants[3]],
        },
        {
            'titre': 'Système de Détection d\'Intrusion Réseau',
            'description': "Conception et implémentation d'un système IDS (Intrusion Detection System) utilisant le machine learning pour détecter les anomalies dans le trafic réseau universitaire en temps réel.",
            'type_projet': 'PFE',
            'statut': 'EN_COURS',
            'technologies': 'Python, Scikit-learn, Wireshark, Flask, Elasticsearch',
            'annee_universitaire': '2025-2026',
            'tuteur': enseignants[2],
            'etudiants': [etudiants[4], etudiants[5]],
        },
        {
            'titre': 'Gestionnaire de Bibliothèque Numérique',
            'description': "Application web de gestion d'une bibliothèque numérique avec système de recherche avancé, gestion des emprunts et recommandations de lectures basées sur l'historique.",
            'type_projet': 'PFA',
            'statut': 'VALIDE',
            'technologies': 'Vue.js, Spring Boot, MySQL, Redis',
            'annee_universitaire': '2025-2026',
            'tuteur': enseignants[1],
            'etudiants': [etudiants[2]],
        },
        {
            'titre': 'Chatbot FAQ pour l\'Université',
            'description': "Développement d'un chatbot intelligent capable de répondre aux questions fréquentes des étudiants concernant l'inscription, les emplois du temps, les procédures administratives, etc.",
            'type_projet': 'MINI',
            'statut': 'TERMINE',
            'technologies': 'Python, NLTK, FastAPI, React, SQLite',
            'annee_universitaire': '2024-2025',
            'tuteur': enseignants[0],
            'etudiants': [etudiants[0]],
        },
        {
            'titre': 'Dashboard de Monitoring IoT',
            'description': "Tableau de bord en temps réel pour la surveillance de capteurs IoT déployés dans les serres agricoles. Visualisation des données de température, humidité et luminosité avec alertes automatiques.",
            'type_projet': 'PFE',
            'statut': 'EN_ATTENTE',
            'technologies': 'React, Django, MQTT, InfluxDB, Grafana, Arduino',
            'annee_universitaire': '2025-2026',
            'tuteur': enseignants[2],
            'etudiants': [etudiants[3]],
        },
    ]

    for data in projets_data:
        etud_list = data.pop('etudiants')
        tuteur = data.pop('tuteur')
        projet, created = Projet.objects.get_or_create(
            titre=data['titre'],
            defaults={**data, 'tuteur': tuteur}
        )
        if created:
            projet.etudiants.set(etud_list)
            print(f"  ✅ Projet créé: {projet.titre}")
        else:
            print(f"  ⏭️  Projet existant: {projet.titre}")

    # --- Stages ---
    stages_data = [
        {
            'titre': 'Développement d\'une API REST pour la gestion RH',
            'description': "Stage au sein du département IT de Coris Bank. Développement d'une API RESTful pour la gestion des ressources humaines : suivi des congés, évaluations et fiches de paie.",
            'entreprise': 'Coris Bank International',
            'ville': 'Ouagadougou',
            'type_stage': 'PFE',
            'statut': 'TERMINE',
            'technologies': 'Django, PostgreSQL, Docker, Redis, Swagger',
            'annee_universitaire': '2024-2025',
            'date_debut': '2024-10-01',
            'date_fin': '2025-03-31',
            'etudiant': etudiants[0],
            'tuteur_academique': enseignants[1],
            'maitre_stage': 'Mamadou Diallo',
        },
        {
            'titre': 'Application mobile de suivi agricole',
            'description': "Conception d'une application mobile pour le suivi des parcelles agricoles dans la région des Hauts-Bassins. Géolocalisation, suivi météo et conseils aux producteurs de coton.",
            'entreprise': 'SOFITEX',
            'ville': 'Bobo-Dioulasso',
            'type_stage': 'PFE',
            'statut': 'TERMINE',
            'technologies': 'Flutter, Firebase, Google Maps API, Node.js',
            'annee_universitaire': '2024-2025',
            'date_debut': '2024-09-15',
            'date_fin': '2025-02-28',
            'etudiant': etudiants[1],
            'tuteur_academique': enseignants[0],
            'maitre_stage': 'Ibrahim Ouattara',
        },
        {
            'titre': 'Mise en place d\'un système de monitoring réseau',
            'description': "Installation et configuration d'outils de supervision réseau (Zabbix, Grafana) pour surveiller l'infrastructure IT de l'ONATEL. Mise en place d'alertes automatiques et de dashboards.",
            'entreprise': 'ONATEL',
            'ville': 'Ouagadougou',
            'type_stage': 'INGENIEUR',
            'statut': 'EN_COURS',
            'technologies': 'Zabbix, Grafana, Linux, Python, SNMP',
            'annee_universitaire': '2025-2026',
            'date_debut': '2025-10-01',
            'date_fin': '2026-03-31',
            'etudiant': etudiants[4],
            'tuteur_academique': enseignants[2],
            'maitre_stage': 'Salif Kaboré',
        },
        {
            'titre': 'Digitalisation du circuit de validation des factures',
            'description': "Développement d'une application web pour dématérialiser le processus de validation des factures fournisseurs. Workflow d'approbation multi-niveaux avec signature électronique.",
            'entreprise': 'Orange Burkina',
            'ville': 'Ouagadougou',
            'type_stage': 'INGENIEUR',
            'statut': 'EN_COURS',
            'technologies': 'React, Spring Boot, MySQL, Keycloak',
            'annee_universitaire': '2025-2026',
            'date_debut': '2025-11-01',
            'date_fin': '2026-04-30',
            'etudiant': etudiants[5],
            'tuteur_academique': enseignants[1],
            'maitre_stage': 'Aïssata Traoré',
        },
        {
            'titre': 'Analyse de données pour la microfinance',
            'description': "Stage d'analyse de données au sein d'une institution de microfinance. Création de tableaux de bord pour le suivi du portefeuille de crédits et scoring de risque client.",
            'entreprise': 'RCPB',
            'ville': 'Ouagadougou',
            'type_stage': 'TECHNICIEN',
            'statut': 'TERMINE',
            'technologies': 'Python, Pandas, Power BI, SQL Server',
            'annee_universitaire': '2024-2025',
            'date_debut': '2024-07-01',
            'date_fin': '2024-09-30',
            'etudiant': etudiants[2],
            'tuteur_academique': enseignants[0],
            'maitre_stage': 'Ousmane Compaoré',
        },
    ]

    for data in stages_data:
        stage, created = Stage.objects.get_or_create(
            titre=data['titre'],
            defaults=data
        )
        if created:
            print(f"  ✅ Stage créé: {stage.titre}")
        else:
            print(f"  ⏭️  Stage existant: {stage.titre}")

    print(f"\n📊 Résumé:")
    print(f"  - {Enseignant.objects.count()} enseignants")
    print(f"  - {Etudiant.objects.count()} étudiants")
    print(f"  - {Projet.objects.count()} projets")
    print(f"  - {Stage.objects.count()} stages")
    print("✨ Données de démonstration créées avec succès!")


if __name__ == '__main__':
    seed()
