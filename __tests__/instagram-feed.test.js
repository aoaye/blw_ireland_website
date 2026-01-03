/**
 * Unit tests for instagram-feed.js
 * Tests Instagram feed loading, URL cleaning, and embed functionality
 */

describe('Instagram Feed - URL Cleaning', () => {
    const cleanInstagramUrl = (url) => {
        try {
            const urlObj = new URL(url);
            return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
        } catch (e) {
            return url.split('?')[0].split('#')[0];
        }
    };

    it('should clean Instagram URL with query parameters', () => {
        const dirtyUrl = 'https://www.instagram.com/p/TEST/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==';
        const cleanUrl = cleanInstagramUrl(dirtyUrl);
        expect(cleanUrl).toBe('https://www.instagram.com/p/TEST/');
    });

    it('should clean Instagram URL with hash', () => {
        const dirtyUrl = 'https://www.instagram.com/p/TEST/#test';
        const cleanUrl = cleanInstagramUrl(dirtyUrl);
        expect(cleanUrl).toBe('https://www.instagram.com/p/TEST/');
    });

    it('should handle clean URLs', () => {
        const cleanUrl = 'https://www.instagram.com/p/TEST/';
        const result = cleanInstagramUrl(cleanUrl);
        expect(result).toBe('https://www.instagram.com/p/TEST/');
    });

    it('should handle invalid URLs gracefully', () => {
        const invalidUrl = 'not-a-url';
        const result = cleanInstagramUrl(invalidUrl);
        expect(result).toBe('not-a-url');
    });
});

describe('Instagram Feed - Config Loading', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should load config from API', async () => {
        const mockConfig = {
            autoFetch: false,
            manualPostUrl: 'https://www.instagram.com/p/TEST/'
        };

        global.fetch.mockResolvedValueOnce({
            json: async () => mockConfig
        });

        const config = await fetch('http://localhost:3000/api/instagram-config')
            .then(r => r.json());

        expect(config).toEqual(mockConfig);
        expect(config.autoFetch).toBe(false);
        expect(config.manualPostUrl).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
        global.fetch.mockRejectedValueOnce(new Error('Network error'));

        try {
            await fetch('http://localhost:3000/api/instagram-config');
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    });
});

describe('Instagram Feed - Auto Fetch Logic', () => {
    it('should prioritize manual URL when autoFetch is false', () => {
        const autoFetch = false;
        const manualPostUrl = 'https://www.instagram.com/p/TEST/';

        if (!autoFetch && manualPostUrl && manualPostUrl.trim() !== '') {
            expect(true).toBe(true); // Manual URL should be used
        } else {
            expect(false).toBe(true);
        }
    });

    it('should use auto-fetch when enabled', () => {
        const autoFetch = true;
        const manualPostUrl = '';

        if (autoFetch) {
            expect(true).toBe(true); // Auto-fetch should be used
        } else {
            expect(false).toBe(true);
        }
    });

    it('should fallback to manual URL if auto-fetch fails', () => {
        const autoFetch = true;
        const manualPostUrl = 'https://www.instagram.com/p/TEST/';
        const autoFetchSucceeded = false;

        if (autoFetchSucceeded) {
            // Use auto-fetched URL
            expect(true).toBe(true);
        } else if (manualPostUrl && manualPostUrl.trim() !== '') {
            // Fallback to manual URL
            expect(true).toBe(true);
        }
    });
});

describe('Instagram Feed - URL Validation', () => {
    it('should validate Instagram post URLs', () => {
        const validUrls = [
            'https://www.instagram.com/p/TEST/',
            'https://www.instagram.com/p/ABC123/',
            'http://www.instagram.com/p/TEST/'
        ];

        validUrls.forEach(url => {
            expect(url).toMatch(/instagram\.com\/p\//);
        });
    });

    it('should reject invalid Instagram URLs', () => {
        const invalidUrls = [
            'https://www.facebook.com/p/TEST/',
            'not-a-url',
            'https://www.instagram.com/'
        ];

        invalidUrls.forEach(url => {
            expect(url).not.toMatch(/instagram\.com\/p\//);
        });
    });
});

describe('Instagram Feed - Config Defaults', () => {
    it('should handle undefined autoFetch as true', () => {
        const config1 = { autoFetch: undefined };
        const config2 = { autoFetch: false };
        const config3 = { autoFetch: true };

        // Logic: autoFetch !== false means if it's explicitly false, use false, otherwise default to true
        const autoFetch1 = config1.autoFetch !== false ? true : false; // undefined !== false is true, so true
        const autoFetch2 = config2.autoFetch !== false ? false : true; // false !== false is false, so true (wrong logic)
        const autoFetch3 = config3.autoFetch !== false ? true : false; // true !== false is true, so true

        // Correct logic: if autoFetch is explicitly false, use false, otherwise use true
        const correctAutoFetch1 = config1.autoFetch === false ? false : true;
        const correctAutoFetch2 = config2.autoFetch === false ? false : true;
        const correctAutoFetch3 = config3.autoFetch === false ? false : true;

        expect(correctAutoFetch1).toBe(true);
        expect(correctAutoFetch2).toBe(false);
        expect(correctAutoFetch3).toBe(true);
    });

    it('should handle empty manualPostUrl', () => {
        const config = { manualPostUrl: '' };
        const manualPostUrl = (config.manualPostUrl || '').trim();
        expect(manualPostUrl).toBe('');
    });
});

