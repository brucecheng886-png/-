"""測試 Dify LLM 回應格式 — 診斷圖譜匯入問題"""
import httpx
import json
import sys

api_key = 'app-Rtir44Lb2sgK4ZN5mzulqE9F'
url = 'http://localhost:5001/v1/chat-messages'

prompt = """你是知識圖譜架構師。快速為每筆記錄歸類。
規則：回傳 JSON 陣列，每元素對應一筆輸入。不要 Markdown，只有純 JSON。

Schema:
{"label": "3-8字標題", "description": "30-80字摘要", "type": "分類(2-4字)", "keywords": ["k1", "k2"]}

1 筆資料:
[0] 台灣民進黨在2024年選舉中獲勝

輸出 JSON 陣列 (長度=1)："""

print(f"Sending request to {url}...")
print(f"Prompt length: {len(prompt)} chars")

try:
    resp = httpx.post(
        url,
        headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
        json={'query': prompt, 'user': 'test', 'inputs': {}, 'response_mode': 'blocking'},
        timeout=120
    )
    print(f"Status: {resp.status_code}")
    
    if resp.status_code != 200:
        print(f"Error response: {resp.text[:500]}")
        sys.exit(1)
    
    data = resp.json()
    answer = data.get('answer', '')
    print(f"\n=== LLM Answer ===")
    print(answer)
    print(f"\n=== Parse Test ===")
    
    # Try to parse as JSON
    try:
        parsed = json.loads(answer)
        print(f"Direct JSON parse: SUCCESS")
        print(f"Type: {type(parsed).__name__}")
        print(json.dumps(parsed, indent=2, ensure_ascii=False))
    except json.JSONDecodeError:
        print(f"Direct parse failed, trying extraction...")
        import re
        md = re.search(r'```(?:json)?\s*([\[\{].*?[\]\}])\s*```', answer, re.DOTALL)
        if md:
            try:
                parsed = json.loads(md.group(1))
                print(f"Markdown extraction: SUCCESS")
                print(json.dumps(parsed, indent=2, ensure_ascii=False))
            except:
                print(f"Markdown extraction: FAILED")
        else:
            print(f"No JSON found in response")
    
    # Check usage
    usage = data.get('metadata', {}).get('usage', {})
    print(f"\n=== Usage ===")
    print(f"Prompt tokens: {usage.get('prompt_tokens')}")
    print(f"Completion tokens: {usage.get('completion_tokens')}")
    print(f"Latency: {usage.get('latency', 0):.1f}s")

except httpx.TimeoutException:
    print("TIMEOUT - LLM took too long")
except Exception as e:
    print(f"ERROR: {e}")
