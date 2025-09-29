# totem/urls.py (URLs principal do projeto)
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Incluir URLs da app tela_totem como página principal
    path('', include('tela_totem.urls')),
]