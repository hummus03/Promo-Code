document.addEventListener('DOMContentLoaded', function() {
    // Get shop from URL
    const urlParams = new URLSearchParams(window.location.search);
    const shop = urlParams.get('shop');

    if (!shop) {
        console.error('No shop parameter found');
        alert('Missing shop parameter');
        return;
    }

    // Navigation to create survey page
    document.getElementById('createSurvey').addEventListener('click', function() {
        window.location.href = `/create-survey.html?shop=${shop}`;
    });

    // View responses button handler - Updated!
    document.getElementById('viewResponses').addEventListener('click', function() {
        window.location.href = `/survey-responses.html?shop=${shop}`;
    });

    // Fetch and display surveys
    async function fetchSurveys() {
        try {
            const response = await fetch(`/api/surveys?shop=${shop}`);
            if (!response.ok) throw new Error('Failed to fetch surveys');
            
            const surveys = await response.json();
            
            // Update statistics
            document.getElementById('totalResponses').textContent = surveys.length;
            
            // Update activity log
            const activityLog = document.getElementById('activityLog');
            activityLog.innerHTML = ''; // Clear existing entries
            
            surveys.forEach(survey => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${new Date(survey.createdAt).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${survey.name}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Survey Created
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                        </span>
                    </td>
                `;
                activityLog.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching surveys:', error);
        }
    }

    // Initial fetch
    fetchSurveys();
}); 