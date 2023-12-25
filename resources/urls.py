from django.urls import path
from . import views


urlpatterns = [
    path('', views.home),
    path('whisper/', views.whisper_to_me)
]
