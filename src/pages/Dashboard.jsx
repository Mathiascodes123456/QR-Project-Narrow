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
    <div className="container mx-auto px-6 py-20 max-w-7xl relative">
      {/* Multi-layered background patterns */}
      <div className="absolute inset-0 ocean-wave-pattern opacity-40"></div>
      <div className="absolute inset-0 aviation-pattern opacity-20"></div>
      {/* Additional mountain silhouette in top-left */}
      <div className="absolute top-0 left-0 w-1/4 h-1/3 opacity-5">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9Im1vdW50YWluMyIgeDE9IjAlIiB5MT0iMTAwJSIgeDI9IjAlIiB5Mj0iMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNDc1NTY5O3N0b3Atb3BhY2l0eTowLjQiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iNTAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMzM0MTU1O3N0b3Atb3BhY2l0eTowLjMiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzY0NzQ4YjtzdG9wLW9wYWNpdHk6MC4yIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjbW91bnRhaW4zKSIvPgogIDxwYXRoIGQ9Ik0wLDIwMEw1MCwxNTBMMTAwLDIwMEwxNTAsMTUwTDIwMCwyMDBMMjUwLDE1MEwzMDAsMjAwTDM1MCwxNTBMNDAwLDIwMEw0MDAsMzAwTDAsMzAwWiIgZmlsbD0iIzQ3NTU2OSIgb3BhY2l0eT0iMC4zIi8+CiAgPHBhdGggZD0iTTAsMjUwTDEwMCwyMDBMMjAwLDI1MEwzMDAsMjAwTDQwMCwyNTBMNDAwLDMwMEwwLDMwMFoiIGZpbGw9IiMzMzQxNTUiIG9wYWNpdHk9IjAuMiIvPgogIDxwYXRoIGQ9Ik0wLDE1MEwxNTAsMTAwTDIwMCwxNTBMMzAwLDEwMEw0MDAsMTUwTDQwMCwzMDBMMCwzMDBaIiBmaWxsPSIjNjQ3NDhiIiBvcGFjaXR5PSIwLjE1Ii8+Cjwvc3ZnPg==')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
      </div>
      {/* Ocean wave accent in bottom-right */}
      <div className="absolute bottom-0 right-0 w-1/3 h-1/4 opacity-8">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9IndhdmUyIiB4MT0iMCUiIHkxPSI1MCUiIHgyPSIxMDAlIiB5Mj0iNTAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwNDc1NTtzdG9wLW9wYWNpdHk6MC4zIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjUwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwNjY4ODtzdG9wLW9wYWNpdHk6MC4yIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDg4YWE7c3RvcC1vcGFjaXR5OjAuMSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI3dhdmUyKSIvPgogIDxwYXRoIGQ9Ik0wLDE1MEw1MCwxMjBMMTAwLDE1MEwxNTAsMTIwTDIwMCwxNTBMMjUwLDEyMEwzMDAsMTUwTDM1MCwxMjBMNDAwLDE1MEw0MDAsMzAwTDAsMzAwWiIgZmlsbD0iIzAwNDc1NSIgb3BhY2l0eT0iMC4yIi8+CiAgPHBhdGggZD0iTTAsMTgwTDEwMCwxNTBMMjAwLDE4MEwzMDAsMTUwTDQwMCwxODBMNDAwLDMwMEwwLDMwMFoiIGZpbGw9IiMwMDY2ODgiIG9wYWNpdHk9IjAuMTUiLz4KPC9zdmc+')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
      </div>
      
           {/* Header */}
           <div className="text-center mb-16 relative z-10">
             {/* Henna Logo */}
             <div className="flex justify-center mb-8">
               <div className="relative">
                 <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-2xl border-2 border-blue-500/30 flex items-center justify-center relative henna-h-logo">
                   <div className="w-16 h-12 relative">
                     {/* HH Logo with shared vertical line */}
                     <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-16 h-12 relative">
                         {/* First H */}
                         <div className="absolute left-0 top-0 w-2 h-12 bg-white rounded-sm"></div>
                         <div className="absolute left-6 top-0 w-2 h-12 bg-white rounded-sm"></div>
                         <div className="absolute left-0 top-5 w-8 h-2 bg-white rounded-sm"></div>
                         
                         {/* Second H - shares the middle vertical line */}
                         <div className="absolute right-0 top-0 w-2 h-12 bg-white rounded-sm"></div>
                         <div className="absolute left-6 top-5 w-8 h-2 bg-white rounded-sm"></div>
                       </div>
                     </div>
                   </div>
                   {/* Glow effect */}
                   <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-emerald-400/20 rounded-2xl blur-lg"></div>
                 </div>
               </div>
             </div>
             
             <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white via-blue-100 to-emerald-100 bg-clip-text text-transparent">
               Analytics Dashboard
             </h1>
             <p className="text-xl text-slate-300 max-w-2xl mx-auto">
               Track your QR code performance and engagement with detailed insights
             </p>
           </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 relative z-10">
        <div className="stat-card group hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          {/* Henna Logo Watermark */}
          <div className="absolute top-4 right-4 opacity-5">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center">
              <div className="w-3 h-3 relative">
                <div className="absolute left-0 top-0 w-0.5 h-3 bg-white rounded-sm"></div>
                <div className="absolute right-0 top-0 w-0.5 h-3 bg-white rounded-sm"></div>
                <div className="absolute left-0 top-1.5 w-3 h-0.5 bg-white rounded-sm"></div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 border border-blue-500/30 shadow-lg">
              <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Total Scans</p>
            <p className="text-5xl font-bold text-white mt-2 bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">{analytics.totalScans || 0}</p>
          </div>
        </div>

        <div className="stat-card group hover:shadow-xl transition-all duration-300">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500/20 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 border border-emerald-500/30">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Unique Visitors</p>
            <p className="text-4xl font-bold text-white mt-2">{analytics.uniqueVisitors || 0}</p>
          </div>
        </div>

        <div className="stat-card group hover:shadow-xl transition-all duration-300">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 border border-purple-500/30">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Mobile Scans</p>
            <p className="text-4xl font-bold text-white mt-2">{analytics.mobileScans || 0}</p>
          </div>
        </div>

        <div className="stat-card group hover:shadow-xl transition-all duration-300">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 border border-orange-500/30">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Desktop Scans</p>
            <p className="text-4xl font-bold text-white mt-2">{analytics.desktopScans || 0}</p>
          </div>
        </div>
      </div>

      {/* Top vCards */}
      <div className="card mb-8 relative z-10">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white">Top vCards</h3>
        </div>
        <div className="space-y-4">
          {analytics.topVcards && analytics.topVcards.length > 0 ? (
            analytics.topVcards.map((vcard, index) => (
              <div
                key={vcard.id}
                className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl cursor-pointer hover:bg-slate-700 hover:shadow-md transition-all duration-200 group"
                onClick={() => navigate(`/dashboard/${vcard.id}`)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-200">
                    {index + 1}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-white text-lg">{vcard.name}</p>
                    <p className="text-sm text-slate-400 font-medium">{vcard.scan_count} scans</p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400">
              <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-600">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <p className="text-lg font-medium">No vCards generated yet</p>
              <p className="text-sm">Create your first QR code to see analytics here</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Scans */}
      <div className="card relative z-10">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {analytics.recentScans && analytics.recentScans.length > 0 ? (
            analytics.recentScans.slice(0, 10).map((scan, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors duration-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-white text-lg">{scan.vcard_name}</p>
                    <p className="text-sm text-slate-400 font-medium">
                      {scan.device_type} • {scan.action}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-slate-400 font-medium">
                  {new Date(scan.scan_time).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400">
              <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-600">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </div>
              <p className="text-lg font-medium">No scans recorded yet</p>
              <p className="text-sm">Scan activity will appear here once people start using your QR codes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard