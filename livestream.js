// Simple YouTube Live Stream Embed
// Loads and displays a YouTube stream configured in the admin portal

// Load stream configuration from API
async function loadStream() {
    const videoWrapper = document.querySelector('.video-wrapper');
    const placeholder = document.getElementById('stream-placeholder');
    
    if (!videoWrapper || !placeholder) {
        console.error('Stream container not found');
        return;
    }

    try {
        // Load configuration from API
        const apiUrl = window.location.origin.includes('localhost')
            ? 'http://localhost:8080/api/stream-config'
            : `${window.location.origin}/api/stream-config`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const config = await response.json();
        const streamUrl = (config.embeddedStreamUrl || '').trim();
        
        console.log('Stream config loaded:', { 
            hasStreamUrl: !!streamUrl,
            streamUrl: streamUrl ? streamUrl.substring(0, 50) + '...' : 'none'
        });
        
        // If a stream URL is configured, embed it
        if (streamUrl) {
            embedYouTubeStream(streamUrl, videoWrapper, placeholder);
        } else {
            // Show placeholder and hide chat
            showPlaceholder(videoWrapper, placeholder);
            hideYouTubeChat();
        }
    } catch (error) {
        console.error('Error loading stream config:', error);
        showPlaceholder(videoWrapper, placeholder);
        hideYouTubeChat();
    }
}

// Extract YouTube video ID from URL
function extractYouTubeVideoId(streamUrl) {
    let videoId = '';
    
    if (streamUrl.includes('youtube.com/watch?v=')) {
        videoId = streamUrl.split('v=')[1].split('&')[0];
    } else if (streamUrl.includes('youtu.be/')) {
        videoId = streamUrl.split('youtu.be/')[1].split('?')[0];
    } else if (streamUrl.includes('youtube.com/embed/')) {
        videoId = streamUrl.split('embed/')[1].split('?')[0];
    } else if (streamUrl.length === 11 && /^[a-zA-Z0-9_-]+$/.test(streamUrl)) {
        // Assume it's just the video ID
        videoId = streamUrl;
    }
    
    return videoId;
}

// Embed YouTube stream
function embedYouTubeStream(streamUrl, container, placeholder) {
    const videoId = extractYouTubeVideoId(streamUrl);
    
    if (!videoId) {
        console.error('Could not extract YouTube video ID from:', streamUrl);
        showPlaceholder(container, placeholder);
        hideYouTubeChat();
        return;
    }
    
    console.log('Embedding YouTube stream:', videoId);
    
    // Hide placeholder
    placeholder.style.display = 'none';
    
    // Create or update iframe
    let iframe = container.querySelector('iframe');
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        iframe.allowFullscreen = true;
        iframe.setAttribute('frameborder', '0');
        container.appendChild(iframe);
    }
    
    // Set iframe source for YouTube live stream
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    iframe.style.display = 'block';
    
    // Also embed YouTube live chat
    embedYouTubeChat(videoId);
}

// Embed YouTube live chat
function embedYouTubeChat(videoId) {
    const chatContainer = document.getElementById('youtube-chat-container');
    if (!chatContainer || !videoId) {
        hideYouTubeChat();
        return;
    }
    
    console.log('Embedding YouTube chat for video:', videoId);
    
    // Get the current domain for embed_domain parameter
    const embedDomain = window.location.hostname || window.location.host;
    
    // Always use light theme for YouTube chat (better readability)
    // Create YouTube live chat iframe with light theme
    chatContainer.innerHTML = `
        <iframe 
            src="https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${embedDomain}&dark_theme=0"
            style="width: 100%; height: 100%; border: none; border-radius: 10px;"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowfullscreen>
        </iframe>
    `;
}

// Hide YouTube chat when no stream is active
function hideYouTubeChat() {
    const chatContainer = document.getElementById('youtube-chat-container');
    if (!chatContainer) return;
    
    chatContainer.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; padding: 2rem; text-align: center; color: #666;">
            <div>
                <p>Chat will appear when a live stream is active</p>
                <p style="font-size: 0.9em; margin-top: 0.5rem;">Join the conversation during our live services!</p>
            </div>
        </div>
    `;
}

// Show placeholder when no stream is configured
function showPlaceholder(container, placeholder) {
    // Hide any existing iframe
    const iframe = container.querySelector('iframe');
    if (iframe) {
        iframe.style.display = 'none';
    }
    
    // Show placeholder
    placeholder.style.display = 'flex';
    
    // Hide chat
    hideYouTubeChat();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadStream);
} else {
    loadStream();
}

// Periodically check for config updates (every 30 seconds)
setInterval(loadStream, 30000);

