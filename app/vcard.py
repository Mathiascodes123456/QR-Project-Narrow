"""
vCard 3.0 generation utilities.
"""
from typing import Optional
from slugify import slugify


def generate_vcard(
    name: str,
    company: Optional[str] = None,
    title: Optional[str] = None,
    email: Optional[str] = None,
    phone: Optional[str] = None,
    website: Optional[str] = None
) -> str:
    """
    Generate a vCard 3.0 formatted string.
    
    Args:
        name: Full name of the person
        company: Company name
        title: Job title
        email: Email address
        phone: Phone number
        website: Website URL
        
    Returns:
        vCard 3.0 formatted string
    """
    vcard_lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        f"FN:{name}",
    ]
    
    if company:
        vcard_lines.append(f"ORG:{company}")
    
    if title:
        vcard_lines.append(f"TITLE:{title}")
    
    if email:
        vcard_lines.append(f"EMAIL:{email}")
    
    if phone:
        # Clean phone number - remove non-digit characters except + at start
        clean_phone = phone.strip()
        if not clean_phone.startswith('+'):
            clean_phone = clean_phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
        vcard_lines.append(f"TEL:{clean_phone}")
    
    if website:
        # Ensure website has protocol
        if not website.startswith(('http://', 'https://')):
            website = f"https://{website}"
        vcard_lines.append(f"URL:{website}")
    
    vcard_lines.append("END:VCARD")
    
    return "\n".join(vcard_lines)


def generate_vcard_filename(name: str) -> str:
    """
    Generate a slugified filename for the vCard.
    
    Args:
        name: Full name of the person
        
    Returns:
        Slugified filename with .vcf extension
    """
    slug = slugify(name)
    if not slug:
        slug = "contact"
    return f"{slug}.vcf"
