import QRCode from 'qrcode';
import { promisify } from 'util';
import PDFDocument from 'pdfkit';

/**
 * Generate QR code in the specified format
 * @param {string} data - Data to encode in the QR code
 * @param {string} format - Output format (png, svg, pdf, eps)
 * @param {Object} options - QR code options
 * @returns {Promise<Buffer|string>} QR code as buffer or string
 */
export async function generateQRCode(data, format = 'png', options = {}) {
  const defaultOptions = {
    width: 300,
    margin: 4,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
  };

  const qrOptions = { ...defaultOptions, ...options };

  try {
    switch (format.toLowerCase()) {
      case 'png':
        return await QRCode.toBuffer(data, {
          type: 'png',
          ...qrOptions
        });

      case 'svg':
        return await QRCode.toString(data, {
          type: 'svg',
          ...qrOptions
        });

      case 'pdf':
        // Generate QR code as PNG first
        const qrBuffer = await QRCode.toBuffer(data, {
          type: 'png',
          ...qrOptions
        });
        
        // Create PDF document
        const doc = new PDFDocument({
          size: [qrOptions.width + 40, qrOptions.width + 40], // Add margins
          margins: { top: 20, bottom: 20, left: 20, right: 20 }
        });
        
        // Collect PDF data
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        
        return new Promise((resolve, reject) => {
          doc.on('end', () => resolve(Buffer.concat(chunks)));
          doc.on('error', reject);
          
          // Add QR code image to PDF
          doc.image(qrBuffer, 20, 20, {
            width: qrOptions.width,
            height: qrOptions.width
          });
          
          // Finalize PDF
          doc.end();
        });

      case 'eps':
        // EPS format is not directly supported by qrcode library
        // We'll generate as SVG and convert if needed
        return await QRCode.toString(data, {
          type: 'svg',
          ...qrOptions
        });

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
}

/**
 * Generate QR code as data URL
 * @param {string} data - Data to encode
 * @param {string} format - Output format
 * @param {Object} options - QR code options
 * @returns {Promise<string>} Data URL string
 */
export async function generateQRCodeDataURL(data, format = 'png', options = {}) {
  try {
    const qrOptions = {
      width: 300,
      margin: 4,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M',
      ...options
    };

    return await QRCode.toDataURL(data, qrOptions);
  } catch (error) {
    console.error('Error generating QR code data URL:', error);
    throw new Error(`Failed to generate QR code data URL: ${error.message}`);
  }
}

/**
 * Get content type for QR code format
 * @param {string} format - QR code format
 * @returns {string} MIME content type
 */
export function getQRContentType(format) {
  const contentTypes = {
    'png': 'image/png',
    'svg': 'image/svg+xml',
    'pdf': 'application/pdf',
    'eps': 'application/postscript'
  };
  
  return contentTypes[format.toLowerCase()] || 'image/png';
}

/**
 * Generate QR code with custom styling
 * @param {string} data - Data to encode
 * @param {Object} styleOptions - Styling options
 * @returns {Promise<Buffer>} Styled QR code as buffer
 */
export async function generateStyledQRCode(data, styleOptions = {}) {
  const defaultStyle = {
    width: 300,
    margin: 4,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
  };

  const options = { ...defaultStyle, ...styleOptions };

  try {
    return await QRCode.toBuffer(data, {
      type: 'png',
      ...options
    });
  } catch (error) {
    console.error('Error generating styled QR code:', error);
    throw new Error(`Failed to generate styled QR code: ${error.message}`);
  }
}

/**
 * Generate multiple QR code formats at once
 * @param {string} data - Data to encode
 * @param {string[]} formats - Array of formats to generate
 * @param {Object} options - QR code options
 * @returns {Promise<Object>} Object with format as key and buffer/string as value
 */
export async function generateMultipleFormats(data, formats = ['png', 'svg'], options = {}) {
  const results = {};
  
  try {
    await Promise.all(
      formats.map(async (format) => {
        try {
          results[format] = await generateQRCode(data, format, options);
        } catch (error) {
          console.error(`Error generating ${format} QR code:`, error);
          results[format] = null;
        }
      })
    );
    
    return results;
  } catch (error) {
    console.error('Error generating multiple QR code formats:', error);
    throw new Error(`Failed to generate multiple QR code formats: ${error.message}`);
  }
}

/**
 * Validate QR code data length
 * @param {string} data - Data to validate
 * @param {string} errorCorrectionLevel - Error correction level
 * @returns {boolean} True if data length is valid
 */
export function validateQRDataLength(data, errorCorrectionLevel = 'M') {
  if (!data || typeof data !== 'string') {
    return false;
  }

  // Maximum data capacity for QR codes varies by error correction level
  const maxLengths = {
    'L': 2953, // Low error correction
    'M': 2331, // Medium error correction (default)
    'Q': 1663, // Quartile error correction
    'H': 1273  // High error correction
  };

  const maxLength = maxLengths[errorCorrectionLevel] || maxLengths['M'];
  return data.length <= maxLength;
}
