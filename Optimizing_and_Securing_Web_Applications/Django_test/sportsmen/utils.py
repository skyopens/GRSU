from django.db.models import Count
from django.core.cache import cache
from .models import Sports

menu = [
    {'title': 'Home', 'url_name': 'home'},
    {'title': 'About', 'url_name': 'about'},
    {'title': 'Add article', 'url_name': 'addarticle'},
    {'title': 'Contact', 'url_name': 'contact'}
]

class DataMixin:
    paginate_by = 3

    def get_user_context(self, **kwargs):
        context = kwargs

        cats = cache.get('cats')
        if not cats:
            cats = Sports.objects.annotate(total=Count('sportsman')).filter(total__gt=0)
            cache.set('cats', cats, 70)

        user_menu = menu.copy()
        if not self.request.user.is_authenticated:
            user_menu.pop(1)

        context['menu'] = user_menu
        context['cats'] = cats

        if 'sport_selected' not in context:
            context['sport_selected'] = 0

        return context
