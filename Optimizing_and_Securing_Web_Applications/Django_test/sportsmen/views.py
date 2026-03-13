from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponseServerError, HttpResponse, HttpResponseNotFound, Http404
from .models import *
from .forms import AddArticleForm

# Create your views here.
menu = ['home', 'about', 'contacts']

def index(request):
    context = {
        'title': 'Sportsmen Home',
        'menu': menu,
        'sportsmen': Sportsman.objects.all()
    }
    return render(request, 'sportsmen/home.html', context)

def contacts(request):
    return HttpResponse("Contacts Page")

def about(request):
    context = {
        'title': 'About Us',
        'menu': menu
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

def post_detail(request, post_slug):
    # return HttpResponse(f"<h3>Show the post with ID: {post_id}</h3>")
    post = get_object_or_404(Sportsman, slug=post_slug)
    context = {
        'post': post,
        'menu': menu,
        'title': post.title,
        'sport_selected': post.sport_id,
    }
    return render(request, 'sportsmen/post.html', context=context)

def show_sports(request, sport_slug):
    sport = Sports.objects.filter(slug=sport_slug)
    sportsmen = Sportsman.objects.filter(sport_id=sport[0].id)
    if len(sportsmen) == 0:
        raise Http404()
    context = {
        'sportsmen': sportsmen,
        'menu': menu,
        'title': 'Display by sport category',
        'sport_selected': sport[0].id,
    }
    return render(request, 'sportsmen/home.html', context=context)

def addarticle(request):
    if request.method == 'POST':
        form = AddArticleForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('home')
    else:
        form = AddArticleForm()
    return render(request, 'addarticle.html', {'form': form})

def error_404(request, exception):
    return HttpResponseNotFound("<h1 style='font-size:20em;'>404</h1>")

def error_500(request):
    return HttpResponseNotFound("<h1 style='font-size:20em;'>500</h1>")