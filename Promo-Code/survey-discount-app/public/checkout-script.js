(function() {
    // Function to create and inject the survey
    function createSurvey() {
        const surveyContainer = document.createElement('div');
        surveyContainer.id = 'survey-container';
        surveyContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
        `;

        // Add survey content
        surveyContainer.innerHTML = `
            <h2>Quick Survey</h2>
            <p>Complete this survey for a discount!</p>
            <div id="survey-questions"></div>
            <button onclick="submitSurvey()">Submit Survey</button>
        `;

        document.body.appendChild(surveyContainer);
    }

    // Wait for the page to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createSurvey);
    } else {
        createSurvey();
    }
})(); 