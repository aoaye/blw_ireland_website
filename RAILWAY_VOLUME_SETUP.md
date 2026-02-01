# Railway Persistent Volume Setup Guide

This guide explains how to set up persistent storage on Railway so your data persists across redeployments.

## Problem

By default, when you redeploy your application on Railway, all data in the `data/` and `uploads/` folders is lost. This includes:
- Events calendar
- Instagram URLs
- Viewership records
- Uploaded images
- Site configuration
- Zone structure data

## Solution: Railway Persistent Volumes

Railway provides persistent volumes that survive redeployments. Your code has been updated to support this.

## Setup Steps

### Step 1: Create a Volume in Railway

1. Go to your Railway project dashboard
2. Click **"+ New"** or **"Add Service"**
3. Select **"Volume"** (not "GitHub Repo")
4. Name it: `data-storage` (or any name you prefer)
5. Railway will create the volume

### Step 2: Mount the Volume to Your Service

1. Go to your main service (the one running `admin-server.js`)
2. Click on the service to open its settings
3. Go to the **"Volumes"** or **"Mounts"** tab
4. Click **"Add Volume Mount"** or **"Mount"**
5. Select the volume you created (`data-storage`)
6. Set the **Mount Path** to: `/data`
7. Save the changes

### Step 3: Set Environment Variable (Recommended)

1. In your service settings, go to **"Variables"** tab
2. Add a new environment variable:
   - **Name**: `VOLUME_PATH`
   - **Value**: `/data`
3. This makes it explicit which path to use

### Step 4: Deploy

1. Commit and push your code changes
2. Railway will automatically redeploy
3. Check the logs to see the storage paths being used:
   ```
   Storage paths: { DATA_DIR: '/data/data', UPLOADS_DIR: '/data/uploads', USE_VOLUME: true, VOLUME_BASE: '/data' }
   ```

## How It Works

- **Local Development**: Uses `data/` and `uploads/` folders (relative paths)
- **Railway with Volume**: Uses `/data/data/` and `/data/uploads/` (persistent volume)

The code automatically detects:
- If `VOLUME_PATH` or `RAILWAY_VOLUME_MOUNT_PATH` is set → uses volume
- If `RAILWAY_ENVIRONMENT` is set → uses volume (assumes `/data`)
- Otherwise → uses local directories for development

## Directory Structure on Railway

After mounting at `/data`, your data will be organized as:

```
/data/
  ├── data/
  │   ├── config.json
  │   ├── events.json
  │   ├── instagram-config.json
  │   ├── stream-config.json
  │   ├── previous-streams.json
  │   ├── stream-viewership.json
  │   ├── zone-data.json
  │   └── archived-events.json
  └── uploads/
      ├── image-1234567890-123456789.jpeg
      └── ... (all uploaded images)
```

## First Deployment

**Important**: On your first deployment with the volume:

1. The volume will be empty initially
2. You'll need to either:
   - **Option A**: Manually upload your existing `data/` and `uploads/` folders to the volume
   - **Option B**: Use the backup/restore system (to be implemented)
   - **Option C**: Re-enter your data through the admin dashboard

## Verification

After setup, verify it's working:

1. **Check Logs**: Look for the storage paths log message
2. **Upload an Image**: Upload an image through admin dashboard
3. **Create an Event**: Add a test event
4. **Redeploy**: Trigger a redeployment (or wait for next auto-deploy)
5. **Verify Data Persists**: Check that your image and event are still there

## Troubleshooting

### Data Still Getting Deleted

- Verify the volume is mounted: Check service → Volumes tab
- Check mount path: Should be `/data`
- Verify environment variable: `VOLUME_PATH=/data` should be set
- Check logs: Look for the storage paths message

### Images Not Loading

- Verify `UPLOADS_DIR` is correct in logs
- Check that images are being saved to the volume path
- Verify static file serving is using the correct path

### Permission Errors

- Railway volumes should have correct permissions automatically
- If issues occur, check Railway documentation for volume permissions

## Next Steps

After setting up persistent volumes, consider:
1. Setting up automated backups (even with volumes, backups are good practice)
2. Monitoring disk space usage
3. Setting up alerts for low disk space

## Support

If you encounter issues:
1. Check Railway logs for error messages
2. Verify volume is mounted correctly
3. Check environment variables are set
4. Review the storage paths log message
