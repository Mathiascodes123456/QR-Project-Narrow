import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getVCardAnalytics } from '../services/analyticsService'
import AnalyticsChart from '../components/AnalyticsChart'

const Analytics = () => {
  const { vcardId } = useParams()
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getVCardAnalytics(vcardId)
        setAnalytics(data)
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError('Failed to load analytics data')
      } finally {
        setIsLoading(false)
      }
    }

    if (vcardId) {
      fetchAnalytics()
    }
  }, [vcardId])

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-lg mb-8">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-8">{error || 'Analytics data not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-2xl mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          QR Code Analytics
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Track scans and engagement metrics for <strong>{analytics.vcardName}</strong>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Scans</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalScans}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.uniqueVisitors}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mobile Scans</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.mobileScans}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Desktop Scans</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.desktopScans}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Device Distribution Chart */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Device Distribution</h2>
          <div className="h-64">
            <AnalyticsChart
              type="doughnut"
              data={{
                labels: ['Mobile', 'Desktop', 'Tablet'],
                datasets: [{
                  data: [analytics.mobileScans, analytics.desktopScans, analytics.tabletScans],
                  backgroundColor: ['#8b5cf6', '#f59e0b', '#3b82f6'],
                  borderWidth: 0
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      usePointStyle: true
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Daily Scans Chart */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Daily Scans (Last 7 Days)</h2>
          <div className="h-64">
            <AnalyticsChart
              type="line"
              data={{
                labels: analytics.dailyScans?.map(day => new Date(day.date).toLocaleDateString()).reverse() || [],
                datasets: [{
                  label: 'Scans',
                  data: analytics.dailyScans?.map(day => day.count).reverse() || [],
                  borderColor: '#6366f1',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  tension: 0.4,
                  fill: true
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="card mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Scans</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Device</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">IP Address</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentScans?.map((scan, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(scan.scan_time).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {scan.city && scan.country ? `${scan.city}, ${scan.country}` : 'Unknown'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      scan.device_type === 'mobile' ? 'bg-purple-100 text-purple-800' :
                      scan.device_type === 'desktop' ? 'bg-orange-100 text-orange-800' :
                      scan.device_type === 'tablet' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {scan.device_type || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                    {scan.ip_address || 'Unknown'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {scan.action || 'scan'}
                  </td>
                </tr>
              )) || []}
              {(!analytics.recentScans || analytics.recentScans.length === 0) && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No scans recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          Generate New QR Code
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-secondary"
        >
          Global Analytics
        </button>
        <button
          onClick={() => window.location.reload()}
          className="btn-secondary"
        >
          Refresh Data
        </button>
      </div>
    </div>
  )
}

export default Analytics
