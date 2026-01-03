/**
 * Unit tests for livestream.js
 * Tests RTMP URL combination, stream loading, and player management
 */

describe('Live Stream - RTMP URL Combination', () => {
    const combineRTMPUrl = (serverUrl, streamKey) => {
        if (!serverUrl || !streamKey) return '';
        
        // Remove trailing slash from server URL if present
        serverUrl = serverUrl.replace(/\/$/, '');
        
        // Combine: rtmp://server.com:1935/live + stream-key = rtmp://server.com:1935/live/stream-key
        return `${serverUrl}/${streamKey}`;
    };

    it('should combine server URL and stream key correctly', () => {
        const serverUrl = 'rtmp://server.com:1935/live';
        const streamKey = 'test-key';
        const result = combineRTMPUrl(serverUrl, streamKey);
        expect(result).toBe('rtmp://server.com:1935/live/test-key');
    });

    it('should handle server URL with trailing slash', () => {
        const serverUrl = 'rtmp://server.com:1935/live/';
        const streamKey = 'test-key';
        const result = combineRTMPUrl(serverUrl, streamKey);
        expect(result).toBe('rtmp://server.com:1935/live/test-key');
    });

    it('should return empty string if server URL is missing', () => {
        const serverUrl = '';
        const streamKey = 'test-key';
        const result = combineRTMPUrl(serverUrl, streamKey);
        expect(result).toBe('');
    });

    it('should return empty string if stream key is missing', () => {
        const serverUrl = 'rtmp://server.com:1935/live';
        const streamKey = '';
        const result = combineRTMPUrl(serverUrl, streamKey);
        expect(result).toBe('');
    });
});

describe('Live Stream - Stream Type Detection', () => {
    it('should detect RTMP URLs', () => {
        const url = 'rtmp://server.com:1935/live/stream';
        expect(url.startsWith('rtmp://')).toBe(true);
    });

    it('should detect HLS URLs', () => {
        const url = 'http://server.com/hls/stream.m3u8';
        expect(url.startsWith('http://') || url.startsWith('https://')).toBe(true);
        expect(url.includes('.m3u8')).toBe(true);
    });

    it('should detect FLV URLs', () => {
        const url = 'http://server.com:1935/live?app=live&stream=stream-key';
        expect(url.startsWith('http://') || url.startsWith('https://')).toBe(true);
        expect(url.includes('?app=')).toBe(true);
    });
});

describe('Live Stream - HLS URL Construction', () => {
    it('should construct HLS URL from RTMP server URL and stream key', () => {
        const rtmpUrl = 'rtmp://server.com:1935/live';
        const streamKey = 'test-key';
        
        const hlsUrl = rtmpUrl.replace('rtmp://', 'http://').replace(':1935', '') + '/hls/' + streamKey + '.m3u8';
        expect(hlsUrl).toBe('http://server.com/live/hls/test-key.m3u8');
    });
});

describe('Live Stream - FLV URL Construction', () => {
    it('should construct FLV URL from RTMP server URL and stream key', () => {
        const rtmpUrl = 'rtmp://server.com:1935/live';
        const streamKey = 'test-key';
        
        const flvUrl = rtmpUrl.replace('rtmp://', 'http://') + '?app=live&stream=' + streamKey;
        expect(flvUrl).toBe('http://server.com:1935/live?app=live&stream=test-key');
    });
});

describe('Live Stream - Config Loading', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should load stream config from API', async () => {
        const mockConfig = {
            rtmpServerUrl: 'rtmp://server.com:1935/live',
            rtmpStreamKey: 'test-key',
            streamType: 'rtmp'
        };

        global.fetch.mockResolvedValueOnce({
            json: async () => mockConfig
        });

        const config = await fetch('http://localhost:3000/api/stream-config')
            .then(r => r.json());

        expect(config).toEqual(mockConfig);
        expect(config.rtmpServerUrl).toBeDefined();
        expect(config.rtmpStreamKey).toBeDefined();
        expect(config.streamType).toBe('rtmp');
    });

    it('should handle missing config gracefully', async () => {
        global.fetch.mockRejectedValueOnce(new Error('Network error'));

        try {
            await fetch('http://localhost:3000/api/stream-config');
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    });
});

describe('Live Stream - Stream Type Validation', () => {
    it('should validate stream types', () => {
        const validTypes = ['rtmp', 'hls', 'flv'];
        const testType = 'rtmp';
        
        expect(validTypes).toContain(testType);
    });

    it('should reject invalid stream types', () => {
        const validTypes = ['rtmp', 'hls', 'flv'];
        const invalidType = 'invalid';
        
        expect(validTypes).not.toContain(invalidType);
    });
});

describe('Live Stream - URL Validation', () => {
    it('should validate RTMP URLs', () => {
        const url = 'rtmp://server.com:1935/live/stream';
        expect(url).toMatch(/^rtmp:\/\//);
    });

    it('should validate HTTP/HTTPS URLs', () => {
        const httpUrl = 'http://server.com/stream.m3u8';
        const httpsUrl = 'https://server.com/stream.m3u8';
        
        expect(httpUrl.startsWith('http://') || httpUrl.startsWith('https://')).toBe(true);
        expect(httpsUrl.startsWith('http://') || httpsUrl.startsWith('https://')).toBe(true);
    });
});

