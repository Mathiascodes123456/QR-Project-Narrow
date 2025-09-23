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
        
        // Track QR code generation
        await trackScan(vcardId, {
          action: 'generated',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform
        })
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
    <div className="container mx-auto px-6 py-16 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl mb-8 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-corporate mb-6 leading-tight">
          Your QR Code is Ready!
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
          Share your professional contact information instantly with anyone who scans your QR code
        </p>
        
        {/* Personal Stats Widget */}
        {analytics && (
          <div className="inline-flex items-center space-x-8 bg-white rounded-2xl px-8 py-4 shadow-lg border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{analytics.totalScans || 0}</div>
              <div className="text-sm text-gray-600">Total Scans</div>
            </div>
            <div className="w-px h-12 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analytics.uniqueVisitors || 0}</div>
              <div className="text-sm text-gray-600">Unique People</div>
            </div>
            <div className="w-px h-12 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{analytics.mobileScans || 0}</div>
              <div className="text-sm text-gray-600">Mobile Scans</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-10 mb-16">
        {/* QR Code Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your QR Code</h2>
          <div className="flex justify-center">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-300">
              <img
                src={`data:image/png;base64,${vcardData.qrFiles.png}`}
                alt="QR Code Preview"
                className="w-64 h-64"
              />
            </div>
          </div>
          <div className="text-center mt-6">
            <p className="text-gray-600 leading-relaxed mb-4">
              <span className="font-semibold text-blue-600">Instant contact sharing</span><br/>
              When someone scans this QR code, their phone will instantly offer to add your contact
            </p>
            <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <span>Works offline • No app required</span>
            </div>
          </div>
        </div>

        {/* Download Options */}
        <div className="space-y-8">
          {/* vCard Download */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">vCard File</h2>
            <p className="text-gray-600 mb-6">Download the contact file that gets shared when your QR code is scanned</p>
            <a
              href={`/api/vcard/${vcardId}/download`}
              onClick={handleDownloadVCard}
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Download {vcardData.vcardFilename}
            </a>
          </div>

          {/* QR Code Downloads */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">QR Code Downloads</h2>
              <button
                onClick={() => setShowCustomizer(!showCustomizer)}
                className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
              >
                {showCustomizer ? 'Hide Customizer' : 'Customize QR Code'}
              </button>
            </div>
            <p className="text-gray-600 mb-6">Choose your preferred format for different use cases</p>
            <div className="grid grid-cols-2 gap-4">
              {['png', 'svg', 'eps', 'pdf'].map((format) => (
                vcardData.qrFiles[format] && (
                  <a
                    key={format}
                    href={`/api/qr/${vcardId}/${format}`}
                    onClick={() => handleDownloadQR(format)}
                    className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 mb-3 flex items-center justify-center">
                      {format === 'png' && (
                        <svg className="w-6 h-6 text-gray-600 group-hover:text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
                        </svg>
                      )}
                      {format === 'svg' && (
                        <svg className="w-6 h-6 text-gray-600 group-hover:text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
                        </svg>
                      )}
                      {format === 'eps' && (
                        <svg className="w-6 h-6 text-gray-600 group-hover:text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
                        </svg>
                      )}
                      {format === 'pdf' && (
                        <svg className="w-6 h-6 text-gray-600 group-hover:text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path>
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 uppercase group-hover:text-blue-600">{format}</span>
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
      <div className="grid md:grid-cols-2 gap-8">
        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">How Your QR Code Works</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-lg">Someone Scans Your QR</h3>
                <p className="text-gray-600">Their phone camera instantly recognizes the QR code and reads your contact info</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-lg">Instant Contact Addition</h3>
                <p className="text-gray-600">Their phone immediately offers to "Add to Contacts" - no apps needed!</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-lg">Analytics Tracking</h3>
                <p className="text-gray-600">We track every scan so you can see who's interested in connecting with you</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Generate Another QR Code
            </button>
            
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
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
