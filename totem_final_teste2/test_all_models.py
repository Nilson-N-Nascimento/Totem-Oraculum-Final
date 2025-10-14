import requests
import json
import os

API_KEY = "AIzaSyChPB1j0fvfchLhuItW7rMnIB0Oy8Fh6lg"

models_to_test = [
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-lite-001", 
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-2.5-pro"
]

def test_model(model_name):
    print(f"\n🧪 Testando: {model_name}")
    print("=" * 60)
    
    endpoint = f"https://generativelanguage.googleapis.com/v1/models/{model_name}:generateContent"
    
    body = {
        "contents": [{
            "parts": [{
                "text": "Olá, responda apenas 'OK' se estiver funcionando."
            }]
        }],
        "generationConfig": {
            "maxOutputTokens": 10,
            "temperature": 0.1
        }
    }
    
    try:
        response = requests.post(
            f"{endpoint}?key={API_KEY}",
            headers={"Content-Type": "application/json"},
            json=body,
            timeout=10
        )
        
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'candidates' in data and len(data['candidates']) > 0:
                text = data['candidates'][0]['content']['parts'][0]['text']
                print(f"✅ FUNCIONANDO! Resposta: {text}")
                return True
        elif response.status_code == 429:
            print(f"❌ QUOTA ESGOTADA")
            error_data = response.json()
            if 'error' in error_data and 'message' in error_data['error']:
                print(f"💬 Mensagem: {error_data['error']['message'][:200]}")
        else:
            print(f"❌ ERRO: {response.status_code}")
            print(f"💬 Resposta: {response.text[:300]}")
            
        return False
        
    except Exception as e:
        print(f"💥 Exceção: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 TESTANDO TODOS OS MODELOS GEMINI")
    print("=" * 60)
    
    working_models = []
    
    for model in models_to_test:
        if test_model(model):
            working_models.append(model)
    
    print("\n" + "=" * 60)
    print("📊 RESUMO DOS TESTES")
    print("=" * 60)
    
    if working_models:
        print(f"\n✅ Modelos FUNCIONANDO ({len(working_models)}):")
        for model in working_models:
            print(f"   🟢 {model}")
        print(f"\n🎯 RECOMENDADO: {working_models[0]}")
    else:
        print("\n❌ Nenhum modelo com quota disponível no momento")
        print("⏰ Aguarde reset da quota (normalmente às 00:00 UTC)")
