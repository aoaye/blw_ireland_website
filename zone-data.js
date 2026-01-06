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
    // Group A
    const groupAFellowships = document.querySelector('.group-dropdown:nth-of-type(1) .fellowships-list');
    if (groupAFellowships && zoneData.groupA.fellowships.length > 0) {
        groupAFellowships.innerHTML = '';
        zoneData.groupA.fellowships.forEach(fellowship => {
            const fellowshipItem = document.createElement('div');
            fellowshipItem.className = 'fellowship-item';
            fellowshipItem.textContent = fellowship;
            groupAFellowships.appendChild(fellowshipItem);
        });
    } else if (groupAFellowships && zoneData.groupA.fellowships.length === 0) {
        groupAFellowships.innerHTML = '<p class="fellowship-placeholder">Fellowships will be listed here</p>';
    }

    // Group B
    const groupBFellowships = document.querySelector('.group-dropdown:nth-of-type(2) .fellowships-list');
    if (groupBFellowships && zoneData.groupB.fellowships.length > 0) {
        groupBFellowships.innerHTML = '';
        zoneData.groupB.fellowships.forEach(fellowship => {
            const fellowshipItem = document.createElement('div');
            fellowshipItem.className = 'fellowship-item';
            fellowshipItem.textContent = fellowship;
            groupBFellowships.appendChild(fellowshipItem);
        });
    } else if (groupBFellowships && zoneData.groupB.fellowships.length === 0) {
        groupBFellowships.innerHTML = '<p class="fellowship-placeholder">Fellowships will be listed here</p>';
    }

    // Group C
    const groupCFellowships = document.querySelector('.group-dropdown:nth-of-type(3) .fellowships-list');
    if (groupCFellowships && zoneData.groupC.fellowships.length > 0) {
        groupCFellowships.innerHTML = '';
        zoneData.groupC.fellowships.forEach(fellowship => {
            const fellowshipItem = document.createElement('div');
            fellowshipItem.className = 'fellowship-item';
            fellowshipItem.textContent = fellowship;
            groupCFellowships.appendChild(fellowshipItem);
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
        zoneData.groupA.fellowships = apiData.groupA?.fellowships || [];
        zoneData.groupB.fellowships = apiData.groupB?.fellowships || [];
        zoneData.groupC.fellowships = apiData.groupC?.fellowships || [];
        
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

