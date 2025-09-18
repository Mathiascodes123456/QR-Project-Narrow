"""
FastAPI QR → vCard generator application.
"""
import uuid
from typing import Optional
from fastapi import FastAPI, Form, Request, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import os

from .vcard import generate_vcard, generate_vcard_filename
from .qr import create_qr_response, generate_qr_code

# Initialize FastAPI app
app = FastAPI(
    title="QR → vCard Generator",
    description="Generate QR codes that directly download vCard files",
    version="1.0.0"
)

# Setup templates and static files
templates = Jinja2Templates(directory="app/templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# In-memory storage for vCard data (no DB in v1)
vcard_storage = {}


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Home page with the form."""
    return templates.TemplateResponse("form.html", {"request": request})


@app.post("/generate", response_class=HTMLResponse)
async def generate_vcard_and_qr(
    request: Request,
    name: str = Form(...),
    company: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    website: Optional[str] = Form(None),
    qr_mode: str = Form("url")  # "url" or "vcard"
):
    """
    Generate vCard and QR code, return success page with download links.
    """
    # Generate vCard content
    vcard_content = generate_vcard(
        name=name,
        company=company,
        title=title,
        email=email,
        phone=phone,
        website=website
    )
    
    # Generate unique ID for this vCard
    vcard_id = str(uuid.uuid4())
    vcard_storage[vcard_id] = {
        "content": vcard_content,
        "filename": generate_vcard_filename(name),
        "name": name
    }
    
    # Generate QR code data based on mode
    if qr_mode == "vcard":
        # QR code contains the vCard text directly
        qr_data = vcard_content
    else:
        # QR code contains URL that downloads the vCard
        base_url = str(request.base_url).rstrip('/')
        qr_data = f"{base_url}/scan/{vcard_id}"
    
    # Generate QR codes in all formats
    qr_formats = ["png", "svg", "eps", "pdf"]
    qr_files = {}
    
    for fmt in qr_formats:
        try:
            qr_bytes = generate_qr_code(qr_data, fmt)
            qr_files[fmt] = qr_bytes
        except Exception as e:
            print(f"Error generating {fmt} QR code: {e}")
            qr_files[fmt] = None
    
    return templates.TemplateResponse(
        "success.html",
        {
            "request": request,
            "vcard_id": vcard_id,
            "vcard_filename": generate_vcard_filename(name),
            "name": name,
            "qr_mode": qr_mode,
            "qr_files": qr_files
        }
    )


@app.get("/scan/{vcard_id}")
async def scan_qr(vcard_id: str):
    """
    Download vCard file immediately when QR code is scanned.
    No landing page - direct download trigger.
    """
    if vcard_id not in vcard_storage:
        raise HTTPException(status_code=404, detail="vCard not found")
    
    vcard_data = vcard_storage[vcard_id]
    
    return Response(
        content=vcard_data["content"],
        media_type="text/vcard",
        headers={
            "Content-Disposition": f"attachment; filename=\"{vcard_data['filename']}\""
        }
    )


@app.get("/qr/{vcard_id}.{format}")
async def get_qr_code(vcard_id: str, format: str):
    """
    Download QR code in the specified format.
    """
    if vcard_id not in vcard_storage:
        raise HTTPException(status_code=404, detail="vCard not found")
    
    vcard_data = vcard_storage[vcard_id]
    
    # Generate QR code data (URL mode for this endpoint)
    base_url = "http://localhost:8000"  # In production, use actual domain
    qr_data = f"{base_url}/scan/{vcard_id}"
    
    return create_qr_response(
        data=qr_data,
        format=format,
        filename=f"qr_{vcard_data['name'].replace(' ', '_')}"
    )


@app.get("/vcard/{vcard_id}")
async def get_vcard(vcard_id: str):
    """
    Download vCard file directly.
    """
    if vcard_id not in vcard_storage:
        raise HTTPException(status_code=404, detail="vCard not found")
    
    vcard_data = vcard_storage[vcard_id]
    
    return Response(
        content=vcard_data["content"],
        media_type="text/vcard",
        headers={
            "Content-Disposition": f"attachment; filename=\"{vcard_data['filename']}\""
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
