"""
FastAPI QR → vCard generator application.
"""
import uuid
import os
import sqlite3
import json
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, Form, Request, HTTPException
from fastapi.responses import HTMLResponse, FileResponse, Response
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pyngrok import ngrok

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

# Add base64 filter to templates
import base64
templates.env.filters["b64encode"] = lambda x: base64.b64encode(x).decode('utf-8') if x else ''

app.mount("/static", StaticFiles(directory="static"), name="static")

# In-memory storage for vCard data (no DB in v1)
vcard_storage = {}

# Global variable to store the public URL
public_url = None

# Initialize database
def init_database():
    """Initialize SQLite database for tracking."""
    conn = sqlite3.connect('qr_tracking.db')
    cursor = conn.cursor()
    
    # Create scans table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vcard_id TEXT NOT NULL,
            scan_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ip_address TEXT,
            user_agent TEXT,
            country TEXT,
            city TEXT,
            latitude REAL,
            longitude REAL,
            referer TEXT,
            device_type TEXT
        )
    ''')
    
    # Create vcards table for reference
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS vcards (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            company TEXT,
            title TEXT,
            email TEXT,
            phone TEXT,
            website TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def log_scan(vcard_id: str, request: Request, location_data: dict = None):
    """Log a scan event to the database."""
    try:
        conn = sqlite3.connect('qr_tracking.db')
        cursor = conn.cursor()
        
        # Get client IP
        ip_address = request.client.host
        if request.headers.get("x-forwarded-for"):
            ip_address = request.headers.get("x-forwarded-for").split(",")[0].strip()
        
        # Get user agent
        user_agent = request.headers.get("user-agent", "")
        
        # Determine device type from user agent
        device_type = "unknown"
        if "Mobile" in user_agent or "Android" in user_agent or "iPhone" in user_agent:
            device_type = "mobile"
        elif "Tablet" in user_agent or "iPad" in user_agent:
            device_type = "tablet"
        elif "Windows" in user_agent or "Macintosh" in user_agent or "Linux" in user_agent:
            device_type = "desktop"
        
        # Insert scan record
        cursor.execute('''
            INSERT INTO scans (vcard_id, ip_address, user_agent, country, city, latitude, longitude, referer, device_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            vcard_id,
            ip_address,
            user_agent,
            location_data.get('country') if location_data else None,
            location_data.get('city') if location_data else None,
            location_data.get('latitude') if location_data else None,
            location_data.get('longitude') if location_data else None,
            request.headers.get("referer"),
            device_type
        ))
        
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error logging scan: {e}")

