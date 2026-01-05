// Instagram Feed Configuration
const INSTAGRAM_USERNAME = 'blwirelandzone';
const INSTAGRAM_URL = 'https://www.instagram.com/blwirelandzone';

// Configuration: Choose your method
let AUTO_FETCH = true; // Set to true to automatically fetch latest post, false to use manual URL
let MANUAL_POST_URL = ''; // Only used if AUTO_FETCH is false

// Load config from API
async function loadInstagramConfigFromAPI() {
    try {
        // Use current origin in production, localhost in development
        const apiUrl = window.location.origin.includes('localhost')
            ? 'http://localhost:8080/api/instagram-config'
            : `${window.location.origin}/api/instagram-config`;
        const response = await fetch(apiUrl);
        const config = await response.json();
        // If autoFetch is explicitly false, use manual mode; otherwise default to true
        // Simplified logic: if config.autoFetch is explicitly false, use false, otherwise use true
        AUTO_FETCH = config.autoFetch !== false; // Only false if explicitly set to false
        MANUAL_POST_URL = (config.manualPostUrl || '').trim();
        console.log('Loaded Instagram config:', { AUTO_FETCH, MANUAL_POST_URL: MANUAL_POST_URL ? 'set' : 'empty' });
    } catch (error) {
        console.log('Admin API not available, using default configuration');
    }
}

// API endpoint (adjust if your backend is on a different server)
// Note: This endpoint needs to be implemented in admin-server.js if using auto-fetch
const API_ENDPOINT = window.location.origin.includes('localhost')
    ? 'http://localhost:8080/api/instagram/latest'
    : `${window.location.origin}/api/instagram/latest`;

