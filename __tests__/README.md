# Test Suite Documentation

This directory contains unit tests for the BLW Ireland Zone website.

## Test Structure

- `admin-server.test.js` - Tests for backend API endpoints, authentication, and data management
- `admin-frontend.test.js` - Tests for admin portal frontend functions
- `frontend-api.test.js` - Tests for frontend API integration and data formatting
- `instagram-feed.test.js` - Tests for Instagram feed loading and URL handling
- `livestream.test.js` - Tests for live stream functionality and RTMP URL handling
- `utils.test.js` - Tests for utility functions

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## Test Coverage

The test suite covers:
- ✅ Authentication and session management
- ✅ API endpoint functionality
- ✅ Data validation and structure
- ✅ URL manipulation and cleaning
- ✅ Date formatting
- ✅ Frontend API integration
- ✅ Instagram feed configuration
- ✅ Live stream configuration
- ✅ Event management
- ✅ Error handling

## Writing New Tests

When adding new features, ensure you:
1. Write tests for new functions
2. Test both success and error cases
3. Test edge cases and boundary conditions
4. Maintain test coverage above 80%

## Mocking

Tests use mocks for:
- File system operations (fs.promises)
- Network requests (fetch)
- DOM manipulation (jsdom)

## Notes

- Tests are isolated and don't require a running server
- File operations are mocked to avoid test pollution
- Network requests are mocked to ensure fast, reliable tests

