// RTMP Stream Player Configuration
let player = null;
let flvPlayer = null;

// Load stream config from API
async function loadStreamConfigFromAPI() {
    try {
        // Use current origin in production, localhost in development
        const apiUrl = window.location.origin.includes('localhost')
            ? 'http://localhost:3000/api/stream-config'
            : `${window.location.origin}/api/stream-config`;
        const response = await fetch(apiUrl);
        const config = await response.json();
        if (config.rtmpServerUrl || config.rtmpStreamKey) {
            document.getElementById('rtmp-server-url').value = config.rtmpServerUrl || '';
            document.getElementById('rtmp-stream-key').value = config.rtmpStreamKey || '';
            document.getElementById('stream-type').value = config.streamType || 'hls';
            
            // Auto-load stream if configured
            const serverUrl = config.rtmpServerUrl || '';
            const streamKey = config.rtmpStreamKey || '';
            const streamType = config.streamType || 'hls';
            
            // For RTMP: need both server URL and stream key
            if (streamType === 'rtmp' && serverUrl && streamKey) {
                loadStream();
            }
            // For HLS/FLV: if server URL is a full HTTP(S) URL, auto-load
            else if ((streamType === 'hls' || streamType === 'flv') && 
                     (serverUrl.startsWith('http://') || serverUrl.startsWith('https://'))) {
                loadStream();
            }
            // For HLS/FLV: if both server URL and stream key provided, try to auto-load
            else if ((streamType === 'hls' || streamType === 'flv') && serverUrl && streamKey) {
                loadStream();
            }
        }
    } catch (error) {
        console.log('Admin API not available, using manual configuration');
    }
}

// Combine server URL and stream key for RTMP
function combineRTMPUrl(serverUrl, streamKey) {
    if (!serverUrl || !streamKey) return '';
    
    // Remove trailing slash from server URL if present
    serverUrl = serverUrl.replace(/\/$/, '');
    
    // Combine: rtmp://server.com:1935/live + stream-key = rtmp://server.com:1935/live/stream-key
    return `${serverUrl}/${streamKey}`;
}

// Load stream based on selected type
function loadStream() {
    const serverUrl = document.getElementById('rtmp-server-url').value.trim();
    const streamKey = document.getElementById('rtmp-stream-key').value.trim();
    const streamType = document.getElementById('stream-type').value;

    let streamUrl = '';

    // For RTMP, combine server URL and stream key
    if (streamType === 'rtmp') {
        if (!serverUrl || !streamKey) {
            // Don't show alert if fields are empty - just return silently
            // The placeholder will remain visible
            return;
        }
        streamUrl = combineRTMPUrl(serverUrl, streamKey);
    } else {
        // For HLS/FLV, try to use server URL + stream key, or allow manual full URL entry
        // If user entered a full URL in server URL field, use that
        if (serverUrl.startsWith('http://') || serverUrl.startsWith('https://')) {
            streamUrl = serverUrl;
        } else if (serverUrl && streamKey) {
            // Try to construct HLS/FLV URL from server URL and stream key
            // This is server-dependent, so we'll try common patterns
            if (streamType === 'hls') {
                // Common HLS pattern: http://server.com/hls/stream-key.m3u8
                streamUrl = serverUrl.replace('rtmp://', 'http://').replace(':1935', '') + '/hls/' + streamKey + '.m3u8';
            } else if (streamType === 'flv') {
                // Common FLV pattern: http://server.com:1935/live?app=live&stream=stream-key
                streamUrl = serverUrl.replace('rtmp://', 'http://') + '?app=live&stream=' + streamKey;
            }
        } else {
            // Don't show alert - just return silently
            return;
        }
    }

    if (!streamUrl) {
        // Don't show alert - just return silently
        return;
    }

    // Clean up existing players
    cleanupPlayers();

    // Show stream status
    document.getElementById('stream-status').style.display = 'flex';
    document.getElementById('stream-placeholder').style.display = 'none';

    // Load based on stream type
    if (streamType === 'rtmp') {
        loadRTMPStream(streamUrl);
    } else if (streamType === 'hls') {
        loadHLSStream(streamUrl);
    } else if (streamType === 'flv') {
        loadFLVStream(streamUrl);
    }
}

// Load RTMP stream using Video.js
function loadRTMPStream(rtmpUrl) {
    const videoElement = document.getElementById('video-player');
    videoElement.style.display = 'block';

    // Initialize Video.js player
    player = videojs('video-player', {
        fluid: true,
        responsive: true,
        autoplay: true,
        controls: true,
        preload: 'auto',
        techOrder: ['html5', 'flash'],
        flash: {
            swf: 'https://vjs.zencdn.net/swf/video-js.swf'
        },
        sources: [{
            src: rtmpUrl,
            type: 'rtmp/mp4'
        }]
    });

    player.ready(function() {
        console.log('RTMP player ready');
        player.play().catch(function(error) {
            console.error('Error playing stream:', error);
            // Show placeholder instead of alert
            document.getElementById('stream-placeholder').style.display = 'block';
            document.getElementById('video-player').style.display = 'none';
        });
    });

    player.on('error', function() {
        console.error('Player error:', player.error());
        // Show placeholder instead of alert
        document.getElementById('stream-placeholder').style.display = 'block';
        document.getElementById('video-player').style.display = 'none';
    });
}

