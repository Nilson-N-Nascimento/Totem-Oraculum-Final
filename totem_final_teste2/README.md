# 🌟 Totem Oraculum - Belém COP 30

Sistema interativo de totem digital para a cidade de Belém, desenvolvido especialmente para a COP 30. Um guia inteligente que combina dados locais precisos com IA avançada para oferecer informações completas sobre a capital paraense.

## 🚀 Características Principais

### 🧠 **IA Integrada (Gemini)**
- Respostas inteligentes e contextualizadas sobre Belém
- Processamento de linguagem natural em português
- Integração perfeita entre dados locais e conhecimento da IA

### 🗺️ **Base de Dados Local Completa**
- **Hotéis e Hospedagem**: Com links diretos do Google Maps, preços, comodidades
- **Restaurantes**: Especialidades locais, pratos típicos, horários, contatos  
- **Pontos Turísticos**: Atrações imperdíveis com descrições detalhadas
- **Informações COP 30**: Dados específicos sobre o evento

### 🔗 **Links Clicáveis e Navegação**
- Links diretos para Google Maps de todos os locais
- Websites oficiais clicáveis
- Informações de contato (telefones, endereços completos)
- Preços, horários e dicas atualizadas

### 🛡️ **Sistema Ultra-Robusto**
- 4 camadas de proteção contra erros
- Fallbacks inteligentes
- Cache de dados locais
- Sistema de busca multi-camadas

### 🌐 **Multilíngue**
- Português (padrão)
- Inglês 
- Espanhol

## ⚙️ Instalação e Configuração

### 1. **Clone o Repositório**
```bash
git clone https://github.com/Nilson-N-Nascimento/Totem-Oraculum.git
cd Totem-Oraculum
```

### 2. **Configure as Chaves de API**
```bash
# Copie o arquivo de exemplo
cp tela_totem/static/js/config.example.js tela_totem/static/js/config.js

# Edite o arquivo config.js e adicione suas chaves:
# - GEMINI_API_KEY: Chave da API do Google Gemini
# - GOOGLE_API_KEY: Chave da API do Google Maps (opcional)
```

### 3. **Instale as Dependências**
```bash
pip install django
```

### 4. **Execute o Servidor**
```bash
python manage.py runserver
```

### 5. **Acesse o Sistema**
Abra seu navegador em `http://localhost:8000`

## 🔑 **Configuração de Chaves de API**

### **Gemini API Key (Obrigatória)**
1. Acesse [Google AI Studio](https://aistudio.google.com/)
2. Crie uma nova API Key
3. Adicione no arquivo `config.js`:
```javascript
window.GEMINI_API_KEY = 'sua_chave_aqui';
```

### **Google Maps API Key (Opcional)**
Para funcionalidades avançadas de mapas:
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Ative a API do Google Maps
3. Crie uma API Key
4. Adicione no arquivo `config.js`:
```javascript
window.GOOGLE_API_KEY = 'sua_chave_aqui';
```

## 🎯 **Como Usar**

### **Exemplos de Perguntas Suportadas:**
- "Onde posso me hospedar em Belém?"
- "Quais os melhores restaurantes para comer açaí?"
- "O que visitar em 3 dias na cidade?"
- "Como funciona o transporte público?"
- "Quando será a COP 30?"
- "Quais pratos típicos experimentar?"

### **Recursos Avançados:**
- **Busca Inteligente**: Detecta automaticamente o tipo de informação solicitada
- **Links Diretos**: Todos os locais incluem links clicáveis para Google Maps
- **Informações Completas**: Endereços, telefones, horários, preços, dicas
- **Respostas Contextualizadas**: IA enriquece dados locais com informações relevantes

## 🏗️ **Estrutura do Projeto**

```
totem_final_teste2/
├── tela_totem/              # App principal
│   ├── static/
│   │   ├── js/
│   │   │   ├── script.js          # Lógica principal do chatbot
│   │   │   ├── config.example.js  # Exemplo de configuração
│   │   │   └── config.js          # Suas chaves (não commitado)
│   │   ├── css/
│   │   │   └── styles.css         # Estilos do totem
│   │   └── data/
│   │       └── belem_database.json # Base de dados local
│   └── templates/
│       └── totem.html             # Interface do totem
├── api/                     # APIs auxiliares
├── totem/                   # Configurações Django
└── manage.py               # Servidor Django
```

## 🔧 **Recursos Técnicos**

- **Backend**: Django (Python)
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **IA**: Google Gemini API
- **Mapas**: Google Maps API
- **Database**: JSON local + SQLite (Django)
- **Styled**: CSS responsivo para totems

## 🌟 **Funcionalidades Principais**

### **Sistema de Busca Multi-Camadas:**
1. **Busca Forçada**: Detecta palavras-chave e força categoria
2. **Busca por Pontuação**: Palavras-chave categorizadas com pesos  
3. **Busca Ampla**: Busca por palavras individuais
4. **Busca Genérica**: Fallback por categoria

### **Formatação Rica de Respostas:**
- Emojis contextuais para cada categoria
- Links clicáveis formatados em Markdown
- Informações organizadas e fáceis de ler
- Dicas locais e informações extras

### **Sistema de Fallbacks:**
- Dados locais → IA enriquecida → IA sozinha → Resposta padrão
- Garante que sempre há uma resposta útil
- Logs detalhados para debug e manutenção

## 🚀 **Deploy em Produção**

### **Variáveis de Ambiente Recomendadas:**
```bash
export GEMINI_API_KEY="sua_chave_aqui"
export DEBUG=False
export ALLOWED_HOSTS="seu-dominio.com"
```

### **Nginx + Gunicorn (Recomendado):**
```bash
pip install gunicorn
gunicorn totem.wsgi:application
```

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Crie um Pull Request

## 📜 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 **Contato**

**Desenvolvido para a COP 30 - Belém do Pará**

- **Repositório**: https://github.com/Nilson-N-Nascimento/Totem-Oraculum
- **Issues**: https://github.com/Nilson-N-Nascimento/Totem-Oraculum/issues

---

### 🌿 **Desenvolvido com ❤️ para Belém e a COP 30** 🌿