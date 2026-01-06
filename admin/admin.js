// Admin Portal JavaScript
const API_BASE = '/api';

let currentEventId = null;

// Check authentication on load
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/admin/check-auth`, {
            credentials: 'include' // Include cookies for session authentication
        });
        const data = await response.json();
        if (data.authenticated) {
            showDashboard();
            loadDashboardData();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
    }
}

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    
    try {
        const response = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Include cookies for session authentication
            body: JSON.stringify({ password })
        });
        
        const data = await response.json();
        if (data.success) {
            showDashboard();
            loadDashboardData();
        } else {
            errorDiv.textContent = data.error || 'Invalid password';
            errorDiv.classList.add('show');
        }
    } catch (error) {
        errorDiv.textContent = 'Login failed. Please try again.';
        errorDiv.classList.add('show');
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
    await fetch(`${API_BASE}/admin/logout`, { 
        method: 'POST',
        credentials: 'include' // Include cookies for session authentication
    });
    showLogin();
});

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        showSection(section);
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

function showLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'flex';
}

function showSection(section) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`section-${section}`).classList.add('active');
    
    // Load section-specific data
    if (section === 'events') loadEvents();
    if (section === 'zone-structure') loadZoneStructure();
    if (section === 'images') {
        loadImages();
        loadHeroBackgroundPreview();
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const [events, streamConfig, instagramConfig] = await Promise.all([
            fetch(`${API_BASE}/events`).then(r => r.json()),
            fetch(`${API_BASE}/stream-config`).then(r => r.json()),
            fetch(`${API_BASE}/instagram-config`).then(r => r.json())
        ]);
        
        document.getElementById('events-count').textContent = events.length || 0;
        document.getElementById('stream-status').textContent = streamConfig.embeddedStreamUrl ? 'Configured' : 'Not Configured';
        document.getElementById('instagram-status').textContent = instagramConfig.manualPostUrl ? 'Configured' : 'Not Configured';
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

// Stream Configuration (YouTube Only)
const streamForm = document.getElementById('stream-form');
if (streamForm) {
    streamForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Check authentication first
        try {
            const authCheck = await fetch(`${API_BASE}/admin/check-auth`, {
                credentials: 'include'
            });
            const authData = await authCheck.json();
            if (!authData.authenticated) {
                alert('Your session has expired. Please log in again.');
                showLogin();
                return;
            }
        } catch (authError) {
            console.error('Auth check failed:', authError);
            alert('Authentication check failed. Please log in again.');
            showLogin();
            return;
        }
        
        const embeddedUrl = document.getElementById('embedded-stream-url').value.trim();
        const config = {
            streamType: 'embedded',
            embeddedStreamUrl: embeddedUrl || undefined,
            platform: 'youtube'
        };
        
        try {
            const response = await fetch(`${API_BASE}/stream-config`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(config)
            });
            
            if (response.status === 401) {
                alert('Your session has expired. Please log in again.');
                showLogin();
                return;
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                let message = 'Stream configuration saved successfully!';
                if (embeddedUrl) {
                    message += '\n\nThe stream will be displayed on the livestream page within 30 seconds.';
                    updateStreamPreview(embeddedUrl);
                } else {
                    message += '\n\nNo stream URL is set. The livestream page will show a placeholder until a URL is configured.';
                    updateStreamPreview(null);
                }
                alert(message);
                loadDashboardData();
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            console.error('Error saving stream config:', error);
            alert('Failed to save stream configuration. Please check the console for details.');
        }
    });
    
    // Update preview when URL changes
    const streamUrlField = document.getElementById('embedded-stream-url');
    if (streamUrlField) {
        streamUrlField.addEventListener('input', function() {
            const url = this.value.trim();
            if (url) {
                updateStreamPreview(url);
            } else {
                updateStreamPreview(null);
            }
        });
    }
} else {
    console.error('Stream form not found');
}

// Update stream preview
function updateStreamPreview(streamUrl) {
    const preview = document.getElementById('stream-preview');
    if (!preview) return;
    
    if (streamUrl) {
        // Extract YouTube video ID
        let videoId = '';
        if (streamUrl.includes('youtube.com/watch?v=')) {
            videoId = streamUrl.split('v=')[1].split('&')[0];
        } else if (streamUrl.includes('youtu.be/')) {
            videoId = streamUrl.split('youtu.be/')[1].split('?')[0];
        } else if (streamUrl.includes('youtube.com/embed/')) {
            videoId = streamUrl.split('embed/')[1].split('?')[0];
        } else if (streamUrl.length === 11 && /^[a-zA-Z0-9_-]+$/.test(streamUrl)) {
            videoId = streamUrl;
        }
        
        if (videoId) {
            preview.innerHTML = `
                <iframe 
                    src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1" 
                    style="width: 100%; height: 300px; border: none; border-radius: 5px;"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowfullscreen>
                </iframe>
                <p style="margin-top: 1rem; color: #666; font-size: 0.9em;">Preview of how the stream will appear on the livestream page</p>
            `;
        } else {
            preview.innerHTML = '<p style="color: #d32f2f;">Invalid YouTube URL. Please enter a valid YouTube URL or video ID.</p>';
        }
    } else {
        preview.innerHTML = '<p style="color: #666;">Enter a YouTube stream URL above to see a preview</p>';
    }
}

// Load stream config
async function loadStreamConfig() {
    try {
        const config = await fetch(`${API_BASE}/stream-config`).then(r => r.json());
        document.getElementById('embedded-stream-url').value = config.embeddedStreamUrl || '';
        
        // Update preview if URL exists
        if (config.embeddedStreamUrl) {
            updateStreamPreview(config.embeddedStreamUrl);
        }
        
        // Load previous streams
        await loadPreviousStreams();
    } catch (error) {
        console.error('Failed to load stream config:', error);
    }
}

// Previous Streams Management
let previousStreamsData = { videos: [] };

// Extract YouTube video ID from URL
function extractVideoId(url) {
    if (!url) return '';
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1].split('?')[0];
    } else if (url.length === 11 && /^[a-zA-Z0-9_-]+$/.test(url)) {
        videoId = url;
    }
    return videoId;
}

// Load previous streams
async function loadPreviousStreams() {
    try {
        const data = await fetch(`${API_BASE}/previous-streams`).then(r => r.json());
        previousStreamsData = data || { videos: [] };
        renderPreviousStreams();
    } catch (error) {
        console.error('Failed to load previous streams:', error);
    }
}

// Render previous streams list
function renderPreviousStreams() {
    const listContainer = document.getElementById('previous-streams-list');
    if (!listContainer) return;
    
    if (previousStreamsData.videos.length === 0) {
        listContainer.innerHTML = '<p style="color: #666; font-style: italic;">No videos added yet. Click "Add Video" to get started.</p>';
        return;
    }
    
    listContainer.innerHTML = previousStreamsData.videos.map((video, index) => {
        const videoId = extractVideoId(video.url || video.videoId || '');
        const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
        const title = video.title || 'Untitled Video';
        const date = video.date || '';
        
        return `
            <div class="video-item" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--light-bg); border-radius: 5px; margin-bottom: 0.5rem;">
                ${thumbnail ? `<img src="${thumbnail}" alt="${title}" style="width: 120px; height: 68px; object-fit: cover; border-radius: 4px;">` : '<div style="width: 120px; height: 68px; background: #ddd; border-radius: 4px;"></div>'}
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 0.25rem 0; color: var(--text-color);">${title}</h4>
                    <p style="margin: 0; color: #666; font-size: 0.9em;">${videoId ? `Video ID: ${videoId}` : 'Invalid URL'}</p>
                    ${date ? `<p style="margin: 0.25rem 0 0 0; color: #666; font-size: 0.85em;">Date: ${date}</p>` : ''}
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary" onclick="editVideo(${index})" style="padding: 0.5rem 1rem; font-size: 0.9em;">Edit</button>
                    <button class="btn btn-secondary" onclick="deleteVideo(${index})" style="padding: 0.5rem 1rem; font-size: 0.9em; background: #d32f2f;">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Add video button
