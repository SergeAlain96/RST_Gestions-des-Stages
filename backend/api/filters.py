import django_filters
from .models import Projet, Stage


class ProjetFilter(django_filters.FilterSet):
    """Filtres avancés pour les projets."""
    annee_universitaire = django_filters.CharFilter(lookup_expr='exact')
    type_projet = django_filters.CharFilter(lookup_expr='exact')
    statut = django_filters.CharFilter(lookup_expr='exact')
    technologies = django_filters.CharFilter(method='filter_technologies')
    tuteur = django_filters.NumberFilter(field_name='tuteur__id')

    class Meta:
        model = Projet
        fields = ['annee_universitaire', 'type_projet', 'statut', 'technologies', 'tuteur']

    def filter_technologies(self, queryset, name, value):
        """Filtre les projets contenant une technologie donnée."""
        return queryset.filter(technologies__icontains=value)


class StageFilter(django_filters.FilterSet):
    """Filtres avancés pour les stages."""
    annee_universitaire = django_filters.CharFilter(lookup_expr='exact')
    type_stage = django_filters.CharFilter(lookup_expr='exact')
    statut = django_filters.CharFilter(lookup_expr='exact')
    entreprise = django_filters.CharFilter(lookup_expr='icontains')
    ville = django_filters.CharFilter(lookup_expr='icontains')
    technologies = django_filters.CharFilter(method='filter_technologies')

    class Meta:
        model = Stage
        fields = ['annee_universitaire', 'type_stage', 'statut', 'entreprise', 'ville', 'technologies']

    def filter_technologies(self, queryset, name, value):
        return queryset.filter(technologies__icontains=value)
