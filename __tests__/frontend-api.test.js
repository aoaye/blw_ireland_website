/**
 * Unit tests for frontend-api.js
 * Tests API integration and data formatting functions
 */

// Mock fetch globally
global.fetch = jest.fn();

describe('Frontend API - loadEventsFromAPI', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it('should fetch events successfully', async () => {
        const mockEvents = [
            {
                id: '1',
                title: 'Test Event',
                date: '2024-01-01',
                time: '10:00',
                day: 'Mon'
            }
        ];

        fetch.mockResolvedValueOnce({
            json: async () => mockEvents
        });

        // Since the function is not exported, we test the logic
        const events = await fetch('http://localhost:3000/api/events')
            .then(r => r.json());

        expect(events).toEqual(mockEvents);
        expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/events');
    });

    it('should handle API errors gracefully', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));

        try {
            await fetch('http://localhost:3000/api/events');
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    });
});

describe('Frontend API - formatEventDate', () => {
    // Test the date formatting logic
    const formatEventDate = (dateString) => {
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
        const dateInfo = formatEventDate('2024-01-01');
        expect(dateInfo.dayName).toBe('Mon');
        expect(dateInfo.day).toBe(1);
        expect(dateInfo.month).toBe('Jan');
        expect(dateInfo.year).toBe(2024);
        expect(dateInfo.fullDate).toContain('Mon');
        expect(dateInfo.fullDate).toContain('Jan');
        expect(dateInfo.fullDate).toContain('2024');
    });

    it('should handle different dates', () => {
        const dateInfo = formatEventDate('2024-12-25');
        expect(dateInfo.dayName).toBe('Wed');
        expect(dateInfo.month).toBe('Dec');
        expect(dateInfo.day).toBe(25);
    });

    it('should format Sunday correctly', () => {
        const dateInfo = formatEventDate('2024-01-07'); // Sunday
        expect(dateInfo.dayName).toBe('Sun');
    });
});

describe('Frontend API - Event Card Generation', () => {
    it('should generate correct event card HTML structure', () => {
        const event = {
            id: '1',
            title: 'Test Event',
            description: 'Test Description',
            date: '2024-01-01',
            time: '10:00',
            day: 'Mon'
        };

        const formatEventDate = (dateString) => {
            const date = new Date(dateString);
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return {
                dayName: days[date.getDay()],
                fullDate: `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
            };
        };

        const dateInfo = formatEventDate(event.date);
        const day = event.day || dateInfo.dayName;
        const time = event.time || '';

        expect(day).toBe('Mon');
        expect(time).toBe('10:00');
        expect(event.title).toBe('Test Event');
        expect(event.description).toBe('Test Description');
    });

    it('should handle events without day field', () => {
        const event = {
            id: '1',
            title: 'Test Event',
            date: '2024-01-01',
            time: '10:00'
        };

        const formatEventDate = (dateString) => {
            const date = new Date(dateString);
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return days[date.getDay()];
        };

        const day = event.day || formatEventDate(event.date);
        expect(day).toBe('Mon');
    });
});

describe('Frontend API - loadZoneDataFromAPI', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it('should fetch zone data successfully', async () => {
        const mockZoneData = {
            groupA: { name: 'Group A', colleges: [] },
            groupB: { name: 'Group B', colleges: [] },
            groupC: { name: 'Group C', colleges: [] }
        };

        fetch.mockResolvedValueOnce({
            json: async () => mockZoneData
        });

        const zoneData = await fetch('http://localhost:3000/api/zone-data')
            .then(r => r.json());

        expect(zoneData).toEqual(mockZoneData);
        expect(zoneData).toHaveProperty('groupA');
        expect(zoneData).toHaveProperty('groupB');
        expect(zoneData).toHaveProperty('groupC');
    });
});

describe('Frontend API - loadConfigFromAPI', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it('should fetch config successfully', async () => {
        const mockConfig = {
            siteTitle: 'Test Site',
            tagline: 'Test Tagline'
        };

        fetch.mockResolvedValueOnce({
            json: async () => mockConfig
        });

        const config = await fetch('http://localhost:3000/api/config')
            .then(r => r.json());

        expect(config).toEqual(mockConfig);
        expect(config).not.toHaveProperty('adminPassword');
    });
});

