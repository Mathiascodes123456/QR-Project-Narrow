import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Header = () => {
  const location = useLocation()

  return (
    <header className="bg-slate-800/90 backdrop-blur-sm shadow-lg border-b border-slate-700">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-4 group">
            {/* Henna H Logo */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg border-2 border-blue-500/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 relative henna-h-logo">
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
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-emerald-400/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-200"></div>
              </div>
            </div>
            
            <div>
              <h1 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-200">QR Contact Generator</h1>
              <p className="text-sm text-slate-400">Professional contact sharing</p>
            </div>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-sm font-medium text-slate-300 hover:text-blue-400 hover:bg-slate-700/50 px-4 py-2 rounded-lg border border-slate-600 hover:border-blue-400 transition-all duration-200"
            >
              Generate QR
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
