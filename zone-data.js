// Zone Structure Data
// Add your colleges to each group below
// Format: "College Name"

const zoneData = {
    groupA: {
        name: "Group A - Mighty Army",
        colleges: [
            // Add colleges here, for example:
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
        colleges: [
            "Dublin City University",
            "Dublin Business School",
            "TU Dublin, Grangegorman",
            
            // Add colleges here
        ]
    },
    groupC: {
        name: "Group C - Boundless Love",
        colleges: [
            "Trinity College Dublin",
            "Boundless Love Church",
            // Add colleges here
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

// Function to populate colleges in the dropdown
function populateColleges() {
    // Group A
    const groupAColleges = document.querySelector('.group-dropdown:nth-of-type(1) .colleges-list');
    if (groupAColleges && zoneData.groupA.colleges.length > 0) {
        groupAColleges.innerHTML = '';
        zoneData.groupA.colleges.forEach(college => {
            const collegeItem = document.createElement('div');
            collegeItem.className = 'college-item';
            collegeItem.textContent = college;
            groupAColleges.appendChild(collegeItem);
        });
    } else if (groupAColleges && zoneData.groupA.colleges.length === 0) {
        groupAColleges.innerHTML = '<p class="college-placeholder">Colleges will be listed here</p>';
    }

    // Group B
    const groupBColleges = document.querySelector('.group-dropdown:nth-of-type(2) .colleges-list');
    if (groupBColleges && zoneData.groupB.colleges.length > 0) {
        groupBColleges.innerHTML = '';
        zoneData.groupB.colleges.forEach(college => {
            const collegeItem = document.createElement('div');
            collegeItem.className = 'college-item';
            collegeItem.textContent = college;
            groupBColleges.appendChild(collegeItem);
        });
    } else if (groupBColleges && zoneData.groupB.colleges.length === 0) {
        groupBColleges.innerHTML = '<p class="college-placeholder">Colleges will be listed here</p>';
    }

    // Group C
    const groupCColleges = document.querySelector('.group-dropdown:nth-of-type(3) .colleges-list');
    if (groupCColleges && zoneData.groupC.colleges.length > 0) {
        groupCColleges.innerHTML = '';
        zoneData.groupC.colleges.forEach(college => {
            const collegeItem = document.createElement('div');
            collegeItem.className = 'college-item';
            collegeItem.textContent = college;
            groupCColleges.appendChild(collegeItem);
        });
    } else if (groupCColleges && zoneData.groupC.colleges.length === 0) {
        groupCColleges.innerHTML = '<p class="college-placeholder">Colleges will be listed here</p>';
    }
}

// Populate colleges and images when page loads
document.addEventListener('DOMContentLoaded', async function() {
    // Try to load from API first
    const apiData = await loadZoneDataFromAPI();
    if (apiData) {
        zoneData.groupA.colleges = apiData.groupA?.colleges || [];
        zoneData.groupB.colleges = apiData.groupB?.colleges || [];
        zoneData.groupC.colleges = apiData.groupC?.colleges || [];
        
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
    populateColleges();
});

