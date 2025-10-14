#!/usr/bin/env python3
"""
Lista modelos disponíveis na API do Gemini
"""
import requests
import json

API_KEY = "AIzaSyChPB1j0fvfchLhuItW7rMnIB0Oy8Fh6lg"

def list_models():
    print("📋 Listando modelos disponíveis...")
    
    try:
        response = requests.get(
            f"https://generativelanguage.googleapis.com/v1/models?key={API_KEY}",
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Modelos disponíveis:")
            for model in data.get('models', []):
                name = model.get('name', '')
                supported_methods = model.get('supportedGenerationMethods', [])
                if 'generateContent' in supported_methods:
                    print(f"  🤖 {name}")
                    
        else:
            print(f"❌ Erro: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    list_models()