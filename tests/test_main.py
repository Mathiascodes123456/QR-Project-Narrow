"""
Tests for FastAPI main application.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_home_page():
    """Test home page loads correctly."""
    response = client.get("/")
    assert response.status_code == 200
    assert "QR → vCard Generator" in response.text


def test_generate_vcard_and_qr():
    """Test vCard and QR generation endpoint."""
    response = client.post(
        "/generate",
        data={
            "name": "John Doe",
            "company": "Test Corp",
            "title": "Engineer",
            "email": "john@test.com",
            "phone": "555-123-4567",
            "website": "https://test.com",
            "qr_mode": "url"
        }
    )
    
    assert response.status_code == 200
    assert "QR Code Generated Successfully!" in response.text
    assert "john-doe.vcf" in response.text


def test_scan_qr_endpoint():
    """Test QR scan endpoint returns vCard with correct headers."""
    # First generate a vCard
    generate_response = client.post(
        "/generate",
        data={
            "name": "Jane Smith",
            "email": "jane@test.com",
            "qr_mode": "url"
        }
    )
    assert generate_response.status_code == 200
    
    # Extract vcard_id from the response (this is a simplified test)
    # In a real test, you'd parse the HTML or use a different approach
    # For now, we'll test with a mock ID
    vcard_id = "test-id-123"
    
    # Mock the storage for testing
    from app.main import vcard_storage
    vcard_storage[vcard_id] = {
        "content": "BEGIN:VCARD\nVERSION:3.0\nFN:Jane Smith\nEMAIL:jane@test.com\nEND:VCARD",
        "filename": "jane-smith.vcf",
        "name": "Jane Smith"
    }
    
    response = client.get(f"/scan/{vcard_id}")
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/vcard"
    assert "attachment; filename=\"jane-smith.vcf\"" in response.headers["content-disposition"]
    assert "BEGIN:VCARD" in response.text


def test_scan_qr_not_found():
    """Test QR scan endpoint with non-existent ID."""
    response = client.get("/scan/non-existent-id")
    assert response.status_code == 404


def test_get_qr_code_png():
    """Test QR code download in PNG format."""
    # Mock storage
    from app.main import vcard_storage
    vcard_id = "test-qr-id"
    vcard_storage[vcard_id] = {
        "content": "BEGIN:VCARD\nVERSION:3.0\nFN:Test User\nEND:VCARD",
        "filename": "test-user.vcf",
        "name": "Test User"
    }
    
    response = client.get(f"/qr/{vcard_id}.png")
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert "attachment" in response.headers["content-disposition"]


def test_get_qr_code_svg():
    """Test QR code download in SVG format."""
    from app.main import vcard_storage
    vcard_id = "test-svg-id"
    vcard_storage[vcard_id] = {
        "content": "BEGIN:VCARD\nVERSION:3.0\nFN:Test User\nEND:VCARD",
        "filename": "test-user.vcf",
        "name": "Test User"
    }
    
    response = client.get(f"/qr/{vcard_id}.svg")
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/svg+xml"


def test_get_vcard_direct():
    """Test direct vCard download."""
    from app.main import vcard_storage
    vcard_id = "test-vcard-id"
    vcard_storage[vcard_id] = {
        "content": "BEGIN:VCARD\nVERSION:3.0\nFN:Direct Test\nEND:VCARD",
        "filename": "direct-test.vcf",
        "name": "Direct Test"
    }
    
    response = client.get(f"/vcard/{vcard_id}")
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/vcard"
    assert "attachment; filename=\"direct-test.vcf\"" in response.headers["content-disposition"]


def test_generate_with_vcard_mode():
    """Test generation with direct vCard mode."""
    response = client.post(
        "/generate",
        data={
            "name": "Direct Mode Test",
            "email": "direct@test.com",
            "qr_mode": "vcard"
        }
    )
    
    assert response.status_code == 200
    assert "Direct Mode" in response.text
