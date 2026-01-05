// Admin Portal JavaScript
const API_BASE = '/api';

let currentEventId = null;

// Check authentication on load
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/admin/check-auth`);
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
    if (section === 'images') loadImages();
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
        document.getElementById('stream-status').textContent = streamConfig.isLive ? 'Live' : 'Offline';
        document.getElementById('instagram-status').textContent = instagramConfig.autoFetch ? 'Auto-fetch Enabled' : 'Manual';
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

// Stream Configuration
const streamForm = document.getElementById('stream-form');
if (streamForm) {
    console.log('Stream form found, setting up event listener');
    streamForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Stream form submitted');
        const config = {
            rtmpServerUrl: document.getElementById('rtmp-server-url').value,
            rtmpStreamKey: document.getElementById('rtmp-stream-key').value,
            streamType: document.getElementById('stream-type').value,
            isLive: document.getElementById('stream-live').checked
        };
        
        console.log('Saving stream config:', { ...config, rtmpStreamKey: config.rtmpStreamKey ? '***' : '' });
        
        try {
            const response = await fetch(`${API_BASE}/stream-config`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include cookies for session authentication
                body: JSON.stringify(config)
            });
            
            console.log('Stream config response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Stream config save result:', result);
            
            if (result.success) {
                alert('Stream configuration saved successfully!');
                loadDashboardData();
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            console.error('Error saving stream config:', error);
            alert('Failed to save stream configuration. Please check the console for details.');
        }
    });
} else {
    console.error('Stream form not found');
}

// Load stream config
async function loadStreamConfig() {
    try {
        const config = await fetch(`${API_BASE}/stream-config`).then(r => r.json());
        document.getElementById('rtmp-server-url').value = config.rtmpServerUrl || '';
        document.getElementById('rtmp-stream-key').value = config.rtmpStreamKey || '';
        document.getElementById('stream-type').value = config.streamType || 'hls';
        document.getElementById('stream-live').checked = config.isLive || false;
    } catch (error) {
        console.error('Failed to load stream config:', error);
    }
}

// Instagram Configuration
const instagramForm = document.getElementById('instagram-form');
if (instagramForm) {
    console.log('Instagram form found, setting up event listener');
    instagramForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Instagram form submitted');
        const config = {
            autoFetch: document.getElementById('instagram-auto-fetch').checked,
            manualPostUrl: document.getElementById('instagram-manual-url').value,
            accessToken: document.getElementById('instagram-access-token').value || undefined,
            userId: document.getElementById('instagram-user-id').value || undefined
        };
        
        console.log('Saving Instagram config:', { ...config, accessToken: config.accessToken ? '***' : '' });
        
        try {
            const response = await fetch(`${API_BASE}/instagram-config`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include cookies for session authentication
                body: JSON.stringify(config)
            });
            
            console.log('Instagram config response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Instagram config save result:', result);
            
            if (result.success) {
                // Check if homepage post was updated
                const autoFetch = document.getElementById('instagram-auto-fetch').checked;
                const manualUrl = document.getElementById('instagram-manual-url').value.trim();
                
                let message = 'Instagram configuration saved successfully!';
                
                if (!autoFetch && manualUrl) {
                    // Manual mode with URL - post should update on homepage
                    message += '\n\nThe homepage post should update within 30 seconds. If it doesn\'t appear, please refresh the homepage.';
                } else if (autoFetch) {
                    // Auto-fetch mode - post will update automatically
                    message += '\n\nThe homepage will automatically fetch the latest post.';
                } else {
                    // No URL set
                    message += '\n\nNote: No manual URL is set. The homepage will show a placeholder until a post URL is configured.';
                }
                
                alert(message);
                loadDashboardData(); // Refresh dashboard to show updated status
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            console.error('Error saving Instagram config:', error);
            alert('Failed to save Instagram configuration. Please check the console for details.');
        }
    });
} else {
    console.error('Instagram form not found');
}

// Add event listener for autofetch checkbox to toggle manual URL field
const autoFetchCheckbox = document.getElementById('instagram-auto-fetch');
if (autoFetchCheckbox) {
    autoFetchCheckbox.addEventListener('change', toggleInstagramFields);
}

// Toggle Instagram form fields based on autofetch checkbox
function toggleInstagramFields() {
    const autoFetch = document.getElementById('instagram-auto-fetch').checked;
    const manualUrlField = document.getElementById('instagram-manual-url');
    const manualUrlLabel = manualUrlField ? manualUrlField.previousElementSibling : null;
    const accessTokenField = document.getElementById('instagram-access-token');
    const accessTokenLabel = accessTokenField ? accessTokenField.previousElementSibling : null;
    const userIdField = document.getElementById('instagram-user-id');
    const userIdLabel = userIdField ? userIdField.previousElementSibling : null;
    
    if (autoFetch) {
        // Auto-fetch enabled: disable manual URL, enable API fields
        if (manualUrlField) {
            manualUrlField.disabled = true;
            manualUrlField.required = false;
            manualUrlField.style.opacity = '0.5';
            manualUrlField.placeholder = 'Not needed when auto-fetch is enabled';
        }
        if (manualUrlLabel) manualUrlLabel.style.opacity = '0.5';
        
        if (accessTokenField) {
            accessTokenField.disabled = false;
            accessTokenField.required = false;
            accessTokenField.style.opacity = '1';
            accessTokenField.placeholder = 'Optional: For API access';
        }
        if (accessTokenLabel) accessTokenLabel.style.opacity = '1';
        
        if (userIdField) {
            userIdField.disabled = false;
            userIdField.required = false;
            userIdField.style.opacity = '1';
            userIdField.placeholder = 'Optional: For API access';
        }
        if (userIdLabel) userIdLabel.style.opacity = '1';
    } else {
        // Auto-fetch disabled: enable manual URL, disable API fields
        if (manualUrlField) {
            manualUrlField.disabled = false;
            manualUrlField.required = false;
            manualUrlField.style.opacity = '1';
            manualUrlField.placeholder = 'https://www.instagram.com/p/POST_ID/';
        }
        if (manualUrlLabel) manualUrlLabel.style.opacity = '1';
        
        if (accessTokenField) {
            accessTokenField.disabled = true;
            accessTokenField.required = false;
            accessTokenField.style.opacity = '0.5';
            accessTokenField.placeholder = 'Not needed when using manual URL';
        }
        if (accessTokenLabel) accessTokenLabel.style.opacity = '0.5';
        
        if (userIdField) {
            userIdField.disabled = true;
            userIdField.required = false;
            userIdField.style.opacity = '0.5';
            userIdField.placeholder = 'Not needed when using manual URL';
        }
        if (userIdLabel) userIdLabel.style.opacity = '0.5';
    }
}

// Load Instagram config
async function loadInstagramConfig() {
    try {
        const config = await fetch(`${API_BASE}/instagram-config`).then(r => r.json());
        document.getElementById('instagram-auto-fetch').checked = config.autoFetch !== false; // Default to true if not set
        document.getElementById('instagram-manual-url').value = config.manualPostUrl || '';
        document.getElementById('instagram-access-token').value = config.accessToken || '';
        document.getElementById('instagram-user-id').value = config.userId || '';
        toggleInstagramFields(); // Set initial state
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
                <div class="colleges-editor">
                    <h4>Colleges</h4>
                    <div id="colleges-${groupKey}"></div>
                    <button class="btn btn-primary btn-small" onclick="addCollege('${groupKey}')">Add College</button>
                </div>
            `;
            container.appendChild(card);
            
            // Load colleges
            const collegesContainer = document.getElementById(`colleges-${groupKey}`);
            group.colleges.forEach((college, index) => {
                const item = document.createElement('div');
                item.className = 'college-item';
                item.innerHTML = `
                    <input type="text" value="${college}" onchange="updateCollege('${groupKey}', ${index}, this.value)">
                    <button class="btn btn-danger btn-small" onclick="removeCollege('${groupKey}', ${index})">Remove</button>
                `;
                collegesContainer.appendChild(item);
            });
        });
    } catch (error) {
        console.error('Failed to load zone structure:', error);
    }
}

