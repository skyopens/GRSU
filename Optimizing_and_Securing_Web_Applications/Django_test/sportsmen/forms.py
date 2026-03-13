from django import forms
from .models import *

class AddArticleForm(forms.ModelForm):
    class Meta:
        model = Sportsman
        fields = ['title', 'slug', 'content', 'photo', 'is_published', 'sport']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-input'}),
            'slug': forms.TextInput(attrs={'class': 'form-input'}),
            'content': forms.Textarea(attrs={'cols':40, 'rows': 12})
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['sport'].empty_label = 'Choose sport'