import { generateVCard, generateVCardFilename } from '../server/utils/vcard.js'

describe('vCard Generation', () => {
  test('should generate valid vCard with all fields', () => {
    const contact = {
      name: 'John Doe',
      company: 'Acme Corp',
      title: 'Software Engineer',
      email: 'john@acme.com',
      phone: '+1-555-123-4567',
      website: 'https://acme.com'
    }

    const vcard = generateVCard(contact)
    
    expect(vcard).toContain('BEGIN:VCARD')
    expect(vcard).toContain('VERSION:3.0')
    expect(vcard).toContain('FN:John Doe')
    expect(vcard).toContain('ORG:Acme Corp')
    expect(vcard).toContain('TITLE:Software Engineer')
    expect(vcard).toContain('EMAIL:john@acme.com')
    expect(vcard).toContain('TEL:+15551234567')
    expect(vcard).toContain('URL:https://acme.com')
    expect(vcard).toContain('END:VCARD')
  })

  test('should generate vCard with only required fields', () => {
    const contact = {
      name: 'Jane Smith'
    }

    const vcard = generateVCard(contact)
    
    expect(vcard).toContain('BEGIN:VCARD')
    expect(vcard).toContain('VERSION:3.0')
    expect(vcard).toContain('FN:Jane Smith')
    expect(vcard).toContain('END:VCARD')
    expect(vcard).not.toContain('ORG:')
    expect(vcard).not.toContain('EMAIL:')
  })

  test('should throw error for missing name', () => {
    const contact = {
      company: 'Acme Corp'
    }

    expect(() => generateVCard(contact)).toThrow('Name is required')
  })

  test('should generate valid filename', () => {
    expect(generateVCardFilename('John Doe')).toBe('john-doe.vcf')
    expect(generateVCardFilename('Jane Smith-Jones')).toBe('jane-smith-jones.vcf')
    expect(generateVCardFilename('')).toBe('contact.vcf')
    expect(generateVCardFilename('   ')).toBe('contact.vcf')
  })

  test('should clean phone numbers', () => {
    const contact = {
      name: 'Test User',
      phone: '+1 (555) 123-4567'
    }

    const vcard = generateVCard(contact)
    expect(vcard).toContain('TEL:+15551234567')
  })

  test('should add protocol to website URLs', () => {
    const contact = {
      name: 'Test User',
      website: 'example.com'
    }

    const vcard = generateVCard(contact)
    expect(vcard).toContain('URL:https://example.com')
  })
})