def get_vcard_from_db(vcard_id: str):
    """Get vCard data from database."""
    try:
        conn = sqlite3.connect('qr_tracking.db')
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, name, company, title, email, phone, website
            FROM vcards 
            WHERE id = ?
        ''', (vcard_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                "id": row[0],
                "name": row[1],
                "company": row[2],
                "title": row[3],
                "email": row[4],
                "phone": row[5],
                "website": row[6]
            }
        return None
    except Exception as e:
        print(f"Error getting vCard from database: {e}")
        return None

def get_scan_stats(vcard_id: str = None):
    """Get scan statistics."""
    try:
        conn = sqlite3.connect('qr_tracking.db')
        cursor = conn.cursor()
        
        if vcard_id:
            # Get stats for specific vCard
            cursor.execute('''
                SELECT 
                    COUNT(*) as total_scans,
                    COUNT(DISTINCT ip_address) as unique_visitors,
                    COUNT(CASE WHEN device_type = 'mobile' THEN 1 END) as mobile_scans,
                    COUNT(CASE WHEN device_type = 'desktop' THEN 1 END) as desktop_scans,
                    COUNT(CASE WHEN device_type = 'tablet' THEN 1 END) as tablet_scans,
                    MIN(scan_time) as first_scan,
                    MAX(scan_time) as last_scan
                FROM scans 
                WHERE vcard_id = ?
            ''', (vcard_id,))
        else:
            # Get global stats
            cursor.execute('''
                SELECT 
                    COUNT(*) as total_scans,
                    COUNT(DISTINCT ip_address) as unique_visitors,
                    COUNT(CASE WHEN device_type = 'mobile' THEN 1 END) as mobile_scans,
                    COUNT(CASE WHEN device_type = 'desktop' THEN 1 END) as desktop_scans,
                    COUNT(CASE WHEN device_type = 'tablet' THEN 1 END) as tablet_scans,
                    MIN(scan_time) as first_scan,
                    MAX(scan_time) as last_scan
                FROM scans
            ''')
        
        stats = cursor.fetchone()
        
        # Get recent scans
        cursor.execute('''
            SELECT scan_time, country, city, device_type, ip_address
            FROM scans 
            WHERE vcard_id = ? OR ? IS NULL
            ORDER BY scan_time DESC 
            LIMIT 10
        ''', (vcard_id, vcard_id))
        
        recent_scans = cursor.fetchall()
        
        conn.close()
        
        return {
            'total_scans': stats[0] or 0,
            'unique_visitors': stats[1] or 0,
            'mobile_scans': stats[2] or 0,
            'desktop_scans': stats[3] or 0,
            'tablet_scans': stats[4] or 0,
            'first_scan': stats[5],
            'last_scan': stats[6],
            'recent_scans': recent_scans
        }
    except Exception as e:
        print(f"Error getting scan stats: {e}")
        return None

def get_base_url(request: Request) -> str:
    """Get the base URL for QR codes, preferring public URL."""
    global public_url
    
    # First check environment variable
    base_url = os.getenv("BASE_URL")
    if base_url:
        return base_url.rstrip('/')
    
    # Then check if we have a public URL from ngrok
    if public_url:
        return public_url
    
    # Fallback to request URL
    return str(request.base_url).rstrip('/')

def setup_public_tunnel():
    """Set up ngrok tunnel for public access."""
    global public_url
    try:
        # Create a public tunnel
        tunnel = ngrok.connect(8000)
        public_url = tunnel.public_url
        print(f"🌐 Public URL created: {public_url}")
        print(f"📱 QR codes will now work for anyone!")
        return public_url
    except Exception as e:
        print(f"❌ Failed to create public tunnel: {e}")
        print("📱 QR codes will only work on local network")
        return None


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
    qr_mode: str = Form("vcard")  # "url" or "vcard" - default to direct vCard
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
    
    
    # Store in database for analytics
    try:
        conn = sqlite3.connect('qr_tracking.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO vcards (id, name, company, title, email, phone, website)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (vcard_id, name, company, title, email, phone, website))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error storing vCard in database: {e}")
    
    # Always use vCard data directly for immediate contact import
    # This ensures all QR codes trigger "Add to Contacts" when scanned
    qr_data = vcard_content
    
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
            "qr_mode": "vcard",  # Always use vcard mode now
            "qr_files": qr_files
        }
    )


@app.get("/scan/{vcard_id}")
async def scan_qr(vcard_id: str, request: Request):
    """
    Download vCard file immediately when QR code is scanned.
    No landing page - direct download trigger.
    """
    # Try to get vCard data from memory first, then database
    if vcard_id in vcard_storage:
        vcard_data = vcard_storage[vcard_id]
        vcard_content = vcard_data["content"]
        filename = vcard_data["filename"]
    else:
        # Try to get from database and regenerate vCard
        db_data = get_vcard_from_db(vcard_id)
        if not db_data:
            raise HTTPException(status_code=404, detail="vCard not found")
        
        # Regenerate vCard content
        vcard_content = generate_vcard(
            name=db_data["name"],
            company=db_data["company"],
            title=db_data["title"],
            email=db_data["email"],
            phone=db_data["phone"],
            website=db_data["website"]
        )
        filename = generate_vcard_filename(db_data["name"])
    
    # Log the scan event
    log_scan(vcard_id, request)
    
    return Response(
        content=vcard_content,
        media_type="text/vcard",
        headers={
            "Content-Disposition": f"attachment; filename=\"{filename}\""
        }
    )


@app.get("/qr/{vcard_id}.{format}")
async def get_qr_code(vcard_id: str, format: str, request: Request):
    """
    Download QR code in the specified format.
    """
    
    # Try to get vCard data from memory first, then database
    if vcard_id in vcard_storage:
        vcard_data = vcard_storage[vcard_id]
        qr_data = vcard_data["content"]
    else:
        # Try to get from database and regenerate vCard
        db_data = get_vcard_from_db(vcard_id)
        if not db_data:
            raise HTTPException(status_code=404, detail="vCard not found")
        
        # Regenerate vCard content
        vcard_content = generate_vcard(
            name=db_data["name"],
            company=db_data["company"],
            title=db_data["title"],
            email=db_data["email"],
            phone=db_data["phone"],
            website=db_data["website"]
        )
        qr_data = vcard_content
    
    # Get name for filename
    if vcard_id in vcard_storage:
        name = vcard_storage[vcard_id]["name"]
    else:
        name = db_data["name"]
    
    return create_qr_response(
        data=qr_data,
        format=format,
        filename=f"qr_{name.replace(' ', '_')}"
    )


@app.get("/vcard/{vcard_id}")
async def get_vcard(vcard_id: str):
    """
    Download vCard file directly.
    """
    # Try to get vCard data from memory first, then database
    if vcard_id in vcard_storage:
        vcard_data = vcard_storage[vcard_id]
        vcard_content = vcard_data["content"]
        filename = vcard_data["filename"]
    else:
        # Try to get from database and regenerate vCard
        db_data = get_vcard_from_db(vcard_id)
        if not db_data:
            raise HTTPException(status_code=404, detail="vCard not found")
        
        # Regenerate vCard content
        vcard_content = generate_vcard(
            name=db_data["name"],
            company=db_data["company"],
            title=db_data["title"],
            email=db_data["email"],
            phone=db_data["phone"],
            website=db_data["website"]
        )
        filename = generate_vcard_filename(db_data["name"])
    
    return Response(
        content=vcard_content,
        media_type="text/vcard",
        headers={
            "Content-Disposition": f"attachment; filename=\"{filename}\""
        }
    )


@app.get("/analytics/{vcard_id}")
async def get_vcard_analytics(vcard_id: str):
    """Get analytics for a specific vCard."""
    if vcard_id not in vcard_storage:
        raise HTTPException(status_code=404, detail="vCard not found")
    
    stats = get_scan_stats(vcard_id)
    if not stats:
        raise HTTPException(status_code=500, detail="Failed to retrieve analytics")
    
    return {
        "vcard_id": vcard_id,
        "vcard_name": vcard_storage[vcard_id]["name"],
        "analytics": stats
    }

@app.get("/analytics")
async def get_global_analytics():
    """Get global analytics for all vCards."""
    stats = get_scan_stats()
    if not stats:
        raise HTTPException(status_code=500, detail="Failed to retrieve analytics")
    
    return {
        "analytics": stats
    }

@app.get("/dashboard")
async def analytics_dashboard(request: Request):
    """Global analytics dashboard page."""
    stats = get_scan_stats()
    return templates.TemplateResponse(
        "dashboard.html",
        {
            "request": request,
            "stats": stats or {},
            "is_global": True
        }
    )

@app.get("/dashboard/{vcard_id}")
async def personal_analytics_dashboard(vcard_id: str, request: Request):
    """Personal analytics dashboard for a specific vCard."""
    # Check if vCard exists
    vcard_exists = (vcard_id in vcard_storage or get_vcard_from_db(vcard_id) is not None)
    
    if not vcard_exists:
        raise HTTPException(status_code=404, detail="vCard not found")
    
    stats = get_scan_stats(vcard_id)
    return templates.TemplateResponse(
        "dashboard.html",
        {
            "request": request,
            "stats": stats or {},
            "vcard_id": vcard_id,
            "is_global": False
        }
    )

@app.post("/track/{vcard_id}")
async def track_scan_with_location(vcard_id: str, request: Request):
    """Track a scan with location data from client."""
    # Check if vCard exists in memory or database
    vcard_exists = (vcard_id in vcard_storage or get_vcard_from_db(vcard_id) is not None)
    
    if not vcard_exists:
        raise HTTPException(status_code=404, detail="vCard not found")
    
    # Get location data from request body
    try:
        body = await request.json()
        location_data = body.get('location', {})
    except:
        location_data = {}
    
    # Log the scan with location data
    log_scan(vcard_id, request, location_data)
    
    return {"status": "tracked"}

@app.on_event("startup")
async def startup_event():
    """Set up public tunnel and database on startup."""
    init_database()
    setup_public_tunnel()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
