import express from 'express';
import { getDatabase } from '../database/init.js';
import { promisify } from 'util';

const router = express.Router();

// Promisify database methods
const db = getDatabase();
const all = promisify(db.all.bind(db));
const get = promisify(db.get.bind(db));
const run = promisify(db.run.bind(db));

/**
 * POST /api/analytics/track
 * Track a general analytics event
 */
router.post('/track', async (req, res) => {
  try {
    const { action, customOptions, timestamp } = req.body;

    // Get client IP
    const ipAddress = req.ip || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                     req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                     'unknown';

    // Get user agent
    const userAgent = req.headers['user-agent'] || '';

    // Determine device type from user agent
    let deviceType = 'unknown';
    if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/Tablet|iPad|PlayBook|Silk/i.test(userAgent)) {
      deviceType = 'tablet';
    } else if (/Windows|Macintosh|Linux|X11/i.test(userAgent)) {
      deviceType = 'desktop';
    }

    // Log the event
    await run(`
      INSERT INTO scans (vcard_id, ip_address, user_agent, device_type, action, scan_time)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      'custom_qr', // Use a special ID for custom QR events
      ipAddress,
      userAgent,
      deviceType,
      action,
      timestamp || new Date().toISOString()
    ]);

    res.json({
      success: true,
      message: 'Event tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

/**
 * POST /api/analytics/track/:vcardId
 * Track a scan event
 */
router.post('/track/:vcardId', async (req, res) => {
  try {
    const { vcardId } = req.params;
    const { location, action = 'scan' } = req.body;

    // Get client IP
    const ipAddress = req.ip || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                     req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                     'unknown';

    // Get user agent
    const userAgent = req.headers['user-agent'] || '';

    // Determine device type from user agent
    let deviceType = 'unknown';
    if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/Tablet|iPad|PlayBook|Silk/i.test(userAgent)) {
      deviceType = 'tablet';
    } else if (/Windows|Macintosh|Linux|X11/i.test(userAgent)) {
      deviceType = 'desktop';
    }

    // Log the scan event
    await run(`
      INSERT INTO scans (vcard_id, ip_address, user_agent, country, city, latitude, longitude, referer, device_type, action)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      vcardId,
      ipAddress,
      userAgent,
      location?.country || null,
      location?.city || null,
      location?.latitude || null,
      location?.longitude || null,
      req.headers.referer || null,
      deviceType,
      action
    ]);

    res.json({
      success: true,
      message: 'Scan tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking scan:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

/**
 * GET /api/analytics/:vcardId
 * Get analytics for a specific vCard
 */
router.get('/:vcardId', async (req, res) => {
  try {
    const { vcardId } = req.params;

    // Check if vCard exists
    const vcard = await get(`
      SELECT id, name FROM vcards WHERE id = ?
    `, [vcardId]);

    if (!vcard) {
      return res.status(404).json({
        error: 'vCard not found'
      });
    }

    // Get scan statistics
    const stats = await get(`
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
    `, [vcardId]);

    // Get recent scans
    const recentScans = await all(`
      SELECT scan_time, country, city, device_type, ip_address, action
      FROM scans 
      WHERE vcard_id = ?
      ORDER BY scan_time DESC 
      LIMIT 10
    `, [vcardId]);

    // Get daily scan counts for the last 7 days
    const dailyScans = await all(`
      SELECT 
        DATE(scan_time) as date,
        COUNT(*) as count
      FROM scans 
      WHERE vcard_id = ? 
        AND scan_time >= datetime('now', '-7 days')
      GROUP BY DATE(scan_time)
      ORDER BY date DESC
    `, [vcardId]);

    res.json({
      success: true,
      vcardId,
      vcardName: vcard.name,
      analytics: {
        totalScans: stats.total_scans || 0,
        uniqueVisitors: stats.unique_visitors || 0,
        mobileScans: stats.mobile_scans || 0,
        desktopScans: stats.desktop_scans || 0,
        tabletScans: stats.tablet_scans || 0,
        firstScan: stats.first_scan,
        lastScan: stats.last_scan,
        recentScans: recentScans,
        dailyScans: dailyScans
      }
    });

  } catch (error) {
    console.error('Error getting vCard analytics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

/**
 * GET /api/analytics
 * Get global analytics for all vCards
 */
router.get('/', async (req, res) => {
  try {
    // Get global scan statistics
    const stats = await get(`
      SELECT 
        COUNT(*) as total_scans,
        COUNT(DISTINCT ip_address) as unique_visitors,
        COUNT(CASE WHEN device_type = 'mobile' THEN 1 END) as mobile_scans,
        COUNT(CASE WHEN device_type = 'desktop' THEN 1 END) as desktop_scans,
        COUNT(CASE WHEN device_type = 'tablet' THEN 1 END) as tablet_scans,
        MIN(scan_time) as first_scan,
        MAX(scan_time) as last_scan
      FROM scans
    `);

    // Get recent scans across all vCards
    const recentScans = await all(`
      SELECT 
        s.scan_time, 
        s.country, 
        s.city, 
        s.device_type, 
        s.ip_address,
        s.action,
        v.name as vcard_name
      FROM scans s
      JOIN vcards v ON s.vcard_id = v.id
      ORDER BY s.scan_time DESC 
      LIMIT 20
    `);

    // Get daily scan counts for the last 7 days
    const dailyScans = await all(`
      SELECT 
        DATE(scan_time) as date,
        COUNT(*) as count
      FROM scans 
      WHERE scan_time >= datetime('now', '-7 days')
      GROUP BY DATE(scan_time)
      ORDER BY date DESC
    `);

    // Get top vCards by scan count
    const topVcards = await all(`
      SELECT 
        v.id,
        v.name,
        COUNT(s.id) as scan_count
      FROM vcards v
      LEFT JOIN scans s ON v.id = s.vcard_id
      GROUP BY v.id, v.name
      ORDER BY scan_count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      analytics: {
        totalScans: stats.total_scans || 0,
        uniqueVisitors: stats.unique_visitors || 0,
        mobileScans: stats.mobile_scans || 0,
        desktopScans: stats.desktop_scans || 0,
        tabletScans: stats.tablet_scans || 0,
        firstScan: stats.first_scan,
        lastScan: stats.last_scan,
        recentScans: recentScans,
        dailyScans: dailyScans,
        topVcards: topVcards
      }
    });

  } catch (error) {
    console.error('Error getting global analytics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

/**
 * GET /api/analytics/export/:vcardId
 * Export analytics data as CSV
 */
router.get('/export/:vcardId', async (req, res) => {
  try {
    const { vcardId } = req.params;

    // Check if vCard exists
    const vcard = await get(`
      SELECT id, name FROM vcards WHERE id = ?
    `, [vcardId]);

    if (!vcard) {
      return res.status(404).json({
        error: 'vCard not found'
      });
    }

    // Get all scans for this vCard
    const scans = await all(`
      SELECT 
        scan_time,
        ip_address,
        user_agent,
        country,
        city,
        latitude,
        longitude,
        referer,
        device_type,
        action
      FROM scans 
      WHERE vcard_id = ?
      ORDER BY scan_time DESC
    `, [vcardId]);

    // Generate CSV
    const csvHeader = 'Scan Time,IP Address,User Agent,Country,City,Latitude,Longitude,Referer,Device Type,Action\n';
    const csvRows = scans.map(scan => 
      `"${scan.scan_time}","${scan.ip_address || ''}","${scan.user_agent || ''}","${scan.country || ''}","${scan.city || ''}","${scan.latitude || ''}","${scan.longitude || ''}","${scan.referer || ''}","${scan.device_type || ''}","${scan.action || ''}"`
    ).join('\n');

    const csvContent = csvHeader + csvRows;
    const filename = `analytics_${vcard.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);

  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

export default router;
