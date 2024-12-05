const mongoose = require('mongoose');

const SurveyResponseSchema = new mongoose.Schema({
    shop: String,
    surveyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survey'
    },
    responses: [{
        questionId: String,
        answer: String
    }],
    discountCode: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SurveyResponse', SurveyResponseSchema);
