# tela_totem/urls.py
from django.urls import path
from . import views

# Nome da aplicação para namespacing
app_name = 'tela_totem'

urlpatterns = [
    # Página principal do totem
    path('', views.totem_view, name='totem'),
    
    # API para dados de Belém
    path('api/belem-data/', views.belem_data_api, name='belem_data_api'),
    
    # Alternativa usando Class Based View (descomente para usar)
    # path('', views.TotemView.as_view(), name='totem'),
    
    # Rota para redirecionamento da home
    path('home/', views.home_redirect, name='home'),
    
    # Health check para monitoramento
    path('health/', views.health_check, name='health'),
]