import React, { useState, useEffect, useCallback } from 'react'

const QRCodeCustomizer = ({ vcardData, onQRCodeGenerated }) => {
  const [customOptions, setCustomOptions] = useState({
    width: 300,
    margin: 4,
    errorCorrectionLevel: 'M',
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF'
  })

  const [previewUrl, setPreviewUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [templates, setTemplates] = useState([])

  // Load templates on component mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/api/qr/templates')
        const data = await response.json()
        if (data.success) {
          setTemplates(data.templates)
        }
      } catch (error) {
        console.error('Failed to load templates:', error)
      }
    }
    loadTemplates()
  }, [])

  // Generate preview when options change
  const generatePreview = useCallback(async () => {
    if (!vcardData?.vcardContent) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/qr/custom/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: vcardData.vcardContent,
          customOptions
        })
      })

      const result = await response.json()
      if (result.success) {
        setPreviewUrl(result.dataUrl)
      }
    } catch (error) {
      console.error('Failed to generate preview:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [vcardData?.vcardContent, customOptions])

  // Generate preview on mount and when options change
  useEffect(() => {
    generatePreview()
  }, [generatePreview])

  const handleOptionChange = (key, value) => {
    setCustomOptions(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleTemplateSelect = (template) => {
    setCustomOptions(prev => ({
      ...prev,
      ...template.options
    }))
  }

  const handleDownload = async () => {
    if (!vcardData?.vcardContent) return

    try {
      // Track custom QR code download
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'custom_qr_downloaded',
          customOptions: {
            width: customOptions.width,
            foregroundColor: customOptions.foregroundColor,
            backgroundColor: customOptions.backgroundColor,
            errorCorrectionLevel: customOptions.errorCorrectionLevel
          },
          timestamp: new Date().toISOString()
        })
      }).catch(() => {}) // Don't fail if analytics fails

      const response = await fetch('/api/qr/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: vcardData.vcardContent,
          customOptions,
          format: 'png'
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `custom_qr_${vcardData.name.replace(/\s+/g, '_')}.png`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to download QR code:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Preview Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Live Preview</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Real-time updates</span>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            {isGenerating ? (
              <div className="w-64 h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
              </div>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt="Custom QR Code Preview"
                className="w-64 h-64"
              />
            ) : (
              <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-sm">Preview will appear here</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center mt-6">
          <button
            onClick={handleDownload}
            disabled={!previewUrl || isGenerating}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Download Custom QR Code
          </button>
        </div>
      </div>

      {/* Templates Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left group"
            >
              <h4 className="font-medium text-gray-900 mb-1 group-hover:text-blue-700">{template.name}</h4>
              <p className="text-sm text-gray-500">{template.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Customization Options */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Colors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Colors</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foreground Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={customOptions.foregroundColor}
                  onChange={(e) => handleOptionChange('foregroundColor', e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={customOptions.foregroundColor}
                  onChange={(e) => handleOptionChange('foregroundColor', e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={customOptions.backgroundColor}
                  onChange={(e) => handleOptionChange('backgroundColor', e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={customOptions.backgroundColor}
                  onChange={(e) => handleOptionChange('backgroundColor', e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Eye Color (optional)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={customOptions.eyeColor || customOptions.foregroundColor}
                  onChange={(e) => handleOptionChange('eyeColor', e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={customOptions.eyeColor || ''}
                  onChange={(e) => handleOptionChange('eyeColor', e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Leave empty to use foreground color"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Size & Quality */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Size & Quality</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QR Code Size: {customOptions.width}px
              </label>
              <input
                type="range"
                min="200"
                max="800"
                step="50"
                value={customOptions.width}
                onChange={(e) => handleOptionChange('width', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Margin: {customOptions.margin}px
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={customOptions.margin}
                onChange={(e) => handleOptionChange('margin', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Error Correction Level
              </label>
              <select
                value={customOptions.errorCorrectionLevel}
                onChange={(e) => handleOptionChange('errorCorrectionLevel', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Higher levels allow more damage before the QR code becomes unreadable
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRCodeCustomizer
