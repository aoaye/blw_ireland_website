# Testing Guide

This document provides information about the test suite for the BLW Ireland Zone website.

## Overview

The test suite includes comprehensive unit tests for:
- Backend API endpoints (admin-server.js)
- Admin frontend functions (admin/admin.js)
- Frontend API integration (frontend-api.js)
- Instagram feed functionality (instagram-feed.js)
- Live stream functionality (livestream.js)
- Utility functions

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Tests
```bash
npm test
```

### 3. Run Tests with Coverage
```bash
npm run test:coverage
```

## Test Files

### `__tests__/admin-server.test.js`
Tests for backend server functionality:
- Authentication and password hashing
- API endpoint data structures
- Configuration management
- Events, zone data, stream config, and Instagram config

### `__tests__/admin-frontend.test.js`
Tests for admin portal frontend:
- UI interactions (toggle fields)
- Config loading
- Event management
- Form validation
- Error handling

### `__tests__/frontend-api.test.js`
Tests for frontend API integration:
- Event fetching and formatting
- Date formatting functions
- Zone data loading
- Config loading

### `__tests__/instagram-feed.test.js`
Tests for Instagram feed:
- URL cleaning and validation
- Config loading
- Auto-fetch logic
- Manual post handling

### `__tests__/livestream.test.js`
Tests for live stream functionality:
- RTMP URL combination
- Stream type detection
- HLS/FLV URL construction
- Config loading and validation

### `__tests__/utils.test.js`
Tests for utility functions:
- Date formatting
- URL validation
- String manipulation
- Data validation
- Array operations

## Test Coverage Goals

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Running Specific Tests

### Run a single test file
```bash
npm test -- admin-server.test.js
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="Instagram"
```

### Run tests in watch mode
```bash
npm run test:watch
```

## Writing New Tests

When adding new features:

1. **Create test file** in `__tests__/` directory
2. **Follow naming convention**: `*.test.js`
3. **Test both success and error cases**
4. **Test edge cases and boundary conditions**
5. **Mock external dependencies** (file system, network, etc.)

### Example Test Structure

```javascript
describe('Feature Name', () => {
    beforeEach(() => {
        // Setup before each test
    });

    it('should do something correctly', () => {
        // Test implementation
        expect(result).toBe(expected);
    });

    it('should handle errors gracefully', () => {
        // Error case test
    });
});
```

## Mocking

The test suite uses mocks for:
- **File System**: `fs.promises` operations
- **Network Requests**: `fetch` API
- **DOM**: jsdom for browser APIs

## Continuous Integration

Tests can be integrated into CI/CD pipelines:
```bash
npm test -- --coverage --watchAll=false
```

## Troubleshooting

### Tests failing due to module resolution
- Ensure all dependencies are installed: `npm install`
- Check that `node_modules` exists

### Coverage not generating
- Run: `npm run test:coverage`
- Check `coverage/` directory

### Tests timing out
- Increase timeout in `jest.config.js` or test file
- Check for infinite loops or hanging promises

## Best Practices

1. **Keep tests isolated** - Each test should be independent
2. **Use descriptive test names** - Clearly state what is being tested
3. **Test one thing at a time** - Each test should verify one behavior
4. **Mock external dependencies** - Don't rely on real file system or network
5. **Clean up after tests** - Use `beforeEach` and `afterEach` for setup/teardown

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

