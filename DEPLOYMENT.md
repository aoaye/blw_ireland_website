# Deployment Guide

This guide provides recommendations for hosting your BLW Ireland Zone website with your custom domain.

## Hosting Requirements

Your website needs:
- **Node.js runtime** (for admin-server.js)
- **Persistent file storage** (for `data/` and `uploads/` directories)
- **HTTPS/SSL support** (for security)
- **Custom domain support**
- **24/7 uptime** (for admin portal and API)

## Recommended Hosting Options

### 🥇 Option 1: Railway (Best for Simplicity)

**Why Railway:**
- ✅ Free tier available (with limits)
- ✅ Automatic HTTPS/SSL
- ✅ Easy deployment from GitHub
- ✅ Persistent file storage
- ✅ Custom domain support
- ✅ Node.js support out of the box
- ✅ Very easy to set up

**Pricing:** Free tier, then ~$5-10/month

**Setup Steps:**
1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub"
4. Select your repository
5. Railway auto-detects Node.js and runs `npm start`
6. Add your custom domain in project settings
7. SSL is automatic

**Pros:**
- Easiest deployment process
- Great developer experience
- Automatic SSL
- Good free tier

**Cons:**
- Free tier has resource limits
- May need paid plan for production

---

### 🥈 Option 2: Render (Great Free Tier)

**Why Render:**
- ✅ Generous free tier
- ✅ Automatic HTTPS/SSL
- ✅ Persistent disk storage
- ✅ Custom domain support
- ✅ Easy GitHub integration
- ✅ Node.js support

**Pricing:** Free tier available, then ~$7-25/month

**Setup Steps:**
1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Create new "Web Service"
4. Connect GitHub repository
5. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node
6. Add custom domain in settings
7. SSL is automatic

**Pros:**
- Best free tier for Node.js apps
- Persistent storage
- Reliable uptime
- Good documentation

**Cons:**
- Free tier apps sleep after inactivity
- Slightly more complex than Railway

---

### 🥉 Option 3: DigitalOcean App Platform

**Why DigitalOcean:**
- ✅ Professional hosting
- ✅ Automatic scaling
- ✅ Built-in databases (if needed later)
- ✅ Custom domain support
- ✅ Excellent uptime
- ✅ Good for production

**Pricing:** ~$5-12/month (no free tier, but reliable)

