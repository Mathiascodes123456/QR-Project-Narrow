import axios from 'axios'

const API_BASE_URL = '/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('Response error:', error)
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred'
      throw new Error(message)
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error - please check your connection')
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred')
    }
  }
)

/**
 * Generate vCard and QR codes
 * @param {Object} contactData - Contact information
 * @returns {Promise<Object>} Generated vCard data with QR codes
 */
export const generateVCard = async (contactData) => {
  try {
    const response = await api.post('/vcard/generate', contactData)
    return response.data
  } catch (error) {
    console.error('Error generating vCard:', error)
    throw error
  }
}

/**
 * Get vCard by ID
 * @param {string} vcardId - vCard ID
 * @returns {Promise<Object>} vCard data
 */
export const getVCard = async (vcardId) => {
  try {
    const response = await api.get(`/vcard/${vcardId}`)
    return response.data
  } catch (error) {
    console.error('Error getting vCard:', error)
    throw error
  }
}

/**
 * Download vCard file
 * @param {string} vcardId - vCard ID
 * @returns {Promise<Blob>} vCard file blob
 */
export const downloadVCard = async (vcardId) => {
  try {
    const response = await api.get(`/vcard/${vcardId}/download`, {
      responseType: 'blob'
    })
    return response.data
  } catch (error) {
    console.error('Error downloading vCard:', error)
    throw error
  }
}

/**
 * Update vCard
 * @param {string} vcardId - vCard ID
 * @param {Object} contactData - Updated contact information
 * @returns {Promise<Object>} Updated vCard data
 */
export const updateVCard = async (vcardId, contactData) => {
  try {
    const response = await api.put(`/vcard/${vcardId}`, contactData)
    return response.data
  } catch (error) {
    console.error('Error updating vCard:', error)
    throw error
  }
}

/**
 * Delete vCard
 * @param {string} vcardId - vCard ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteVCard = async (vcardId) => {
  try {
    const response = await api.delete(`/vcard/${vcardId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting vCard:', error)
    throw error
  }
}

/**
 * Track a scan event
 * @param {string} vcardId - vCard ID
 * @param {Object} trackingData - Tracking data
 * @returns {Promise<Object>} Tracking result
 */
export const trackScan = async (vcardId, trackingData = {}) => {
  try {
    const response = await api.post(`/analytics/track/${vcardId}`, trackingData)
    return response.data
  } catch (error) {
    console.error('Error tracking scan:', error)
    // Don't throw error for tracking failures - it shouldn't break the user experience
    return { success: false, error: error.message }
  }
}

/**
 * Download QR code
 * @param {string} vcardId - vCard ID
 * @param {string} format - QR code format (png, svg, eps, pdf)
 * @param {Object} options - QR code options
 * @returns {Promise<Blob>} QR code file blob
 */
export const downloadQRCode = async (vcardId, format, options = {}) => {
  try {
    const params = new URLSearchParams(options)
    const response = await api.get(`/qr/${vcardId}/${format}?${params}`, {
      responseType: 'blob'
    })
    return response.data
  } catch (error) {
    console.error('Error downloading QR code:', error)
    throw error
  }
}

/**
 * Get QR code as data URL
 * @param {string} vcardId - vCard ID
 * @param {string} format - QR code format (png, svg)
 * @param {Object} options - QR code options
 * @returns {Promise<string>} QR code data URL
 */
export const getQRCodeDataURL = async (vcardId, format, options = {}) => {
  try {
    const params = new URLSearchParams(options)
    const response = await api.get(`/qr/${vcardId}/${format}/data?${params}`)
    return response.data.dataUrl
  } catch (error) {
    console.error('Error getting QR code data URL:', error)
    throw error
  }
}

export default {
  generateVCard,
  getVCard,
  downloadVCard,
  updateVCard,
  deleteVCard,
  trackScan,
  downloadQRCode,
  getQRCodeDataURL
}
