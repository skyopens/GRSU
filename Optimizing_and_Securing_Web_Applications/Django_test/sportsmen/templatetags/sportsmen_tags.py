from django import template
from sportsmen.models import Sports

register = template.Library()

@register.simple_tag(name='getsports')
def get_sports(filter=None):
    if filter is None:
        return Sports.objects.all()
    return Sports.objects.filter(pk=filter)

@register.inclusion_tag('sportsmen/list_sports.html')
def show_sports(sort=None, sport_selected=0):
    if sort is None:
        sports = Sports.objects.all()
    else:
        sports = Sports.objects.order_by(sort)
    return {'sports': sports, 'sport_selected': sport_selected}
