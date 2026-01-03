# Quick Deployment Guide

## 🚀 Recommended: Railway (Easiest)

### Step 1: Prepare Code
1. Push your code to GitHub
2. Make sure `.env` is in `.gitignore` (already done)

### Step 2: Deploy
1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Railway auto-detects Node.js and runs `npm start`
5. Done! Your site is live

### Step 3: Add Your Domain
1. In Railway project → Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `blwirelandzone.com`)
4. Add the CNAME record Railway provides to your domain registrar
5. SSL is automatic!

### Step 4: Set Environment Variables
In Railway → Variables, add:
```
SESSION_SECRET=your-strong-random-secret-here
NODE_ENV=production
```

**That's it!** Your website will be live at your domain.

---

## Alternative: Render (Best Free Tier)

1. Go to [render.com](https://render.com)
2. Create "Web Service" → Connect GitHub
3. Settings:
   - Build: `npm install`
   - Start: `npm start`
4. Add custom domain in settings
5. SSL is automatic

---

## What Changed for Production

✅ **Code is now production-ready:**
- Port uses `process.env.PORT` (hosting platforms set this)
- API URLs auto-detect production vs development
- Secure cookies enabled in production
- Session secret from environment variable

✅ **No code changes needed** - just deploy!

---

## After Deployment

1. **Change admin password** (default is `admin`)
2. **Test everything:**
   - Website loads
   - Admin portal works
   - Can save configurations
   - Images upload
   - Events display

3. **Set up backups** (backup `data/` directory)

---

## Need Help?

The full deployment guide is in `DEPLOYMENT.md` with detailed instructions for all hosting options.

