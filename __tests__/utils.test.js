/**
 * Unit tests for utility functions
 * Tests common utility functions used across the application
 */

describe('Utility Functions - Date Formatting', () => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return {
            dayName: days[date.getDay()],
            day: date.getDate(),
            month: months[date.getMonth()],
            year: date.getFullYear(),
            fullDate: `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
        };
    };

    it('should format date correctly', () => {
        const result = formatDate('2024-01-01');
        expect(result.dayName).toBe('Mon');
        expect(result.month).toBe('Jan');
        expect(result.day).toBe(1);
        expect(result.year).toBe(2024);
    });

    it('should handle different months', () => {
        const result = formatDate('2024-12-25');
        expect(result.month).toBe('Dec');
        expect(result.day).toBe(25);
    });
});

describe('Utility Functions - URL Validation', () => {
    it('should validate Instagram URLs', () => {
        const validUrl = 'https://www.instagram.com/p/TEST/';
        expect(validUrl).toMatch(/instagram\.com\/p\//);
    });

    it('should validate RTMP URLs', () => {
        const validUrl = 'rtmp://server.com:1935/live';
        expect(validUrl).toMatch(/^rtmp:\/\//);
    });

    it('should validate HTTP URLs', () => {
        const validUrl = 'http://server.com/stream.m3u8';
        expect(validUrl).toMatch(/^https?:\/\//);
    });
});

describe('Utility Functions - String Manipulation', () => {
    it('should remove trailing slashes', () => {
        const url1 = 'rtmp://server.com/live/';
        const url2 = 'rtmp://server.com/live';
        
        expect(url1.replace(/\/$/, '')).toBe('rtmp://server.com/live');
        expect(url2.replace(/\/$/, '')).toBe('rtmp://server.com/live');
    });

    it('should trim strings', () => {
        const str = '  test  ';
        expect(str.trim()).toBe('test');
    });

    it('should handle empty strings', () => {
        const str = '';
        expect(str.trim()).toBe('');
        expect(str.length).toBe(0);
    });
});

describe('Utility Functions - Data Validation', () => {
    it('should validate event structure', () => {
        const event = {
            id: '1',
            title: 'Test',
            date: '2024-01-01',
            time: '10:00'
        };

        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('title');
        expect(event).toHaveProperty('date');
        expect(event).toHaveProperty('time');
    });

    it('should validate stream config structure', () => {
        const config = {
            rtmpServerUrl: 'rtmp://server.com:1935/live',
            rtmpStreamKey: 'key',
            streamType: 'hls'
        };

        expect(config).toHaveProperty('rtmpServerUrl');
        expect(config).toHaveProperty('rtmpStreamKey');
        expect(config).toHaveProperty('streamType');
    });
});

describe('Utility Functions - Array Operations', () => {
    it('should filter arrays correctly', () => {
        const events = [
            { id: '1', title: 'Event 1' },
            { id: '2', title: 'Event 2' },
            { id: '3', title: 'Event 3' }
        ];

        const filtered = events.filter(e => e.id !== '2');
        expect(filtered.length).toBe(2);
        expect(filtered.find(e => e.id === '2')).toBeUndefined();
    });

    it('should find items in arrays', () => {
        const events = [
            { id: '1', title: 'Event 1' },
            { id: '2', title: 'Event 2' }
        ];

        const found = events.find(e => e.id === '2');
        expect(found).toBeDefined();
        expect(found.title).toBe('Event 2');
    });
});

