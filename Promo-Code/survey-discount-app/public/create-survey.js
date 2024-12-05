document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('surveyForm');
    const addQuestionBtn = document.getElementById('addQuestion');
    const questionsContainer = document.getElementById('questionsContainer');
    let questionCount = 0;

    function createMultipleChoiceOptions(questionDiv, questionIndex) {
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'mt-4 options-container space-y-2';
        optionsDiv.innerHTML = `
            <div class="flex justify-between items-center">
                <label class="block text-sm font-medium text-gray-700">Options</label>
                <button type="button" class="add-option text-blue-600 hover:text-blue-800 text-sm">
                    + Add Option
                </button>
            </div>
            <div class="options-list space-y-2">
                <div class="flex items-center space-x-2">
                    <input type="text" name="questions[${questionIndex}][options][]" 
                        class="flex-grow rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Option text" required>
                    <button type="button" class="delete-option text-red-600 hover:text-red-800">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        const addOptionBtn = optionsDiv.querySelector('.add-option');
        const optionsList = optionsDiv.querySelector('.options-list');

        addOptionBtn.addEventListener('click', () => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'flex items-center space-x-2';
            optionDiv.innerHTML = `
                <input type="text" name="questions[${questionIndex}][options][]" 
                    class="flex-grow rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Option text" required>
                <button type="button" class="delete-option text-red-600 hover:text-red-800">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            `;

            optionDiv.querySelector('.delete-option').addEventListener('click', () => {
                optionDiv.remove();
            });

            optionsList.appendChild(optionDiv);
        });

        return optionsDiv;
    }

    function addQuestion() {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'bg-gray-50 p-4 rounded-lg question-block';
        questionCount++;

        questionDiv.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div class="flex-grow">
                    <input type="text" name="questions[${questionCount}][text]" 
                        placeholder="Enter your question" required
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                </div>
                <button type="button" class="delete-question ml-4 text-red-600 hover:text-red-800">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Answer Type</label>
                <select name="questions[${questionCount}][type]" required
                    class="question-type mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option value="text">Text</option>
                    <option value="rating">Rating (1-5)</option>
                    <option value="multiple">Multiple Choice</option>
                </select>
            </div>
        `;

        const typeSelect = questionDiv.querySelector('.question-type');
        const optionsContainer = document.createElement('div');
        questionDiv.appendChild(optionsContainer);

        typeSelect.addEventListener('change', function() {
            optionsContainer.innerHTML = '';
            if (this.value === 'multiple') {
                optionsContainer.appendChild(createMultipleChoiceOptions(questionDiv, questionCount));
            }
        });

        questionDiv.querySelector('.delete-question').addEventListener('click', function() {
            questionDiv.remove();
        });

        questionsContainer.appendChild(questionDiv);
    }

    // Add first question by default
    addQuestion();

    // Add question button click handler
    addQuestionBtn.addEventListener('click', addQuestion);

    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('surveyName').value,
            description: document.getElementById('surveyDescription').value,
            questions: Array.from(document.querySelectorAll('.question-block')).map((block, index) => {
                const questionData = {
                    text: block.querySelector('input[type="text"]').value,
                    type: block.querySelector('select').value,
                    order: index + 1
                };

                if (questionData.type === 'multiple') {
                    questionData.options = Array.from(block.querySelectorAll('.options-list input')).map(input => input.value);
                }

                return questionData;
            }),
            discountSettings: {
                type: document.getElementById('discountType').value,
                value: parseFloat(document.getElementById('discountValue').value)
            }
        };

        try {
            // Get shop from URL query parameter
            const urlParams = new URLSearchParams(window.location.search);
            const shop = urlParams.get('shop');
            
            if (!shop) {
                throw new Error('No shop parameter found');
            }

            console.log('Creating survey for shop:', shop);
            console.log('Survey data:', formData);

            const response = await fetch(`/api/surveys?shop=${shop}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Failed to create survey');
            }

            const result = await response.json();
            console.log('Survey created:', result);
            alert('Survey created successfully!');
            window.location.href = '/?shop=' + shop;
        } catch (error) {
            console.error('Detailed error:', error);
            alert(`Failed to create survey: ${error.message}`);
        }
    });
}); 