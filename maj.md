🏗️ Phase 1 : Identité Institutionnelle et Structure du Site

Objectif : Adapter la plateforme à l’identité de l’ESI et préparer la structure du portail.

Composant	Backend (Django)	Frontend (React + TS)
Structure globale	Préparer l’API principale (api/).	Créer le layout principal Layout.tsx.
Identité visuelle	Ajouter un modèle Organisation si nécessaire.	Ajouter le logo de l’ESI dans le header.
Footer institutionnel	Créer un endpoint pour les informations institutionnelles.	Ajouter en bas de page : adresse UNB, adresse ESI, et Plan du site.
Navigation	Structurer les endpoints principaux.	Créer les routes principales avec react-router-dom.
Module système global	Préparer la compatibilité avec le système principal.	Adapter l’en-tête pour s’intégrer au portail global.
🧱 Phase 2 : Organisation des Projets par Filière

Objectif : Structurer les projets par groupes pédagogiques.

Groupes possibles :

SI (Systèmes Informatiques)

RS (Réseaux et Systèmes)

Administration Réseaux

Supervision

Sécurité

Autres

Composant	Backend	Frontend
Groupes de projets	Créer un modèle GroupeProjet.	Créer des blocs de catégories pour chaque groupe.
Projet	Lier Projet à GroupeProjet.	Filtrer les projets par groupe.
API filtrage	Endpoint /api/projets/?groupe=SI.	Ajouter un système de filtrage.
Affichage	Optimiser les requêtes DRF.	Afficher les projets sous forme de sections/blocs.
💼 Phase 3 : Module Stages et Emplois

Objectif : Permettre la consultation des offres de stages.

Page principale :

Stages et Emplois

Composant	Backend	Frontend
Modèle Stage	Créer modèle Stage.	Créer page StagesEmplois.tsx.
Informations Stage	Ajouter champs : niveau, durée, date début.	Afficher ces informations dans une carte.
Niveau académique	Enum : Licence / IT / Master / IC.	Ajouter filtres par niveau.
API Stages	Endpoint /api/stages/.	Charger les stages avec axios.
Filtres	Ajouter filtres DRF.	Ajouter recherche et filtres.
🏢 Phase 4 : Espace Entreprises

Objectif : Permettre aux entreprises de proposer des stages et rechercher des profils.

Composant	Backend	Frontend
Compte entreprise	Modèle Entreprise.	Page RegisterEntreprise.
Authentification	JWT pour les entreprises.	Page login entreprise.
Proposition stage	Endpoint POST /api/stages/proposer.	Formulaire de proposition de stage.
Gestion offres	Entreprise peut modifier/supprimer ses offres.	Dashboard entreprise.
Recherche profils	API pour consulter les CV étudiants.	Interface de recherche de profils.
🎓 Phase 5 : Espace Étudiant et CV

Objectif : Permettre aux étudiants de créer et gérer leur CV.

Composant	Backend	Frontend
Profil étudiant	Modèle Etudiant.	Page ProfilEtudiant.
CV étudiant	Modèle CV.	Formulaire de création CV.
Upload CV	FileField pour PDF.	Upload de CV.
Mise à jour CV	API PUT/PATCH.	Interface de mise à jour.
Base de CV	API pour entreprises.	Liste consultable des profils.
🔐 Phase 6 : Gestion des Inscriptions

Objectif : Limiter l’inscription uniquement aux étudiants de l’ESI.

Plusieurs solutions possibles.

Méthode 1 (simple)

Inscription uniquement avec email institutionnel :

prenom.nom@esi.unb.bf
Méthode 2 (plus sécurisée)

Importer une liste officielle d'étudiants.

Composant	Backend	Frontend
Liste étudiants	Modèle EtudiantAutorise.	Vérification à l'inscription.
Validation inscription	Vérifier matricule ou email.	Message d'erreur si refus.
📊 Phase 7 : Centralisation des CV

Objectif : Créer une base de talents pour les entreprises.

Composant	Backend	Frontend
Base CV	API /api/cv/.	Page "Profils étudiants".
Recherche profils	Filtres par compétences.	Barre de recherche.
Compétences	Modèle Competence.	Affichage badges compétences.
Matching stage	Associer stage et compétences.	Suggestion profils.
⚙️ Phase 8 : Administration et Gestion

Objectif : Superviser toute la plateforme.

Composant	Backend	Frontend
Admin Django	Gestion étudiants / entreprises.	Tableau de bord admin.
Validation entreprises	Compte entreprise validé par admin.	Interface validation.
Modération stages	Vérifier offres avant publication.	Statut "En attente".
Statistiques	API statistiques plateforme.	Dashboard statistiques.