# Totem Oraculum  Belém COP 30

> Guia digital interativo desenvolvido para a COP 30 em Belém, Pará. A aplicação funciona como um totem de autoatendimento que orienta visitantes nacionais e internacionais sobre a cidade, integrando inteligência artificial, dados locais estruturados e suporte multilíngue.

---

## Sobre o Projeto

O **Totem Oraculum** é uma solução de totem digital criada para ser implantada em pontos estratégicos da cidade durante o evento da COP 30. Seu objetivo é oferecer ao visitante uma experiência imersiva e informativa sobre Belém, abrangendo:

- Pontos turísticos e atrações culturais
- Culinária típica regional (Tacacá, Maniçoba, Açaí e muito mais)
- Notícias e agenda de eventos em tempo real
- Hotéis e opções de hospedagem (com links diretos para o Google Maps)
- Guia do visitante com rotas e dicas de segurança
- Desafio gamificado de sustentabilidade

---

## Stack de Tecnologias

### Back-end
| Tecnologia | Finalidade |
|---|---|
| **Python 3** | Linguagem principal do servidor |
| **Django 5.2** | Framework web  roteamento, views e templates |
| **SQLite** | Banco de dados relacional local (via Django ORM) |
| **WSGI / ASGI** | Interfaces de deploy (Gunicorn / Uvicorn compatível) |

### Front-end
| Tecnologia | Finalidade |
|---|---|
| **HTML5 semântico** | Estrutura da interface do totem |
| **CSS3** | Estilização completa com variáveis CSS, Grid e Flexbox |
| **JavaScript (ES6+)** | Lógica interativa no cliente, sem frameworks |
| **Google Fonts  Poppins** | Tipografia moderna e legível |
| **Font Awesome 6** | Biblioteca de ícones vetoriais |

### APIs e Serviços Externos
| Serviço | Finalidade |
|---|---|
| **Google Gemini 1.5 Flash** | IA generativa para respostas contextualizadas sobre Belém |
| **RSS2JSON + G1 Pará** | Feed de notícias em tempo real da região |
| **MyMemory Translation API** | Tradução automática de conteúdo |
| **Google Maps (links diretos)** | Navegação e localização de pontos de interesse |

### Dados e Arquivos Locais
| Recurso | Finalidade |
|---|---|
| **JSON** | Base de dados local (hotéis, restaurantes, pontos turísticos, etc.) |
| **Django Template Engine** | Renderização server-side de HTML dinâmico |

---

## Arquitetura e Técnicas Utilizadas

### Arquitetura Geral
- **MVT (Model-View-Template)**  Padrão arquitetural nativo do Django, separando responsabilidades entre camada de dados, lógica de negócio e apresentação.
- **Modularização de Apps**  O projeto é dividido em apps Django independentes (`tela_totem`, `api`), seguindo o princípio de responsabilidade única.
- **Namespace URL Routing**  Cada app possui seu próprio `urls.py` com namespaces, garantindo organização e evitando conflitos de rotas.

### Back-end (Django)
- **Function-Based Views (FBVs)** e **Class-Based Views (CBVs)**  Ambos os padrões são implementados, com `TemplateView` para views genéricas e funções para lógica customizada como `health_check` e `home_redirect`.
- **Context Processors**  Injeção de dados dinâmicos nos templates via dicionário de contexto.
- **Health Check Endpoint**  Rota dedicada `/health/` para monitoramento de disponibilidade da aplicação.
- **WSGI/ASGI Ready**  Aplicação preparada para deploy em ambientes de produção modernos.

### Front-end e JavaScript
- **Module Pattern (IIFE)**  Toda a lógica JavaScript é encapsulada em módulos auto-invocados (`Utils`, `ApiService`), evitando poluição do escopo global.
- **Dynamic DOM Manipulation**  Cards e conteúdo da interface são gerados dinamicamente via JavaScript puro, sem dependência de frameworks como React ou Vue.
- **Event Delegation**  Eventos de clique nos cards são gerenciados via delegação no elemento container, garantindo performance mesmo com DOM dinâmico.
- **Internacionalização (i18n) no cliente**  Sistema de tradução multilíngue (Português, Inglês, Espanhol) implementado inteiramente em JavaScript, com objeto de traduções centralizado.
- **CSS Custom Properties (Variáveis CSS)**  Paleta de cores temática (sustentabilidade, Amazônia, COP 30) gerenciada via `:root { --variavel: valor }`, facilitando manutenção e customização visual.
- **CSS Grid com auto-fit / minmax**  Layout responsivo dos cards sem media queries, adaptando automaticamente o número de colunas ao tamanho da tela.
- **Acessibilidade**  Estrutura HTML semântica com uso correto de `<header>`, `<main>`, atributos `data-*` e aria-friendly.

### Integração com IA (Gemini)
- **Prompt Engineering**  Respostas da IA são guiadas por prompts estruturados que delimitam o contexto (Belém, COP 30) para resultados precisos e relevantes.
- **Sistema de Fallback Multi-camadas**  4 níveis de proteção contra falhas: dado local  cache  fallback de módulo  resposta padrão. Garante funcionamento mesmo sem conectividade com a API.
- **Rate Limiting no cliente**  Controle de frequência de requisições à API implementado no front-end para evitar abuso e custos excessivos.
- **Proxy via Backend Django**  Arquitetura planejada para ocultar a chave de API no servidor, evitando exposição no cliente (segurança em produção).

### Dados Estruturados
- **JSON como fonte de dados local**  Base de dados de hotéis, restaurantes, pontos turísticos e respostas de intenção armazenados em arquivos JSON, permitindo atualizações sem alteração de código.
- **Busca multi-camadas com detecção de intenção**  O sistema identifica automaticamente o tipo de informação solicitada (hospedagem, gastronomia, turismo) e aciona a fonte de dados correta.

---

## Estrutura do Projeto

```
Totem-Oraculum-Final/
 totem_final/                  # Versão principal (front-end interativo)
    totem/                    # Configurações do projeto Django
       settings.py
       urls.py
       wsgi.py
       asgi.py
    tela_totem/               # App da interface do totem
       templates/totem.html  # Template principal (HTML + CSS + JS)
       views.py
       urls.py
    api/                      # App de API REST (estrutura base)
    manage.py
    db.sqlite3

 totem_final_teste2/           # Versão avançada com IA e dados estruturados
     tela_totem/
        static/
           js/script.js      # Engine JS com Gemini e módulos
           data/             # Base de dados local em JSON
        templates/
     test_gemini_api.py         # Testes de integração com Gemini
     test_api.html              # Testes de interface da API
     list_models.py             # Utilitário de listagem de modelos
```

---

## Como Executar

```bash
# 1. Clone o repositório
git clone https://github.com/Nilson-N-Nascimento/Totem-Oraculum-Final.git
cd Totem-Oraculum-Final/totem_final

# 2. Instale as dependências
pip install django

# 3. Execute as migrações
python manage.py migrate

# 4. Inicie o servidor de desenvolvimento
python manage.py runserver

# 5. Acesse no navegador
# http://localhost:8000
```

---

## Licença

Projeto desenvolvido com fins educacionais e demonstrativos para o contexto da COP 30  Belém, Pará, Brasil.