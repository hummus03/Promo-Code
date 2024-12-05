console.log('Dashboard script starting...');

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Dashboard script starting...');

    const urlParams = new URLSearchParams(window.location.search);
    const shop = urlParams.get('shop');
    console.log('Shop from URL:', shop);

    if (!shop) {
        console.error('No shop parameter found');
        return;
    }

    // Update Quick Action links with shop parameter
    document.querySelectorAll('a[href]').forEach(link => {
        const url = new URL(link.href, window.location.origin);
        url.searchParams.set('shop', shop);
        link.href = url.toString();
    });

    try {
        console.log('Fetching surveys for shop:', shop);
        const surveysResponse = await fetch(`/api/surveys?shop=${shop}`);
        const surveys = await surveysResponse.json();
        console.log('Surveys fetched:', surveys);

        let totalResponses = 0;
        let totalDiscounts = 0;

        for (const survey of surveys) {
            console.log('Fetching responses for survey:', survey._id);
            const responsesResponse = await fetch(`/api/surveys/${survey._id}/responses?shop=${shop}`);
            const data = await responsesResponse.json();
            console.log('Response data:', data);
            
            if (data.responses) {
                totalResponses += data.responses.length;
                totalDiscounts += data.responses.filter(r => r.discountCode).length;
            }
        }

        // Update stats
        document.getElementById('totalResponses').textContent = totalResponses;
        document.getElementById('totalDiscounts').textContent = totalDiscounts;

        // Update activity table
        const tableBody = document.querySelector('#activityTable tbody');
        if (tableBody) {
            console.log('Found table body, updating with', surveys.length, 'surveys');
            const rows = surveys.map(survey => `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${new Date(survey.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${survey.name}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">
                            <i class="fas fa-file-alt mr-2 text-blue-500"></i>
                            Survey Created
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${survey.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                            ${survey.active ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button onclick="shareSurvey('${survey._id}')" class="text-blue-600 hover:text-blue-800">
                            <i class="fas fa-share-alt mr-2"></i>
                            Share
                        </button>
                    </td>
                </tr>
            `).join('');
            tableBody.innerHTML = rows;
            console.log('Table updated with rows:', rows);
        } else {
            console.error('Table body not found');
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        console.error('Error details:', error.message);
    }
});

function shareSurvey(surveyId) {
    const surveyUrl = `${window.location.origin}/survey.html?shop=survey-saver.myshopify.com&id=${surveyId}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(surveyUrl).then(() => {
        alert('Survey link copied to clipboard!\n\n' + surveyUrl);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Survey URL: ' + surveyUrl);
    });
} 