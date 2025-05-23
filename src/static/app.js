document.addEventListener('DOMContentLoaded', function() {
    const activitiesList = document.getElementById('activities-list');
    const activitySelect = document.getElementById('activity');
    const signupForm = document.getElementById('signup-form');
    const messageDiv = document.getElementById('message');

    // Load activities
    fetch('/activities')
        .then(response => response.json())
        .then(activities => {
            displayActivities(activities);
            populateActivitySelect(activities);
        })
        .catch(error => {
            console.error('Error loading activities:', error);
            activitiesList.innerHTML = '<p class="error">Failed to load activities</p>';
        });

    function displayActivities(activities) {
        activitiesList.innerHTML = '';
        
        Object.entries(activities).forEach(([name, details]) => {
            const activityCard = document.createElement('div');
            activityCard.className = 'activity-card';
            
            const participantsList = details.participants && details.participants.length > 0
                ? `<ul class="participants-list">
                     ${details.participants.map(email => `<li>${email}</li>`).join('')}
                   </ul>`
                : '<p class="no-participants">No participants yet</p>';
            
            activityCard.innerHTML = `
                <h4>${name}</h4>
                <p><strong>Description:</strong> ${details.description}</p>
                <p><strong>Schedule:</strong> ${details.schedule}</p>
                <p><strong>Capacity:</strong> ${details.participants.length}/${details.max_participants}</p>
                <div class="participants-section">
                    <h5>Current Participants:</h5>
                    ${participantsList}
                </div>
            `;
            
            activitiesList.appendChild(activityCard);
        });
    }

    function populateActivitySelect(activities) {
        Object.keys(activities).forEach(activityName => {
            const option = document.createElement('option');
            option.value = activityName;
            option.textContent = activityName;
            activitySelect.appendChild(option);
        });
    }

    // Handle form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const activity = document.getElementById('activity').value;
        
        if (!email || !activity) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        // Make signup request
        fetch(`/activities/${activity}/signup?email=${encodeURIComponent(email)}`, {
            method: 'POST'
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return response.json().then(err => Promise.reject(err));
        })
        .then(data => {
            showMessage(data.message, 'success');
            signupForm.reset();
            // Reload activities to show updated participants
            return fetch('/activities');
        })
        .then(response => response.json())
        .then(activities => {
            displayActivities(activities);
        })
        .catch(error => {
            showMessage(error.detail || 'An error occurred', 'error');
        });
    });

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.classList.remove('hidden');
        
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 5000);
    }
});
