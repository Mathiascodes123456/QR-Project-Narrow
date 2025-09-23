import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Success from './pages/Success'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/success/:vcardId" element={<Success />} />
          <Route path="/dashboard/:vcardId" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
