import urllib.request
import json
import os
API_KEY = os.environ.get("GEMINI_API_KEY", "")
req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}")
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read())
        for m in data.get("models", []):
            if "gemini-3" in m["name"]:
                print(m["name"])
except Exception as e:
    print("Error:", e)
