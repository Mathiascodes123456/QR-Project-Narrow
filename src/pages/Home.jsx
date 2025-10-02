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
               QR Contact Generator
             </h1>
             <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
               Professional QR code generation for seamless contact sharing. Create, track, and optimize your business networking with enterprise-grade analytics.
             </p>
           </div>

      {/* Main Card */}
      <div className="card relative overflow-hidden">
        {/* Henna Logo Watermarks */}
        <div className="absolute top-6 left-6 opacity-5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 relative">
              <div className="absolute left-0 top-0 w-0.5 h-5 bg-white rounded-sm"></div>
              <div className="absolute right-0 top-0 w-0.5 h-5 bg-white rounded-sm"></div>
              <div className="absolute left-0 top-2.5 w-5 h-0.5 bg-white rounded-sm"></div>
            </div>
          </div>
        </div>
        <div className="absolute top-6 right-6 opacity-5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 relative">
              <div className="absolute left-0 top-0 w-0.5 h-5 bg-white rounded-sm"></div>
              <div className="absolute right-0 top-0 w-0.5 h-5 bg-white rounded-sm"></div>
              <div className="absolute left-0 top-2.5 w-5 h-0.5 bg-white rounded-sm"></div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-6 opacity-5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 relative">
              <div className="absolute left-0 top-0 w-0.5 h-5 bg-white rounded-sm"></div>
              <div className="absolute right-0 top-0 w-0.5 h-5 bg-white rounded-sm"></div>
              <div className="absolute left-0 top-2.5 w-5 h-0.5 bg-white rounded-sm"></div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 right-6 opacity-5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 relative">
              <div className="absolute left-0 top-0 w-0.5 h-5 bg-white rounded-sm"></div>
              <div className="absolute right-0 top-0 w-0.5 h-5 bg-white rounded-sm"></div>
              <div className="absolute left-0 top-2.5 w-5 h-0.5 bg-white rounded-sm"></div>
            </div>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-white flex items-center border-b-2 border-blue-500 pb-3">
                <svg className="w-6 h-6 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Contact Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-3">
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
                    <p className="mt-2 text-sm text-red-400">{errors.name}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Professional Information Section */}
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-white flex items-center border-b-2 border-emerald-500 pb-3">
                <svg className="w-6 h-6 text-emerald-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                Professional Details
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-slate-300 mb-3">
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
                  <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-3">
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
              <h2 className="text-2xl font-semibold text-white flex items-center border-b-2 border-blue-500 pb-3">
                <svg className="w-6 h-6 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                Contact Methods
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-3">
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
                    <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-3">
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
                <label htmlFor="website" className="block text-sm font-medium text-slate-300 mb-3">
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
                  <p className="mt-2 text-sm text-red-400">{errors.website}</p>
                )}
              </div>
            </div>
            
            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400">{errors.submit}</p>
              </div>
            )}
            
            {/* Generate Button */}
            <div className="pt-8">
              <div className="relative">
                {/* Henna Logo Watermark on Button */}
                <div className="absolute -top-2 -right-2 opacity-20">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center">
                    <div className="w-3 h-3 relative">
                      <div className="absolute left-0 top-0 w-0.5 h-3 bg-white rounded-sm"></div>
                      <div className="absolute right-0 top-0 w-0.5 h-3 bg-white rounded-sm"></div>
                      <div className="absolute left-0 top-1.5 w-3 h-0.5 bg-white rounded-sm"></div>
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg py-4 px-8 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className="flex items-center justify-center relative z-10">
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
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="mt-20 grid md:grid-cols-3 gap-8 relative z-10">
        <div className="feature-card text-center group">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300 border border-blue-500/30">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Instant Contact Import</h3>
          <p className="text-slate-300 leading-relaxed">QR codes contain vCard data directly for immediate contact addition on any device</p>
        </div>
        
        <div className="feature-card text-center group">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300 border border-emerald-500/30">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Enterprise Analytics</h3>
          <p className="text-slate-300 leading-relaxed">Track scan metrics, device types, and engagement data with professional-grade insights</p>
        </div>
        
        <div className="feature-card text-center group">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300 border border-purple-500/30">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Professional Format Support</h3>
          <p className="text-slate-300 leading-relaxed">Generate QR codes in PNG, SVG, EPS, and PDF formats for any business use case</p>
        </div>
      </div>
    </div>
  )
}

export default Home
