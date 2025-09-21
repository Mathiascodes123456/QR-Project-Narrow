import express from 'express';
import { generateQRCode, getQRContentType } from '../utils/qr.js';
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
