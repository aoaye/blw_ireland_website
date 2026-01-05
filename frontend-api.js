// Frontend API Integration
// This file handles fetching data from the admin API for the public website

// Use current origin in production, localhost in development
const API_BASE = window.location.origin.includes('localhost') 
    ? 'http://localhost:8080/api' 
    : `${window.location.origin}/api`;

// Fetch events from API
async function loadEventsFromAPI() {
    try {
        const response = await fetch(`${API_BASE}/events`);
        const events = await response.json();
        return events;
    } catch (error) {
        console.error('Failed to load events:', error);
        return null;
    }
}

// Fetch zone data from API
async function loadZoneDataFromAPI() {
    try {
        const response = await fetch(`${API_BASE}/zone-data`);
        const zoneData = await response.json();
        return zoneData;
    } catch (error) {
        console.error('Failed to load zone data:', error);
        return null;
    }
}

// Fetch stream config from API
async function loadStreamConfigFromAPI() {
    try {
        const response = await fetch(`${API_BASE}/stream-config`);
        const config = await response.json();
        return config;
    } catch (error) {
        console.error('Failed to load stream config:', error);
        return null;
    }
}

// Fetch Instagram config from API
async function loadInstagramConfigFromAPI() {
    try {
        const response = await fetch(`${API_BASE}/instagram-config`);
        const config = await response.json();
        return config;
    } catch (error) {
        console.error('Failed to load Instagram config:', error);
        return null;
    }
}

// Fetch site config from API
async function loadSiteConfigFromAPI() {
    try {
        const response = await fetch(`${API_BASE}/config`);
        const config = await response.json();
        return config;
    } catch (error) {
        console.error('Failed to load site config:', error);
        return null;
    }
}

// Format event date for display
function formatEventDate(dateString) {
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
}

// Update homepage events
async function updateHomepageEvents() {
    const events = await loadEventsFromAPI();
    if (!events || events.length === 0) return;
    
    const eventsContainer = document.querySelector('.events-list');
    if (!eventsContainer) return;
    
    eventsContainer.innerHTML = '';
    
    events.forEach(event => {
        const dateInfo = event.date ? formatEventDate(event.date) : null;
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.innerHTML = `
            <div class="event-date">
                <span class="day">${event.day || (dateInfo ? dateInfo.dayName : '')}</span>
                <span class="time">${event.time || ''}</span>
                ${dateInfo ? `<span class="date-full">${dateInfo.fullDate}</span>` : ''}
            </div>
            <div class="event-details">
                <h3>${event.title}</h3>
                <p>${event.description || ''}</p>
            </div>
        `;
        eventsContainer.appendChild(eventCard);
    });
}

// Update zone structure on about page
async function updateZoneStructure() {
    const zoneData = await loadZoneDataFromAPI();
    if (!zoneData) return;
    
    // Update colleges in zone-data.js format for existing code
    if (typeof populateColleges === 'function') {
        // Update the zoneData object that populateColleges uses
        if (window.zoneData) {
            window.zoneData.groupA.colleges = zoneData.groupA?.colleges || [];
            window.zoneData.groupB.colleges = zoneData.groupB?.colleges || [];
            window.zoneData.groupC.colleges = zoneData.groupC?.colleges || [];
            populateColleges();
        }
    }
    
    // Update group images
    if (typeof displayGroupImage === 'function') {
        if (zoneData.groupA?.image) {
            displayGroupImage('groupA', zoneData.groupA.image);
        }
        if (zoneData.groupB?.image) {
            displayGroupImage('groupB', zoneData.groupB.image);
        }
        if (zoneData.groupC?.image) {
            displayGroupImage('groupC', zoneData.groupC.image);
        }
    }
}

// Update site title and tagline
async function updateSiteContent() {
    const config = await loadSiteConfigFromAPI();
    if (!config) return;
    
    // Update hero tagline
    const heroTagline = document.querySelector('.hero-content p');
    if (heroTagline && config.tagline) {
        heroTagline.textContent = config.tagline;
    }
    
    // Update hero background image
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        if (config.heroBackground) {
            // Use current origin in production, localhost in development
            const imageUrl = window.location.origin.includes('localhost')
                ? `http://localhost:8080${config.heroBackground}`
                : config.heroBackground;
            // Set background image (overlay gradient is handled by CSS ::before)
            heroSection.style.backgroundImage = `url(${imageUrl})`;
            heroSection.style.backgroundSize = 'cover';
            heroSection.style.backgroundPosition = 'center';
            heroSection.style.backgroundRepeat = 'no-repeat';
        } else {
            // Reset to gradient if no background image
            heroSection.style.backgroundImage = 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)';
            heroSection.style.backgroundSize = '';
            heroSection.style.backgroundPosition = '';
            heroSection.style.backgroundRepeat = '';
        }
    }
    
    // Update about page tagline
    const aboutTagline = document.querySelector('.subtitle');
    if (aboutTagline && config.tagline) {
        aboutTagline.textContent = config.tagline;
    }
    
    // Update about page hero background image (if using same image as homepage)
    const aboutHero = document.querySelector('.about-hero');
    if (aboutHero && config.heroBackground) {
        const imageUrl = window.location.origin.includes('localhost')
            ? `http://localhost:8080${config.heroBackground}`
            : config.heroBackground;
        aboutHero.style.backgroundImage = `url(${imageUrl})`;
        aboutHero.style.backgroundSize = 'cover';
        aboutHero.style.backgroundPosition = 'center';
        aboutHero.style.backgroundRepeat = 'no-repeat';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Only run if API is available (admin server is running)
    updateHomepageEvents();
    updateZoneStructure();
    updateSiteContent();
});

