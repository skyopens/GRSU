from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def index(request):
    return HttpResponse("Hello, world. You're at the sportsmen index.")

def contacts(request):
    return HttpResponse("Contacts Page")

def about(request):
    return HttpResponse("About Page")