const addVideoBtn = document.getElementById('add-video-btn');
if (addVideoBtn) {
    addVideoBtn.addEventListener('click', () => {
        openVideoModal();
    });
}

// Video modal functions
function openVideoModal(index = null) {
    const modal = document.getElementById('video-modal');
    const title = document.getElementById('video-modal-title');
    const form = document.getElementById('video-form');
    const videoIndex = document.getElementById('video-index');
    const videoUrl = document.getElementById('video-url');
    const videoTitle = document.getElementById('video-title');
    const videoDate = document.getElementById('video-date');
    
    if (index !== null && previousStreamsData.videos[index]) {
        const video = previousStreamsData.videos[index];
        title.textContent = 'Edit Video';
        videoIndex.value = index;
        videoUrl.value = video.url || video.videoId || '';
        videoTitle.value = video.title || '';
        videoDate.value = video.date || '';
    } else {
        title.textContent = 'Add Video';
        videoIndex.value = '';
        videoUrl.value = '';
        videoTitle.value = '';
        videoDate.value = '';
    }
    
    modal.style.display = 'block';
}

function closeVideoModal() {
    const modal = document.getElementById('video-modal');
    modal.style.display = 'none';
}

// Close modal on X click
const closeVideoModalBtn = document.getElementById('close-video-modal');
if (closeVideoModalBtn) {
    closeVideoModalBtn.addEventListener('click', closeVideoModal);
}

