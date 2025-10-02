import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getVCard, trackScan } from '../services/vcardService'
import { getVCardAnalytics } from '../services/analyticsService'
import QRCodeCustomizer from '../components/QRCodeCustomizer'

const Success = () => {
  const { vcardId } = useParams()
  const navigate = useNavigate()
  const [vcardData, setVcardData] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCustomizer, setShowCustomizer] = useState(false)

  // Generate vCard content for QR code
  const generateVCardContent = (vcard) => {
    let vcardContent = 'BEGIN:VCARD\nVERSION:3.0\n'
    
    if (vcard.name) {
      const nameParts = vcard.name.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      vcardContent += `FN:${vcard.name}\n`
      vcardContent += `N:${lastName};${firstName};;;\n`
    }
    
    if (vcard.company) {
      vcardContent += `ORG:${vcard.company}\n`
    }
    
    if (vcard.title) {
      vcardContent += `TITLE:${vcard.title}\n`
    }
    
    if (vcard.email) {
      vcardContent += `EMAIL:${vcard.email}\n`
    }
    
    if (vcard.phone) {
      vcardContent += `TEL:${vcard.phone}\n`
    }
    
    if (vcard.website) {
      vcardContent += `URL:${vcard.website}\n`
    }
    
    vcardContent += 'END:VCARD'
    return vcardContent
  }

  useEffect(() => {
    const fetchVCardData = async () => {
      try {
        const [vcardData, analyticsData] = await Promise.all([
          getVCard(vcardId),
          getVCardAnalytics(vcardId).catch(() => null) // Don't fail if analytics fails
        ])
        
        setVcardData({
          ...vcardData,
          vcardContent: generateVCardContent(vcardData)
        })
        setAnalytics(analyticsData)
      } catch (err) {
        console.error('Error fetching vCard data:', err)
        setError('Failed to load QR code data')
      } finally {
        setIsLoading(false)
      }
    }

    if (vcardId) {
      fetchVCardData()
    }
  }, [vcardId])

  const handleDownloadQR = async (format) => {
    try {
      await trackScan(vcardId, {
        action: 'qr_downloaded',
        format,
        timestamp: new Date().toISOString()
      })
    } catch (err) {
      console.error('Error tracking download:', err)
    }
  }

  const handleDownloadVCard = async () => {
    try {
      await trackScan(vcardId, {
        action: 'vcard_downloaded',
        timestamp: new Date().toISOString()
      })
    } catch (err) {
      console.error('Error tracking vCard download:', err)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading QR code...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !vcardData) {
    return (
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-lg mb-8">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-8">{error || 'QR code not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Generate New QR Code
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
                 <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl shadow-2xl border-2 border-blue-500/30 flex items-center justify-center relative henna-h-logo">
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
                   <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-emerald-400/20 rounded-3xl blur-xl"></div>
                 </div>
               </div>
             </div>
             
             <h1 className="text-6xl font-bold text-white mb-6 leading-tight bg-gradient-to-r from-white via-blue-100 to-emerald-100 bg-clip-text text-transparent">
               Your QR Code is Ready!
             </h1>
             <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
               Share your professional contact information instantly with anyone who scans your QR code
             </p>
        
        {/* Personal Stats Widget */}
        {analytics && (
          <div className="inline-flex items-center space-x-8 bg-slate-800/90 rounded-2xl px-8 py-4 shadow-2xl border border-slate-700 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{analytics.totalScans || 0}</div>
              <div className="text-sm text-slate-300">Total Scans</div>
            </div>
            <div className="w-px h-12 bg-slate-600"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{analytics.uniqueVisitors || 0}</div>
              <div className="text-sm text-slate-300">Unique People</div>
            </div>
            <div className="w-px h-12 bg-slate-600"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{analytics.mobileScans || 0}</div>
              <div className="text-sm text-slate-300">Mobile Scans</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-10 mb-16 relative z-10">
             {/* QR Code Preview */}
             <div className="card relative overflow-hidden">
               {/* Henna Logo Watermark */}
               <div className="absolute top-4 right-4 opacity-10">
                 <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 relative">
                    <div className="absolute left-0 top-0 w-0.5 h-5 bg-white rounded-sm"></div>
                    <div className="absolute right-0 top-0 w-0.5 h-5 bg-white rounded-sm"></div>
                    <div className="absolute left-0 top-2.5 w-5 h-0.5 bg-white rounded-sm"></div>
                  </div>
                 </div>
               </div>
               
               <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                 <svg className="w-6 h-6 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                 </svg>
                 Your QR Code
               </h2>
               <div className="flex justify-center">
                 <div className="relative group">
                   <div className="bg-gradient-to-br from-slate-700/80 to-slate-800/80 p-8 rounded-2xl border border-slate-600 hover:border-blue-400 transition-all duration-300 shadow-2xl">
                     <img
                       src={`data:image/png;base64,${vcardData.qrFiles.png}`}
                       alt="QR Code Preview"
                       className="w-64 h-64"
                     />
                     {/* Hover overlay */}
                     <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                       <div className="bg-white/90 rounded-full p-3">
                         <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                         </svg>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
               <div className="text-center mt-8">
                 <div className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 rounded-xl p-6 border border-blue-500/20">
                   <p className="text-slate-300 leading-relaxed mb-4">
                     <span className="font-semibold text-blue-400 text-lg">Instant contact sharing</span><br/>
                     <span className="text-slate-400">When someone scans this QR code, their phone will instantly offer to add your contact</span>
                   </p>
                   <div className="inline-flex items-center space-x-2 text-sm text-slate-400 bg-slate-800/50 rounded-lg px-4 py-2">
                     <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                     </svg>
                     <span>Works offline • No app required</span>
                   </div>
                 </div>
               </div>
             </div>

        {/* Download Options */}
        <div className="space-y-8">
          {/* vCard Download */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">vCard File</h2>
            <p className="text-slate-300 mb-6">Download the contact file that gets shared when your QR code is scanned</p>
            <a
              href={`/api/vcard/${vcardId}/download`}
              onClick={handleDownloadVCard}
              className="btn-primary w-full flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Download {vcardData.vcardFilename}
            </a>
          </div>

          {/* QR Code Downloads */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">QR Code Downloads</h2>
              <button
                onClick={() => setShowCustomizer(!showCustomizer)}
                className="btn-secondary"
              >
                {showCustomizer ? 'Hide Customizer' : 'Customize QR Code'}
              </button>
            </div>
            <p className="text-slate-300 mb-6">Choose your preferred format for different use cases</p>
            <div className="grid grid-cols-2 gap-4">
              {['png', 'svg', 'eps', 'pdf'].map((format) => (
                vcardData.qrFiles[format] && (
                  <a
                    key={format}
                    href={`/api/qr/${vcardId}/${format}`}
                    onClick={() => handleDownloadQR(format)}
                    className="flex flex-col items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-blue-400 hover:bg-slate-700 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 mb-3 flex items-center justify-center">
                      {format === 'png' && (
                        <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
                        </svg>
                      )}
                      {format === 'svg' && (
                        <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
                        </svg>
                      )}
                      {format === 'eps' && (
                        <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
                        </svg>
                      )}
                      {format === 'pdf' && (
                        <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path>
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-slate-300 uppercase group-hover:text-blue-400">{format}</span>
                  </a>
                )
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Customizer */}
      {showCustomizer && (
        <div className="mb-16">
          <QRCodeCustomizer 
            vcardData={vcardData}
            onQRCodeGenerated={(customQR) => {
              // Handle custom QR code generation if needed
              console.log('Custom QR code generated:', customQR)
            }}
          />
        </div>
      )}

      {/* Instructions & Actions */}
      <div className="grid md:grid-cols-2 gap-8 relative z-10">
        {/* Instructions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">How Your QR Code Works</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-medium text-white text-lg">Someone Scans Your QR</h3>
                <p className="text-slate-300">Their phone camera instantly recognizes the QR code and reads your contact info</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-medium text-white text-lg">Instant Contact Addition</h3>
                <p className="text-slate-300">Their phone immediately offers to "Add to Contacts" - no apps needed!</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-medium text-white text-lg">Analytics Tracking</h3>
                <p className="text-slate-300">We track every scan so you can see who's interested in connecting with you</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center px-4 py-3 border border-slate-600 text-slate-300 font-medium rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Generate Another QR Code
            </button>
            
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center px-4 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
              Print QR Code
            </button>
            
            <button
              onClick={() => navigate(`/dashboard/${vcardId}`)}
              className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              View My Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Success
