// Jest setup file
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.DATABASE_PATH = join(__dirname, '../test.db')
process.env.PORT = '3001'

// Global test timeout
jest.setTimeout(10000)
