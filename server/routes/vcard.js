import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateVCard, generateVCardFilename } from '../utils/vcard.js';
import { generateMultipleFormats } from '../utils/qr.js';
import { getDatabase } from '../database/init.js';
import { promisify } from 'util';

const router = express.Router();

// Promisify database methods
const db = getDatabase();
const run = promisify(db.run.bind(db));
const get = promisify(db.get.bind(db));

/**
 * POST /api/vcard/generate
 * Generate vCard and QR codes
 */
router.post('/generate', async (req, res) => {
  try {
    const { name, company, title, email, phone, website } = req.body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({
        error: 'Name is required',
        field: 'name'
      });
    }

    // Generate vCard content
    const vcardContent = generateVCard({
      name: name.trim(),
      company: company?.trim(),
      title: title?.trim(),
      email: email?.trim(),
      phone: phone?.trim(),
      website: website?.trim()
    });

    // Generate unique ID for this vCard
    const vcardId = uuidv4();
    const vcardFilename = generateVCardFilename(name.trim());

    // Store vCard in database
    try {
      await run(`
        INSERT OR REPLACE INTO vcards (id, name, company, title, email, phone, website, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [vcardId, name.trim(), company?.trim(), title?.trim(), email?.trim(), phone?.trim(), website?.trim()]);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        error: 'Failed to save vCard to database'
      });
    }

    // Generate QR codes in multiple formats
    const qrFormats = ['png', 'svg', 'eps', 'pdf'];
    let qrFiles = {};

    try {
      qrFiles = await generateMultipleFormats(vcardContent, qrFormats, {
        width: 300,
        margin: 4,
        errorCorrectionLevel: 'M'
      });
    } catch (qrError) {
      console.error('QR generation error:', qrError);
      return res.status(500).json({
        error: 'Failed to generate QR codes'
      });
    }

    // Convert QR files to base64 for frontend
    const qrFilesBase64 = {};
    for (const [format, data] of Object.entries(qrFiles)) {
      if (data) {
        if (format === 'svg' || format === 'eps') {
          qrFilesBase64[format] = Buffer.from(data).toString('base64');
        } else {
          qrFilesBase64[format] = data.toString('base64');
        }
      }
    }

    res.json({
      success: true,
      vcardId,
      vcardFilename,
      vcardContent,
      qrFiles: qrFilesBase64,
      contact: {
        name: name.trim(),
        company: company?.trim(),
        title: title?.trim(),
        email: email?.trim(),
        phone: phone?.trim(),
        website: website?.trim()
      }
    });

  } catch (error) {
    console.error('Error generating vCard:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

/**
 * GET /api/vcard/:id
 * Get vCard by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const vcard = await get(`
      SELECT id, name, company, title, email, phone, website, created_at, updated_at
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

    // Generate QR codes for display
    console.log('Generating QR codes for vCard:', vcard.id);
    let qrFiles = {};
    try {
      const qrData = await generateMultipleFormats(vcardContent, ['png', 'svg', 'eps', 'pdf'], {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Convert buffers to base64 strings for frontend display
      qrFiles = {};
      for (const [format, data] of Object.entries(qrData)) {
        if (data) {
          if (format === 'svg') {
            // SVG is already a string
            qrFiles[format] = data;
          } else {
            // Convert Buffer to base64 string
            qrFiles[format] = data.toString('base64');
          }
        }
      }
      
      console.log('QR codes generated successfully:', Object.keys(qrFiles));
    } catch (error) {
      console.error('Error generating QR codes:', error);
      qrFiles = {};
    }

    res.json({
      success: true,
      vcard: {
        id: vcard.id,
        name: vcard.name,
        company: vcard.company,
        title: vcard.title,
        email: vcard.email,
        phone: vcard.phone,
        website: vcard.website,
        createdAt: vcard.created_at,
        updatedAt: vcard.updated_at
      },
      vcardContent,
      vcardFilename: generateVCardFilename(vcard.name),
      qrFiles
    });

  } catch (error) {
    console.error('Error getting vCard:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

/**
 * GET /api/vcard/:id/download
 * Download vCard file
 */
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;

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

    const filename = generateVCardFilename(vcard.name);

    res.setHeader('Content-Type', 'text/vcard');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(vcardContent);

  } catch (error) {
    console.error('Error downloading vCard:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

/**
 * PUT /api/vcard/:id
 * Update vCard
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, company, title, email, phone, website } = req.body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({
        error: 'Name is required',
        field: 'name'
      });
    }

    // Check if vCard exists
    const existingVcard = await get(`
      SELECT id FROM vcards WHERE id = ?
    `, [id]);

    if (!existingVcard) {
      return res.status(404).json({
        error: 'vCard not found'
      });
    }

    // Update vCard in database
    await run(`
      UPDATE vcards 
      SET name = ?, company = ?, title = ?, email = ?, phone = ?, website = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name.trim(), company?.trim(), title?.trim(), email?.trim(), phone?.trim(), website?.trim(), id]);

    // Generate updated vCard content
    const vcardContent = generateVCard({
      name: name.trim(),
      company: company?.trim(),
      title: title?.trim(),
      email: email?.trim(),
      phone: phone?.trim(),
      website: website?.trim()
    });

    res.json({
      success: true,
      vcardId: id,
      vcardContent,
      contact: {
        name: name.trim(),
        company: company?.trim(),
        title: title?.trim(),
        email: email?.trim(),
        phone: phone?.trim(),
        website: website?.trim()
      }
    });

  } catch (error) {
    console.error('Error updating vCard:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

/**
 * DELETE /api/vcard/:id
 * Delete vCard
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vCard exists
    const existingVcard = await get(`
      SELECT id FROM vcards WHERE id = ?
    `, [id]);

    if (!existingVcard) {
      return res.status(404).json({
        error: 'vCard not found'
      });
    }

    // Delete vCard and related scans
    await run(`DELETE FROM scans WHERE vcard_id = ?`, [id]);
    await run(`DELETE FROM vcards WHERE id = ?`, [id]);

    res.json({
      success: true,
      message: 'vCard deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting vCard:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

export default router;
