"""
Tests for QR code generation functionality.
"""
import pytest
from app.qr import generate_qr_code, get_qr_content_type, create_qr_response


def test_generate_qr_code_png():
    """Test PNG QR code generation."""
    qr_data = generate_qr_code("test data", "png")
    assert isinstance(qr_data, bytes)
    assert len(qr_data) > 0


def test_generate_qr_code_svg():
    """Test SVG QR code generation."""
    qr_data = generate_qr_code("test data", "svg")
    assert isinstance(qr_data, bytes)
    assert len(qr_data) > 0
    # SVG should contain XML declaration
    assert b"<?xml" in qr_data


def test_generate_qr_code_eps():
    """Test EPS QR code generation."""
    qr_data = generate_qr_code("test data", "eps")
    assert isinstance(qr_data, bytes)
    assert len(qr_data) > 0


def test_generate_qr_code_pdf():
    """Test PDF QR code generation."""
    qr_data = generate_qr_code("test data", "pdf")
    assert isinstance(qr_data, bytes)
    assert len(qr_data) > 0


def test_generate_qr_code_invalid_format():
    """Test error handling for invalid format."""
    with pytest.raises(ValueError):
        generate_qr_code("test data", "invalid")


def test_get_qr_content_type():
    """Test content type mapping."""
    assert get_qr_content_type("png") == "image/png"
    assert get_qr_content_type("svg") == "image/svg+xml"
    assert get_qr_content_type("eps") == "application/postscript"
    assert get_qr_content_type("pdf") == "application/pdf"
    assert get_qr_content_type("unknown") == "image/png"


def test_create_qr_response():
    """Test QR response creation."""
    response = create_qr_response("test data", "png", "test_qr")
    
    assert response.media_type == "image/png"
    assert "attachment; filename=\"test_qr.png\"" in response.headers["Content-Disposition"]
    assert len(response.body) > 0