// Cancel button
const cancelVideoBtn = document.getElementById('cancel-video');
if (cancelVideoBtn) {
    cancelVideoBtn.addEventListener('click', closeVideoModal);
}

// Close modal on outside click
window.addEventListener('click', (e) => {
    const modal = document.getElementById('video-modal');
    if (e.target === modal) {
        closeVideoModal();
    }
});

// Edit video (global function for onclick)
window.editVideo = function(index) {
    openVideoModal(index);
};

// Delete video (global function for onclick)
window.deleteVideo = async function(index) {
    if (!confirm('Are you sure you want to delete this video?')) {
        return;
    }
    
    try {
        previousStreamsData.videos.splice(index, 1);
        
        const response = await fetch(`${API_BASE}/previous-streams`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(previousStreamsData)
        });
        
        if (response.status === 401) {
            alert('Your session has expired. Please log in again.');
            showLogin();
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        await loadPreviousStreams();
        alert('Video deleted successfully!');
    } catch (error) {
        console.error('Error deleting video:', error);
        alert('Failed to delete video. Please try again.');
    }
};

// Video form submission
const videoForm = document.getElementById('video-form');
if (videoForm) {
    videoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Check authentication
        try {
            const authCheck = await fetch(`${API_BASE}/admin/check-auth`, { credentials: 'include' });
            const authData = await authCheck.json();
            if (!authData.authenticated) {
                alert('Your session has expired. Please log in again.');
                showLogin();
                return;
            }
        } catch (authError) {
            console.error('Auth check failed:', authError);
            alert('Authentication check failed. Please log in again.');
            showLogin();
            return;
        }
        
        const videoUrl = document.getElementById('video-url').value.trim();
        const videoTitle = document.getElementById('video-title').value.trim();
        const videoDate = document.getElementById('video-date').value;
        const videoIndex = document.getElementById('video-index').value;
        
        const videoId = extractVideoId(videoUrl);
        if (!videoId) {
            alert('Invalid YouTube URL. Please enter a valid YouTube video URL or ID.');
            return;
        }
        
        const videoData = {
            url: videoUrl,
            videoId: videoId,
            title: videoTitle || null,
            date: videoDate || null
        };
        
        try {
            if (videoIndex !== '') {
                // Edit existing
                previousStreamsData.videos[parseInt(videoIndex)] = videoData;
            } else {
                // Add new
                previousStreamsData.videos.push(videoData);
            }
            
            const response = await fetch(`${API_BASE}/previous-streams`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(previousStreamsData)
            });
            
            if (response.status === 401) {
                alert('Your session has expired. Please log in again.');
                showLogin();
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await loadPreviousStreams();
            closeVideoModal();
            alert('Video saved successfully!');
        } catch (error) {
            console.error('Error saving video:', error);
            alert('Failed to save video. Please try again.');
        }
    });
}

