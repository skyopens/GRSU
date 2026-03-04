from django.db import models
from django.urls import reverse

# Create your models here.
class Sportsman(models.Model):
    title = models.CharField(max_length=255, verbose_name='Full Name')
    content = models.TextField(blank=True)
    photo = models.ImageField(upload_to="photos/%Y/%m/%d/")
    time_create = models.DateTimeField(auto_now_add=True)
    time_update = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=True)
    sport = models.ForeignKey('Sports', on_delete=models.CASCADE, null=True)

    class Meta:
        verbose_name = "Sport news"
        verbose_name_plural = "Sport news"
        ordering = ['-title']   

    # def __str__(self):
    #     return f"{self.title} | {self.content} | {self.is_published} | {self.time_update}"
    
    def get_absolute_url(self):
        return reverse('post', kwargs={'post_id': self.id})

    # def get_absolute_url(self):
    #     return reverse('home')
    
    def __str__(self):
        return self.title
    
class Sports(models.Model):
    name = models.CharField(max_length=100, db_index=True, verbose_name="The name of sport")

    class Meta:
        verbose_name = "Sport"
        ordering = ['-name']   

    def __str__(self):
        return self.name