window.addCollege = (groupKey) => {
    const container = document.getElementById(`colleges-${groupKey}`);
    const item = document.createElement('div');
    item.className = 'college-item';
    const index = container.children.length;
    item.innerHTML = `
        <input type="text" placeholder="College name" onchange="updateCollege('${groupKey}', ${index}, this.value)">
        <button class="btn btn-danger btn-small" onclick="removeCollege('${groupKey}', ${index})">Remove</button>
    `;
    container.appendChild(item);
};

window.updateCollege = async (groupKey, index, value) => {
    const zoneData = await fetch(`${API_BASE}/zone-data`).then(r => r.json());
    if (!zoneData[groupKey].colleges) zoneData[groupKey].colleges = [];
    zoneData[groupKey].colleges[index] = value;
        await fetch(`${API_BASE}/zone-data`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Include cookies for session authentication
            body: JSON.stringify(zoneData)
        });
};

window.removeCollege = async (groupKey, index) => {
    const zoneData = await fetch(`${API_BASE}/zone-data`).then(r => r.json());
    zoneData[groupKey].colleges.splice(index, 1);
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
document.getElementById('image-upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('image-file');
    const file = fileInput.files[0];
    const purpose = document.getElementById('image-purpose').value;
    
    if (!file) {
        alert('Please select an image file to upload');
        return;
    }
    
    const formData = new FormData();
    formData.append('image', file);
    
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
        
        // Apply image to selected purpose
        if (purpose !== 'other') {
            await applyImageToPurpose(data.url, purpose);
        }
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'upload-success-message';
        successMsg.textContent = `Image uploaded successfully! ${purpose !== 'other' ? `Applied to ${purpose.replace('-', ' ')}.` : ''}`;
        successMsg.style.cssText = 'background: var(--success); color: white; padding: 1rem; border-radius: 5px; margin: 1rem 0;';
        const form = document.getElementById('image-upload-form');
        form.parentNode.insertBefore(successMsg, form.nextSibling);
        
        setTimeout(() => successMsg.remove(), 5000);
        
        document.getElementById('image-upload-form').reset();
        loadImages();
    } catch (error) {
        console.error('Upload error:', error);
        alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
    }
});

async function applyImageToPurpose(imageUrl, purpose) {
    try {
        if (purpose === 'hero-background') {
            const config = await fetch(`${API_BASE}/config`).then(r => r.json());
            await fetch(`${API_BASE}/config`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ...config, heroBackground: imageUrl })
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
    } catch (error) {
        console.error('Delete error:', error);
        alert(`Failed to delete image: ${error.message || 'Unknown error'}`);
    }
};

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

