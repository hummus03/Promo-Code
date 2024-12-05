document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const surveyId = urlParams.get('id');
    const shop = urlParams.get('shop');

    if (!surveyId || !shop) {
        alert('Missing survey ID or shop parameter');
        return;
    }

    const form = document.getElementById('surveyForm');
    const questionsContainer = document.getElementById('questionsContainer');

    async function loadSurvey() {
        try {
            const response = await fetch(`/api/surveys/${surveyId}?shop=${shop}`);
            if (!response.ok) throw new Error('Failed to fetch survey');
            
            const survey = await response.json();
            
            // Update title and description
            document.getElementById('surveyTitle').textContent = survey.name;
            document.getElementById('surveyDescription').textContent = survey.description;

            // Create form fields for each question
            survey.questions.forEach((question, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'space-y-2';

                let inputHtml = '';
                switch(question.type) {
                    case 'text':
                        inputHtml = `
                            <input type="text" 
                                name="question_${question._id}" 
                                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required>
                        `;
                        break;
                    case 'rating':
                        inputHtml = `
                            <div class="flex space-x-4">
                                ${[1,2,3,4,5].map(num => `
                                    <label class="flex items-center">
                                        <input type="radio" name="question_${question._id}" value="${num}" required>
                                        <span class="ml-2">${num}</span>
                                    </label>
                                `).join('')}
                            </div>
                        `;
                        break;
                    case 'multiple':
                        inputHtml = `
                            <select name="question_${question._id}" 
                                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required>
                                <option value="">Select an option</option>
                                ${question.options.map(option => `
                                    <option value="${option}">${option}</option>
                                `).join('')}
                            </select>
                        `;
                        break;
                }

                questionDiv.innerHTML = `
                    <label class="block text-sm font-medium text-gray-700">
                        ${question.text}
                    </label>
                    ${inputHtml}
                `;

                questionsContainer.appendChild(questionDiv);
            });
        } catch (error) {
            console.error('Error loading survey:', error);
            alert('Failed to load survey');
        }
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(form);
        const responses = [];

        // Convert FormData to array of responses
        for (let [name, value] of formData.entries()) {
            if (name.startsWith('question_')) {
                const questionId = name.replace('question_', '');
                responses.push({
                    questionId,
                    answer: value
                });
            }
        }

        try {
            const response = await fetch('/api/checkout/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    shop,
                    surveyId,
                    responses
                })
            });

            if (!response.ok) throw new Error('Failed to submit survey');
            
            const result = await response.json();
            
            if (result.discountCode) {
                alert(`Thank you for completing the survey! Your discount code is: ${result.discountCode}`);
            } else {
                alert('Thank you for completing the survey!');
            }

            // Redirect back to the shop or a thank you page
            window.location.href = `https://${shop}`;
        } catch (error) {
            console.error('Error submitting survey:', error);
            alert('Failed to submit survey');
        }
    });

    // Load the survey
    loadSurvey();
}); 