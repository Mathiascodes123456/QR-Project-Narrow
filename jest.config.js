export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.js'],
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/index.js',
    '!server/database/init.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000
}
