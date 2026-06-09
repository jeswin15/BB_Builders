from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_api():
    # Test GET
    response = client.get("/api/workers")
    print(f"GET /api/workers Status: {response.status_code}")
    print(f"GET response: {response.json()[:2] if response.status_code == 200 else response.text}")
    
    # Test POST
    payload = {
        "id": "W-9999",
        "name": "API Test",
        "phone": "1234567890",
        "skill": "Mason",
        "dailyRate": 500.0,
        "joinDate": "2026-01-01",
        "status": "Active",
        "site": "Test Site",
        "advances": 0.0,
        "balance": 0.0,
        "attendance": []
    }
    
    response = client.post("/api/workers", json=payload)
    print(f"POST /api/workers Status: {response.status_code}")
    print(f"POST response: {response.text}")
    
if __name__ == "__main__":
    test_api()
