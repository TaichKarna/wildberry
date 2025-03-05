// Jest setup file
import dotenv from 'dotenv';

// Load environment variables from .env.test file if it exists
dotenv.config({ path: '.env.test' });

// Global test setup
beforeAll(() => {
  // Setup code that runs before all tests
  console.log('Starting test suite');
});

afterAll(() => {
  // Cleanup code that runs after all tests
  console.log('Finished test suite');
});

// Mock console.error to avoid cluttering test output
const originalConsoleError = console.error;
console.error = (...args) => {
  if (process.env.NODE_ENV === 'test' && args[0]?.includes && args[0].includes('test error')) {
    return; // Suppress expected test errors
  }
  originalConsoleError(...args);
};
