// Zone Structure Data
// Add your fellowships to each group below
// Format: "Fellowship Name"

const zoneData = {
    groupA: {
        name: "Group A - Mighty Army",
        fellowships: [
            // Add fellowships here, for example:
            "University College Dublin",
            "National College Ireland",
            "Maynooth University",
            "TU Dublin, Blanchardstown",
            "TU Dublin, Tallaght",
            "University of Limerick",
            // "Trinity College Dublin",
            // "University College Dublin",
            // "Dublin City University"
        ]
    },
    groupB: {
        name: "Group B - LimitBreakers",
        fellowships: [
            "Dublin City University",
            "Dublin Business School",
            "TU Dublin, Grangegorman",
            
            // Add fellowships here
        ]
    },
    groupC: {
        name: "Group C - Boundless Love",
        fellowships: [
            "Trinity College Dublin",
            "Boundless Love Church",
            // Add fellowships here
        ]
    }
};

// Display group image on the about page
window.displayGroupImage = function(groupKey, imageUrl) {
    // Map groupKey to group index (groupA = 1, groupB = 2, groupC = 3)
    const groupIndex = groupKey === 'groupA' ? 1 : groupKey === 'groupB' ? 2 : 3;
    const groupDropdown = document.querySelector(`.group-dropdown:nth-of-type(${groupIndex})`);
    
    if (!groupDropdown || !imageUrl) return;
    
    // Construct full image URL
    const fullImageUrl = window.location.origin.includes('localhost')
        ? `http://localhost:8080${imageUrl}`
        : imageUrl;
    
    // Find or create image container
    let imageContainer = groupDropdown.querySelector('.group-image-container');
    if (!imageContainer) {
        const groupHeader = groupDropdown.querySelector('.group-header');
        if (groupHeader) {
            imageContainer = document.createElement('div');
            imageContainer.className = 'group-image-container';
            groupHeader.insertAdjacentElement('afterend', imageContainer);
        }
    }
    
    if (imageContainer) {
        imageContainer.innerHTML = `
            <img src="${fullImageUrl}" alt="${zoneData[groupKey].name}" class="group-image-display" 
                 onerror="this.style.display='none'">
        `;
    }
};

// Function to populate fellowships in the dropdown
function populateFellowships() {
    // Helper function to create fellowship item (supports both string and object format)
    function createFellowshipElement(fellowship) {
        const fellowshipItem = document.createElement('div');
        fellowshipItem.className = 'fellowship-item';
        
        // Handle both old format (string) and new format (object)
        if (typeof fellowship === 'string') {
            fellowshipItem.textContent = fellowship;
        } else {
            const name = fellowship.name || '';
            const url = fellowship.url || '';
            
            if (url) {
                // Create a link if URL is provided
                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.textContent = name;
                link.className = 'fellowship-link';
                fellowshipItem.appendChild(link);
            } else {
                // Just text if no URL
                fellowshipItem.textContent = name;
            }
        }
        
        return fellowshipItem;
    }
    
    // Group A
    const groupAFellowships = document.querySelector('.group-dropdown:nth-of-type(1) .fellowships-list');
    if (groupAFellowships && zoneData.groupA.fellowships.length > 0) {
        groupAFellowships.innerHTML = '';
        zoneData.groupA.fellowships.forEach(fellowship => {
            groupAFellowships.appendChild(createFellowshipElement(fellowship));
        });
    } else if (groupAFellowships && zoneData.groupA.fellowships.length === 0) {
        groupAFellowships.innerHTML = '<p class="fellowship-placeholder">Fellowships will be listed here</p>';
    }

    // Group B
    const groupBFellowships = document.querySelector('.group-dropdown:nth-of-type(2) .fellowships-list');
    if (groupBFellowships && zoneData.groupB.fellowships.length > 0) {
        groupBFellowships.innerHTML = '';
        zoneData.groupB.fellowships.forEach(fellowship => {
            groupBFellowships.appendChild(createFellowshipElement(fellowship));
        });
    } else if (groupBFellowships && zoneData.groupB.fellowships.length === 0) {
        groupBFellowships.innerHTML = '<p class="fellowship-placeholder">Fellowships will be listed here</p>';
    }

    // Group C
    const groupCFellowships = document.querySelector('.group-dropdown:nth-of-type(3) .fellowships-list');
    if (groupCFellowships && zoneData.groupC.fellowships.length > 0) {
        groupCFellowships.innerHTML = '';
        zoneData.groupC.fellowships.forEach(fellowship => {
            groupCFellowships.appendChild(createFellowshipElement(fellowship));
        });
    } else if (groupCFellowships && zoneData.groupC.fellowships.length === 0) {
        groupCFellowships.innerHTML = '<p class="fellowship-placeholder">Fellowships will be listed here</p>';
    }
}

// Populate fellowships and images when page loads
document.addEventListener('DOMContentLoaded', async function() {
    // Try to load from API first
    const apiData = await loadZoneDataFromAPI();
    if (apiData) {
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
        
        zoneData.groupA.fellowships = normalizeFellowships(apiData.groupA?.fellowships || []);
        zoneData.groupB.fellowships = normalizeFellowships(apiData.groupB?.fellowships || []);
        zoneData.groupC.fellowships = normalizeFellowships(apiData.groupC?.fellowships || []);
        
        // Update group images
        if (apiData.groupA?.image) {
            zoneData.groupA.image = apiData.groupA.image;
            displayGroupImage('groupA', apiData.groupA.image);
        }
        if (apiData.groupB?.image) {
            zoneData.groupB.image = apiData.groupB.image;
            displayGroupImage('groupB', apiData.groupB.image);
        }
        if (apiData.groupC?.image) {
            zoneData.groupC.image = apiData.groupC.image;
            displayGroupImage('groupC', apiData.groupC.image);
        }
    }
    populateFellowships();
});

