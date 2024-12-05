const mongoose = require('mongoose');

const SurveySchema = new mongoose.Schema({
    shop: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    questions: [{
        text: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['text', 'rating', 'multiple'],
            required: true
        },
        order: {
            type: Number,
            required: true
        },
        options: [{
            type: String
        }]
    }],
    discountSettings: {
        type: {
            type: String,
            enum: ['percentage', 'fixed'],
            required: true
        },
        value: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        }
    },
    active: {
        type: Boolean,
        default: true
    },
    isActiveCheckout: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Survey', SurveySchema);
