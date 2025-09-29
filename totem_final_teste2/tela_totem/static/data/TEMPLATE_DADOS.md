# Template para Dados de Belém - Oraculum AI

Este arquivo serve como guia para adicionar novos dados ao `belem_database.json`. Copie os modelos abaixo e adapte conforme necessário.

## 📍 Ponto Turístico
```json
{
  "nome": "Nome do Local",
  "categoria": "mercado|lazer|cultura|religioso|natureza",
  "descricao": "Descrição completa do local",
  "endereco": "Endereço completo",
  "preco": "Informações de preço (ex: 'Gratuito', 'R$ 15,00', 'Varia')",
  "horario": "Horário de funcionamento",
  "website": "https://site-oficial.com",
  "telefone": "(91) 9999-9999",
  "dicas": "Dicas importantes para visitantes"
}
```

## 🍽️ Restaurante
```json
{
  "nome": "Nome do Restaurante",
  "categoria": "alta_gastronomia|restaurante_popular|lanchonete|bar_restaurante",
  "especialidade": "Tipo de comida/especialidade",
  "endereco": "Endereço completo",
  "preco_medio": "R$ XX,00 - R$ YY,00 por pessoa",
  "horario": "Horário de funcionamento",
  "website": "https://site-oficial.com",
  "telefone": "(91) 9999-9999",
  "pratos_famosos": ["Prato 1", "Prato 2", "Prato 3"],
  "dicas": "Informações úteis (reservas, especialidades, etc.)"
}
```

## 🏨 Hotel
```json
{
  "nome": "Nome do Hotel",
  "categoria": "5_estrelas|4_estrelas|3_estrelas|pousada|hostel",
  "endereco": "Endereço completo",
  "preco_diaria": "R$ XX,00 - R$ YY,00",
  "website": "https://site-oficial.com",
  "telefone": "(91) 9999-9999",
  "comodidades": ["Wi-Fi gratuito", "Piscina", "Academia", "Spa"],
  "dicas": "Informações sobre localização, serviços especiais, etc."
}
```

## 🚌 Transporte
```json
{
  "tipo": "Nome/Tipo do Transporte",
  "descricao": "Descrição do serviço",
  "preco": "Informações de preço",
  "cobertura": "Área de cobertura (opcional)",
  "website": "https://site-oficial.com (opcional)",
  "telefone": "(91) 9999-9999 (opcional)",
  "dicas": "Informações práticas para usar o transporte"
}
```

## 🌍 Informações COP 30
```json
{
  "titulo": "Título da Informação",
  "descricao": "Descrição detalhada",
  "data": "Data/Período do evento",
  "local": "Local específico",
  "impacto_turismo": "Como afeta o turismo",
  "preparativos": ["Preparo 1", "Preparo 2"],
  "dicas_turistas": "Dicas específicas relacionadas ao evento"
}
```

## 🛡️ Segurança
```json
{
  "dica": "Tipo de dica de segurança",
  "locais": ["Local 1", "Local 2"],
  "horarios": "Informações sobre horários seguros",
  "detalhes": "Detalhes adicionais"
}
```

## 🌤️ Clima
```json
{
  "periodo": "Nome da Estação/Período",
  "caracteristicas": "Descrição do clima",
  "dicas": "O que levar, como se preparar"
}
```

---

## 📝 Instruções de Uso:

1. **Adicionar novo item**: Copie o template correspondente
2. **Preencher dados**: Complete todas as informações
3. **Inserir no JSON**: Adicione ao array correspondente no `belem_database.json`
4. **Testar**: Faça uma pergunta à IA para verificar se ela está usando os novos dados

## 📋 Categorias Disponíveis:

### Pontos Turísticos:
- `mercado` - Mercados e feiras
- `lazer` - Entretenimento e diversão
- `cultura` - Museus, teatros, centros culturais
- `religioso` - Igrejas, centros religiosos
- `natureza` - Parques, praias, áreas verdes

### Restaurantes:
- `alta_gastronomia` - Restaurantes requintados
- `restaurante_popular` - Restaurantes tradicionais
- `lanchonete` - Lanchonetes e fast food
- `bar_restaurante` - Bares com comida

### Hotéis:
- `5_estrelas` - Hotéis de luxo
- `4_estrelas` - Hotéis executivos
- `3_estrelas` - Hotéis confortáveis
- `pousada` - Pousadas familiares
- `hostel` - Hospedagem econômica

## 💡 Dicas Importantes:

- **Preços**: Sempre inclua faixas de preço para ajudar turistas
- **Telefones**: Use formato brasileiro: (91) 9999-9999
- **Websites**: Inclua https:// sempre
- **Dicas**: Adicione informações práticas e úteis
- **Endereços**: Use endereços completos com bairro
- **Horários**: Seja específico com dias e horários