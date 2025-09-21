import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Header = () => {
  const location = useLocation()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-corporate">QR Contact Generator</h1>
              <p className="text-sm text-gray-600">Professional contact sharing</p>
            </div>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'text-primary' 
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              Generate QR
            </Link>
            <Link 
              to="/dashboard" 
              className={`text-sm font-medium transition-colors ${
                location.pathname.startsWith('/dashboard') 
                  ? 'text-primary' 
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              Analytics
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
