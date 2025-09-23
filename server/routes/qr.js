import express from 'express';
import { generateQRCode, getQRContentType, generateCustomQRCode } from '../utils/qr.js';
import { generateVCard } from '../utils/vcard.js';
import { getDatabase } from '../database/init.js';
import { promisify } from 'util';

const router = express.Router();

// Promisify database methods
const db = getDatabase();
const get = promisify(db.get.bind(db));

/**
 * GET /api/qr/:id/:format
 * Download QR code in specified format
 */
router.get('/:id/:format', async (req, res) => {
  try {
    const { id, format } = req.params;
    const { size = 10, border = 4 } = req.query;

    // Validate format
    const validFormats = ['png', 'svg', 'eps', 'pdf'];
    if (!validFormats.includes(format.toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid format',
        validFormats
      });
    }

    // Get vCard data from database
    const vcard = await get(`
      SELECT id, name, company, title, email, phone, website
      FROM vcards 
      WHERE id = ?
    `, [id]);

    if (!vcard) {
      return res.status(404).json({
        error: 'vCard not found'
      });
    }

    // Generate vCard content
    const vcardContent = generateVCard({
      name: vcard.name,
      company: vcard.company,
      title: vcard.title,
      email: vcard.email,
      phone: vcard.phone,
      website: vcard.website
    });

    // Generate QR code
    const qrOptions = {
      width: parseInt(size) * 30, // Convert size multiplier to pixels
      margin: parseInt(border),
      errorCorrectionLevel: 'M'
    };

    const qrData = await generateQRCode(vcardContent, format.toLowerCase(), qrOptions);
    const contentType = getQRContentType(format.toLowerCase());
    const filename = `qr_${vcard.name.replace(/\s+/g, '_')}.${format}`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(qrData);

  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

/**
 * GET /api/qr/:id/:format/data
 * Get QR code as data URL
 */
router.get('/:id/:format/data', async (req, res) => {
  try {
    const { id, format } = req.params;
    const { size = 10, border = 4 } = req.query;

    // Validate format
    const validFormats = ['png', 'svg'];
    if (!validFormats.includes(format.toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid format for data URL',
        validFormats
      });
    }

    // Get vCard data from database
    const vcard = await get(`
      SELECT id, name, company, title, email, phone, website
      FROM vcards 
      WHERE id = ?
    `, [id]);

    if (!vcard) {
      return res.status(404).json({
        error: 'vCard not found'
      });
    }

    // Generate vCard content
    const vcardContent = generateVCard({
      name: vcard.name,
      company: vcard.company,
      title: vcard.title,
      email: vcard.email,
      phone: vcard.phone,
      website: vcard.website
    });

    // Generate QR code as data URL
    const qrOptions = {
      width: parseInt(size) * 30,
      margin: parseInt(border),
      errorCorrectionLevel: 'M'
    };

    let dataUrl;
    if (format.toLowerCase() === 'png') {
      const qrBuffer = await generateQRCode(vcardContent, 'png', qrOptions);
      dataUrl = `data:image/png;base64,${qrBuffer.toString('base64')}`;
    } else {
      const qrSvg = await generateQRCode(vcardContent, 'svg', qrOptions);
      dataUrl = `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString('base64')}`;
    }

    res.json({
      success: true,
      dataUrl,
      format: format.toLowerCase(),
      vcardId: id
    });

  } catch (error) {
    console.error('Error generating QR code data URL:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

/**
 * POST /api/qr/generate
 * Generate QR code from custom data
 */
router.post('/generate', async (req, res) => {
  try {
    const { data, format = 'png', size = 10, border = 4, errorCorrectionLevel = 'M' } = req.body;

    if (!data || data.trim() === '') {
      return res.status(400).json({
        error: 'Data is required for QR code generation'
      });
    }

    // Validate format
    const validFormats = ['png', 'svg', 'eps', 'pdf'];
    if (!validFormats.includes(format.toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid format',
        validFormats
      });
    }

    // Generate QR code
    const qrOptions = {
      width: parseInt(size) * 30,
      margin: parseInt(border),
      errorCorrectionLevel: errorCorrectionLevel.toUpperCase()
    };

    const qrData = await generateQRCode(data.trim(), format.toLowerCase(), qrOptions);
    const contentType = getQRContentType(format.toLowerCase());
    const filename = `qr_code.${format}`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(qrData);

  } catch (error) {
    console.error('Error generating custom QR code:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

/**
 * POST /api/qr/custom
 * Generate QR code with advanced customization
 */
router.post('/custom', async (req, res) => {
  try {
    const { 
      data, 
      customOptions = {},
      format = 'png'
    } = req.body;

    if (!data || data.trim() === '') {
      return res.status(400).json({
        error: 'Data is required for QR code generation'
      });
    }

    // Validate format
    const validFormats = ['png', 'svg'];
    if (!validFormats.includes(format.toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid format for custom QR code',
        validFormats
      });
    }

    // Generate custom QR code
    const qrData = await generateCustomQRCode(data.trim(), customOptions);
    const contentType = getQRContentType(format.toLowerCase());
    const filename = `custom_qr_code.${format}`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(qrData);

  } catch (error) {
    console.error('Error generating custom QR code:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

/**
 * POST /api/qr/custom/data
 * Generate custom QR code as data URL
 */
router.post('/custom/data', async (req, res) => {
  try {
    const { 
      data, 
      customOptions = {}
    } = req.body;

    if (!data || data.trim() === '') {
      return res.status(400).json({
        error: 'Data is required for QR code generation'
      });
    }

    // Generate custom QR code
    const qrData = await generateCustomQRCode(data.trim(), customOptions);
    const dataUrl = `data:image/png;base64,${qrData.toString('base64')}`;

    res.json({
      success: true,
      dataUrl,
      format: 'png'
    });

  } catch (error) {
    console.error('Error generating custom QR code data URL:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

/**
 * GET /api/qr/templates
 * Get available QR code templates and presets
 */
router.get('/templates', (req, res) => {
  const templates = [
    {
      id: 'classic',
      name: 'Classic',
      description: 'Traditional black and white QR code',
      preview: '/api/qr/templates/classic/preview',
      options: {
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF',
        width: 300,
        margin: 4,
        errorCorrectionLevel: 'M'
      }
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Blue theme with modern styling',
      preview: '/api/qr/templates/modern/preview',
      options: {
        foregroundColor: '#2563eb',
        backgroundColor: '#f8fafc',
        width: 350,
        margin: 6,
        errorCorrectionLevel: 'M'
      }
    },
    {
      id: 'colorful',
      name: 'Colorful',
      description: 'Vibrant purple and yellow colors',
      preview: '/api/qr/templates/colorful/preview',
      options: {
        foregroundColor: '#7c3aed',
        backgroundColor: '#fef3c7',
        width: 300,
        margin: 4,
        errorCorrectionLevel: 'M'
      }
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Clean design with subtle colors',
      preview: '/api/qr/templates/minimal/preview',
      options: {
        foregroundColor: '#374151',
        backgroundColor: '#ffffff',
        width: 300,
        margin: 4,
        errorCorrectionLevel: 'M'
      }
    },
    {
      id: 'corporate',
      name: 'Corporate',
      description: 'Professional look for business use',
      preview: '/api/qr/templates/corporate/preview',
      options: {
        foregroundColor: '#1f2937',
        backgroundColor: '#ffffff',
        width: 400,
        margin: 8,
        errorCorrectionLevel: 'H'
      }
    },
    {
      id: 'high-contrast',
      name: 'High Contrast',
      description: 'Maximum readability with high contrast',
      preview: '/api/qr/templates/high-contrast/preview',
      options: {
        foregroundColor: '#000000',
        backgroundColor: '#ffffff',
        width: 500,
        margin: 10,
        errorCorrectionLevel: 'H'
      }
    }
  ];

  res.json({
    success: true,
    templates
  });
});

/**
 * GET /api/qr/:id/scan
 * Handle QR code scan (direct vCard download)
 */
router.get('/:id/scan', async (req, res) => {
  try {
    const { id } = req.params;

    // Get vCard data from database
    const vcard = await get(`
      SELECT id, name, company, title, email, phone, website
      FROM vcards 
      WHERE id = ?
    `, [id]);

    if (!vcard) {
      return res.status(404).json({
        error: 'vCard not found'
      });
    }

    // Generate vCard content
    const vcardContent = generateVCard({
      name: vcard.name,
      company: vcard.company,
      title: vcard.title,
      email: vcard.email,
      phone: vcard.phone,
      website: vcard.website
    });

    const filename = `${vcard.name.replace(/\s+/g, '_')}.vcf`;

    // Set headers for direct vCard download
    res.setHeader('Content-Type', 'text/vcard');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.send(vcardContent);

  } catch (error) {
    console.error('Error handling QR scan:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

export default router;
