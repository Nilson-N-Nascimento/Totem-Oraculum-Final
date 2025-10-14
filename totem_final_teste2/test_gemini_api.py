#!/usr/bin/env python3
"""
Teste simples da API do Gemini para verificar se a chave está funcionando
"""
import requests
import json

API_KEY = "AIzaSyChPB1j0fvfchLhuItW7rMnIB0Oy8Fh6lg"
API_ENDPOINT = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent"

def test_gemini_api():
    print("🧪 Testando API do Gemini...")
    print(f"🔑 Chave API: {API_KEY[:10]}...{API_KEY[-10:]}")
    print(f"🎯 Endpoint: {API_ENDPOINT}")
    
    # Corpo da requisição
    request_body = {
        "contents": [{
            "parts": [{
                "text": "Responda: Você é o Oraculum AI de Belém?"
            }]
        }],
        "generationConfig": {
            "maxOutputTokens": 50,
            "temperature": 0.7
        }
    }
    
    try:
        print("📡 Enviando requisição para o Gemini...")
        response = requests.post(
            f"{API_ENDPOINT}?key={API_KEY}",
            headers={'Content-Type': 'application/json'},
            json=request_body,
            timeout=30
        )
        
        print(f"📊 Status da resposta: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Sucesso! Resposta do Gemini:")
            if 'candidates' in data and data['candidates']:
                text = data['candidates'][0]['content']['parts'][0]['text']
                print(f"💬 Texto: {text}")
                return True
            else:
                print("❌ Estrutura de resposta inválida")
                print(f"📦 Data: {data}")
                return False
        else:
            print(f"❌ Erro HTTP: {response.status_code}")
            print(f"📄 Resposta: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")
        return False

if __name__ == "__main__":
    success = test_gemini_api()
    if success:
        print("\n🎉 API do Gemini está funcionando corretamente!")
    else:
        print("\n💥 Problema com a API do Gemini!")