function loadInstagramPost() {
    const feedContainer = document.getElementById('instagram-feed');
    
    if (!feedContainer) return;

    // Priority 1: If manual URL is set and autoFetch is false, use manual URL
    if (!AUTO_FETCH && MANUAL_POST_URL && MANUAL_POST_URL.trim() !== '') {
        console.log('Using manual post URL (autoFetch disabled):', MANUAL_POST_URL);
        embedInstagramPost(MANUAL_POST_URL);
        return;
    }

    // Priority 2: If autoFetch is enabled, try to fetch automatically
    if (AUTO_FETCH) {
        console.log('Auto-fetch enabled, fetching latest post...');
        fetchLatestPost()
            .then(postUrl => {
                if (postUrl) {
                    console.log('Auto-fetch successful:', postUrl);
                    embedInstagramPost(postUrl);
                } else {
                    // Fallback to manual URL if auto-fetch fails and manual URL exists
                    if (MANUAL_POST_URL && MANUAL_POST_URL.trim() !== '') {
                        console.log('Auto-fetch failed, using manual post URL as fallback:', MANUAL_POST_URL);
                        embedInstagramPost(MANUAL_POST_URL);
                    } else {
                        console.log('Auto-fetch failed and no manual URL available');
                        showSetupInstructions(feedContainer);
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching Instagram post:', error);
                // Fallback to manual URL if auto-fetch fails and manual URL exists
                if (MANUAL_POST_URL && MANUAL_POST_URL.trim() !== '') {
                    console.log('Auto-fetch error, using manual post URL as fallback:', MANUAL_POST_URL);
                    embedInstagramPost(MANUAL_POST_URL);
                } else {
                    console.log('Auto-fetch error and no manual URL available');
                    showSetupInstructions(feedContainer);
                }
            });
        return;
    }

    // Priority 3: If manual URL exists but autoFetch is not explicitly false, use it
    if (MANUAL_POST_URL && MANUAL_POST_URL.trim() !== '') {
        console.log('Using manual post URL (no autoFetch preference):', MANUAL_POST_URL);
        embedInstagramPost(MANUAL_POST_URL);
        return;
    }

    // Fallback: Show setup instructions
    console.log('No Instagram post configuration available');
    showSetupInstructions(feedContainer);
}

// Fetch latest post from API
async function fetchLatestPost() {
    try {
        const response = await fetch(API_ENDPOINT);
        const data = await response.json();
        
        if (data.success && data.postUrl) {
            return data.postUrl;
        } else {
            console.warn('API returned no post URL, trying RSS method...');
            // If API not configured, try RSS method
            return await fetchLatestPostAlternative();
        }
    } catch (error) {
        console.warn('API endpoint not available, trying RSS method...', error);
        // If API fails, try alternative RSS method
        return await fetchLatestPostAlternative();
    }
}

// Alternative method: Use RSS feed (no API key required!)
async function fetchLatestPostAlternative() {
    try {
        // Method 1: Try RSSHub (free, no API key needed)
        const rssUrl = `https://rsshub.app/instagram/user/${INSTAGRAM_USERNAME}`;
        const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
        
        const response = await fetch(rss2jsonUrl);
        const data = await response.json();
        
        if (data.status === 'ok' && data.items && data.items.length > 0) {
            // Extract Instagram post URL from RSS item
            const postUrl = data.items[0].link;
            if (postUrl && postUrl.includes('instagram.com/p/')) {
                return postUrl;
            }
        }
    } catch (error) {
        console.warn('RSS method failed:', error);
    }
    
    // If RSS fails, return null to show manual setup
    return null;
}

function showSetupInstructions(feedContainer) {
    feedContainer.innerHTML = `
        <div class="instagram-setup">
            <p>Check back soon for our latest updates!</p>
            <p class="instagram-note">
                <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer">Follow us on Instagram →</a>
            </p>
        </div>
    `;
}

function cleanInstagramUrl(url) {
    // Remove query parameters and hash, keep only the base post URL
    // Example: https://www.instagram.com/p/POST_ID/?utm_source=... -> https://www.instagram.com/p/POST_ID/
    try {
        const urlObj = new URL(url);
        // Reconstruct URL with just the pathname
        return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    } catch (e) {
        // If URL parsing fails, try to manually clean it
        return url.split('?')[0].split('#')[0];
    }
}

function embedInstagramPost(postUrl) {
    const feedContainer = document.getElementById('instagram-feed');
    
    if (!feedContainer) {
        console.error('Instagram feed container not found');
        return;
    }
    
    // Clean the URL to remove query parameters
    const cleanUrl = cleanInstagramUrl(postUrl);
    console.log('Embedding Instagram post:', cleanUrl);
    
    // Create Instagram embed blockquote (Instagram's official embed format)
    feedContainer.innerHTML = `
        <blockquote class="instagram-media" 
            data-instgrm-permalink="${cleanUrl}" 
            data-instgrm-version="14"
            style="background:#FFF; border:0; border-radius:10px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
        </blockquote>
    `;
    
    // Load Instagram's embed script if not already loaded
    if (!window.instgrm) {
        console.log('Loading Instagram embed script...');
        const script = document.createElement('script');
        script.src = 'https://www.instagram.com/embed.js';
        script.async = true;
        script.onload = function() {
            console.log('Instagram embed script loaded successfully');
            // Process embeds after a short delay to ensure everything is ready
            setTimeout(function() {
                if (window.instgrm && window.instgrm.Embeds) {
                    console.log('Processing Instagram embeds...');
                    try {
                        window.instgrm.Embeds.process();
                        console.log('Instagram embeds processed');
                    } catch (e) {
                        console.error('Error processing Instagram embeds:', e);
                    }
                } else {
                    console.warn('Instagram embed API not available after script load');
                }
            }, 200);
        };
        script.onerror = function() {
            console.error('Failed to load Instagram embed script');
            showSetupInstructions(feedContainer);
        };
        document.body.appendChild(script);
    } else {
        // Process embeds if script already loaded
        console.log('Instagram script already loaded, processing embeds...');
        if (window.instgrm && window.instgrm.Embeds) {
            // Small delay to ensure DOM is ready
            setTimeout(function() {
                try {
                    window.instgrm.Embeds.process();
                    console.log('Instagram embeds processed (script already loaded)');
                } catch (e) {
                    console.error('Error processing Instagram embeds:', e);
                }
            }, 200);
        } else {
            console.warn('Instagram embed API not available');
        }
    }
}

// Load Instagram post when page loads
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, initializing Instagram feed...');
    await loadInstagramConfigFromAPI();
    console.log('Config loaded, loading post...', { AUTO_FETCH, MANUAL_POST_URL: MANUAL_POST_URL ? 'set' : 'empty' });
    loadInstagramPost();
    
    // Periodically check for config updates (every 30 seconds)
    // This allows the page to update when admin changes the manual post URL
    setInterval(async () => {
        const oldManualUrl = MANUAL_POST_URL;
        const oldAutoFetch = AUTO_FETCH;
        await loadInstagramConfigFromAPI();
        
        // Reload if config changed
        if (oldManualUrl !== MANUAL_POST_URL || oldAutoFetch !== AUTO_FETCH) {
            console.log('Config changed, reloading Instagram post...');
            loadInstagramPost();
        }
    }, 30000); // Check every 30 seconds
});

// Also try to load if script is loaded after DOMContentLoaded
if (document.readyState === 'loading') {
    // DOM hasn't finished loading yet, wait for DOMContentLoaded
} else {
    // DOM is already loaded, initialize immediately
    console.log('DOM already loaded, initializing Instagram feed immediately...');
    (async function() {
        await loadInstagramConfigFromAPI();
        loadInstagramPost();
    })();
}

