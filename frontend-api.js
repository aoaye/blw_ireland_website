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
    
    // Update fellowships in zone-data.js format for existing code
    if (typeof populateFellowships === 'function') {
        // Update the zoneData object that populateFellowships uses
        if (window.zoneData) {
            // Handle migration from old format (strings) to new format (objects)
            function normalizeFellowships(fellowships) {
                if (!Array.isArray(fellowships)) return [];
                return fellowships.map(f => {
                    if (typeof f === 'string') {
                        return { name: f };
                    }
                    return f;
                });
            }
            
            window.zoneData.groupA.fellowships = normalizeFellowships(zoneData.groupA?.fellowships || []);
            window.zoneData.groupB.fellowships = normalizeFellowships(zoneData.groupB?.fellowships || []);
            window.zoneData.groupC.fellowships = normalizeFellowships(zoneData.groupC?.fellowships || []);
            populateFellowships();
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
    
    // Update hero background slideshow
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        // Always prioritize heroBackgrounds array if it exists and has items
        // Only fall back to heroBackground if heroBackgrounds is empty or missing
        let heroImages = [];
        if (config.heroBackgrounds && Array.isArray(config.heroBackgrounds) && config.heroBackgrounds.length > 0) {
            heroImages = config.heroBackgrounds;
        } else if (config.heroBackground) {
            heroImages = [config.heroBackground];
        }
        
        if (heroImages.length > 0) {
            // Prepare image URLs with proper origin
            const imageUrls = heroImages.map(img => {
                return window.location.origin.includes('localhost')
                    ? `http://localhost:8080${img}`
                    : img;
            });
            
            // Initialize slideshow
            initHeroSlideshow(heroSection, imageUrls);
        } else {
            // Reset to gradient if no background images
            heroSection.style.backgroundImage = 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)';
            heroSection.style.backgroundSize = '';
            heroSection.style.backgroundPosition = '';
            heroSection.style.backgroundRepeat = '';
            // Clear any existing slideshow
            if (heroSection.dataset.slideshowInterval) {
                clearInterval(parseInt(heroSection.dataset.slideshowInterval));
                delete heroSection.dataset.slideshowInterval;
            }
        }
    }
    
    // Update about page tagline
    const aboutTagline = document.querySelector('.subtitle');
    if (aboutTagline && config.tagline) {
        aboutTagline.textContent = config.tagline;
    }
    
    // Update about page hero background slideshow (if using same images as homepage)
    const aboutHero = document.querySelector('.about-hero');
    if (aboutHero) {
        // Always prioritize heroBackgrounds array if it exists and has items
        // Only fall back to heroBackground if heroBackgrounds is empty or missing
        let heroImages = [];
        if (config.heroBackgrounds && Array.isArray(config.heroBackgrounds) && config.heroBackgrounds.length > 0) {
            heroImages = config.heroBackgrounds;
        } else if (config.heroBackground) {
            heroImages = [config.heroBackground];
        }
        if (heroImages.length > 0) {
            const imageUrls = heroImages.map(img => {
                return window.location.origin.includes('localhost')
                    ? `http://localhost:8080${img}`
                    : img;
            });
            initHeroSlideshow(aboutHero, imageUrls);
        }
    }
}

// Initialize hero background slideshow
function initHeroSlideshow(element, imageUrls) {
    if (!imageUrls || imageUrls.length === 0) return;
    
    let currentIndex = 0;
    
    // Function to change background image
    const changeBackground = () => {
        const imageUrl = imageUrls[currentIndex];
        element.style.backgroundImage = `url(${imageUrl})`;
        element.style.backgroundSize = 'cover';
        element.style.backgroundPosition = 'center';
        element.style.backgroundRepeat = 'no-repeat';
        element.style.transition = 'background-image 1s ease-in-out';
    };
    
    // Set initial image
    changeBackground();
    
    // If multiple images, create slideshow
    if (imageUrls.length > 1) {
        // Clear any existing interval
        if (element.dataset.slideshowInterval) {
            clearInterval(parseInt(element.dataset.slideshowInterval));
        }
        
        // Change image every 5 seconds
        const intervalId = setInterval(() => {
            currentIndex = (currentIndex + 1) % imageUrls.length;
            changeBackground();
        }, 5000);
        
        element.dataset.slideshowInterval = intervalId.toString();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Only run if API is available (admin server is running)
    updateHomepageEvents();
    updateZoneStructure();
    updateSiteContent();
});