// Instagram Configuration
const instagramForm = document.getElementById('instagram-form');
if (instagramForm) {
    instagramForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Check authentication first
        try {
            const authCheck = await fetch(`${API_BASE}/admin/check-auth`, {
                credentials: 'include'
            });
            const authData = await authCheck.json();
            if (!authData.authenticated) {
                alert('Your session has expired. Please log in again.');
                showLogin();
                return;
            }
        } catch (authError) {
            console.error('Auth check failed:', authError);
            alert('Authentication check failed. Please log in again.');
            showLogin();
            return;
        }
        
        const manualPostUrl = document.getElementById('instagram-manual-url').value.trim();
        const config = {
            autoFetch: false, // Always false - we only use manual URLs
            manualPostUrl: manualPostUrl || undefined
        };
        
        try {
            const response = await fetch(`${API_BASE}/instagram-config`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(config)
            });
            
            if (response.status === 401) {
                alert('Your session has expired. Please log in again.');
                showLogin();
                return;
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                let message = 'Instagram configuration saved successfully!';
                if (manualPostUrl) {
                    message += '\n\nThe homepage post will update within 30 seconds. If it doesn\'t appear, please refresh the homepage.';
                    updateInstagramPreview(manualPostUrl);
                } else {
                    message += '\n\nNo post URL is set. The homepage will show a placeholder until a post URL is configured.';
                    updateInstagramPreview(null);
                }
                alert(message);
                loadDashboardData();
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            console.error('Error saving Instagram config:', error);
            alert('Failed to save Instagram configuration. Please check the console for details.');
        }
    });
    
    // Update preview when URL changes
    const manualUrlField = document.getElementById('instagram-manual-url');
    if (manualUrlField) {
        manualUrlField.addEventListener('input', function() {
            const url = this.value.trim();
            if (url && url.includes('instagram.com/p/')) {
                updateInstagramPreview(url);
            } else {
                updateInstagramPreview(null);
            }
        });
    }
} else {
    console.error('Instagram form not found');
}

// Update Instagram preview
function updateInstagramPreview(postUrl) {
    const preview = document.getElementById('instagram-preview');
    if (!preview) return;
    
    if (postUrl && postUrl.includes('instagram.com/p/')) {
        // Clean URL
        const cleanUrl = cleanInstagramUrl(postUrl);
        preview.innerHTML = `
            <blockquote class="instagram-media" 
                data-instgrm-permalink="${cleanUrl}" 
                data-instgrm-version="14"
                style="background:#FFF; border:0; border-radius:10px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
            </blockquote>
            <p style="margin-top: 1rem; color: #666; font-size: 0.9em;">Preview of how the post will appear on the homepage</p>
        `;
        
        // Load Instagram embed script if needed
        if (!window.instgrm) {
            const script = document.createElement('script');
            script.src = 'https://www.instagram.com/embed.js';
            script.async = true;
            script.onload = function() {
                if (window.instgrm && window.instgrm.Embeds) {
                    window.instgrm.Embeds.process();
                }
            };
            document.body.appendChild(script);
        } else {
            if (window.instgrm.Embeds) {
                window.instgrm.Embeds.process();
            }
        }
    } else {
        preview.innerHTML = '<p style="color: #666;">Enter a valid Instagram post URL above to see a preview</p>';
    }
}

// Clean Instagram URL
function cleanInstagramUrl(url) {
    try {
        const urlObj = new URL(url);
        let pathname = urlObj.pathname;
        if (!pathname.endsWith('/')) {
            pathname += '/';
        }
        return `${urlObj.protocol}//${urlObj.host}${pathname}`;
    } catch (e) {
        let cleaned = url.split('?')[0].split('#')[0];
        if (!cleaned.endsWith('/')) {
            cleaned += '/';
        }
        return cleaned;
    }
}

// Load Instagram config
async function loadInstagramConfig() {
    try {
        const config = await fetch(`${API_BASE}/instagram-config`).then(r => r.json());
        document.getElementById('instagram-manual-url').value = config.manualPostUrl || '';
        
        // Update preview if URL exists
        if (config.manualPostUrl) {
            updateInstagramPreview(config.manualPostUrl);
        }
    } catch (error) {
        console.error('Failed to load Instagram config:', error);
    }
}

// Events Management
async function loadEvents() {
    try {
        const events = await fetch(`${API_BASE}/events`).then(r => r.json());
        const container = document.getElementById('events-list');
        container.innerHTML = '';
        
        events.forEach(event => {
            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <div class="event-info">
                    <h3>${event.title}</h3>
                    <p>${event.description || ''}</p>
                    <p><strong>${event.day || ''}</strong> - ${event.date} at ${event.time}</p>
                </div>
                <div class="event-actions">
                    <button class="btn btn-secondary btn-small" onclick="editEvent('${event.id}')">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteEvent('${event.id}')">Delete</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Failed to load events:', error);
    }
}

document.getElementById('add-event-btn').addEventListener('click', () => {
    currentEventId = null;
    document.getElementById('event-form').reset();
    document.getElementById('event-id').value = '';
    document.getElementById('modal-title').textContent = 'Add Event';
    document.getElementById('event-modal').style.display = 'block';
});

document.getElementById('event-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const eventData = {
        title: document.getElementById('event-title').value,
        description: document.getElementById('event-description').value,
        date: document.getElementById('event-date').value,
        time: document.getElementById('event-time').value,
        day: document.getElementById('event-day').value
    };
    
    try {
        if (currentEventId) {
            await fetch(`${API_BASE}/events/${currentEventId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include cookies for session authentication
                body: JSON.stringify(eventData)
            });
        } else {
            await fetch(`${API_BASE}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include cookies for session authentication
                body: JSON.stringify(eventData)
            });
        }
        document.getElementById('event-modal').style.display = 'none';
        loadEvents();
        loadDashboardData();
    } catch (error) {
        alert('Failed to save event');
    }
});

