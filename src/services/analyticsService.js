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
 * Get analytics for a specific vCard
 * @param {string} vcardId - vCard ID
 * @returns {Promise<Object>} vCard analytics data
 */
export const getVCardAnalytics = async (vcardId) => {
  try {
    const response = await api.get(`/analytics/${vcardId}`)
    
    // Include vCard name in analytics object for component compatibility
    const analyticsData = response.data.analytics
    analyticsData.vcardName = response.data.vcardName
    analyticsData.vcardId = response.data.vcardId
    
    return analyticsData
  } catch (error) {
    console.error('Error getting vCard analytics:', error)
    throw error
  }
}

/**
 * Get global analytics for all vCards
 * @returns {Promise<Object>} Global analytics data
 */
export const getGlobalAnalytics = async () => {
  try {
    const response = await api.get('/analytics')
    return response.data.analytics
  } catch (error) {
    console.error('Error getting global analytics:', error)
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
 * Export analytics data as CSV
 * @param {string} vcardId - vCard ID
 * @returns {Promise<Blob>} CSV file blob
 */
export const exportAnalytics = async (vcardId) => {
  try {
    const response = await api.get(`/analytics/export/${vcardId}`, {
      responseType: 'blob'
    })
    return response.data
  } catch (error) {
    console.error('Error exporting analytics:', error)
    throw error
  }
}

/**
 * Get analytics data for a specific date range
 * @param {string} vcardId - vCard ID (optional for global analytics)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Analytics data for date range
 */
export const getAnalyticsByDateRange = async (vcardId, startDate, endDate) => {
  try {
    const params = new URLSearchParams({
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    })
    
    const url = vcardId ? `/analytics/${vcardId}` : '/analytics'
    const response = await api.get(`${url}?${params}`)
    
    return vcardId ? response.data.analytics : response.data.analytics
  } catch (error) {
    console.error('Error getting analytics by date range:', error)
    throw error
  }
}

/**
 * Get device statistics
 * @param {string} vcardId - vCard ID (optional for global analytics)
 * @returns {Promise<Object>} Device statistics
 */
export const getDeviceStats = async (vcardId) => {
  try {
    const response = vcardId 
      ? await api.get(`/analytics/${vcardId}`)
      : await api.get('/analytics')
    
    const analytics = vcardId ? response.data.analytics : response.data.analytics
    
    return {
      mobile: analytics.mobileScans || 0,
      desktop: analytics.desktopScans || 0,
      tablet: analytics.tabletScans || 0,
      total: analytics.totalScans || 0
    }
  } catch (error) {
    console.error('Error getting device stats:', error)
    throw error
  }
}

/**
 * Get scan timeline data
 * @param {string} vcardId - vCard ID (optional for global analytics)
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} Timeline data
 */
export const getScanTimeline = async (vcardId, days = 7) => {
  try {
    const response = vcardId 
      ? await api.get(`/analytics/${vcardId}`)
      : await api.get('/analytics')
    
    const analytics = vcardId ? response.data.analytics : response.data.analytics
    
    return analytics.dailyScans || []
  } catch (error) {
    console.error('Error getting scan timeline:', error)
    throw error
  }
}

export default {
  getVCardAnalytics,
  getGlobalAnalytics,
  trackScan,
  exportAnalytics,
  getAnalyticsByDateRange,
  getDeviceStats,
  getScanTimeline
}
