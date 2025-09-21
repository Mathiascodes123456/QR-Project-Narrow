#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')

console.log('🚀 Setting up QR Contact Generator...\n')

// Check if .env exists, if not copy from example
const envPath = path.join(rootDir, '.env')
const envExamplePath = path.join(rootDir, 'env.example')

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath)
    console.log('✅ Created .env file from template')
  } else {
    console.log('⚠️  No .env.example found, you may need to create .env manually')
  }
} else {
  console.log('✅ .env file already exists')
}

// Install dependencies
console.log('\n📦 Installing dependencies...')
try {
  execSync('npm install', { 
    stdio: 'inherit', 
    cwd: rootDir 
  })
  console.log('✅ Dependencies installed successfully')
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message)
  process.exit(1)
}

// Create necessary directories
const dirs = ['dist', 'logs', 'uploads']
dirs.forEach(dir => {
  const dirPath = path.join(rootDir, dir)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    console.log(`✅ Created ${dir} directory`)
  }
})

console.log('\n🎉 Setup complete!')
console.log('\nNext steps:')
console.log('1. Review and update .env file if needed')
console.log('2. Run "npm run dev" to start development servers')
console.log('3. Open http://localhost:5173 in your browser')
console.log('\nFor more commands, run "make help" or check the README.md')
