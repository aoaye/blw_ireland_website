// Admin Portal Backend Server
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Trust proxy (important for production behind reverse proxy/load balancer)
app.set('trust proxy', 1);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Determine if we should use secure cookies (HTTPS)
// IMPORTANT: For HTTPS production sites (like www.blwirelandzone.org), secure MUST be true
// or the browser will NOT send cookies. Set one of these environment variables:
// - NODE_ENV=production (sets secure to true)
// - FORCE_SECURE_COOKIES=true (forces secure to true)
// - USE_SECURE_COOKIES=false (forces secure to false, for localhost)
const isProduction = process.env.NODE_ENV === 'production';
const forceSecure = process.env.FORCE_SECURE_COOKIES === 'true';
const forceInsecure = process.env.USE_SECURE_COOKIES === 'false';
// Default to false for localhost (HTTP), true for production (HTTPS)
// Only set to true if explicitly forced or in production mode
const useSecureCookies = !forceInsecure && (isProduction || forceSecure);

// Session configuration - MUST be before routes
app.use(session({
    secret: process.env.SESSION_SECRET || 'blw-ireland-zone-secret-key-change-in-production',
    resave: false, // Don't resave unchanged sessions
    saveUninitialized: false,
    rolling: true, // Reset expiration on activity
    cookie: { 
        secure: useSecureCookies, // HTTPS only - REQUIRED for HTTPS sites
        httpOnly: true, // Prevent XSS attacks
        sameSite: 'lax', // CSRF protection - works for same-site requests
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        domain: process.env.COOKIE_DOMAIN || undefined // Allow setting custom domain if needed
    },
    name: 'blw-admin-session' // Custom session name to avoid conflicts
}));

