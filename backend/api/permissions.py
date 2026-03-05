from rest_framework.permissions import BasePermission


class IsEtudiant(BasePermission):
    """Autorise uniquement les utilisateurs ayant un profil étudiant."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, 'etudiant_profile')
        )


class IsEnseignant(BasePermission):
    """Autorise uniquement les utilisateurs ayant un profil enseignant."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, 'enseignant_profile')
        )


class IsOwnerEtudiant(BasePermission):
    """Vérifie que l'étudiant est bien associé au projet."""

    def has_object_permission(self, request, view, obj):
        if not hasattr(request.user, 'etudiant_profile'):
            return False
        etudiant = request.user.etudiant_profile
        # Pour un Projet
        if hasattr(obj, 'etudiants'):
            return etudiant in obj.etudiants.all()
        # Pour un Stage
        if hasattr(obj, 'etudiant'):
            return obj.etudiant == etudiant
        return False


class IsTuteurOfProjet(BasePermission):
    """Vérifie que l'enseignant est le tuteur du projet."""

    def has_object_permission(self, request, view, obj):
        if not hasattr(request.user, 'enseignant_profile'):
            return False
        return obj.tuteur == request.user.enseignant_profile


class IsTuteurOfStage(BasePermission):
    """Vérifie que l'enseignant est le tuteur académique du stage."""

    def has_object_permission(self, request, view, obj):
        if not hasattr(request.user, 'enseignant_profile'):
            return False
        return obj.tuteur_academique == request.user.enseignant_profile
