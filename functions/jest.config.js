module.exports = {
  // Basic configuration
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Root directory
  rootDir: '.',
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/src/test/test-setup.ts'
  ],
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/src/test/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  
  // Transform configuration
  transform: {
    '^.+\.ts$': 'ts-jest'
  },
  
  // Module file extensions
  moduleFileExtensions: [
    'ts',
    'js',
    'json'
  ],
  
  // Module name mapping for path aliases
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@test/(.*)$': '<rootDir>/src/test/$1'
  },
  
  // Coverage configuration
  collectCoverage: false, // Set to true when running coverage
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/test/**/*',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/index.ts',
    '!src/types/**/*'
  ],
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    // Specific thresholds for critical files
    './src/enhanced-functions.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/utils/logger.ts': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },
  
  // Test timeout
  testTimeout: 30000,
  
  // Global setup and teardown
  globalSetup: '<rootDir>/src/test/global-setup.ts',
  globalTeardown: '<rootDir>/src/test/global-teardown.ts',
  
  // Verbose output
  verbose: true,
  
  // Force exit after tests complete
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Maximum number of worker processes
  maxWorkers: 1, // Use single worker for Firebase emulator tests
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Reset modules between tests
  resetModules: true,
  
  // Test environment options
  testEnvironmentOptions: {
    // Node.js specific options
  },
  
  // Global variables available in tests
  globals: {
    'ts-jest': {
      tsconfig: {
        target: 'es2020',
        module: 'commonjs',
        moduleResolution: 'node',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true
      },
      isolatedModules: true
    }
  },
  
  // Files to ignore
  testPathIgnorePatterns: [
    '/node_modules/',
    '/lib/',
    '/coverage/',
    '/emulator-data/'
  ],
  
  // Module paths to ignore
  modulePathIgnorePatterns: [
    '<rootDir>/lib/',
    '<rootDir>/coverage/',
    '<rootDir>/emulator-data/'
  ],
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  // Error on deprecated features
  errorOnDeprecated: true,
  
  // Notify mode
  notify: false,
  
  // Bail on first test failure (useful for CI)
  bail: false,
  
  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Reporter configuration
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true
      }
    ]
  ],
  
  // Custom test sequencer for Firebase tests
  testSequencer: '<rootDir>/src/test/test-sequencer.js'
};