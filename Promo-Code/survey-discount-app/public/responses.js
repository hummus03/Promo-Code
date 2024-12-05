async function loadResponses() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const shop = urlParams.get('shop') || 'survey-saver.myshopify.com';
        const surveyId = urlParams.get('id');

        const response = await fetch(`/api/responses?shop=${encodeURIComponent(shop)}${surveyId ? `&surveyId=${surveyId}` : ''}`);
        const data = await response.json();

        console.log('Total responses received:', data.responses.length);
        console.log('Responses with discount codes:', data.responses.filter(r => r.discountCode).length);
        console.log('Full response data:', data);

        if (!data.success) {
            throw new Error(data.error || 'Failed to load responses');
        }

        const statsResponse = await fetch(`/api/stats?shop=${shop}`);
        const statsData = await statsResponse.json();
        console.log('Stats data:', statsData);

        document.getElementById('totalResponses').textContent = statsData.totalResponses || 0;
        document.getElementById('discountsUsed').textContent = statsData.totalDiscounts || 0;
        document.getElementById('completionRate').textContent = 
            `${Math.round((statsData.totalResponses / (statsData.totalResponses || 1)) * 100)}%`;

        const responsesContainer = document.getElementById('responsesContainer');
        if (data.responses.length === 0) {
            responsesContainer.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-inbox text-gray-400 text-4xl mb-3"></i>
                    <p class="text-gray-500">No responses yet.</p>
                </div>`;
            return;
        }

        responsesContainer.innerHTML = `
            <div class="space-y-6">
                ${data.responses.map(response => `
                    <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold text-gray-800">${response.surveyName}</h3>
                            <span class="text-sm text-gray-500">
                                ${new Date(response.date).toLocaleDateString()}
                            </span>
                        </div>
                        <div class="space-y-4">
                            ${response.responses.map(answer => `
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <span class="font-medium text-gray-700 block mb-2">${answer.questionText}</span>
                                    <span class="text-gray-600">${answer.answer}</span>
                                </div>
                            `).join('')}
                        </div>
                        ${response.discountCode ? `
                            <div class="mt-6 pt-4 border-t border-gray-100">
                                <div class="flex items-center">
                                    <i class="fas fa-ticket-alt text-green-500 mr-2"></i>
                                    <span class="font-medium text-gray-700">Discount Code:</span>
                                    <span class="ml-2 text-green-600 font-mono">${response.discountCode}</span>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;

    } catch (error) {
        console.error('Error loading responses:', error);
        document.getElementById('responsesContainer').innerHTML = `
            <div class="bg-red-50 text-red-500 p-4 rounded-lg text-center">
                <i class="fas fa-exclamation-circle text-xl mb-2"></i>
                <div>Error loading responses: ${error.message}</div>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', loadResponses);