// CORS configuration for API routes
app.use('/api', (req, res, next) => {
    const origin = req.headers.origin;
    // Allow credentials for same-origin and configured origins
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        // If no origin header, allow the request origin
        res.setHeader('Access-Control-Allow-Origin', req.headers.referer ? new URL(req.headers.referer).origin : '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.static('.')); // Serve static files
app.use('/admin', express.static('admin')); // Serve admin static files
app.use('/uploads', express.static('uploads')); // Serve uploaded images

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads';
        // Multer callbacks should handle async operations properly
        fs.mkdir(uploadPath, { recursive: true })
            .then(() => cb(null, uploadPath))
            .catch((error) => {
                console.error('Error creating upload directory:', error);
                cb(error);
            });
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Data storage paths
const DATA_DIR = 'data';
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const ZONE_DATA_FILE = path.join(DATA_DIR, 'zone-data.json');
const STREAM_CONFIG_FILE = path.join(DATA_DIR, 'stream-config.json');
const INSTAGRAM_CONFIG_FILE = path.join(DATA_DIR, 'instagram-config.json');
const PREVIOUS_STREAMS_FILE = path.join(DATA_DIR, 'previous-streams.json');
const VIEWERSHIP_FILE = path.join(DATA_DIR, 'stream-viewership.json');

// Initialize data directory and default config
async function initializeData() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.mkdir('uploads', { recursive: true });
        
        // Initialize config file
        try {
            await fs.access(CONFIG_FILE);
            // Migrate old heroBackground to heroBackgrounds array if needed
            const config = await readJSON(CONFIG_FILE);
            if (config && config.heroBackground && !config.heroBackgrounds) {
                // Migrate single image to array
                config.heroBackgrounds = [config.heroBackground];
                delete config.heroBackground;
                await writeJSON(CONFIG_FILE, config);
            } else if (config && !config.heroBackgrounds) {
                // Initialize empty array if neither exists
                config.heroBackgrounds = [];
                await writeJSON(CONFIG_FILE, config);
            }
        } catch {
            const defaultConfig = {
                adminPassword: await bcrypt.hash('admin', 10),
                siteTitle: 'BLW Ireland Zone',
                tagline: 'Making An Impact; In universities across the nation and beyond...',
                heroBackgrounds: [],
                instagramAutoFetch: true
            };
            await fs.writeFile(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
        }
        
        // Initialize events file
        try {
            await fs.access(EVENTS_FILE);
        } catch {
            await fs.writeFile(EVENTS_FILE, JSON.stringify([], null, 2));
        }
        
        // Initialize archived events file
        try {
            await fs.access(path.join(DATA_DIR, 'archived-events.json'));
        } catch {
            await fs.writeFile(path.join(DATA_DIR, 'archived-events.json'), JSON.stringify([], null, 2));
        }
        
        // Initialize zone data
        try {
            await fs.access(ZONE_DATA_FILE);
        } catch {
            const defaultZoneData = {
                groupA: { name: "Group A - Mighty Army", fellowships: [], image: null },
                groupB: { name: "Group B - LimitBreakers", fellowships: [], image: null },
                groupC: { name: "Group C - Boundless Love", fellowships: [], image: null }
            };
            await fs.writeFile(ZONE_DATA_FILE, JSON.stringify(defaultZoneData, null, 2));
        }
        
        // Initialize stream config
        try {
            await fs.access(STREAM_CONFIG_FILE);
        } catch {
            await fs.writeFile(STREAM_CONFIG_FILE, JSON.stringify({
                rtmpServerUrl: '',
                rtmpStreamKey: '',
                streamType: 'hls',
                isLive: false
            }, null, 2));
        }
        
        // Initialize Instagram config
        try {
            await fs.access(INSTAGRAM_CONFIG_FILE);
        } catch {
            await fs.writeFile(INSTAGRAM_CONFIG_FILE, JSON.stringify({
                autoFetch: true,
                manualPostUrl: '',
                accessToken: '',
                userId: ''
            }, null, 2));
        }
        
        // Initialize previous streams
        try {
            await fs.access(PREVIOUS_STREAMS_FILE);
        } catch {
            await fs.writeFile(PREVIOUS_STREAMS_FILE, JSON.stringify({
                videos: []
            }, null, 2));
        }
        
        // Initialize viewership tracking
        try {
            await fs.access(VIEWERSHIP_FILE);
        } catch {
            await fs.writeFile(VIEWERSHIP_FILE, JSON.stringify({}, null, 2));
        }
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}

// Authentication middleware
function requireAuth(req, res, next) {
    // Always log auth checks for debugging
    console.log('Auth check:', {
        path: req.path,
        hasSession: !!req.session,
        authenticated: !!(req.session && req.session.authenticated),
        sessionId: req.sessionID,
        hasCookies: !!req.headers.cookie,
        cookieHeader: req.headers.cookie ? 'present' : 'missing'
    });
    
    if (req.session && req.session.authenticated) {
        // Touch session to keep it alive
        req.session.touch();
        return next();
    }
    
    // Set CORS headers even for unauthorized responses
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    console.log('❌ Unauthorized request to:', req.path, 'Session:', req.session ? 'exists' : 'missing', 'Authenticated:', req.session?.authenticated);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    res.status(401).json({ error: 'Unauthorized' });
}

// Helper functions to read/write JSON files
async function readJSON(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return null;
    }
}

async function writeJSON(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// ==================== AUTHENTICATION ROUTES ====================

app.post('/api/admin/login', async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }
        
        const config = await readJSON(CONFIG_FILE);
        
        if (!config || !config.adminPassword) {
            return res.status(500).json({ error: 'Configuration not found' });
        }
        
        const isValid = await bcrypt.compare(password, config.adminPassword);
        if (isValid) {
            req.session.authenticated = true;
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.status(500).json({ error: 'Session error' });
                }
                // Set CORS headers
                const origin = req.headers.origin;
                if (origin) {
                    res.setHeader('Access-Control-Allow-Origin', origin);
                }
                res.setHeader('Access-Control-Allow-Credentials', 'true');
                
                console.log('✅ Login successful - Session ID:', req.sessionID, 'Secure cookies:', useSecureCookies);
                res.json({ success: true, sessionId: req.sessionID });
            });
        } else {
            res.status(401).json({ error: 'Invalid password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/api/admin/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/admin/check-auth', (req, res) => {
    // Touch the session to keep it alive
    if (req.session) {
        req.session.touch();
    }
    res.json({ authenticated: !!(req.session && req.session.authenticated) });
});

// ==================== CONFIG ROUTES ====================

app.get('/api/config', async (req, res) => {
    const config = await readJSON(CONFIG_FILE);
    const safeConfig = { ...config };
    delete safeConfig.adminPassword; // Never send password hash
    
    // Migrate heroBackground to heroBackgrounds if needed (backward compatibility)
    if (safeConfig.heroBackground && !safeConfig.heroBackgrounds) {
        safeConfig.heroBackgrounds = [safeConfig.heroBackground];
        delete safeConfig.heroBackground;
        // Save migrated config
        const fullConfig = await readJSON(CONFIG_FILE);
        fullConfig.heroBackgrounds = [fullConfig.heroBackground];
        delete fullConfig.heroBackground;
        await writeJSON(CONFIG_FILE, fullConfig);
    } else if (!safeConfig.heroBackgrounds) {
        safeConfig.heroBackgrounds = [];
    }
    
    // Clean up: If heroBackgrounds array is populated, ensure old heroBackground is removed
    if (safeConfig.heroBackgrounds && Array.isArray(safeConfig.heroBackgrounds) && safeConfig.heroBackgrounds.length > 0) {
        if (safeConfig.heroBackground) {
            delete safeConfig.heroBackground;
            // Also clean up in the saved config file
            const fullConfig = await readJSON(CONFIG_FILE);
            if (fullConfig.heroBackground) {
                delete fullConfig.heroBackground;
                await writeJSON(CONFIG_FILE, fullConfig);
            }
        }
    }
    
    res.json(safeConfig);
});

app.put('/api/config', requireAuth, async (req, res) => {
    try {
        // Touch the session to keep it alive
        if (req.session) {
            req.session.touch();
        }
        const config = await readJSON(CONFIG_FILE);
        const updates = req.body;
    
    if (updates.newPassword) {
        config.adminPassword = await bcrypt.hash(updates.newPassword, 10);
        delete updates.newPassword;
    }
    
        Object.assign(config, updates);
        
        // Clean up: If heroBackgrounds array is populated, remove old heroBackground field
        if (config.heroBackgrounds && Array.isArray(config.heroBackgrounds) && config.heroBackgrounds.length > 0) {
            delete config.heroBackground;
        }
        
        await writeJSON(CONFIG_FILE, config);
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving config:', error);
        res.status(500).json({ error: 'Failed to save configuration' });
    }
});

// ==================== EVENTS ROUTES ====================

app.get('/api/events', async (req, res) => {
    let events = await readJSON(EVENTS_FILE) || [];
    
    // Filter out past events and sort chronologically
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of today for date comparison
    
    // Separate upcoming and past events
    const upcomingEvents = [];
    const pastEvents = [];
    
    events.forEach(event => {
        if (!event.date) {
            // Events without dates are considered upcoming (recurring events)
            upcomingEvents.push(event);
            return;
        }
        
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        
        // If event date is today or in the future, it's upcoming
        if (eventDate >= now) {
            upcomingEvents.push(event);
        } else {
            pastEvents.push(event);
        }
    });
    
    // Sort upcoming events by date (closest first)
    upcomingEvents.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1; // Events without dates go to end
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
    });
    
    // Archive past events (save them to archived events file)
    if (pastEvents.length > 0) {
        const ARCHIVED_EVENTS_FILE = path.join(DATA_DIR, 'archived-events.json');
        let archivedEvents = [];
        try {
            archivedEvents = await readJSON(ARCHIVED_EVENTS_FILE);
        } catch {
            archivedEvents = [];
        }
        
        // Add past events to archived (avoid duplicates)
        pastEvents.forEach(pastEvent => {
            if (!archivedEvents.find(ae => ae.id === pastEvent.id)) {
                archivedEvents.push({
                    ...pastEvent,
                    archivedAt: new Date().toISOString()
                });
            }
        });
        
        await writeJSON(ARCHIVED_EVENTS_FILE, archivedEvents);
        
        // Remove past events from active events
        const activeEventIds = new Set(upcomingEvents.map(e => e.id));
        events = events.filter(e => activeEventIds.has(e.id));
        await writeJSON(EVENTS_FILE, events);
    }
    
    res.json(upcomingEvents);
});

