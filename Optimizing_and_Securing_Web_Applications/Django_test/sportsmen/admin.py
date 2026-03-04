from django.contrib import admin
from .models import Sportsman, Sports

# Register your models here.
class SportsmanAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'time_create', 'photo', 'is_published')
    list_display_links = ('id', 'title')
    search_fields = ('title', 'content')
    list_editable = ('is_published',)
    list_filter = ('is_published', 'time_create')

admin.site.register(Sportsman, SportsmanAdmin)

class SportsAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    list_display_links = ('id', 'name')
    search_fields = ('name',)
    
admin.site.register(Sports, SportsAdmin)
admin.site.site_url = '/sportsmen/'