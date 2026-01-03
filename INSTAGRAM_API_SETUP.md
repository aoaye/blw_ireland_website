# Instagram API Setup for Automatic Post Fetching

This guide will help you set up automatic fetching of your most recent Instagram post.

## Option 1: Instagram Graph API (Recommended)

### Prerequisites
- A Facebook Business account
- Your Instagram account connected to a Facebook Page
- Access to Facebook Developers

### Step-by-Step Setup

1. **Create a Facebook App**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Click "My Apps" → "Create App"
   - Choose "Business" type
   - Fill in app details and create

2. **Add Instagram Basic Display Product**
   - In your app dashboard, click "Add Product"
   - Find "Instagram Basic Display" and click "Set Up"
   - Follow the setup wizard

3. **Get Your Access Token**
   - Go to Tools → Graph API Explorer
   - Select your app
   - Generate a User Token with these permissions:
     - `instagram_basic`
     - `pages_read_engagement`
   - Click "Generate Access Token"

4. **Get Your Instagram User ID**
   - In Graph API Explorer, query: `me/accounts`
   - Find your Instagram account ID
   - Or use: `https://graph.instagram.com/me?fields=id&access_token=YOUR_TOKEN`

5. **Configure Your Server**
   - Set environment variables:
     ```bash
     export INSTAGRAM_ACCESS_TOKEN="your_access_token_here"
     export INSTAGRAM_USER_ID="your_user_id_here"
     ```
   - Or create a `.env` file (if using dotenv package):
     ```
     INSTAGRAM_ACCESS_TOKEN=your_access_token_here
     INSTAGRAM_USER_ID=your_user_id_here
     ```

6. **Install dotenv (optional but recommended)**
   ```bash
   npm install dotenv
   ```
   
   Then add to the top of `server.js`:
   ```javascript
   require('dotenv').config();
   ```

### Long-Lived Token (Important!)

Instagram tokens expire. To get a long-lived token:

1. Exchange your short-lived token:
   ```
   GET https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=YOUR_CLIENT_SECRET&access_token=SHORT_LIVED_TOKEN
   ```

2. Long-lived tokens last 60 days and can be refreshed

## Option 2: Using a Third-Party Service

### EmbedSocial (Free tier available)
- Sign up at [EmbedSocial](https://embedsocial.com/)
- Connect your Instagram account
- Get embed code or API access
- Update `instagram-feed.js` to use their API

### SnapWidget (Free)
- Go to [SnapWidget](https://snapwidget.com/)
- Create a widget for your Instagram
- Get the embed code
- Update your HTML

## Option 3: Serverless Function (Vercel/Netlify)

If deploying to Vercel or Netlify, create a serverless function:

### For Vercel:
Create `api/instagram.js`:
```javascript
export default async function handler(req, res) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;
  
  const response = await fetch(
    `https://graph.instagram.com/${userId}/media?fields=permalink&access_token=${token}&limit=1`
  );
  
  const data = await response.json();
  res.json(data);
}
```

### For Netlify:
Create `netlify/functions/instagram.js`:
```javascript
exports.handler = async (event, context) => {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;
  
  const response = await fetch(
    `https://graph.instagram.com/${userId}/media?fields=permalink&access_token=${token}&limit=1`
  );
  
  const data = await response.json();
  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
};
```

## Option 4: Manual Method (Simplest)

If API setup is too complex:

1. Set `AUTO_FETCH = false` in `instagram-feed.js`
2. Add your post URL to `MANUAL_POST_URL`
3. Update weekly when you want to feature a new post

## Testing

After setup, test your API endpoint:
```bash
curl http://localhost:8000/api/instagram/latest
```

You should get a JSON response with the post URL.

## Troubleshooting

**"Invalid access token"**
- Token may have expired
- Regenerate token in Facebook Developers
- Use long-lived token

**"User not found"**
- Make sure Instagram account is connected to Facebook Page
- Verify User ID is correct

**CORS errors**
- Make sure your server sets proper CORS headers
- Check that API endpoint is accessible

**Rate limits**
- Instagram API has rate limits
- Cache responses on your server
- Consider updating only once per day

## Security Notes

- **Never commit access tokens to Git**
- Use environment variables
- Add `.env` to `.gitignore`
- Rotate tokens regularly
- Use long-lived tokens and refresh them

## Refresh Token Script

Create `refresh-token.js` to refresh your token:
```javascript
const https = require('https');

const SHORT_LIVED_TOKEN = 'your_short_lived_token';
const CLIENT_SECRET = 'your_client_secret';

const url = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${CLIENT_SECRET}&access_token=${SHORT_LIVED_TOKEN}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(JSON.parse(data)));
});
```

Run this before your token expires to get a new long-lived token.

