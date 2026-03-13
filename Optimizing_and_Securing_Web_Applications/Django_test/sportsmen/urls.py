"""
URL configuration for Django_test project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, re_path
from sportsmen import views

# app_name = 'sportsmen'

urlpatterns = [
    path('', views.index, name='home'),
    path('contacts/', views.contacts, name='contacts'),
    path('about/', views.about, name='about'),
    path('sport/<slug:sp_id>/', views.sport_detail, name='post'),
    re_path(r'^sports/(?P<year>[0-9]{4})/$', views.sports_by_year),
    path('post/<slug:post_slug>/', views.post_detail, name='post'),
    path('sports/<slug:sport_slug>/', views.show_sports, name='sports'),
    path('addarticle/', views.addarticle, name='addarticle')
]