window.editEvent = async (id) => {
    try {
        const events = await fetch(`${API_BASE}/events`).then(r => r.json());
        const event = events.find(e => e.id === id);
        if (event) {
            currentEventId = id;
            document.getElementById('event-id').value = id;
            document.getElementById('event-title').value = event.title || '';
            document.getElementById('event-description').value = event.description || '';
            document.getElementById('event-date').value = event.date || '';
            document.getElementById('event-time').value = event.time || '';
            document.getElementById('event-day').value = event.day || '';
            document.getElementById('modal-title').textContent = 'Edit Event';
            document.getElementById('event-modal').style.display = 'block';
        }
    } catch (error) {
        alert('Failed to load event');
    }
};

window.deleteEvent = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
        await fetch(`${API_BASE}/events/${id}`, { 
            method: 'DELETE',
            credentials: 'include' // Include cookies for session authentication
        });
        loadEvents();
        loadDashboardData();
    } catch (error) {
        alert('Failed to delete event');
    }
};

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('event-modal').style.display = 'none';
});

document.getElementById('cancel-event').addEventListener('click', () => {
    document.getElementById('event-modal').style.display = 'none';
});

// Zone Structure Management
async function loadZoneStructure() {
    try {
        const zoneData = await fetch(`${API_BASE}/zone-data`).then(r => r.json());
        const container = document.getElementById('zone-groups');
        container.innerHTML = '';
        
        ['groupA', 'groupB', 'groupC'].forEach(groupKey => {
            const group = zoneData[groupKey];
            const card = document.createElement('div');
            card.className = 'zone-group-card';
            card.innerHTML = `
                <h3>${group.name}</h3>
                ${group.image ? `<img src="${group.image}" class="group-image-preview" alt="${group.name}">` : ''}
                <div class="form-group">
                    <label>Group Image</label>
                    <input type="file" accept="image/*" onchange="uploadGroupImage('${groupKey}', this)">
                </div>
                <div class="fellowships-editor">
                    <h4>Fellowships</h4>
                    <div id="fellowships-${groupKey}"></div>
                    <button class="btn btn-primary btn-small" onclick="addFellowship('${groupKey}')">Add Fellowship</button>
                </div>
            `;
            container.appendChild(card);
            
            // Load fellowships
            const fellowshipsContainer = document.getElementById(`fellowships-${groupKey}`);
            group.fellowships.forEach((fellowship, index) => {
                const item = document.createElement('div');
                item.className = 'fellowship-item';
                item.innerHTML = `
                    <input type="text" value="${fellowship}" onchange="updateFellowship('${groupKey}', ${index}, this.value)">
                    <button class="btn btn-danger btn-small" onclick="removeFellowship('${groupKey}', ${index})">Remove</button>
                `;
                fellowshipsContainer.appendChild(item);
            });
        });
    } catch (error) {
        console.error('Failed to load zone structure:', error);
    }
}

window.addFellowship = (groupKey) => {
    const container = document.getElementById(`fellowships-${groupKey}`);
    const item = document.createElement('div');
    item.className = 'fellowship-item';
    const index = container.children.length;
    item.innerHTML = `
        <input type="text" placeholder="Fellowship name" onchange="updateFellowship('${groupKey}', ${index}, this.value)">
        <button class="btn btn-danger btn-small" onclick="removeFellowship('${groupKey}', ${index})">Remove</button>
    `;
    container.appendChild(item);
};

window.updateFellowship = async (groupKey, index, value) => {
    const zoneData = await fetch(`${API_BASE}/zone-data`).then(r => r.json());
    if (!zoneData[groupKey].fellowships) zoneData[groupKey].fellowships = [];
    zoneData[groupKey].fellowships[index] = value;
        await fetch(`${API_BASE}/zone-data`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Include cookies for session authentication
            body: JSON.stringify(zoneData)
        });
};

