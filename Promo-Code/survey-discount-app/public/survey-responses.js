document.addEventListener('DOMContentLoaded', function() {
    const surveySelect = document.getElementById('surveySelect');
    const responsesTable = document.getElementById('responsesTable');
    const totalResponses = document.getElementById('totalResponses');
    const codesUsed = document.getElementById('codesUsed');
    const avgRating = document.getElementById('avgRating');

    // Get shop from URL
    const urlParams = new URLSearchParams(window.location.search);
    const shop = urlParams.get('shop');

    if (!shop) {
        console.error('No shop parameter found');
        alert('Missing shop parameter');
        return;
    }

    // Fetch surveys for dropdown
    async function fetchSurveys() {
        try {
            const response = await fetch(`/api/surveys?shop=${shop}`);
            if (!response.ok) throw new Error('Failed to fetch surveys');
            
            const surveys = await response.json();
            console.log('Available surveys:', surveys);
            
            surveySelect.innerHTML = `
                <option value="">Select a survey</option>
                ${surveys.map(survey => `
                    <option value="${survey._id}">${survey.name}</option>
                `).join('')}
            `;

            // If there's only one survey, select it automatically
            if (surveys.length === 1) {
                surveySelect.value = surveys[0]._id;
                fetchResponses(surveys[0]._id);
            }
        } catch (error) {
            console.error('Error fetching surveys:', error);
            surveySelect.innerHTML = '<option value="">Error loading surveys</option>';
        }
    }

    // Fetch responses for selected survey
    async function fetchResponses(surveyId) {
        try {
            console.log('Fetching responses for survey:', surveyId);
            const response = await fetch(`/api/surveys/${surveyId}/responses?shop=${shop}`);
            if (!response.ok) throw new Error('Failed to fetch responses');
            
            const data = await response.json();
            console.log('Response data:', data);
            
            // Update stats
            totalResponses.textContent = data.responses.length;
            codesUsed.textContent = data.responses.filter(r => r.discountCode).length;
            
            // Calculate average rating if there are rating questions
            const ratings = data.responses
                .filter(r => r.questionType === 'rating')
                .map(r => parseInt(r.answer))
                .filter(r => !isNaN(r));
            
            avgRating.textContent = ratings.length 
                ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
                : 'N/A';

            // Update table
            responsesTable.innerHTML = data.responses.map(response => `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${new Date(response.date).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${response.questionText}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${response.answer}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${response.discountCode || 'N/A'}
                    </td>
                </tr>
            `).join('');

            if (data.responses.length === 0) {
                responsesTable.innerHTML = `
                    <tr>
                        <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                            No responses yet
                        </td>
                    </tr>
                `;
            }
        } catch (error) {
            console.error('Error fetching responses:', error);
            responsesTable.innerHTML = `
                <tr>
                    <td colspan="4" class="px-6 py-4 text-center text-red-600">
                        Error loading responses: ${error.message}
                    </td>
                </tr>
            `;
        }
    }

    // Survey selection change handler
    surveySelect.addEventListener('change', function() {
        if (this.value) {
            fetchResponses(this.value);
        } else {
            responsesTable.innerHTML = '';
            totalResponses.textContent = '0';
            codesUsed.textContent = '0';
            avgRating.textContent = 'N/A';
        }
    });

    // Initial surveys fetch
    fetchSurveys();
}); 