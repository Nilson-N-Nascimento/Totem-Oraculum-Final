# tela_totem/views.py
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.views.generic import TemplateView
import json
import os
from django.conf import settings

def totem_view(request):
    """
    View principal para a tela do totem
    """
    context = {
        'titulo': 'Sistema Totem',
        'mensagem_boas_vindas': 'Bem-vindo ao Sistema',
        'versao': '1.0',
    }
    return render(request, 'totem.html', context)

def belem_data_api(request):
    """
    API para fornecer dados locais sobre Belém para o chatbot
    """
    try:
        # Caminho para o arquivo de dados
        data_path = os.path.join(settings.BASE_DIR, 'tela_totem', 'static', 'data', 'belem_database.json')
        
        # Carrega os dados do arquivo JSON
        with open(data_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        # Permite filtrar por categoria se especificado
        categoria = request.GET.get('categoria')
        if categoria:
            if categoria in data:
                return JsonResponse({categoria: data[categoria]})
            else:
                return JsonResponse({"error": "Categoria não encontrada"}, status=404)
        
        # Retorna todos os dados se não especificar categoria
        return JsonResponse(data)
        
    except FileNotFoundError:
        return JsonResponse({"error": "Arquivo de dados não encontrado"}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Erro ao decodificar dados JSON"}, status=500)
    except Exception as e:
        return JsonResponse({"error": f"Erro interno: {str(e)}"}, status=500)

# Alternativa usando Class Based View
class TotemView(TemplateView):
    template_name = 'totem.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            'titulo': 'Sistema Totem',
            'mensagem_boas_vindas': 'Bem-vindo ao Sistema',
            'versao': '1.0',
        })
        return context

def home_redirect(request):
    """
    View para redirecionar para a página principal
    """
    return redirect('tela_totem:totem')

# Views adicionais que podem ser úteis
def health_check(request):
    """
    View para verificação de saúde do sistema
    """
    return HttpResponse("OK", content_type="text/plain")