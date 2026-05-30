from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "features" in data
    assert "chain detection" in data["features"]

def test_demo_endpoint():
    response = client.get("/demo")
    assert response.status_code == 200
    data = response.json()
    assert "approximate_shape_complementarity" in data
    assert "designability_score" in data
    assert "classification" in data
    assert data["contact_count_5A"] > 0

def test_demo_contains_advanced_fields():
    response = client.get("/demo")
    data = response.json()
    expected_fields = [
        "salt_bridge_count",
        "hbond_like_contact_count",
        "aromatic_contact_count",
        "residue_hotspots",
        "risk_flags",
        "contact_distance_histogram"
    ]
    for field in expected_fields:
        assert field in data
