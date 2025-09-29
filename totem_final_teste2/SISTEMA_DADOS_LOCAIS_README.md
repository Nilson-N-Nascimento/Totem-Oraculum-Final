# 📊 Sistema de Dados Locais - Oraculum AI

## 🎯 Visão Geral

O Oraculum AI agora conta com um sistema integrado de dados locais sobre Belém do Pará. A IA consulta automaticamente nossa base de dados para fornecer informações específicas e atualizadas.

## 🔄 Como Funciona

### Fluxo de Consulta:

1. **Usuário faz pergunta** → Sistema analisa a mensagem
2. **Busca dados locais** → Procura informações específicas na base
3. **Dados encontrados?**
   - ✅ **SIM**: Usa dados locais + IA para resposta enriquecida
   - ❌ **NÃO**: Usa IA padrão ou fallback inteligente

### Prioridade de Respostas:

1. **🥇 Dados Locais + IA**: Informação específica enriquecida pela IA
2. **🥈 IA Padrão**: Conhecimento geral da Gemini AI
3. **🥉 Fallback Local**: Sistema de respostas pré-programadas

## 📁 Estrutura de Arquivos

```
tela_totem/
├── static/
│   └── data/
│       ├── belem_database.json      # Base de dados principal
│       └── TEMPLATE_DADOS.md        # Guia para adicionar dados
├── views.py                         # API Django para servir dados
└── urls.py                          # Rotas da API
```

## 🗂️ Categorias de Dados

### 🏛️ Pontos Turísticos
- **Busca por**: "onde visitar", "ponto turístico", "o que fazer"
- **Exemplos**: Ver-o-Peso, Theatro da Paz, Estação das Docas

### 🍽️ Restaurantes
- **Busca por**: "onde comer", "restaurante", "tacacá", "açaí"
- **Categorias**: Alta gastronomia, Popular, Lanchonete, Bar

### 🏨 Hotéis
- **Busca por**: "onde ficar", "hotel", "hospedagem"
- **Tipos**: 5 estrelas, 4 estrelas, 3 estrelas, Pousada, Hostel

### 🚌 Transporte
- **Busca por**: "como chegar", "transporte", "ônibus", "táxi"
- **Tipos**: BRT, Táxi, Uber, Aeroporto

### 🌍 COP 30
- **Busca por**: "cop 30", "conferência", "clima"
- **Info**: Datas, local, impacto turístico

## 🔧 API Endpoints

### Buscar Todos os Dados
```
GET /api/belem-data/
```

### Buscar por Categoria
```
GET /api/belem-data/?categoria=pontos_turisticos
GET /api/belem-data/?categoria=restaurantes
GET /api/belem-data/?categoria=hoteis
GET /api/belem-data/?categoria=transporte
GET /api/belem-data/?categoria=cop30
```

## 📝 Como Adicionar Novos Dados

### 1. Usando o Template
1. Abra `TEMPLATE_DADOS.md`
2. Copie o template da categoria desejada
3. Preencha todas as informações
4. Adicione ao `belem_database.json`

### 2. Exemplo Prático - Novo Restaurante:

```json
{
  "nome": "Casa do Saulo",
  "categoria": "restaurante_popular",
  "especialidade": "Culinária paraense tradicional",
  "endereco": "Av. Gov. José Malcher, 247 - Nazaré, Belém - PA",
  "preco_medio": "R$ 45,00 - R$ 80,00 por pessoa",
  "horario": "Segunda a sábado: 11h às 22h, Domingo: 11h às 17h",
  "website": "https://casadosaulo.com.br",
  "telefone": "(91) 3224-6959",
  "pratos_famosos": ["Pato no tucupi", "Maniçoba", "Tambaqui assado"],
  "dicas": "Tradicional desde 1989, reservas recomendadas aos finais de semana"
}
```

### 3. Inserção no JSON:

Adicione o objeto ao array `restaurantes` em `belem_database.json`:

```json
{
  "restaurantes": [
    // ... outros restaurantes
    {
      "nome": "Casa do Saulo",
      // ... dados do restaurante
    }
  ]
}
```

## 🧪 Testando o Sistema

### 1. Perguntas que Usam Dados Locais:
- "Onde posso comer em Belém?"
- "Qual o preço do Ver-o-Peso?"
- "Hotéis próximos ao centro"
- "Como chegar do aeroporto?"

### 2. Monitoramento no Console:
```javascript
// Mensagens que você verá:
"💾 Base de dados local de Belém carregada com sucesso"
"📋 Usando dados locais específicos: X resultados"
```

### 3. Testando a API Diretamente:
```
http://127.0.0.1:8000/api/belem-data/?categoria=restaurantes
```

## 🛠️ Troubleshooting

### Problema: Dados não carregam
**Solução**: Verifique se o arquivo JSON está válido:
```bash
python -m json.tool tela_totem/static/data/belem_database.json
```

### Problema: API retorna erro 404
**Solução**: Verifique se a URL está em `urls.py`:
```python
path('api/belem-data/', views.belem_data_api, name='belem_data_api'),
```

### Problema: IA não usa dados locais
**Solução**: Verifique o console do navegador para logs do sistema.

## 📊 Estatísticas de Uso

O sistema registra automaticamente:
- ✅ Quando dados locais são encontrados
- ⚡ Quando a IA é usada para enriquecer
- 🔄 Quando fallback é usado

## 🚀 Melhorias Futuras

- [ ] Cache mais inteligente para dados frequentes
- [ ] Análise de sentimento para personalizar respostas
- [ ] Sistema de avaliação das respostas
- [ ] Interface admin para editar dados via web
- [ ] Sincronização automática com APIs externas

## 💡 Dicas de Performance

1. **JSON otimizado**: Mantenha o arquivo JSON organizado e sem dados desnecessários
2. **Cache ativo**: Os dados são carregados uma vez e mantidos em cache
3. **Busca inteligente**: O sistema usa múltiplas palavras-chave para encontrar dados relevantes
4. **Fallback seguro**: Sempre há uma resposta, mesmo se tudo falhar

---

**🎉 O sistema está 100% operacional e pronto para uso!**