# Complete Setup Instructions

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

This will install:
- Express (web server)
- express-session (authentication)
- multer (file uploads)
- bcryptjs (password hashing)
- body-parser (request parsing)
- dotenv (environment variables)

### 2. Start the Admin Server
```bash
# Windows
start-admin.bat

# Or directly
node admin-server.js
```

The admin portal will be available at: **http://localhost:8080/admin**
- Default password: `admin`

The public website will also be available at: **http://localhost:8080**
- The admin server serves both the frontend website and admin portal

## Architecture

### Single Server Setup

**Admin Server** (Port 8080) handles everything:
- Serves the public website at `http://localhost:8080/`
- Admin portal at `http://localhost:8080/admin`
- API endpoints for data management at `http://localhost:8080/api/*`
- File uploads
- Authentication

### Data Flow

```
Admin Server (Port 8080)
    ├── Frontend Website (/)
    ├── Admin Portal (/admin)
    └── API Endpoints (/api/*)
         ↓
    JSON files in data/
```

## First Time Setup

1. **Start Admin Server**
   ```bash
   node admin-server.js
   ```

2. **Login to Admin Portal**
   - Go to http://localhost:8080/admin
   - Password: `admin`

3. **Change Password**
   - Go to Settings section
   - Change admin password immediately

4. **Configure Your Content**
   - Add events in Events Calendar
   - Configure live stream in Live Stream section
   - Set up Instagram feed
   - Add colleges to Zone Structure
   - Upload images

## Production Deployment

This project uses a single Express server that serves both the frontend website and admin portal. For detailed deployment instructions, see **[DEPLOYMENT.md](DEPLOYMENT.md)**.

**Recommended hosting:**
- **Railway** - Easiest setup, supports persistent volumes (see [RAILWAY_VOLUME_SETUP.md](RAILWAY_VOLUME_SETUP.md))
- **Render** - Good free tier with persistent storage
- **DigitalOcean App Platform** - Professional hosting

**Important for production:**
- Set up persistent volumes for data storage (Railway volumes recommended)
- Change default admin password
- Enable HTTPS (automatic on most platforms)
- Set secure session cookies

## Important Files

### Backend
- `admin-server.js` - Main admin server
- `data/` - JSON data storage
- `uploads/` - Uploaded images

### Frontend
- `index.html`, `about.html`, `livestream.html` - Public pages
- `frontend-api.js` - API integration
- `admin/` - Admin portal files

### Configuration
- `package.json` - Dependencies
- `.env` - Environment variables (optional)

## Security Checklist

- [ ] Change default admin password
- [ ] Update session secret in admin-server.js
- [ ] Enable HTTPS in production
- [ ] Set secure cookies in production
- [ ] Add rate limiting
- [ ] Implement CORS properly
- [ ] Backup data/ directory regularly
- [ ] Set proper file permissions

## Troubleshooting

**Admin portal won't start?**
- Check if port 8080 is available
- Ensure all dependencies are installed: `npm install`

**Can't login?**
- Default password is `admin`
- Check browser console for errors
- Verify admin-server.js is running

**Frontend not loading data?**
- Ensure admin server is running on port 8080
- Check browser console for CORS errors
- Update API_BASE in frontend-api.js if needed

**Images not uploading?**
- Check uploads/ directory exists
- Verify file permissions
- Check file size (max 10MB)

## Next Steps

1. **Configure Content** - Add events, images, and configure livestream
2. **Set Up Persistent Storage** - See [RAILWAY_VOLUME_SETUP.md](RAILWAY_VOLUME_SETUP.md) for Railway
3. **Deploy to Production** - See [DEPLOYMENT.md](DEPLOYMENT.md) for hosting options
4. **Change Admin Password** - Do this immediately after first login
5. **Set Up Backups** - Regular backups of `data/` and `uploads/` directories

## Documentation

- **[ADMIN_PORTAL.md](ADMIN_PORTAL.md)** - Complete admin portal feature guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[EMBEDDED_STREAMING_GUIDE.md](EMBEDDED_STREAMING_GUIDE.md)** - YouTube streaming setup
- **[RAILWAY_VOLUME_SETUP.md](RAILWAY_VOLUME_SETUP.md)** - Persistent storage setup

