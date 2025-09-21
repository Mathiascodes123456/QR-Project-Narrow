import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGlobalAnalytics } from '../services/analyticsService'

const Dashboard = () => {
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getGlobalAnalytics()
        setAnalytics(data)
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError('Failed to load analytics data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Generate QR Code
          </button>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">No Data</h1>
          <p className="text-gray-600 mb-8">No analytics data available</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Generate QR Code
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-16 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
        <p className="text-xl text-gray-600">Track your QR code performance and engagement</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Total Scans</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalScans || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Unique Visitors</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.uniqueVisitors || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Mobile Scans</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.mobileScans || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Desktop Scans</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.desktopScans || 0}</p>
          </div>
        </div>
      </div>

      {/* Top vCards */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top vCards</h3>
        <div className="space-y-3">
          {analytics.topVcards && analytics.topVcards.length > 0 ? (
            analytics.topVcards.map((vcard, index) => (
              <div
                key={vcard.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => navigate(`/dashboard/${vcard.id}`)}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{vcard.name}</p>
                    <p className="text-sm text-gray-500">{vcard.scan_count} scans</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No vCards generated yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Scans */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Scans</h3>
        <div className="space-y-3">
          {analytics.recentScans && analytics.recentScans.length > 0 ? (
            analytics.recentScans.slice(0, 10).map((scan, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{scan.vcard_name}</p>
                    <p className="text-sm text-gray-500">
                      {scan.device_type} • {scan.action}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(scan.scan_time).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No scans recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard