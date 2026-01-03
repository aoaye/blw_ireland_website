module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/',
    '/__tests__/',
    '/uploads/',
    '/data/'
  ],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!admin-server.js'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/__tests__/admin-server.test.js',
        '<rootDir>/__tests__/frontend-api.test.js',
        '<rootDir>/__tests__/instagram-feed.test.js',
        '<rootDir>/__tests__/livestream.test.js',
        '<rootDir>/__tests__/utils.test.js'
      ]
    },
    {
      displayName: 'jsdom',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/__tests__/admin-frontend.test.js'
      ]
    }
  ]
};

