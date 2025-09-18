"""
Tests for vCard generation functionality.
"""
import pytest
from app.vcard import generate_vcard, generate_vcard_filename


def test_generate_vcard_minimal():
    """Test vCard generation with only required fields."""
    vcard = generate_vcard(name="John Doe")
    
    assert "BEGIN:VCARD" in vcard
    assert "VERSION:3.0" in vcard
    assert "FN:John Doe" in vcard
    assert "END:VCARD" in vcard


def test_generate_vcard_complete():
    """Test vCard generation with all fields."""
    vcard = generate_vcard(
        name="Jane Smith",
        company="Acme Corp",
        title="Software Engineer",
        email="jane@acme.com",
        phone="+1-555-123-4567",
        website="https://acme.com"
    )
    
    assert "FN:Jane Smith" in vcard
    assert "ORG:Acme Corp" in vcard
    assert "TITLE:Software Engineer" in vcard
    assert "EMAIL:jane@acme.com" in vcard
    assert "TEL:+1-555-123-4567" in vcard
    assert "URL:https://acme.com" in vcard


def test_generate_vcard_website_protocol():
    """Test that website gets https protocol if missing."""
    vcard = generate_vcard(
        name="Test User",
        website="example.com"
    )
    
    assert "URL:https://example.com" in vcard


def test_generate_vcard_phone_cleaning():
    """Test phone number cleaning."""
    vcard = generate_vcard(
        name="Test User",
        phone="(555) 123-4567"
    )
    
    assert "TEL:5551234567" in vcard


def test_generate_vcard_filename():
    """Test filename generation."""
    filename = generate_vcard_filename("John Doe")
    assert filename == "john-doe.vcf"
    
    filename = generate_vcard_filename("Jane O'Connor-Smith")
    assert filename == "jane-o-connor-smith.vcf"
    
    filename = generate_vcard_filename("")
    assert filename == "contact.vcf"