**Setup Steps:**
1. Push code to GitHub
2. Go to [digitalocean.com](https://digitalocean.com)
3. Create App → Connect GitHub
4. Configure:
   - Build: `npm install`
   - Run: `npm start`
5. Add custom domain
6. SSL is automatic

**Pros:**
- Very reliable
- Professional infrastructure
- Good support
- Scales well

**Cons:**
- Paid only (no free tier)
- More expensive than others

---

### Option 4: VPS (DigitalOcean Droplet, Linode, etc.)

**Why VPS:**
- ✅ Full control
- ✅ Most cost-effective long-term
- ✅ Can host multiple services
- ✅ Custom configuration

**Pricing:** ~$5-10/month

**Setup Steps:**
1. Create VPS (Ubuntu recommended)
2. Install Node.js: `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs`
3. Install PM2: `npm install -g pm2`
4. Clone your repository
5. Run `npm install`
6. Start with PM2: `pm2 start admin-server.js --name blw-website`
7. Set up Nginx reverse proxy
8. Configure SSL with Let's Encrypt
9. Point domain to VPS IP

**Pros:**
- Full control
- Most flexible
- Cost-effective
- Can add more services

**Cons:**
- Requires server management
- More setup work
- You handle updates/security

---

### Option 5: Vercel (For Frontend + Serverless)

**Why Vercel:**
- ✅ Excellent for static sites
- ✅ Free tier
- ✅ Automatic HTTPS
- ✅ Great performance
- ⚠️ Requires converting backend to serverless functions

**Note:** Would require refactoring admin-server.js into serverless functions.

---

## Pre-Deployment Checklist

Before deploying, make sure to:

### 1. Update Configuration

**admin-server.js:**
```javascript
// Change session secret
secret: process.env.SESSION_SECRET || 'your-strong-random-secret-here',

// Enable secure cookies for production
cookie: { 
    secure: true, // HTTPS only
    maxAge: 24 * 60 * 60 * 1000
}
```

### 2. Environment Variables

Create a `.env` file (don't commit to Git):
```env
NODE_ENV=production
PORT=8080
SESSION_SECRET=your-strong-random-secret-here
```

**Note:** Most hosting platforms set `PORT` automatically, so you may not need to set this.

### 3. Update API URLs

**frontend-api.js:**
```javascript
// Change from localhost to your domain
const API_BASE = 'https://yourdomain.com/api';
```

**instagram-feed.js:**
```javascript
// Update API endpoint
const response = await fetch('https://yourdomain.com/api/instagram-config');
```

### 4. Security Updates

- [ ] Change default admin password
- [ ] Update session secret
- [ ] Enable HTTPS
- [ ] Set secure cookies
- [ ] Review CORS settings if needed

### 5. File Structure

Ensure these directories exist and are writable:
- `data/` - For JSON configuration files
- `uploads/` - For uploaded images

---

## Deployment Steps (Railway Example)

### Step 1: Prepare Your Code

1. **Create `.gitignore`** (if not exists):
```gitignore
node_modules/
.env
data/*.json
uploads/*
coverage/
```

2. **Update `admin-server.js`** for production:
```javascript
const PORT = process.env.PORT || 8080;
```

**Note:** The code already uses `process.env.PORT || 8080`, so hosting platforms will automatically set the port.

3. **Commit and push to GitHub**

### Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Railway will auto-detect Node.js
5. Add environment variable: `PORT=3000`
6. Deploy!

### Step 3: Add Custom Domain

1. In Railway project, go to "Settings" → "Domains"
2. Click "Add Domain"
3. Enter your domain (e.g., `blwirelandzone.com`)
4. Railway provides DNS records to add:
   - CNAME record pointing to Railway's domain
5. Add the DNS records at your domain registrar
6. SSL certificate is automatically provisioned

### Step 4: Update Frontend API URLs

After deployment, update:
- `frontend-api.js`: Change `API_BASE` to your domain
- `instagram-feed.js`: Change API URL to your domain

---

## Post-Deployment

### 1. Test Everything
- [ ] Website loads at your domain
- [ ] Admin portal accessible at `/admin`
- [ ] Can log in to admin
- [ ] Can save configurations
- [ ] Images upload correctly
- [ ] Events display on homepage
- [ ] Instagram feed works

### 2. Set Up Backups
- Back up `data/` directory regularly
- Consider automated backups (Railway/Render have options)

### 3. Monitor
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor error logs
- Check disk space for uploads

---

## My Recommendation

**For your use case, I recommend Railway or Render:**

1. **Railway** - If you want the easiest setup
2. **Render** - If you want the best free tier
3. **DigitalOcean App Platform** - If you want professional hosting and don't mind paying

All three support:
- ✅ Custom domains
- ✅ Automatic SSL
- ✅ Node.js
- ✅ Persistent storage
- ✅ Easy deployment

---

## Quick Comparison

| Feature | Railway | Render | DigitalOcean | VPS |
|---------|---------|--------|--------------|-----|
| Free Tier | ✅ Limited | ✅ Generous | ❌ | ❌ |
| Ease of Setup | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Custom Domain | ✅ | ✅ | ✅ | ✅ |
| Auto SSL | ✅ | ✅ | ✅ | Manual |
| Cost/Month | $0-10 | $0-25 | $5-12 | $5-10 |
| Best For | Quick deploy | Free tier | Production | Control |

---

## Need Help?

If you need help with deployment, I can:
1. Create deployment configuration files
2. Update code for production
3. Set up environment variables
4. Configure domain settings

Let me know which hosting option you'd like to use!

