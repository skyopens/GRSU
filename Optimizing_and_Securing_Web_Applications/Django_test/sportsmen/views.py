from django.http import HttpResponseNotFound
from django.shortcuts import render
from django.core.paginator import Paginator
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView, DetailView, CreateView
from django.urls import reverse_lazy

from .models import *
from .forms import AddArticleForm
from .utils import DataMixin


def error_404(request, exception):
    return HttpResponseNotFound("<h1 style='font-size:20em;'>404</h1>")


def error_500(request):
    return HttpResponseNotFound("<h1 style='font-size:20em;'>500</h1>")


class SportsmenHome(DataMixin, ListView):
    model = Sportsman
    template_name = 'sportsmen/home.html'
    context_object_name = 'sportsmen'

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title='Main page', sport_selected=0)
        return {**context, **c_def}

    def get_queryset(self):
        return Sportsman.objects.filter(is_published=True)


class SportsmenSport(DataMixin, ListView):
    model = Sportsman
    template_name = 'sportsmen/home.html'
    context_object_name = 'sportsmen'
    allow_empty = False

    def get_queryset(self):
        return Sportsman.objects.filter(
            sport__slug=self.kwargs['sport_slug'],
            is_published=True
        )

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(
            title='Sport - ' + str(context['sportsmen'][0].sport),
            sport_selected=context['sportsmen'][0].sport_id
        )
        return {**context, **c_def}


class ShowPost(DataMixin, DetailView):
    model = Sportsman
    template_name = 'sportsmen/post.html'
    slug_url_kwarg = 'post_slug'
    context_object_name = 'post'

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(
            title=str(context['post']),
            sport_selected=0
        )
        return {**context, **c_def}


class AddArticle(LoginRequiredMixin, DataMixin, CreateView):
    form_class = AddArticleForm
    template_name = 'addarticle.html'
    success_url = reverse_lazy('home')
    login_url = '/' 

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title='Add article')
        return {**context, **c_def}


def about(request):
    sports_list = Sports.objects.all()
    paginator = Paginator(sports_list, 3)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    from .utils import menu as site_menu
    user_menu = site_menu.copy()
    if not request.user.is_authenticated:
        user_menu = [item for item in user_menu if item['url_name'] != 'add_article']

    return render(request, 'sportsmen/about.html', {
        'page_obj': page_obj,
        'menu': user_menu,
        'title': 'About',
        'sport_selected': 0,
    })