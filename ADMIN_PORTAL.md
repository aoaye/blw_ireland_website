# Admin Portal Guide

## Overview

The BLW Ireland Zone Admin Portal provides comprehensive control over your website content, including:

- **Live Stream Management** - Configure RTMP/HLS/FLV streams
- **Instagram Feed** - Manual or automatic post fetching
- **Events Calendar** - Add, edit, and delete events
- **Zone Structure** - Manage groups and colleges with GUI
- **Image Management** - Upload images for backgrounds and groups
- **Site Settings** - Configure site title, tagline, and admin password

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Admin Server**
   ```bash
   # Windows
   start-admin.bat
   
   # Or directly
   node admin-server.js
   ```

3. **Access the Portal**
   - Open: http://localhost:3000/admin
   - Default password: `admin`

## Features

### 1. Live Stream Management
- Configure RTMP/HLS/FLV stream URLs
- Set stream type (RTMP, HLS, or FLV)
- Toggle live status
- Changes reflect immediately on the livestream page

### 2. Instagram Feed
- **Auto-fetch mode**: Automatically fetches latest post using Instagram API
- **Manual mode**: Set a specific post URL
- Configure Instagram Access Token and User ID for API access
- See `INSTAGRAM_API_SETUP.md` for API setup instructions

### 3. Events Calendar
- Add new events with title, description, date, time, and day
- Edit existing events
- Delete events
- Events automatically appear on the homepage "Upcoming Events" section

### 4. Zone Structure
- Edit group names (Group A, B, C)
- Add/remove colleges for each group
- Upload group images
- Changes reflect on the About page dropdowns

### 5. Image Management
- Upload images for:
  - Hero background (homepage banner)
  - Group images (above group names in dropdowns)
  - Other purposes
- Images are stored in the `uploads/` folder
- Maximum file size: 10MB
- Supported formats: JPEG, PNG, GIF, WebP

### 6. Settings
- Change site title
- Update tagline
- Change admin password (default: `admin`)

## Data Storage

All data is stored in JSON files in the `data/` directory:
- `config.json` - Site configuration and admin password
- `events.json` - Events calendar
- `zone-data.json` - Zone structure and colleges
- `stream-config.json` - Live stream configuration
- `instagram-config.json` - Instagram feed settings

**Important**: Keep these files backed up!

## Security Notes

1. **Change Default Password**: Change the admin password immediately after first login
2. **Production Deployment**: 
   - Use HTTPS in production
   - Set `secure: true` in session configuration
   - Change the session secret in `admin-server.js`
   - Consider adding rate limiting
3. **File Permissions**: Ensure `data/` and `uploads/` directories have proper permissions

## API Endpoints

All API endpoints require authentication (except `/api/config` and `/api/events` for public access):

- `POST /api/admin/login` - Login
- `POST /api/admin/logout` - Logout
- `GET /api/admin/check-auth` - Check authentication status
- `GET /api/config` - Get site configuration
- `PUT /api/config` - Update configuration (requires auth)
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (requires auth)
- `PUT /api/events/:id` - Update event (requires auth)
- `DELETE /api/events/:id` - Delete event (requires auth)
- `GET /api/zone-data` - Get zone structure
- `PUT /api/zone-data` - Update zone structure (requires auth)
- `GET /api/stream-config` - Get stream configuration
- `PUT /api/stream-config` - Update stream config (requires auth)
- `GET /api/instagram-config` - Get Instagram config
- `PUT /api/instagram-config` - Update Instagram config (requires auth)
- `POST /api/upload` - Upload image (requires auth)
- `DELETE /api/upload/:filename` - Delete image (requires auth)

## Troubleshooting

**Can't login?**
- Default password is `admin`
- Check browser console for errors
- Ensure admin-server.js is running

**Images not uploading?**
- Check `uploads/` directory exists and is writable
- Verify file size is under 10MB
- Ensure file is a valid image format

**Changes not appearing on website?**
- Frontend needs to be updated to fetch from API (see next section)
- Restart the admin server if needed
- Clear browser cache

## Next Steps

To fully integrate the admin portal with your website:

1. Update frontend JavaScript files to fetch data from API endpoints
2. Replace hardcoded content with API data
3. Test all functionality
4. Deploy both admin server and frontend

See the updated frontend files for API integration examples.

