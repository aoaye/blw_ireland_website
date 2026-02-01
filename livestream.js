// Simple YouTube Live Stream Embed
// Loads and displays a YouTube stream configured in the admin portal

// ==================== SESSION MANAGEMENT ====================

const SESSION_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
const SESSION_KEY = 'blw_stream_session';
const REGISTRATION_KEY = 'blw_registration_shown';

// Get or create session
function getSession() {
    let session = localStorage.getItem(SESSION_KEY);
    
    if (session) {
        try {
            session = JSON.parse(session);
            // Check if session expired
            const now = Date.now();
            if (now - session.createdAt > SESSION_DURATION) {
                // Session expired, create new one
                session = createNewSession();
            } else {
                // Update last activity
                session.lastActivity = now;
                localStorage.setItem(SESSION_KEY, JSON.stringify(session));
            }
        } catch {
            session = createNewSession();
        }
    } else {
        session = createNewSession();
    }
    
    return session;
}

// Create new session
function createNewSession() {
    const session = {
        sessionId: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        createdAt: Date.now(),
        lastActivity: Date.now(),
        firstName: null,
        lastName: null,
        viewerEmail: null,
        viewerPhone: null
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
}

// ==================== REGISTRATION POPUP ====================

// Show registration popup
function showRegistrationPopup(session, videoId) {
    // Only show if there's a valid video ID (stream is configured)
    if (!videoId) {
        return; // No stream configured, don't show registration
    }
    
    // Check if we've shown popup recently (within last hour)
    const lastShown = localStorage.getItem(REGISTRATION_KEY);
    if (lastShown) {
        const timeSinceShown = Date.now() - parseInt(lastShown);
        if (timeSinceShown < 60 * 60 * 1000) { // 1 hour
            return; // Don't show again too soon
        }
    }
    
    // Check if user already registered in this session
    if (session.firstName && session.lastName) {
        return; // Already registered
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'registration-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div class="registration-modal-content" style="
            background: white;
            padding: 2rem;
            border-radius: 10px;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        ">
            <h2 style="margin-top: 0; color: var(--primary-color, #2c3e50);">Welcome to Live Stream</h2>
            <p style="color: #666; margin-bottom: 1.5rem;">
                Please provide your information to help us track attendance.
            </p>
            
            <form id="registration-form">
                <div style="margin-bottom: 1rem;">
                    <label for="viewer-first-name" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        First Name <span style="color: #e74c3c;">*</span>
                    </label>
                    <input 
                        type="text" 
                        id="viewer-first-name" 
                        placeholder="Your first name"
                        required
                        style="width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 5px; font-size: 1rem; box-sizing: border-box;"
                    >
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label for="viewer-last-name" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        Last Name <span style="color: #e74c3c;">*</span>
                    </label>
                    <input 
                        type="text" 
                        id="viewer-last-name" 
                        placeholder="Your last name"
                        required
                        style="width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 5px; font-size: 1rem; box-sizing: border-box;"
                    >
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label for="viewer-email" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        Email <span style="color: #999; font-weight: normal;">(optional)</span>
                    </label>
                    <input 
                        type="email" 
                        id="viewer-email" 
                        placeholder="your.email@example.com"
                        style="width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 5px; font-size: 1rem; box-sizing: border-box;"
                    >
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <label for="viewer-phone" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        Phone <span style="color: #999; font-weight: normal;">(optional)</span>
                    </label>
                    <input 
                        type="tel" 
                        id="viewer-phone" 
                        placeholder="+353 XX XXX XXXX"
                        style="width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 5px; font-size: 1rem; box-sizing: border-box;"
                    >
                </div>
                
                <div style="margin-bottom: 1rem; padding: 0.75rem; background: #f8f9fa; border-radius: 5px; font-size: 0.85rem; color: #666;">
                    <strong>Privacy:</strong> Your information is only used for attendance tracking and will not be shared with third parties.
                </div>
                
                <button 
                    type="submit" 
                    style="
                        width: 100%;
                        padding: 0.75rem;
                        background: var(--primary-color, #2c3e50);
                        color: white;
                        border: none;
                        border-radius: 5px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                    "
                >
                    Continue Watching
                </button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('registration-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveRegistration(modal, session);
    });
    
    // Close on outside click (disabled - user must register)
    // modal.addEventListener('click', (e) => {
    //     if (e.target === modal) {
    //         // Don't allow closing without registration
    //     }
    // });
    
    // Mark as shown
    localStorage.setItem(REGISTRATION_KEY, Date.now().toString());
}

// Save registration
function saveRegistration(modal, session) {
    const firstName = document.getElementById('viewer-first-name').value.trim();
    const lastName = document.getElementById('viewer-last-name').value.trim();
    const email = document.getElementById('viewer-email').value.trim();
    const phone = document.getElementById('viewer-phone').value.trim();
    
    // Validate required fields
    if (!firstName || !lastName) {
        alert('Please provide both first and last name.');
        return;
    }
    
    // Update session
    session.firstName = firstName;
    session.lastName = lastName;
    session.viewerEmail = email || null;
    session.viewerPhone = phone || null;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    
    // Close modal
    closeRegistrationModal(modal);
    
    // Track view with registration info
    const videoId = extractYouTubeVideoIdFromPage();
    if (videoId) {
        trackStreamView(videoId, session);
        // Update viewer count after registration
        updateViewerCount(videoId);
    }
}

// Close registration modal
function closeRegistrationModal(modal) {
    modal.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}

// ==================== VIEWERSHIP TRACKING ====================

// Track stream view
async function trackStreamView(videoId, session) {
    if (!videoId || !session) return;
    
    const timestamp = Date.now();
    
    try {
        const apiUrl = window.location.origin.includes('localhost')
            ? 'http://localhost:8080/api/stream/view'
            : `${window.location.origin}/api/stream/view`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                videoId,
                sessionId: session.sessionId,
                firstName: session.firstName,
                lastName: session.lastName,
                viewerEmail: session.viewerEmail,
                viewerPhone: session.viewerPhone,
                timestamp
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('View tracked:', data);
            updateViewerCount(videoId);
        }
    } catch (error) {
        console.error('Error tracking view:', error);
    }
}

// Update viewer count display
async function updateViewerCount(videoId) {
    try {
        const apiUrl = window.location.origin.includes('localhost')
            ? `http://localhost:8080/api/stream/viewership/${videoId}`
            : `${window.location.origin}/api/stream/viewership/${videoId}`;
        
        const response = await fetch(apiUrl);
        if (response.ok) {
            const data = await response.json();
            const count = data.uniqueViewerCount || 0;
            
            // Display viewer count on page
            let viewerCountEl = document.getElementById('viewer-count');
            if (!viewerCountEl) {
                viewerCountEl = document.createElement('div');
                viewerCountEl.id = 'viewer-count';
                viewerCountEl.style.cssText = 'position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 0.5rem 1rem; border-radius: 5px; font-weight: 600; z-index: 10;';
                const videoWrapper = document.querySelector('.video-wrapper');
                if (videoWrapper) {
                    videoWrapper.style.position = 'relative';
                    videoWrapper.appendChild(viewerCountEl);
                }
            }
            viewerCountEl.textContent = `👁️ ${count} ${count === 1 ? 'viewer' : 'viewers'}`;
        }
    } catch (error) {
        console.error('Error loading viewer count:', error);
    }
}

// Helper to extract video ID from current page
function extractYouTubeVideoIdFromPage() {
    const iframe = document.querySelector('.video-wrapper iframe');
    if (iframe && iframe.src) {
        const match = iframe.src.match(/embed\/([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
    }
    return null;
}

// ==================== STREAM LOADING ====================

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
    
    // Get or create session
    const session = getSession();
    
    // Show registration popup if stream is configured and active (after a short delay)
    setTimeout(() => {
        showRegistrationPopup(session, videoId);
    }, 1000); // Show after 1 second
    
    // Track the view (only if user is registered or will register)
    // We'll track after registration is complete
    
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
    
    // If user is already registered, track the view immediately
    if (session.firstName && session.lastName) {
        trackStreamView(videoId, session);
    }
    
    // Update viewer count periodically
    setInterval(() => {
        const currentSession = getSession();
        // Only update if user is registered
        if (currentSession.firstName && currentSession.lastName) {
            updateViewerCount(videoId);
            // Re-track if session is still valid (to update last activity)
            if (currentSession.sessionId === session.sessionId) {
                trackStreamView(videoId, currentSession);
            }
        }
    }, 30000); // Every 30 seconds
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

// Previous Streams Carousel
let currentCarouselIndex = 0;
let previousStreamsVideos = [];

// Load previous streams
async function loadPreviousStreams() {
    const carouselTrack = document.getElementById('carousel-track');
    const indicators = document.getElementById('carousel-indicators');
    
    if (!carouselTrack || !indicators) {
        return;
    }
    
    try {
        const apiUrl = window.location.origin.includes('localhost')
            ? 'http://localhost:8080/api/previous-streams'
            : `${window.location.origin}/api/previous-streams`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        previousStreamsVideos = (data.videos || []).filter(v => v.videoId || extractYouTubeVideoId(v.url || ''));
        
        if (previousStreamsVideos.length === 0) {
            carouselTrack.innerHTML = `
                <div class="stream-card-placeholder">
                    <p>No previous streams available</p>
                </div>
            `;
            indicators.innerHTML = '';
            return;
        }
        
        renderCarousel();
        setupCarouselControls();
    } catch (error) {
        console.error('Error loading previous streams:', error);
        carouselTrack.innerHTML = `
            <div class="stream-card-placeholder">
                <p>Unable to load previous streams</p>
            </div>
        `;
        indicators.innerHTML = '';
    }
}

// Render carousel
function renderCarousel() {
    const carouselTrack = document.getElementById('carousel-track');
    const indicators = document.getElementById('carousel-indicators');
    
    if (!carouselTrack || !indicators) return;
    
    carouselTrack.innerHTML = previousStreamsVideos.map((video, index) => {
        const videoId = video.videoId || extractYouTubeVideoId(video.url || '');
        const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        const title = video.title || 'Previous Livestream';
        const date = video.date || '';
        
        return `
            <div class="carousel-slide" data-index="${index}">
                <div class="stream-card" onclick="openVideoModal('${videoId}', '${title.replace(/'/g, "\\'")}')">
                    <div class="stream-card-thumbnail">
                        <img src="${thumbnail}" alt="${title}" onerror="this.src='https://img.youtube.com/vi/${videoId}/mqdefault.jpg'">
                        <div class="play-overlay">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="stream-card-info">
                        <h4 class="stream-card-title">${title}</h4>
                        ${date ? `<p class="stream-card-date" style="font-size: 0.85rem; color: var(--text-color-muted); margin-top: 0.5rem;">${date}</p>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Render indicators
    indicators.innerHTML = previousStreamsVideos.map((_, index) => 
        `<button class="carousel-indicator ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Go to slide ${index + 1}"></button>`
    ).join('');
    
    // Update carousel position
    updateCarouselPosition();
}

// Setup carousel controls
function setupCarouselControls() {
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const indicators = document.querySelectorAll('.carousel-indicator');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentCarouselIndex > 0) {
                currentCarouselIndex--;
            } else {
                currentCarouselIndex = previousStreamsVideos.length - 1;
            }
            updateCarouselPosition();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentCarouselIndex < previousStreamsVideos.length - 1) {
                currentCarouselIndex++;
            } else {
                currentCarouselIndex = 0;
            }
            updateCarouselPosition();
        });
    }
    
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentCarouselIndex = index;
            updateCarouselPosition();
        });
    });
    
    // Auto-play carousel (optional - can be disabled)
    // setInterval(() => {
    //     if (currentCarouselIndex < previousStreamsVideos.length - 1) {
    //         currentCarouselIndex++;
    //     } else {
    //         currentCarouselIndex = 0;
    //     }
    //     updateCarouselPosition();
    // }, 5000);
}

// Update carousel position
function updateCarouselPosition() {
    const carouselTrack = document.getElementById('carousel-track');
    const indicators = document.querySelectorAll('.carousel-indicator');
    
    if (!carouselTrack) return;
    
    const slideWidth = carouselTrack.querySelector('.carousel-slide')?.offsetWidth || 0;
    const offset = -currentCarouselIndex * slideWidth;
    carouselTrack.style.transform = `translateX(${offset}px)`;
    
    // Update indicators
    indicators.forEach((indicator, index) => {
        if (index === currentCarouselIndex) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

// Open video modal
window.openVideoModal = function(videoId, title) {
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
        <div class="video-modal-content">
            <span class="video-modal-close">&times;</span>
            <h3>${title}</h3>
            <div class="video-modal-player">
                <iframe 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1" 
                    frameborder="0" 
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowfullscreen>
                </iframe>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    const closeBtn = modal.querySelector('.video-modal-close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        }
    });
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadStream();
        loadPreviousStreams();
    });
} else {
    loadStream();
    loadPreviousStreams();
}

// Periodically check for config updates (every 30 seconds)
setInterval(loadStream, 30000);
setInterval(loadPreviousStreams, 30000);

