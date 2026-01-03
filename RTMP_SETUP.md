# RTMP Stream Setup Guide

This guide will help you configure your custom RTMP server for the BLW Ireland Zone website.

## Overview

The live stream page supports multiple streaming formats:
- **RTMP** - Direct RTMP streaming (may require Flash or server conversion)
- **HLS** - HTTP Live Streaming (recommended for modern browsers)
- **FLV** - Flash Video format (via flv.js)

## RTMP Server Configuration

### Option 1: Direct RTMP Stream

For RTMP streams, you need to provide:
1. **RTMP Server URL**: The server address and path (e.g., `rtmp://your-server.com:1935/live`)
2. **Stream Key**: Your unique stream key (provided by your RTMP server)

The system will automatically combine them into: `rtmp://your-server.com:1935/live/your-stream-key`

**Note:** Modern browsers don't natively support RTMP. You may need to:
- Use a server that converts RTMP to HLS or FLV
- Or use the FLV option if your server provides HTTP-FLV

**Security:** The stream key is stored separately and kept secure. Never share your stream key publicly.

### Option 2: RTMP to HLS Conversion (Recommended)

For best browser compatibility, convert your RTMP stream to HLS on the server side.

**Using Nginx with RTMP module:**
```nginx
rtmp {
    server {
        listen 1935;
        application live {
            live on;
            hls on;
            hls_path /var/www/html/hls;
            hls_fragment 2s;
            hls_playlist_length 10s;
        }
    }
}

http {
    server {
        listen 80;
        location /hls {
            types {
                application/vnd.apple.mpegurl m3u8;
                video/mp2t ts;
            }
            root /var/www/html;
            add_header Cache-Control no-cache;
        }
    }
}
```

Then use the HLS URL:
```
http://your-server.com/hls/stream-key.m3u8
```

### Option 3: RTMP to FLV Conversion

If your server provides HTTP-FLV, use the FLV option in the player.

**Using Nginx with RTMP module:**
```nginx
rtmp {
    server {
        listen 1935;
        application live {
            live on;
            http_flv_live 1935 app=live;
        }
    }
}
```

Then use the FLV URL:
```
http://your-server.com:1935/live?app=live&stream=stream-key
```

## How to Use

1. **Open the Live Stream page** on your website
2. **Enter your RTMP configuration**:
   - **RTMP Server URL**: Enter your server URL (e.g., `rtmp://server.com:1935/live`)
   - **Stream Key**: Enter your stream key (required for RTMP streams)
   - **Stream Type**: Select the format:
     - RTMP: For direct RTMP streams (server URL + stream key will be combined)
     - HLS: If your server converts RTMP to HLS (may need full playback URL)
     - FLV: If your server provides HTTP-FLV (may need full playback URL)
3. **Click "Load Stream"** to start the stream

**Note:** For HLS and FLV streams, if the automatic URL construction doesn't work, you may need to enter the full playback URL in the Server URL field.

## Popular RTMP Server Solutions

### 1. Nginx with RTMP Module
- Free and open-source
- Supports RTMP, HLS, and HTTP-FLV
- Good performance and scalability

### 2. OBS Studio (for streaming)
- Free streaming software
- Can stream to RTMP servers
- Great for live events

### 3. SRS (Simple Realtime Server)
- Open-source streaming server
- Supports RTMP, HLS, WebRTC
- Modern and actively maintained

### 4. MediaMTX (formerly rtsp-simple-server)
- Lightweight streaming server
- Supports multiple protocols
- Easy to configure

## Testing Your Stream

1. **Test with OBS Studio:**
   - Open OBS Studio
   - Go to Settings > Stream
   - Set Service to "Custom"
   - Enter your RTMP server URL
   - Start streaming

2. **Verify the stream:**
   - Check if the stream appears on your website
   - Monitor for any errors in the browser console (F12)

## Troubleshooting

### Stream not loading?
- Verify your RTMP server is running and accessible
- Check that both the server URL and stream key are correct
- Ensure the stream is actually broadcasting (someone needs to be streaming to the server)
- For RTMP: Make sure both server URL and stream key are provided
- For HLS/FLV: You may need to enter the full playback URL manually
- Check browser console for errors (F12)

### RTMP not working in browser?
- Modern browsers don't support RTMP natively
- Use HLS or FLV format instead
- Or set up server-side conversion from RTMP to HLS

### CORS errors?
- Configure your server to allow CORS headers
- Add appropriate headers for video streaming

## Security Considerations

- Use HTTPS for HLS streams
- Implement authentication for your RTMP server
- Use stream keys to prevent unauthorized access
- Consider using a CDN for better performance

## Example Configurations

### RTMP Stream
- **Server URL**: `rtmp://live.example.com:1935/live`
- **Stream Key**: `your-stream-key`
- **Combined URL** (auto-generated): `rtmp://live.example.com:1935/live/your-stream-key`

### HLS Stream
- **Server URL**: `https://live.example.com/hls/your-stream-key.m3u8` (full URL)
- **OR** Server URL: `rtmp://live.example.com:1935/live` + Stream Key: `your-stream-key` (auto-converted)

### FLV Stream
- **Server URL**: `http://live.example.com:1935/live?app=live&stream=your-stream-key` (full URL)
- **OR** Server URL: `rtmp://live.example.com:1935/live` + Stream Key: `your-stream-key` (auto-converted)

## Need Help?

If you need assistance setting up your RTMP server, consider:
- Consulting your server administrator
- Checking your RTMP server's documentation
- Using a managed streaming service (like AWS MediaLive, Wowza, etc.)