// Load HLS stream (if RTMP server converts to HLS)
function loadHLSStream(hlsUrl) {
    const videoElement = document.getElementById('video-player');
    videoElement.style.display = 'block';

    // For HLS, we can use native HLS support or hls.js
    player = videojs('video-player', {
        fluid: true,
        responsive: true,
        autoplay: true,
        controls: true,
        preload: 'auto',
        html5: {
            hls: {
                withCredentials: false
            }
        },
        sources: [{
            src: hlsUrl,
            type: 'application/x-mpegURL'
        }]
    });

    player.ready(function() {
        console.log('HLS player ready');
        player.play().catch(function(error) {
            console.error('Error playing HLS stream:', error);
            // Show placeholder instead of alert
            document.getElementById('stream-placeholder').style.display = 'block';
            document.getElementById('video-player').style.display = 'none';
        });
    });

    player.on('error', function() {
        console.error('Player error:', player.error());
        // Show placeholder instead of alert
        document.getElementById('stream-placeholder').style.display = 'block';
        document.getElementById('video-player').style.display = 'none';
    });
}

// Load FLV stream using flv.js (modern approach for RTMP)
function loadFLVStream(flvUrl) {
    const videoElement = document.getElementById('video-player');
    videoElement.style.display = 'block';

    // Check if flv.js is available
    if (typeof flvjs === 'undefined') {
        alert('flv.js library not loaded. Please check your internet connection.');
        return;
    }

    // Check if flv.js is supported
    if (!flvjs.isSupported()) {
        alert('FLV playback is not supported in your browser.');
        return;
    }

    // Create a basic video element for flv.js
    if (player) {
        player.dispose();
    }

    // Create new video element for flv.js
    const videoWrapper = document.querySelector('.video-wrapper');
    const oldVideo = document.getElementById('video-player');
    
    // Hide old video player
    if (oldVideo) {
        oldVideo.style.display = 'none';
    }
    
    // Check if flv video element already exists
    let flvVideo = document.getElementById('flv-video-player');
    if (!flvVideo) {
        flvVideo = document.createElement('video');
        flvVideo.id = 'flv-video-player';
        flvVideo.className = 'video-js vjs-default-skin';
        flvVideo.controls = true;
        flvVideo.style.width = '100%';
        flvVideo.style.height = 'auto';
        flvVideo.style.display = 'block';
        
        // Insert after the RTMP config
        const rtmpConfig = document.querySelector('.rtmp-config');
        if (rtmpConfig && rtmpConfig.nextSibling) {
            videoWrapper.insertBefore(flvVideo, rtmpConfig.nextSibling);
        } else {
            videoWrapper.appendChild(flvVideo);
        }
    } else {
        flvVideo.style.display = 'block';
    }

    // Initialize flv.js player
    flvPlayer = flvjs.createPlayer({
        type: 'flv',
        url: flvUrl
    }, {
        enableWorker: false,
        enableStashBuffer: false,
        stashInitialSize: 128,
        autoCleanupSourceBuffer: true
    });

    flvPlayer.attachMediaElement(flvVideo);
    flvPlayer.load();

    flvVideo.addEventListener('loadedmetadata', function() {
        console.log('FLV stream loaded');
        flvVideo.play().catch(function(error) {
            console.error('Error playing FLV stream:', error);
            // Show placeholder instead of alert
            document.getElementById('stream-placeholder').style.display = 'block';
            if (flvVideo) flvVideo.style.display = 'none';
        });
    });

    flvPlayer.on(flvjs.Events.ERROR, function(errorType, errorDetail, errorInfo) {
        console.error('FLV player error:', errorType, errorDetail, errorInfo);
        // Show placeholder instead of alert
        document.getElementById('stream-placeholder').style.display = 'block';
        const flvVideo = document.getElementById('flv-video-player');
        if (flvVideo) flvVideo.style.display = 'none';
    });
}

// Cleanup existing players
function cleanupPlayers() {
    if (player) {
        try {
            player.dispose();
            player = null;
        } catch (e) {
            console.error('Error disposing Video.js player:', e);
        }
    }

    if (flvPlayer) {
        try {
            flvPlayer.pause();
            flvPlayer.unload();
            flvPlayer.detachMediaElement();
            flvPlayer.destroy();
            flvPlayer = null;
        } catch (e) {
            console.error('Error disposing flv.js player:', e);
        }
    }

    // Hide video player initially
    const videoElement = document.getElementById('video-player');
    if (videoElement) {
        videoElement.style.display = 'none';
    }

    const flvVideoElement = document.getElementById('flv-video-player');
    if (flvVideoElement) {
        flvVideoElement.style.display = 'none';
    }
}

// Load saved RTMP config from localStorage (optional)
window.addEventListener('DOMContentLoaded', function() {
    // Try to load from API first
    loadStreamConfigFromAPI();
    
    // Load saved values from localStorage if API didn't provide them
    const savedServerUrl = localStorage.getItem('rtmp-server-url');
    const savedStreamKey = localStorage.getItem('rtmp-stream-key');
    
    if (savedServerUrl && !document.getElementById('rtmp-server-url').value) {
        document.getElementById('rtmp-server-url').value = savedServerUrl;
    }
    if (savedStreamKey && !document.getElementById('rtmp-stream-key').value) {
        document.getElementById('rtmp-stream-key').value = savedStreamKey;
    }

    // Save values when they change
    document.getElementById('rtmp-server-url').addEventListener('change', function() {
        localStorage.setItem('rtmp-server-url', this.value);
    });
    document.getElementById('rtmp-stream-key').addEventListener('change', function() {
        localStorage.setItem('rtmp-stream-key', this.value);
    });

    // Allow Enter key to load stream
    const inputs = ['rtmp-server-url', 'rtmp-stream-key'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadStream();
            }
        });
    });
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    cleanupPlayers();
});

