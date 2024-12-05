async function deploySurvey(surveyId) {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const shop = urlParams.get('shop') || 'survey-saver.myshopify.com';

        const response = await fetch('/api/deploy-survey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                surveyId,
                shop
            })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to deploy survey');
        }

        // Update UI to show the survey is deployed
        document.querySelectorAll('.deploy-status').forEach(el => {
            el.textContent = 'Not Deployed';
            el.classList.remove('text-green-500');
            el.classList.add('text-gray-500');
        });

        const deployStatus = document.querySelector(`#deploy-status-${surveyId}`);
        if (deployStatus) {
            deployStatus.textContent = 'Deployed';
            deployStatus.classList.remove('text-gray-500');
            deployStatus.classList.add('text-green-500');
        }

        alert('Survey deployed successfully!');

    } catch (error) {
        console.error('Error deploying survey:', error);
        alert('Error deploying survey: ' + error.message);
    }
}

function loadRecentActivity() {
    fetch('/api/recent-activity')
        .then(response => response.json())
        .then(data => {
            const recentActivityContainer = document.getElementById('recentActivityContainer');
            recentActivityContainer.innerHTML = `
                <table class="min-w-full">
                    <thead>
                        <tr>
                            <th class="text-left">Date</th>
                            <th class="text-left">Survey</th>
                            <th class="text-left">Action</th>
                            <th class="text-left">Status</th>
                            <th class="text-left">Share</th>
                            <th class="text-left">Deploy</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.surveys.map(survey => `
                            <tr class="border-t">
                                <td class="py-2">${new Date(survey.createdAt).toLocaleDateString()}</td>
                                <td>${survey.name}</td>
                                <td>
                                    <a href="/responses?id=${survey._id}" class="text-blue-500 hover:text-blue-700">
                                        View Responses
                                    </a>
                                </td>
                                <td>
                                    <span id="deploy-status-${survey._id}" 
                                          class="deploy-status ${survey.isActiveCheckout ? 'text-green-500' : 'text-gray-500'}">
                                        ${survey.isActiveCheckout ? 'Deployed' : 'Not Deployed'}
                                    </span>
                                </td>
                                <td>
                                    <button class="text-blue-500 hover:text-blue-700">
                                        Share
                                    </button>
                                </td>
                                <td>
                                    <button onclick="deploySurvey('${survey._id}')"
                                            class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                                        Deploy
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        })
        .catch(error => {
            console.error('Error loading recent activity:', error);
            document.getElementById('recentActivityContainer').innerHTML = `
                <div class="text-red-500">
                    Error loading recent activity: ${error.message}
                </div>
            `;
        });
} 