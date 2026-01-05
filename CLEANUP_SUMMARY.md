# Codebase Cleanup Summary

## Files Removed

### 1. Test Coverage Directory
- `coverage/` - Generated test coverage files (already in .gitignore)
- **Reason**: Auto-generated, should not be in repository

### 2. Redundant Server Files
- `server.js` - Simple HTTP server for port 8000
- `start-server.bat` - Windows script for server.js
- `start-server.sh` - Linux/Mac script for server.js
- **Reason**: `admin-server.js` already serves static files and can handle the frontend website. The frontend can be accessed at `http://localhost:8080/` while admin is at `http://localhost:8080/admin`.

### 3. Outdated Documentation
- `INSTAGRAM_SETUP.md` - Outdated guide for manually editing instagram-feed.js
- `ADD_COLLEGES.md` - Outdated guide for manually editing zone-data.js
- **Reason**: Both features are now managed through the admin portal, making these guides obsolete.

## Files Kept (But Could Be Consolidated)

### Documentation Files
- `INSTAGRAM_API_SETUP.md` - Instagram Graph API setup (still relevant)
- `INSTAGRAM_SIMPLE_AUTO.md` - Alternative RSS method (could be merged into main Instagram docs)
- `SETUP_INSTRUCTIONS.md` - General setup guide
- `ADMIN_PORTAL.md` - Admin portal documentation
- `RTMP_SETUP.md` - RTMP streaming setup
- `README.md` - Main readme
- `TESTING.md` - Testing documentation

**Note**: Consider consolidating Instagram documentation into a single file in the future.

## Updated Files

### README.md
- Updated to reflect that admin-server.js serves both admin and frontend
- Removed references to server.js

### SETUP_INSTRUCTIONS.md
- Updated to show single server setup (admin-server.js handles everything)

## Recommendations

1. **Single Server Setup**: Use `admin-server.js` for everything:
   - Frontend website: `http://localhost:8080/`
   - Admin portal: `http://localhost:8080/admin`
   - API endpoints: `http://localhost:8080/api/*`

2. **Documentation Consolidation**: Consider merging Instagram documentation files into one comprehensive guide.

3. **Keep Test Files**: All test files in `__tests__/` are necessary and should be kept.

