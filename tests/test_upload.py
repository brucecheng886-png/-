import requests
import io

url = "http://localhost:8000/api/system/upload"
files = {'file': ('test.txt', io.BytesIO(b'test content'), 'text/plain')}
data = {'graph_id': '1', 'graph_mode': 'existing'}

print(f"測試上傳到: {url}")
response = requests.post(url, files=files, data=data)
print(f"狀態碼: {response.status_code}")
print(f"響應: {response.text}")
