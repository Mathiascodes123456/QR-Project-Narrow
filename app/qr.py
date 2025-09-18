"""
QR code generation utilities using segno.
"""
import io
from typing import Union
import segno
from fastapi.responses import Response


def generate_qr_code(
    data: str,
    format: str = "png",
    size: int = 10,
    border: int = 4
) -> bytes:
    """
    Generate QR code in the specified format.
    
    Args:
        data: Data to encode in the QR code
        format: Output format (png, svg, eps, pdf)
        size: QR code size multiplier
        border: Border size in modules
        
    Returns:
        QR code as bytes
    """
    qr = segno.make(data)
    
    if format == "png":
        return qr.png_data(scale=size, border=border)
    elif format == "svg":
        return qr.svg_data(scale=size, border=border)
    elif format == "eps":
        return qr.eps_data(scale=size, border=border)
    elif format == "pdf":
        return qr.pdf_data(scale=size, border=border)
    else:
        raise ValueError(f"Unsupported format: {format}")


def get_qr_content_type(format: str) -> str:
    """
    Get the appropriate content type for the QR code format.
    
    Args:
        format: QR code format
        
    Returns:
        MIME content type
    """
    content_types = {
        "png": "image/png",
        "svg": "image/svg+xml",
        "eps": "application/postscript",
        "pdf": "application/pdf"
    }
    return content_types.get(format, "image/png")


def create_qr_response(
    data: str,
    format: str = "png",
    filename: str = "qr_code",
    size: int = 10,
    border: int = 4
) -> Response:
    """
    Create a FastAPI Response with QR code data.
    
    Args:
        data: Data to encode in the QR code
        format: Output format (png, svg, eps, pdf)
        filename: Base filename for download
        size: QR code size multiplier
        border: Border size in modules
        
    Returns:
        FastAPI Response with QR code
    """
    qr_data = generate_qr_code(data, format, size, border)
    content_type = get_qr_content_type(format)
    
    return Response(
        content=qr_data,
        media_type=content_type,
        headers={
            "Content-Disposition": f"attachment; filename=\"{filename}.{format}\""
        }
    )
