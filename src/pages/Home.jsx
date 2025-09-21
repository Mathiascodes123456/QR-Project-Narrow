import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateVCard } from '../services/vcardService'

const Home = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    title: '',
    email: '',
    phone: '',
    website: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid website URL'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isValidUrl = (url) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    try {
      const result = await generateVCard(formData)
      navigate(`/success/${result.vcardId}`)
    } catch (error) {
      console.error('Error generating vCard:', error)
      setErrors({ submit: 'Failed to generate QR code. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-6 py-16 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-lg mb-8">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-corporate mb-6 leading-tight">
          QR Contact Generator
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Professional QR code generation for seamless contact sharing. Create, track, and optimize your business networking with enterprise-grade analytics.
        </p>
      </div>

      {/* Main Card */}
      <div className="card">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-corporate border-b-2 border-primary pb-3">
                Contact Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-3">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`input-field text-lg ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Professional Information Section */}
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-corporate border-b-2 border-primary pb-3">
                Professional Details
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-3">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Your company name"
                  />
                </div>
                
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-3">
                    Job Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Your job title"
                  />
                </div>
              </div>
            </div>
            
            {/* Contact Information Section */}
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-corporate border-b-2 border-primary pb-3">
                Contact Methods
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="your.email@company.com"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-3">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-3">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className={`input-field ${errors.website ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="https://yourwebsite.com"
                />
                {errors.website && (
                  <p className="mt-2 text-sm text-red-600">{errors.website}</p>
                )}
              </div>
            </div>
            
            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{errors.submit}</p>
              </div>
            )}
            
            {/* Generate Button */}
            <div className="pt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Generate Professional QR Code
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="mt-20 grid md:grid-cols-3 gap-8">
        <div className="text-center p-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mb-6">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-corporate mb-3">Instant Contact Import</h3>
          <p className="text-gray-600 leading-relaxed">QR codes contain vCard data directly for immediate contact addition on any device</p>
        </div>
        
        <div className="text-center p-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mb-6">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-corporate mb-3">Enterprise Analytics</h3>
          <p className="text-gray-600 leading-relaxed">Track scan metrics, device types, and engagement data with professional-grade insights</p>
        </div>
        
        <div className="text-center p-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mb-6">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-corporate mb-3">Professional Format Support</h3>
          <p className="text-gray-600 leading-relaxed">Generate QR codes in PNG, SVG, EPS, and PDF formats for any business use case</p>
        </div>
      </div>
    </div>
  )
}

export default Home