window.removeFellowship = async (groupKey, index) => {
    const zoneData = await fetch(`${API_BASE}/zone-data`).then(r => r.json());
    zoneData[groupKey].fellowships.splice(index, 1);
        await fetch(`${API_BASE}/zone-data`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Include cookies for session authentication
            body: JSON.stringify(zoneData)
        });
    loadZoneStructure();
};

window.uploadGroupImage = async (groupKey, input) => {
    if (!input.files[0]) return;
    
    const formData = new FormData();
    formData.append('image', input.files[0]);
    
    try {
        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            credentials: 'include', // Include cookies for session authentication
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
            throw new Error(errorData.error || `Upload failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        const zoneData = await fetch(`${API_BASE}/zone-data`).then(r => r.json());
        zoneData[groupKey].image = data.url;
        await fetch(`${API_BASE}/zone-data`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Include cookies for session authentication
            body: JSON.stringify(zoneData)
        });
        loadZoneStructure();
    } catch (error) {
        console.error('Upload error:', error);
        alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
    }
};

// Image Management
// Update file input to allow multiple files for hero background
document.getElementById('image-purpose').addEventListener('change', (e) => {
    const fileInput = document.getElementById('image-file');
    const fileHint = document.getElementById('file-hint');
    if (e.target.value === 'hero-background') {
        fileInput.setAttribute('multiple', 'multiple');
        fileInput.setAttribute('accept', 'image/*');
        if (fileHint) {
            fileHint.textContent = 'For Hero Background, you can select multiple images for the slideshow';
        }
    } else {
        fileInput.removeAttribute('multiple');
        if (fileHint) {
            fileHint.textContent = '';
        }
    }
});

document.getElementById('image-upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('image-file');
    const files = fileInput.files;
    const purpose = document.getElementById('image-purpose').value;
    
    if (!files || files.length === 0) {
        alert('Please select an image file to upload');
        return;
    }
    
    // For hero background, allow multiple files
    const isHeroBackground = purpose === 'hero-background';
    const filesToUpload = isHeroBackground ? Array.from(files) : [files[0]];
    
    try {
        const uploadedUrls = [];
        
        // Upload all files
        for (const file of filesToUpload) {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await fetch(`${API_BASE}/upload`, {
                method: 'POST',
                credentials: 'include', // Include cookies for session authentication
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
                throw new Error(errorData.error || `Upload failed with status ${response.status}`);
            }
            
            const data = await response.json();
            uploadedUrls.push(data.url);
        }
        
        // Apply images to selected purpose
        if (purpose !== 'other') {
            if (isHeroBackground) {
                // Add all uploaded images to hero background slideshow
                await applyImagesToPurpose(uploadedUrls, purpose);
            } else {
                // For other purposes, use the first image
                await applyImageToPurpose(uploadedUrls[0], purpose);
            }
        }
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'upload-success-message';
        const count = uploadedUrls.length;
        successMsg.textContent = `${count} image${count > 1 ? 's' : ''} uploaded successfully! ${purpose !== 'other' ? `Applied to ${purpose.replace('-', ' ')}.` : ''}`;
        successMsg.style.cssText = 'background: var(--success); color: white; padding: 1rem; border-radius: 5px; margin: 1rem 0;';
        const form = document.getElementById('image-upload-form');
        form.parentNode.insertBefore(successMsg, form.nextSibling);
        
        setTimeout(() => successMsg.remove(), 5000);
        
        document.getElementById('image-upload-form').reset();
        loadImages();
        if (purpose === 'hero-background') {
            loadHeroBackgroundPreview();
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
    }
});

async function applyImageToPurpose(imageUrl, purpose) {
    try {
        if (purpose === 'hero-background') {
            const config = await fetch(`${API_BASE}/config`).then(r => r.json());
            // Ensure heroBackgrounds is an array
            if (!config.heroBackgrounds) {
                config.heroBackgrounds = config.heroBackground ? [config.heroBackground] : [];
            }
            // Add image if not already in array
            if (!config.heroBackgrounds.includes(imageUrl)) {
                config.heroBackgrounds.push(imageUrl);
            }
            await fetch(`${API_BASE}/config`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ...config, heroBackgrounds: config.heroBackgrounds })
            });
        } else if (purpose.startsWith('group-')) {
            const groupKey = purpose === 'group-a' ? 'groupA' : purpose === 'group-b' ? 'groupB' : 'groupC';
            const zoneData = await fetch(`${API_BASE}/zone-data`).then(r => r.json());
            zoneData[groupKey].image = imageUrl;
            await fetch(`${API_BASE}/zone-data`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(zoneData)
            });
        }
    } catch (error) {
        console.error('Error applying image to purpose:', error);
    }
}

async function applyImagesToPurpose(imageUrls, purpose) {
    try {
        if (purpose === 'hero-background') {
            const config = await fetch(`${API_BASE}/config`).then(r => r.json());
            // Ensure heroBackgrounds is an array
            if (!config.heroBackgrounds) {
                config.heroBackgrounds = config.heroBackground ? [config.heroBackground] : [];
            }
            // Add all new images that aren't already in the array
            imageUrls.forEach(url => {
                if (!config.heroBackgrounds.includes(url)) {
                    config.heroBackgrounds.push(url);
                }
            });
            await fetch(`${API_BASE}/config`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ...config, heroBackgrounds: config.heroBackgrounds })
            });
        }
    } catch (error) {
        console.error('Error applying images to purpose:', error);
    }
}

async function loadImages() {
    try {
        const container = document.getElementById('uploaded-images');
        if (!container) return;
        
        const response = await fetch(`${API_BASE}/upload`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load images');
        }
        
        const images = await response.json();
        
        if (images.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No images uploaded yet.</p>';
            return;
        }
        
        // Get current usage information
        const config = await fetch(`${API_BASE}/config`).then(r => r.json()).catch(() => ({}));
        const zoneData = await fetch(`${API_BASE}/zone-data`).then(r => r.json()).catch(() => ({}));
        
        container.innerHTML = '';
        
        images.forEach(image => {
            const imageUrl = image.url;
            let usedIn = [];
            
            // Check heroBackgrounds array (new format)
            if (config.heroBackgrounds && Array.isArray(config.heroBackgrounds) && config.heroBackgrounds.includes(imageUrl)) {
                usedIn.push('Hero Background Slideshow');
            }
            // Check old heroBackground format for backward compatibility
            if (config.heroBackground === imageUrl) {
                usedIn.push('Hero Background');
            }
            if (zoneData.groupA && zoneData.groupA.image === imageUrl) {
                usedIn.push('Group A');
            }
            if (zoneData.groupB && zoneData.groupB.image === imageUrl) {
                usedIn.push('Group B');
            }
            if (zoneData.groupC && zoneData.groupC.image === imageUrl) {
                usedIn.push('Group C');
            }
            
            const card = document.createElement('div');
            card.className = 'image-item';
            card.innerHTML = `
                <img src="${image.url}" alt="${image.filename}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22150%22%3E%3Crect fill=%22%23ddd%22 width=%22150%22 height=%22150%22/%3E%3Ctext fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2214%22 dy=%2210.5%22 font-weight=%22bold%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3EImage%3C/text%3E%3C/svg%3E'">
                <div class="image-info">
                    <p><strong>${image.filename}</strong></p>
                    <p>${(image.size / 1024).toFixed(2)} KB</p>
                    ${usedIn.length > 0 ? `<p style="color: var(--success); font-weight: 600;">✓ Used in: ${usedIn.join(', ')}</p>` : '<p style="color: #999;">Not in use</p>'}
                    <button class="btn btn-danger btn-small" onclick="deleteImage('${image.filename}')">Delete</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading images:', error);
        const container = document.getElementById('uploaded-images');
        if (container) {
            container.innerHTML = '<p style="text-align: center; color: var(--danger); padding: 2rem;">Error loading images.</p>';
        }
    }
}

window.deleteImage = async (filename) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;
    
    try {
        const response = await fetch(`${API_BASE}/upload/${filename}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Delete failed' }));
            throw new Error(errorData.error || 'Delete failed');
        }
        
        alert('Image deleted successfully!');
        loadImages();
        loadHeroBackgroundPreview();
    } catch (error) {
        console.error('Delete error:', error);
        alert(`Failed to delete image: ${error.message || 'Unknown error'}`);
    }
};

// Hero Background Slideshow Preview
let currentHeroSlideIndex = 0;
let heroBackgroundImages = [];

async function loadHeroBackgroundPreview() {
    try {
        const config = await fetch(`${API_BASE}/config`).then(r => r.json());
        const heroBackgrounds = config.heroBackgrounds || (config.heroBackground ? [config.heroBackground] : []);
        
        const previewSection = document.getElementById('hero-background-preview');
        const slideshow = document.getElementById('hero-slideshow');
        
        if (heroBackgrounds.length === 0) {
            previewSection.style.display = 'none';
            return;
        }
        
        previewSection.style.display = 'block';
        heroBackgroundImages = heroBackgrounds;
        currentHeroSlideIndex = 0;
        
        updateHeroSlideshow();
    } catch (error) {
        console.error('Error loading hero background preview:', error);
    }
}

function updateHeroSlideshow() {
    const slideshow = document.getElementById('hero-slideshow');
    const counter = document.getElementById('hero-slide-counter');
    
    if (heroBackgroundImages.length === 0) {
        slideshow.innerHTML = '<p style="text-align: center; padding: 2rem;">No hero background images</p>';
        counter.textContent = '0 / 0';
        return;
    }
    
    const currentImage = heroBackgroundImages[currentHeroSlideIndex];
    slideshow.innerHTML = `
        <img src="${currentImage}" alt="Hero Background ${currentHeroSlideIndex + 1}" style="width: 100%; max-height: 400px; object-fit: contain; border-radius: 5px;">
    `;
    counter.textContent = `${currentHeroSlideIndex + 1} / ${heroBackgroundImages.length}`;
    
    // Update button states
    document.getElementById('prev-hero-slide').disabled = currentHeroSlideIndex === 0;
    document.getElementById('next-hero-slide').disabled = currentHeroSlideIndex === heroBackgroundImages.length - 1;
}

// Hero slideshow navigation - set up event listeners when DOM is ready
function setupHeroSlideshowListeners() {
    const prevBtn = document.getElementById('prev-hero-slide');
    const nextBtn = document.getElementById('next-hero-slide');
    const removeBtn = document.getElementById('remove-hero-image');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentHeroSlideIndex > 0) {
                currentHeroSlideIndex--;
                updateHeroSlideshow();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentHeroSlideIndex < heroBackgroundImages.length - 1) {
                currentHeroSlideIndex++;
                updateHeroSlideshow();
            }
        });
    }
    
    if (removeBtn) {
        removeBtn.addEventListener('click', async () => {
            if (heroBackgroundImages.length === 0) return;
            
            const imageUrl = heroBackgroundImages[currentHeroSlideIndex];
            if (!confirm(`Remove this image from the hero background slideshow?`)) return;
            
            try {
                const config = await fetch(`${API_BASE}/config`).then(r => r.json());
                if (!config.heroBackgrounds) {
                    config.heroBackgrounds = config.heroBackground ? [config.heroBackground] : [];
                }
                
                config.heroBackgrounds = config.heroBackgrounds.filter(url => url !== imageUrl);
                
                await fetch(`${API_BASE}/config`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ ...config, heroBackgrounds: config.heroBackgrounds })
                });
                
                // Update local array
                heroBackgroundImages = config.heroBackgrounds;
                
                // Adjust index if needed
                if (currentHeroSlideIndex >= heroBackgroundImages.length) {
                    currentHeroSlideIndex = Math.max(0, heroBackgroundImages.length - 1);
                }
                
                updateHeroSlideshow();
                loadImages(); // Refresh image list
            } catch (error) {
                console.error('Error removing hero image:', error);
                alert('Failed to remove image from slideshow');
            }
        });
    }
}

// Initialize hero slideshow listeners when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupHeroSlideshowListeners);
} else {
    setupHeroSlideshowListeners();
}

// Settings
document.getElementById('site-config-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const config = {
        siteTitle: document.getElementById('site-title').value,
        tagline: document.getElementById('site-tagline').value
    };
    
    try {
        await fetch(`${API_BASE}/config`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Include cookies for session authentication
            body: JSON.stringify(config)
        });
        alert('Site configuration saved!');
    } catch (error) {
        alert('Failed to save configuration');
    }
});

document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    try {
        await fetch(`${API_BASE}/config`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword })
        });
        alert('Password changed successfully!');
        document.getElementById('password-form').reset();
    } catch (error) {
        alert('Failed to change password');
    }
});

// Load config on settings page
async function loadConfig() {
    try {
        const config = await fetch(`${API_BASE}/config`).then(r => r.json());
        document.getElementById('site-title').value = config.siteTitle || '';
        document.getElementById('site-tagline').value = config.tagline || '';
    } catch (error) {
        console.error('Failed to load config:', error);
    }
}

// Initialize
checkAuth();

// Load data when sections are shown
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const section = link.dataset.section;
        if (section === 'livestream') loadStreamConfig();
        if (section === 'instagram') loadInstagramConfig();
        if (section === 'settings') loadConfig();
    });
});

