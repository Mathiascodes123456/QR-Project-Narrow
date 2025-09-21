import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getVCard, trackScan } from '../services/vcardService'

const Success = () => {
  const { vcardId } = useParams()
  const navigate = useNavigate()
  const [vcardData, setVcardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchVCardData = async () => {
      try {
        const data = await getVCard(vcardId)
        setVcardData(data)
        
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
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-lg mb-8">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-corporate mb-6 leading-tight">
          QR Code Generated Successfully
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Your professional contact QR codes are ready for download and business networking
        </p>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-10 mb-16">
        {/* QR Code Preview */}
        <div className="card">
          <h2 className="text-3xl font-bold text-corporate mb-8">QR Code Preview</h2>
          <div className="flex justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
              <img
                src={`data:image/png;base64,${vcardData.qrFiles.png}`}
                alt="QR Code Preview"
                className="w-72 h-72"
              />
            </div>
          </div>
          <p className="text-center text-gray-600 mt-6 leading-relaxed">
            Scan this QR code to instantly add the contact to your device
          </p>
        </div>

        {/* Download Options */}
        <div className="space-y-8">
          {/* vCard Download */}
          <div className="card">
            <h2 className="text-2xl font-bold text-corporate mb-6">vCard File</h2>
            <a
              href={`/api/vcard/${vcardId}/download`}
              onClick={handleDownloadVCard}
              className="inline-flex items-center justify-center w-full px-8 py-4 btn-primary text-lg"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Download {vcardData.vcardFilename}
            </a>
          </div>

          {/* QR Code Downloads */}
          <div className="card">
            <h2 className="text-2xl font-bold text-corporate mb-6">QR Code Downloads</h2>
            <div className="grid grid-cols-2 gap-4">
              {['png', 'svg', 'eps', 'pdf'].map((format) => (
                vcardData.qrFiles[format] && (
                  <a
                    key={format}
                    href={`/api/qr/${vcardId}/${format}`}
                    onClick={() => handleDownloadQR(format)}
                    className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
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
                    <span className="text-sm font-semibold text-gray-700 uppercase group-hover:text-primary">{format}</span>
                  </a>
                )
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions & Actions */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Instructions */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Direct vCard Mode</h3>
                <p className="text-gray-600 text-sm">All QR codes contain vCard data directly</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Instant Import</h3>
                <p className="text-gray-600 text-sm">When scanned, mobile devices immediately offer "Add to Contacts"</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Offline Ready</h3>
                <p className="text-gray-600 text-sm">No internet required after QR code generation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions</h2>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/')}
              className="w-full btn-secondary"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Generate Another QR Code
            </button>
            
            <button
              onClick={handlePrint}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-2xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
              Print QR Code
            </button>
            
            <button
              onClick={() => navigate(`/dashboard/${vcardId}`)}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 px-6 rounded-2xl hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
