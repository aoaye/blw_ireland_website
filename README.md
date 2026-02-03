# BLW Ireland Zone Website

A modern, responsive website for BLW Ireland Zone with live streaming capabilities.

## Features

- 🏠 **Homepage** - Welcome page with features and upcoming events
- 📺 **Live Stream** - YouTube embedded streaming with viewer registration
- ℹ️ **About Page** - Information about the organization
- 🎛️ **Admin Portal** - Full content management system

## Quick Start - Local Development

### Install and Run

```bash
# Install dependencies first:
npm install

# Then run:
npm start
# Or: node admin-server.js
```

The website will be available at: **http://localhost:8080**  
The admin portal will be at: **http://localhost:8080/admin**  
Default admin password: `admin` (change this immediately!)

**For Live Streaming:**
- Configure YouTube Live streaming in the Admin Portal
- See [EMBEDDED_STREAMING_GUIDE.md](EMBEDDED_STREAMING_GUIDE.md) for detailed setup instructions

## File Structure

```
blw_ireland_website/
├── index.html          # Homepage
├── livestream.html     # Live TV page
├── about.html          # About page
├── styles.css          # Main stylesheet
├── script.js           # Main JavaScript
├── livestream.js       # Live TV functionality
├── admin-server.js     # Admin server (serves frontend + admin)
├── package.json        # Node.js configuration
├── start-admin.bat     # Windows admin server script
└── README.md           # This file
```

## Documentation

- **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)** - Complete setup guide
- **[ADMIN_PORTAL.md](ADMIN_PORTAL.md)** - Admin portal feature guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[EMBEDDED_STREAMING_GUIDE.md](EMBEDDED_STREAMING_GUIDE.md)** - YouTube streaming setup
- **[RAILWAY_VOLUME_SETUP.md](RAILWAY_VOLUME_SETUP.md)** - Persistent storage setup for Railway

## Features Overview

- **Content Management** - Admin portal for managing events, images, and content
- **Live Streaming** - YouTube embedded streaming with viewer registration and attendance tracking
- **Event Calendar** - Add and manage upcoming events (automatically archives past events)
- **Instagram Feed** - Display Instagram posts on homepage
- **Zone Structure** - Manage groups and colleges with images
- **Hero Slideshow** - Multiple background images that cycle automatically
- **Viewership Tracking** - Track unique viewers and export attendance data to CSV

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## Notes

- The website is fully responsive and works on mobile devices
- Requires Node.js backend for full functionality (admin portal, API, file uploads)
- Data is stored in JSON files (supports Railway persistent volumes)
- All content is managed through the admin portal

## Troubleshooting

**Server won't start?**
- Make sure Node.js is installed: `node --version`
- Check if port 8080 is already in use
- Ensure dependencies are installed: `npm install`

**Can't login to admin?**
- Default password is `admin`
- Check browser console for errors (F12)
- Verify admin-server.js is running

**Images not uploading?**
- Check that `uploads/` directory exists and is writable
- Verify file size is under 10MB
- Check server logs for errors

For more help, see [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) or [DEPLOYMENT.md](DEPLOYMENT.md).

