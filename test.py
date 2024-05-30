import requests


vlaid_data = {
    "gstin": "27AAACR5055K2Z6",
}

invalid_data = {
    "gstin": "27AAACR5055K2Z7",
}

response = requests.post("http://localhost:9300/gstin", json=vlaid_data)
print(response.json())

response = requests.post("http://localhost:9300/gstin", json=invalid_data)
print(response.json())