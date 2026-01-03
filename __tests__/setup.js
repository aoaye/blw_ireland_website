/**
 * Jest setup file
 * Runs before all tests
 */

// Set up global test environment
global.console = {
    ...console,
    // Uncomment to silence console.log during tests
    // log: jest.fn(),
    // debug: jest.fn(),
    // info: jest.fn(),
    // warn: jest.fn(),
    // error: jest.fn(),
};

// Mock environment variables if needed
process.env.NODE_ENV = 'test';

// Increase timeout for async operations if needed
jest.setTimeout(10000);

