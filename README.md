# BLW Ireland Zone Website

A modern, responsive website for BLW Ireland Zone with live streaming capabilities.

## Features

- 🏠 **Homepage** - Welcome page with features and upcoming events
- 📺 **Live Stream** - RTMP/HLS/FLV streaming support
- ℹ️ **About Page** - Information about the organization

## Quick Start - Local Testing

### Option 1: Python HTTP Server (Easiest)

**Windows:**
```bash
# Run in command prompt:
python -m http.server 8000
```

**Mac/Linux:**
```bash
# Run directly:
python3 -m http.server 8000
```

Then open: **http://localhost:8000**

**Note**: For full functionality (admin portal, API), use Option 2 instead.

### Option 2: Admin Server (Recommended)

```bash
# Install dependencies first:
npm install

# Then run:
node admin-server.js
```

The website will be available at: **http://localhost:3000**
The admin portal will be at: **http://localhost:3000/admin**

### Option 3: VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 4: PHP Built-in Server

```bash
php -S localhost:8000
```

## Deploying to a Test Server

### Option 1: GitHub Pages (Free)

1. Create a GitHub repository
2. Upload all files
3. Go to Settings > Pages
4. Select main branch
5. Your site will be at: `https://yourusername.github.io/repository-name`

### Option 2: Netlify (Free)

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your project folder
3. Your site will be live instantly!

### Option 3: Vercel (Free)

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project folder
3. Follow the prompts

### Option 4: Traditional Web Hosting

1. Upload all files via FTP to your web hosting
2. Ensure `index.html` is in the root directory
3. Access via your domain name

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

## RTMP Stream Setup

See `RTMP_SETUP.md` for detailed instructions on configuring your RTMP server.

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## Notes

- The website is fully responsive and works on mobile devices
- All pages are static HTML/CSS/JavaScript
- No backend server required for basic functionality
- Live stream requires RTMP server configuration

## Troubleshooting

**Server won't start?**
- Make sure Python or Node.js is installed
- Check if port 8000 is already in use
- Try a different port: `python -m http.server 8080`

**Pages not loading?**
- Make sure all files are in the same directory
- Check browser console for errors (F12)
- Ensure file names match exactly (case-sensitive on Linux/Mac)

## Support

For issues or questions, check the RTMP setup guide or consult your web administrator.

