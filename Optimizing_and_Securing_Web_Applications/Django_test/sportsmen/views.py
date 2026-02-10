from django.shortcuts import render
from django.shortcuts import redirect
from django.http import HttpResponseServerError, HttpResponse, HttpResponseNotFound

# Create your views here.
def index(request):
    return HttpResponse("Hello, world. You're at the sportsmen index.")

def contacts(request):
    return HttpResponse("Contacts Page")

def about(request):
    return HttpResponse("About Page")

def get_query(request):
    name = request.GET.get('name', 'default')
    age = request.GET.get('age', 0)
    return HttpResponse(f"Name: {name}, Age: {age}")

def sport_detail(request, sp_id):
    if (request.GET): print(request.GET)
    if (sp_id > 20): raise HttpResponseServerError("Sport ID not found")
    return HttpResponse(f"<h1>Articles by sports</h1><p>{sp_id}</p>")

def sports_by_year(request, year):
    return HttpResponse(f"<h1>Articles by years</h1><p>{year}</p>")

def error_404(request, exception):
    return HttpResponseNotFound("<h1 style='font-size:20em;'>404</h1>")

def error_500(request):
    return HttpResponseNotFound("<h1 style='font-size:20em;'>500</h1>")