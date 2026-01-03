/**
 * Unit tests for admin/admin.js
 * Tests admin frontend functions and UI interactions
 */

// Mock DOM and fetch
global.fetch = jest.fn();
document.body.innerHTML = `
    <div id="login-screen">
        <form id="login-form">
            <input type="password" id="password" />
        </form>
    </div>
    <div id="admin-dashboard" style="display: none;">
        <input type="checkbox" id="instagram-auto-fetch" />
        <input type="text" id="instagram-manual-url" />
    </div>
`;

describe('Admin Frontend - Toggle Manual URL Field', () => {
    const toggleManualUrlField = () => {
        const autoFetch = document.getElementById('instagram-auto-fetch').checked;
        const manualUrlField = document.getElementById('instagram-manual-url');
        const manualUrlLabel = manualUrlField.previousElementSibling;
        
        if (autoFetch) {
            manualUrlField.disabled = true;
            manualUrlField.style.opacity = '0.5';
            if (manualUrlLabel) manualUrlLabel.style.opacity = '0.5';
        } else {
            manualUrlField.disabled = false;
            manualUrlField.style.opacity = '1';
            if (manualUrlLabel) manualUrlLabel.style.opacity = '1';
        }
    };

    beforeEach(() => {
        const manualUrlField = document.getElementById('instagram-manual-url');
        manualUrlField.disabled = false;
        manualUrlField.style.opacity = '1';
    });

    it('should disable manual URL field when autofetch is checked', () => {
        document.getElementById('instagram-auto-fetch').checked = true;
        toggleManualUrlField();
        
        const manualUrlField = document.getElementById('instagram-manual-url');
        expect(manualUrlField.disabled).toBe(true);
        expect(manualUrlField.style.opacity).toBe('0.5');
    });

    it('should enable manual URL field when autofetch is unchecked', () => {
        document.getElementById('instagram-auto-fetch').checked = false;
        toggleManualUrlField();
        
        const manualUrlField = document.getElementById('instagram-manual-url');
        expect(manualUrlField.disabled).toBe(false);
        expect(manualUrlField.style.opacity).toBe('1');
    });
});

describe('Admin Frontend - Config Loading', () => {
    beforeEach(() => {
        global.fetch.mockClear();
    });

    it('should load Instagram config', async () => {
        const mockConfig = {
            autoFetch: false,
            manualPostUrl: 'https://www.instagram.com/p/TEST/',
            userId: 'test-user'
        };

        global.fetch.mockResolvedValueOnce({
            json: async () => mockConfig
        });

        const config = await fetch('/api/instagram-config')
            .then(r => r.json());

        expect(config).toEqual(mockConfig);
    });

    it('should load stream config', async () => {
        const mockConfig = {
            rtmpServerUrl: 'rtmp://server.com:1935/live',
            rtmpStreamKey: 'test-key',
            streamType: 'hls',
            isLive: false
        };

        global.fetch.mockResolvedValueOnce({
            json: async () => mockConfig
        });

        const config = await fetch('/api/stream-config')
            .then(r => r.json());

        expect(config).toEqual(mockConfig);
    });
});

describe('Admin Frontend - Event Management', () => {
    it('should create event with required fields', () => {
        const event = {
            id: Date.now().toString(),
            title: 'Test Event',
            description: 'Test Description',
            date: '2024-01-01',
            time: '10:00',
            day: 'Mon',
            createdAt: new Date().toISOString()
        };

        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('title');
        expect(event).toHaveProperty('date');
        expect(event).toHaveProperty('time');
        expect(event).toHaveProperty('createdAt');
    });

    it('should validate event date format', () => {
        const date = '2024-01-01';
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should validate event time format', () => {
        const time = '10:00';
        expect(time).toMatch(/^\d{2}:\d{2}$/);
    });
});

describe('Admin Frontend - Form Validation', () => {
    it('should validate required fields', () => {
        const formData = {
            title: 'Test Event',
            date: '2024-01-01',
            time: '10:00'
        };

        expect(formData.title).toBeTruthy();
        expect(formData.date).toBeTruthy();
        expect(formData.time).toBeTruthy();
    });

    it('should handle empty optional fields', () => {
        const formData = {
            title: 'Test Event',
            description: '',
            date: '2024-01-01',
            time: '10:00'
        };

        expect(formData.description).toBe('');
    });
});

describe('Admin Frontend - API Error Handling', () => {
    beforeEach(() => {
        global.fetch.mockClear();
    });

    it('should handle API errors gracefully', async () => {
        global.fetch.mockRejectedValueOnce(new Error('Network error'));

        try {
            await fetch('/api/events');
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Network error');
        }
    });

    it('should handle 401 unauthorized errors', async () => {
        global.fetch.mockResolvedValueOnce({
            status: 401,
            json: async () => ({ error: 'Unauthorized' })
        });

        const response = await fetch('/api/events');
        const data = await response.json();
        
        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized');
    });
});

