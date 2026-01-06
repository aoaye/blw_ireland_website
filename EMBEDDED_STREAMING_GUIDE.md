# Embedded Streaming Guide

This guide explains how to use third-party streaming platforms (YouTube, Facebook, Vimeo) with your BLW Ireland Zone website.

## Overview

Instead of hosting your own RTMP server, you can stream to popular platforms and embed the stream on your website. This is **free** and requires no server infrastructure.

## Supported Platforms

### 1. YouTube Live (Recommended) ⭐
- **Cost**: Free
- **Pros**: Reliable, unlimited streaming, automatic recording, mobile-friendly
- **Best for**: Most churches

### 2. Facebook Live
- **Cost**: Free
- **Pros**: Good reach, community engagement
- **Best for**: Churches with active Facebook presence

### 3. Vimeo Live
- **Cost**: $75/month (Premium plan)
- **Pros**: No ads, professional, clean player
- **Best for**: Professional presentation, no ads

## How to Set Up YouTube Live Streaming

### Step 1: Set Up YouTube Live

1. Go to [YouTube Studio](https://studio.youtube.com/)
2. Click **Go Live** in the left sidebar
3. If this is your first time, you'll need to:
   - Verify your channel (requires phone verification)
   - Wait 24 hours after verification
4. Once ready, click **Create Stream**
5. Set up your stream:
   - **Title**: e.g., "BLW Ireland Zone - Sunday Service"
   - **Description**: Add service details
   - **Privacy**: Choose "Unlisted" (only people with link can view) or "Public"
6. Copy your **Stream Key** (you'll need this for OBS)

### Step 2: Configure OBS Studio

1. Open **OBS Studio**
2. Go to **Settings > Stream**
3. Configure:
   - **Service**: YouTube / YouTube Gaming
   - **Server**: Select the closest server (e.g., "Primary YouTube ingest server")
   - **Stream Key**: Paste your stream key from Step 1
4. Click **OK**
5. Click **Start Streaming** when ready

### Step 3: Get Your YouTube Stream URL

1. While streaming, go to your YouTube Studio
2. Click on your live stream
3. Copy the **Stream URL** (e.g., `https://www.youtube.com/watch?v=VIDEO_ID`)
   - Or just copy the **Video ID** (the part after `v=`)

### Step 4: Configure Your Website

1. Go to your admin portal: `http://localhost:8080/admin`
2. Navigate to **Live TV** section
3. Configure:
   - **Stream Type**: Select "Embedded (YouTube/Facebook/Vimeo)"
   - **Embedded Stream URL or ID**: 
     - Paste the full URL: `https://www.youtube.com/watch?v=VIDEO_ID`
     - OR just the video ID: `VIDEO_ID`
4. Click **Save Stream Configuration**
5. Visit `http://localhost:8080/livestream.html` to see your stream!

## How to Set Up Facebook Live Streaming

### Step 1: Get Facebook Stream Key

1. Go to [Facebook Live Producer](https://www.facebook.com/live/producer)
2. Click **Create Live Stream**
3. Copy your **Stream Key** and **Server URL**

### Step 2: Configure OBS

1. In OBS: **Settings > Stream**
2. **Service**: Facebook Live
3. **Server**: Paste the Server URL from Step 1
4. **Stream Key**: Paste your Stream Key

### Step 3: Get Facebook Post URL

1. Start streaming from OBS
2. Go to your Facebook page
3. Find your live post
4. Copy the **post URL** (e.g., `https://www.facebook.com/yourpage/videos/...`)

### Step 4: Configure Your Website

1. In admin portal, select "Embedded" stream type
2. Paste the full Facebook post URL
3. Save configuration

## How to Set Up Vimeo Live Streaming

### Step 1: Set Up Vimeo Live

1. Go to [Vimeo](https://vimeo.com/) and upgrade to Premium ($75/month)
2. Go to **Live** section
3. Create a new live event
4. Copy your **Stream Key** and **RTMP URL**

### Step 2: Configure OBS

1. In OBS: **Settings > Stream**
2. **Service**: Custom
3. **Server**: Paste the RTMP URL from Vimeo
4. **Stream Key**: Paste your Stream Key

### Step 3: Get Vimeo Video URL

1. Start streaming
2. Go to your Vimeo live event page
3. Copy the video URL (e.g., `https://vimeo.com/VIDEO_ID`)

### Step 4: Configure Your Website

1. In admin portal, select "Embedded" stream type
2. Paste the full Vimeo URL
3. Save configuration

## URL Formats Supported

### YouTube
- Full URL: `https://www.youtube.com/watch?v=VIDEO_ID`
- Short URL: `https://youtu.be/VIDEO_ID`
- Just ID: `VIDEO_ID` (11 characters)

### Facebook
- Full post URL: `https://www.facebook.com/yourpage/videos/...`

### Vimeo
- Full URL: `https://vimeo.com/VIDEO_ID`

## Tips

1. **YouTube Unlisted**: Use "Unlisted" privacy setting so only people with the link can view (more control)
2. **Test First**: Always test your stream before going live
3. **Backup Plan**: Keep your RTMP server as backup if needed
4. **Recording**: YouTube automatically saves your streams for later viewing
5. **Mobile**: Embedded streams work great on mobile devices

## Switching Between Stream Types

You can easily switch between:
- **Embedded** (YouTube/Facebook/Vimeo) - No server needed
- **RTMP/HLS/FLV** - Self-hosted streaming

Just change the "Stream Type" in the admin portal and save!

## Troubleshooting

**Stream not showing?**
- Verify the URL/ID is correct
- Make sure the stream is actually live
- Check browser console for errors (F12)

**YouTube video not loading?**
- Make sure the video ID is correct (11 characters)
- Check if the video is set to "Public" or "Unlisted"
- Try the full URL instead of just the ID

**Facebook embed not working?**
- Facebook embeds require the full post URL
- Make sure the post is public or accessible

## Cost Comparison

| Platform | Cost | Server Needed? |
|----------|------|---------------------|
| YouTube Live | Free | No |
| Facebook Live | Free | No |
| Vimeo Live | $75/month | No |
| Self-hosted RTMP | Free | Yes (server costs) |

**Recommendation**: Start with YouTube Live - it's free, reliable, and works great!