app.post('/api/events', requireAuth, async (req, res) => {
    const events = await readJSON(EVENTS_FILE) || [];
    const newEvent = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    events.push(newEvent);
    await writeJSON(EVENTS_FILE, events);
    res.json(newEvent);
});

app.put('/api/events/:id', requireAuth, async (req, res) => {
    try {
        // Touch the session to keep it alive
        if (req.session) {
            req.session.touch();
        }
        const events = await readJSON(EVENTS_FILE) || [];
        const index = events.findIndex(e => e.id === req.params.id);
        if (index !== -1) {
            events[index] = { ...events[index], ...req.body };
            await writeJSON(EVENTS_FILE, events);
            res.json(events[index]);
        } else {
            res.status(404).json({ error: 'Event not found' });
        }
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

app.delete('/api/events/:id', requireAuth, async (req, res) => {
    const events = await readJSON(EVENTS_FILE) || [];
    const filtered = events.filter(e => e.id !== req.params.id);
    await writeJSON(EVENTS_FILE, filtered);
    res.json({ success: true });
});

// ==================== ZONE DATA ROUTES ====================

app.get('/api/zone-data', async (req, res) => {
    const zoneData = await readJSON(ZONE_DATA_FILE);
    res.json(zoneData);
});

app.put('/api/zone-data', requireAuth, async (req, res) => {
    try {
        // Touch the session to keep it alive
        if (req.session) {
            req.session.touch();
        }
        await writeJSON(ZONE_DATA_FILE, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving zone data:', error);
        res.status(500).json({ error: 'Failed to save zone data' });
    }
});

// ==================== STREAM CONFIG ROUTES ====================

app.get('/api/stream-config', async (req, res) => {
    const config = await readJSON(STREAM_CONFIG_FILE);
    res.json(config);
});

app.put('/api/stream-config', requireAuth, async (req, res) => {
    try {
        // Touch the session to keep it alive
        if (req.session) {
            req.session.touch();
        }
        await writeJSON(STREAM_CONFIG_FILE, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving stream config:', error);
        res.status(500).json({ error: 'Failed to save stream configuration' });
    }
});

// ==================== STREAM VIEWERSHIP ROUTES ====================

// Track a stream view
app.post('/api/stream/view', async (req, res) => {
    try {
        const { videoId, sessionId, firstName, lastName, viewerEmail, viewerPhone, timestamp } = req.body;
        
        if (!videoId || !sessionId) {
            return res.status(400).json({ error: 'videoId and sessionId are required' });
        }
        
        // Load existing viewership data
        let viewership = {};
        
        try {
            viewership = await readJSON(VIEWERSHIP_FILE);
        } catch {
            viewership = {};
        }
        
        // Initialize stream entry if it doesn't exist
        if (!viewership[videoId]) {
            viewership[videoId] = {
                videoId,
                startTime: timestamp,
                sessions: {},
                uniqueSessions: [],
                totalViews: 0
            };
        }
        
        // Check if this session already viewed (to avoid duplicate counts on reload)
        const streamData = viewership[videoId];
        
        if (!streamData.sessions[sessionId]) {
            // New session - add to unique count
            if (!streamData.uniqueSessions.includes(sessionId)) {
                streamData.uniqueSessions.push(sessionId);
            }
            streamData.totalViews++;
            
            // Store session details
            streamData.sessions[sessionId] = {
                sessionId,
                firstName: firstName || null,
                lastName: lastName || null,
                viewerName: firstName && lastName ? `${firstName} ${lastName}` : null,
                viewerEmail: viewerEmail || null,
                viewerPhone: viewerPhone || null,
                firstViewTime: timestamp,
                lastViewTime: timestamp,
                viewCount: 1
            };
        } else {
            // Existing session - just update last view time
            streamData.sessions[sessionId].lastViewTime = timestamp;
            streamData.sessions[sessionId].viewCount++;
            
            // Update name if provided (in case user registered after first view)
            if (firstName && lastName) {
                streamData.sessions[sessionId].firstName = firstName;
                streamData.sessions[sessionId].lastName = lastName;
                streamData.sessions[sessionId].viewerName = `${firstName} ${lastName}`;
            }
            if (viewerEmail) {
                streamData.sessions[sessionId].viewerEmail = viewerEmail;
            }
            if (viewerPhone) {
                streamData.sessions[sessionId].viewerPhone = viewerPhone;
            }
        }
        
        await writeJSON(VIEWERSHIP_FILE, viewership);
        
        res.json({ 
            success: true, 
            uniqueViewers: streamData.uniqueSessions.length,
            isNewViewer: streamData.sessions[sessionId].viewCount === 1
        });
    } catch (error) {
        console.error('Error tracking view:', error);
        res.status(500).json({ error: 'Failed to track view' });
    }
});

// Get viewership stats
app.get('/api/stream/viewership/:videoId?', async (req, res) => {
    try {
        let viewership = {};
        
        try {
            viewership = await readJSON(VIEWERSHIP_FILE);
        } catch {
            viewership = {};
        }
        
        const videoId = req.params.videoId;
        if (videoId) {
            const streamData = viewership[videoId];
            if (streamData) {
                res.json({
                    ...streamData,
                    uniqueViewerCount: streamData.uniqueSessions.length
                });
            } else {
                res.json({ 
                    videoId, 
                    uniqueViewerCount: 0, 
                    sessions: {},
                    uniqueSessions: [],
                    totalViews: 0
                });
            }
        } else {
            // Return all viewership data with counts
            const dataWithCounts = {};
            Object.keys(viewership).forEach(key => {
                dataWithCounts[key] = {
                    ...viewership[key],
                    uniqueViewerCount: viewership[key].uniqueSessions.length
                };
            });
            res.json(dataWithCounts);
        }
    } catch (error) {
        console.error('Error loading viewership:', error);
        res.status(500).json({ error: 'Failed to load viewership data' });
    }
});

// Helper function to escape CSV fields
function escapeCSVField(field) {
    if (field === null || field === undefined) {
        return '';
    }
    const str = String(field);
    // If field contains comma, quote, or newline, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

// Helper function to convert viewership data to CSV
function convertViewershipToCSV(streamData, videoId, includeStreamColumn = false) {
    const sessions = streamData.sessions || {};
    const registeredSessions = Object.values(sessions).filter(s => s.firstName && s.lastName);
    
    if (registeredSessions.length === 0) {
        return 'No registered attendees for this stream.';
    }
    
    // CSV Headers
    const headers = [];
    if (includeStreamColumn) {
        headers.push('Stream Video ID');
    }
    headers.push('First Name', 'Last Name', 'Email', 'Phone', 'Join Date', 'Join Time', 'View Count');
    
    // Build CSV rows
    const rows = registeredSessions.map(session => {
        const joinDate = new Date(session.firstViewTime);
        const dateStr = joinDate.toLocaleDateString();
        const timeStr = joinDate.toLocaleTimeString();
        
        const row = [];
        if (includeStreamColumn) {
            row.push(escapeCSVField(videoId));
        }
        row.push(
            escapeCSVField(session.firstName),
            escapeCSVField(session.lastName),
            escapeCSVField(session.viewerEmail || ''),
            escapeCSVField(session.viewerPhone || ''),
            escapeCSVField(dateStr),
            escapeCSVField(timeStr),
            escapeCSVField(session.viewCount || 1)
        );
        return row.join(',');
    });
    
    return [headers.join(','), ...rows].join('\n');
}

// Export viewership data for a specific stream as CSV
app.get('/api/stream/viewership/:videoId/export', requireAuth, async (req, res) => {
    try {
        let viewership = {};
        
        try {
            viewership = await readJSON(VIEWERSHIP_FILE);
        } catch {
            viewership = {};
        }
        
        const videoId = req.params.videoId;
        const streamData = viewership[videoId];
        
        if (!streamData) {
            return res.status(404).json({ error: 'Stream not found' });
        }
        
        const csv = convertViewershipToCSV(streamData, videoId, false);
        
        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="stream-${videoId}-attendees-${Date.now()}.csv"`);
        res.send(csv);
    } catch (error) {
        console.error('Error exporting viewership CSV:', error);
        res.status(500).json({ error: 'Failed to export viewership data' });
    }
});

// Export all viewership data as CSV
app.get('/api/stream/viewership/export/all', requireAuth, async (req, res) => {
    try {
        let viewership = {};
        
        try {
            viewership = await readJSON(VIEWERSHIP_FILE);
        } catch {
            viewership = {};
        }
        
        if (Object.keys(viewership).length === 0) {
            return res.status(404).json({ error: 'No viewership data available' });
        }
        
        // Build CSV with all streams
        const allRows = [];
        const headers = ['Stream Video ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Join Date', 'Join Time', 'View Count'];
        allRows.push(headers.join(','));
        
        // Add data from each stream
        Object.keys(viewership).forEach(videoId => {
            const streamData = viewership[videoId];
            const sessions = streamData.sessions || {};
            const registeredSessions = Object.values(sessions).filter(s => s.firstName && s.lastName);
            
            registeredSessions.forEach(session => {
                const joinDate = new Date(session.firstViewTime);
                const dateStr = joinDate.toLocaleDateString();
                const timeStr = joinDate.toLocaleTimeString();
                
                const row = [
                    escapeCSVField(videoId),
                    escapeCSVField(session.firstName),
                    escapeCSVField(session.lastName),
                    escapeCSVField(session.viewerEmail || ''),
                    escapeCSVField(session.viewerPhone || ''),
                    escapeCSVField(dateStr),
                    escapeCSVField(timeStr),
                    escapeCSVField(session.viewCount || 1)
                ];
                allRows.push(row.join(','));
            });
        });
        
        const csv = allRows.join('\n');
        
        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="all-streams-attendees-${Date.now()}.csv"`);
        res.send(csv);
    } catch (error) {
        console.error('Error exporting all viewership CSV:', error);
        res.status(500).json({ error: 'Failed to export viewership data' });
    }
});

// ==================== INSTAGRAM CONFIG ROUTES ====================

app.get('/api/instagram-config', async (req, res) => {
    const config = await readJSON(INSTAGRAM_CONFIG_FILE);
    const safeConfig = { ...config };
    delete safeConfig.accessToken; // Don't expose token
    res.json(safeConfig);
});

app.put('/api/instagram-config', requireAuth, async (req, res) => {
    try {
        // Touch the session to keep it alive
        if (req.session) {
            req.session.touch();
        }
        const currentConfig = await readJSON(INSTAGRAM_CONFIG_FILE);
        const updated = { ...currentConfig, ...req.body };
        await writeJSON(INSTAGRAM_CONFIG_FILE, updated);
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving Instagram config:', error);
        res.status(500).json({ error: 'Failed to save Instagram configuration' });
    }
});

// ==================== IMAGE UPLOAD ROUTES ====================

app.post('/api/upload', requireAuth, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
                }
                return res.status(400).json({ error: 'Upload error: ' + err.message });
            }
            return res.status(500).json({ error: 'Upload failed: ' + err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        console.log('File uploaded successfully:', req.file.filename);
        res.json({ 
            success: true, 
            url: `/uploads/${req.file.filename}`,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload handler error:', error);
        res.status(500).json({ error: 'Upload failed: ' + error.message });
    }
});

app.get('/api/upload', requireAuth, async (req, res) => {
    try {
        const uploadsDir = 'uploads';
        const files = await fs.readdir(uploadsDir);
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        });
        
        const images = await Promise.all(imageFiles.map(async (filename) => {
            const filePath = path.join(uploadsDir, filename);
            const stats = await fs.stat(filePath);
            return {
                filename,
                url: `/uploads/${filename}`,
                size: stats.size,
                uploadedAt: stats.birthtime
            };
        }));
        
        res.json(images);
    } catch (error) {
        console.error('Error listing images:', error);
        res.status(500).json({ error: 'Failed to list images' });
    }
});

app.delete('/api/upload/:filename', requireAuth, async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join('uploads', filename);
        
        // Check if file exists
        try {
            await fs.access(filePath);
        } catch {
            return res.status(404).json({ error: 'File not found' });
        }
        
        // Check if image is being used anywhere before deleting
        const config = await readJSON(CONFIG_FILE);
        const zoneData = await readJSON(ZONE_DATA_FILE);
        
        const imageUrl = `/uploads/${filename}`;
        let inUse = false;
        let usedIn = [];
        
        // Check heroBackgrounds array (new format)
        if (config && config.heroBackgrounds && Array.isArray(config.heroBackgrounds)) {
            if (config.heroBackgrounds.includes(imageUrl)) {
                inUse = true;
                usedIn.push('Hero Background');
            }
        }
        // Check old heroBackground format for backward compatibility
        if (config && config.heroBackground === imageUrl) {
            inUse = true;
            usedIn.push('Hero Background');
        }
        
        if (zoneData) {
            if (zoneData.groupA && zoneData.groupA.image === imageUrl) {
                inUse = true;
                usedIn.push('Group A');
            }
            if (zoneData.groupB && zoneData.groupB.image === imageUrl) {
                inUse = true;
                usedIn.push('Group B');
            }
            if (zoneData.groupC && zoneData.groupC.image === imageUrl) {
                inUse = true;
                usedIn.push('Group C');
            }
        }
        
        if (inUse) {
            return res.status(400).json({ 
                error: `Cannot delete image. It is currently being used in: ${usedIn.join(', ')}. Please remove it from those locations first.` 
            });
        }
        
        await fs.unlink(filePath);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

// ==================== FAVICON ROUTE ====================

app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No content, but successful
});

// ==================== ADMIN DASHBOARD ROUTE ====================

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Start server (only if not in test environment)
if (process.env.NODE_ENV !== 'test' && require.main === module) {
    initializeData().then(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`\n🔐 Admin Portal Server running on http://0.0.0.0:${PORT}`);
            console.log(`📊 Admin Dashboard: http://0.0.0.0:${PORT}/admin`);
            console.log(`\nDefault password: admin\n`);
            
            // Warn if secure cookies aren't enabled (required for HTTPS sites)
            if (!useSecureCookies) {
                console.warn('⚠️  WARNING: Secure cookies are disabled. For HTTPS production sites,');
                console.warn('   set NODE_ENV=production or FORCE_SECURE_COOKIES=true');
                console.warn('   Otherwise, session cookies may not work on HTTPS!\n');
            } else {
                console.log('✓ Secure cookies enabled (required for HTTPS)\n');
            }
        });
    });
}

// Export app for testing
module.exports = app;

