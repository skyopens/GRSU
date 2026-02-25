from django.shortcuts import render
from django.http import HttpResponseServerError, HttpResponse, HttpResponseNotFound
from .models import *

# Create your views here.
def index(request):
    context = {
        'title': 'Sportsmen Home',
        'menu': ['home', 'about', 'contacts'],
        'sportsmen': Sportsman.objects.all()
    }
    return render(request, 'sportsmen/home.html', context)

def contacts(request):
    return HttpResponse("Contacts Page")

def about(request):
    context = {
        'title': 'About Us',
        'menu': ['home', 'about', 'contacts']
    }
    return render(request, 'sportsmen/about.html', context)

def get_query(request):
    name = request.GET.get('name', 'default')
    age = request.GET.get('age', 0)
    return HttpResponse(f"Name: {name}, Age: {age}")

def sport_detail(request, sp_id):
    if (request.GET): print(request.GET)
    if (sp_id > 20): raise HttpResponseServerError("Sport ID not found")
    return HttpResponse(f"<h1>Articles by sports</h1><p>{sp_id}</p>")

def sports_by_year(request, year):
    return HttpResponse(f"<h1>Articles by years</h1><p>{year}</h1>")

def post_detail(request, post_id):
    return HttpResponse(f"<h3>Show the post with ID: {post_id}</h3>")

def show_sports(request, sport_id):
    if sport_id == 0:
        sportsman_list = Sportsman.objects.all()
    else:
        sportsman_list = Sportsman.objects.filter(sport_id=sport_id)
    return render(request, 'sportsmen/home.html', {'sportsmen': sportsman_list})

def error_404(request, exception):
    return HttpResponseNotFound("<h1 style='font-size:20em;'>404</h1>")

def error_500(request):
    return HttpResponseNotFound("<h1 style='font-size:20em;'>500</h1>")