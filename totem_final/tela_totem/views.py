# tela_totem/views.py
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.views.generic import TemplateView

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