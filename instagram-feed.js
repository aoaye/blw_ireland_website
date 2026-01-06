// Simple Instagram Post Display
// Loads and displays an Instagram post URL configured in the admin portal

const INSTAGRAM_URL = 'https://www.instagram.com/blwirelandzone';

// Load Instagram post from admin configuration
async function loadInstagramPost() {
    const feedContainer = document.getElementById('instagram-feed');
    
    if (!feedContainer) {
        console.error('Instagram feed container not found');
        return;
    }

    try {
        // Load configuration from API
        const apiUrl = window.location.origin.includes('localhost')
            ? 'http://localhost:8080/api/instagram-config'
            : `${window.location.origin}/api/instagram-config`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const config = await response.json();
        const postUrl = (config.manualPostUrl || '').trim();
        
        console.log('Instagram config loaded:', { 
            hasPostUrl: !!postUrl,
            postUrl: postUrl ? postUrl.substring(0, 50) + '...' : 'none'
        });
        
        // If a post URL is configured, embed it
        if (postUrl && postUrl.includes('instagram.com/p/')) {
            embedInstagramPost(postUrl, feedContainer);
        } else {
            // Show placeholder with Instagram link
            showPlaceholder(feedContainer);
        }
    } catch (error) {
        console.error('Error loading Instagram config:', error);
        showPlaceholder(feedContainer);
    }
}

// Embed Instagram post using Instagram's official embed
function embedInstagramPost(postUrl, container) {
    // Clean the URL to ensure proper format
    const cleanUrl = cleanInstagramUrl(postUrl);
    console.log('Embedding Instagram post:', cleanUrl);
    
    // Create Instagram embed blockquote
    container.innerHTML = `
        <blockquote class="instagram-media" 
            data-instgrm-permalink="${cleanUrl}" 
            data-instgrm-version="14"
            style="background:#FFF; border:0; border-radius:10px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
        </blockquote>
    `;
    
    // Load Instagram's embed script if not already loaded
    if (!window.instgrm) {
        const script = document.createElement('script');
        script.src = 'https://www.instagram.com/embed.js';
        script.async = true;
        script.onload = function() {
            console.log('Instagram embed script loaded');
            if (window.instgrm && window.instgrm.Embeds) {
                window.instgrm.Embeds.process();
            }
        };
        script.onerror = function() {
            console.error('Failed to load Instagram embed script');
        };
        document.body.appendChild(script);
    } else {
        // Script already loaded, process embeds
        if (window.instgrm.Embeds) {
            window.instgrm.Embeds.process();
        }
    }
}

// Clean Instagram URL to proper format
function cleanInstagramUrl(url) {
    try {
        const urlObj = new URL(url);
        let pathname = urlObj.pathname;
        if (!pathname.endsWith('/')) {
            pathname += '/';
        }
        return `${urlObj.protocol}//${urlObj.host}${pathname}`;
    } catch (e) {
        // If URL parsing fails, try manual cleaning
        let cleaned = url.split('?')[0].split('#')[0];
        if (!cleaned.endsWith('/')) {
            cleaned += '/';
        }
        return cleaned;
    }
}

// Show placeholder when no post is configured
function showPlaceholder(container) {
    container.innerHTML = `
        <div class="instagram-placeholder">
            <p>Check back soon for our latest updates!</p>
            <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" class="instagram-button">
                <span>📷</span> Follow us on Instagram
            </a>
        </div>
    `;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadInstagramPost);
} else {
    loadInstagramPost();
}

// Periodically check for config updates (every 30 seconds)
setInterval(loadInstagramPost, 30000);
