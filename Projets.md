# 🚀 Roadmap : Plateforme de Gestion de Projets RST

Ce document détaille les phases de développement de la plateforme en utilisant **React (TypeScript)** pour le frontend et **Django** pour le backend.

---

## 🏗️ Phase 1 : Le Socle Technique et la Page d'Accueil
**Objectif :** Établir la communication entre le frontend et le backend et afficher les premiers projets.

| Composant | Tâches Backend (Django) | Tâches Frontend (React + TS) |
| :--- | :--- | :--- |
| **Initialisation** | Initialiser le projet et créer l'app `api`. | Créer le projet avec le template `--template typescript`. |
| **Modèles** | Définir `Projet`, `Etudiant`, `Enseignant` dans `models.py`. | Créer les interfaces TS correspondantes dans `src/types/`. |
| **API** | Créer les Serializers et ViewSets pour `Projet` (GET /api/projets/). | Créer les composants `Header`, `Footer`, `ProjectList`. |
| **Connexion** | Configurer `django-cors-headers` pour autoriser le frontend. | Utiliser `axios` pour récupérer les projets de l'API. |
| **Admin** | Enregistrer les modèles dans l'admin Django pour tester. | Afficher les projets dynamiquement avec `.map()`. |

---

## 🖼️ Phase 2 : La Vitrine Publique
**Objectif :** Permettre aux visiteurs de consulter et filtrer les réalisations (Projets & Stages).

| Composant | Tâches Backend (Django) | Tâches Frontend (React + TS) |
| :--- | :--- | :--- |
| **Détails** | Créer l'endpoint pour un projet unique (`/api/projets/<id>/`). | Créer la page de détail d'un projet (`/projets/:id`). |
| **Filtres** | Ajouter des paramètres de filtrage à l'API (année, type, techno). | Implémenter la barre de recherche et les menus de filtres. |
| **Stages** | Créer le modèle `Stage` et son API associée. | Développer la page "Galerie des Stages". |
| **Navigation** | S'assurer que les routes de l'API sont optimisées. | Configurer `react-router-dom` pour la navigation fluide. |

---

## 🎓 Phase 3 : L'Espace Étudiant
**Objectif :** Gestion de l'authentification et dépôt des livrables par les étudiants.

| Composant | Tâches Backend (Django) | Tâches Frontend (React + TS) |
| :--- | :--- | :--- |
| **Auth** | Configurer JWT (SimpleJWT ou Djoser) pour l'authentification. | Créer les pages Login et Register. |
| **Sécurité** | Protéger les endpoints sensibles avec `IsAuthenticated`. | Gérer le token (LocalStorage/Cookies) via un `AuthContext`. |
| **Dépôt** | Créer l'API `POST` pour la soumission de projet et fichiers. | Créer le formulaire de dépôt (Upload de fichiers). |
| **Dashboard** | API renvoyant uniquement les projets de l'étudiant connecté. | Créer le tableau de bord personnel de l'étudiant. |

---

## 👨‍🏫 Phase 4 : L'Espace Pédagogique
**Objectif :** Outils de suivi, de validation et d'évaluation pour les enseignants.

| Composant | Tâches Backend (Django) | Tâches Frontend (React + TS) |
| :--- | :--- | :--- |
| **Permissions** | Créer des permissions personnalisées (ex: `IsEnseignant`). | Protéger les routes réservées aux enseignants. |
| **Suivi** | API listant les projets dont l'enseignant est le tuteur. | Créer le tableau de bord Enseignant. |
| **Validation** | Créer l'endpoint `PATCH` pour valider/refuser un sujet. | Ajouter les boutons d'action (Valider/Refuser) sur l'interface. |
| **Notation** | Créer le modèle `Evaluation` (Notes/Critères). | Développer le formulaire de saisie de la grille d'évaluation. |

---

## ⚙️ Phase 5 : Administration et Finalisation
**Objectif :** Archivage, gestion globale et préparation au déploiement.

| Composant | Tâches Backend (Django) | Tâches Frontend (React + TS) |
| :--- | :--- | :--- |
| **Archivage** | Créer une commande de gestion pour l'archivage annuel. | Ajouter un indicateur "Archivé" sur les anciens projets. |
| **Admin** | Personnaliser l'admin Django (filtres avancés, exports CSV). | Finaliser l'UI/UX (états de chargement, notifications). |
| **Qualité** | Optimiser les requêtes SQL (select_related, prefetch_related). | Effectuer les tests de bout en bout (E2E). |
| **Déploiement** | Configurer `gunicorn`, les variables d'env et les collectstatic. | Générer le build de production (`npm run build`). |

---

## 🛠️ Stack Technique
- **Frontend :** React 18+, TypeScript, React Router, Axios.
- **Backend :** Django 4+, Django REST Framework (DRF), SimpleJWT.
- **Base de données :** PostgreSQL.
- **Style :** Tailwind CSS (recommandé pour la rapidité).
