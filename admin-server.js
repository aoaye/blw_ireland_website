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

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS configuration for API routes
app.use('/api', (req, res, next) => {
    const origin = req.headers.origin;
    // Allow credentials for same-origin and configured origins
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
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

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'blw-ireland-zone-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production' || process.env.FORCE_SECURE_COOKIES === 'true', // HTTPS only in production
        httpOnly: true, // Prevent XSS attacks
        sameSite: 'lax', // CSRF protection - works for most cases
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        domain: process.env.COOKIE_DOMAIN || undefined // Allow setting custom domain if needed
    }
}));

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
        
        // Initialize zone data
        try {
            await fs.access(ZONE_DATA_FILE);
        } catch {
            const defaultZoneData = {
                groupA: { name: "Group A - Mighty Army", colleges: [], image: null },
                groupB: { name: "Group B - LimitBreakers", colleges: [], image: null },
                groupC: { name: "Group C - Boundless Love", colleges: [], image: null }
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
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) {
        return next();
    }
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
            // Explicitly save session to ensure cookie is set
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.status(500).json({ error: 'Session error' });
                }
                // Set additional headers to help with cookie issues
                res.setHeader('Access-Control-Allow-Credentials', 'true');
                res.json({ success: true });
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
    
    res.json(safeConfig);
});

app.put('/api/config', requireAuth, async (req, res) => {
    const config = await readJSON(CONFIG_FILE);
    const updates = req.body;
    
    if (updates.newPassword) {
        config.adminPassword = await bcrypt.hash(updates.newPassword, 10);
        delete updates.newPassword;
    }
    
    Object.assign(config, updates);
    await writeJSON(CONFIG_FILE, config);
    res.json({ success: true });
});

// ==================== EVENTS ROUTES ====================

app.get('/api/events', async (req, res) => {
    const events = await readJSON(EVENTS_FILE) || [];
    res.json(events);
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
    const events = await readJSON(EVENTS_FILE) || [];
    const index = events.findIndex(e => e.id === req.params.id);
    if (index !== -1) {
        events[index] = { ...events[index], ...req.body };
        await writeJSON(EVENTS_FILE, events);
        res.json(events[index]);
    } else {
        res.status(404).json({ error: 'Event not found' });
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
    await writeJSON(ZONE_DATA_FILE, req.body);
    res.json({ success: true });
});

// ==================== STREAM CONFIG ROUTES ====================

app.get('/api/stream-config', async (req, res) => {
    const config = await readJSON(STREAM_CONFIG_FILE);
    res.json(config);
});

app.put('/api/stream-config', requireAuth, async (req, res) => {
    await writeJSON(STREAM_CONFIG_FILE, req.body);
    res.json({ success: true });
});

// ==================== INSTAGRAM CONFIG ROUTES ====================

app.get('/api/instagram-config', async (req, res) => {
    const config = await readJSON(INSTAGRAM_CONFIG_FILE);
    const safeConfig = { ...config };
    delete safeConfig.accessToken; // Don't expose token
    res.json(safeConfig);
});

app.put('/api/instagram-config', requireAuth, async (req, res) => {
    const currentConfig = await readJSON(INSTAGRAM_CONFIG_FILE);
    const updated = { ...currentConfig, ...req.body };
    await writeJSON(INSTAGRAM_CONFIG_FILE, updated);
    res.json({ success: true });
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
        });
    });
}

// Export app for testing
module.exports = app;

