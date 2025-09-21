import slugify from 'slugify';

/**
 * Generate a vCard 3.0 formatted string
 * @param {Object} contact - Contact information
 * @param {string} contact.name - Full name of the person
 * @param {string} [contact.company] - Company name
 * @param {string} [contact.title] - Job title
 * @param {string} [contact.email] - Email address
 * @param {string} [contact.phone] - Phone number
 * @param {string} [contact.website] - Website URL
 * @returns {string} vCard 3.0 formatted string
 */
export function generateVCard({
  name,
  company = null,
  title = null,
  email = null,
  phone = null,
  website = null
}) {
  if (!name || name.trim() === '') {
    throw new Error('Name is required for vCard generation');
  }

  // Parse name into first and last name
  const nameParts = name.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const vcardLines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${name.trim()}`
  ];

  // Add separate name fields for better compatibility
  if (firstName) {
    vcardLines.push(`N:${lastName};${firstName};;;`);
  }

  if (company && company.trim()) {
    vcardLines.push(`ORG:${company.trim()}`);
  }

  if (title && title.trim()) {
    vcardLines.push(`TITLE:${title.trim()}`);
  }

  if (email && email.trim()) {
    const cleanEmail = email.trim().toLowerCase();
    if (isValidEmail(cleanEmail)) {
      vcardLines.push(`EMAIL:${cleanEmail}`);
    }
  }

  if (phone && phone.trim()) {
    const cleanPhone = cleanPhoneNumber(phone.trim());
    if (cleanPhone) {
      vcardLines.push(`TEL:${cleanPhone}`);
    }
  }

  if (website && website.trim()) {
    const cleanWebsite = cleanWebsiteUrl(website.trim());
    if (cleanWebsite) {
      vcardLines.push(`URL:${cleanWebsite}`);
    }
  }

  vcardLines.push('END:VCARD');

  return vcardLines.join('\n');
}

/**
 * Generate a slugified filename for the vCard
 * @param {string} name - Full name of the person
 * @returns {string} Slugified filename with .vcf extension
 */
export function generateVCardFilename(name) {
  if (!name || name.trim() === '') {
    return 'contact.vcf';
  }

  const slug = slugify(name.trim(), {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });

  return slug ? `${slug}.vcf` : 'contact.vcf';
}

/**
 * Clean and validate phone number
 * @param {string} phone - Raw phone number
 * @returns {string|null} Cleaned phone number or null if invalid
 */
function cleanPhoneNumber(phone) {
  if (!phone) return null;

  // Remove all non-digit characters except + at the start
  let cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Ensure it starts with + or is all digits
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = cleanPhone.replace(/\D/g, '');
  }

  // Basic validation - at least 7 digits
  const digitCount = cleanPhone.replace(/\D/g, '').length;
  if (digitCount < 7) {
    return null;
  }

  return cleanPhone;
}

/**
 * Clean and validate website URL
 * @param {string} website - Raw website URL
 * @returns {string|null} Cleaned website URL or null if invalid
 */
function cleanWebsiteUrl(website) {
  if (!website) return null;

  let cleanWebsite = website.trim();

  // Add protocol if missing
  if (!cleanWebsite.match(/^https?:\/\//i)) {
    cleanWebsite = `https://${cleanWebsite}`;
  }

  // Basic URL validation
  try {
    new URL(cleanWebsite);
    return cleanWebsite;
  } catch {
    return null;
  }
}

/**
 * Validate email address
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Parse vCard content back to contact object
 * @param {string} vcardContent - vCard content string
 * @returns {Object} Parsed contact information
 */
export function parseVCard(vcardContent) {
  const lines = vcardContent.split('\n');
  const contact = {};

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('FN:')) {
      contact.name = trimmedLine.substring(3);
    } else if (trimmedLine.startsWith('ORG:')) {
      contact.company = trimmedLine.substring(4);
    } else if (trimmedLine.startsWith('TITLE:')) {
      contact.title = trimmedLine.substring(6);
    } else if (trimmedLine.startsWith('EMAIL:')) {
      contact.email = trimmedLine.substring(6);
    } else if (trimmedLine.startsWith('TEL:')) {
      contact.phone = trimmedLine.substring(4);
    } else if (trimmedLine.startsWith('URL:')) {
      contact.website = trimmedLine.substring(4);
    }
  }

  return contact;
}
