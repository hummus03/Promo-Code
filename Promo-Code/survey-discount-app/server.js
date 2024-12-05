require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const winston = require('winston');
const path = require('path');

const Survey = require('./models/Survey');
const SurveyResponse = require('./models/SurveyResponse');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB:', process.env.MONGODB_URI);
        logger.info('MongoDB connected successfully');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        logger.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Survey Routes
app.post('/api/surveys', async (req, res) => {
    try {
        const { name, description, questions, discountSettings, shop } = req.body;

        // Validate input
        if (!name || !questions || questions.length === 0) {
            return res.status(400).json({ error: 'Survey name and questions are required' });
        }

        // Create new survey
        const newSurvey = new Survey({
            shop,
            name,
            description,
            questions,
            discountSettings
        });

        await newSurvey.save();

        res.json({ success: true, surveyId: newSurvey._id });
    } catch (error) {
        console.error('Error creating survey:', error);
        res.status(500).json({ error: 'Failed to create survey' });
    }
});

app.get('/api/surveys', async (req, res) => {
    try {
        console.log('Fetching surveys');
        const shop = req.query.shop;
        
        if (!shop) {
            console.log('No shop provided in query');
            return res.status(400).json({ error: 'No shop provided' });
        }
        
        console.log('Fetching surveys for shop:', shop);
        
        const surveys = await Survey.find({ 
            shop: shop,
            active: true 
        });
        
        console.log('Found surveys:', surveys);
        res.json(surveys);
    } catch (err) {
        console.error('Survey fetch error:', err);
        logger.error('Survey fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch surveys' });
    }
});

app.get('/api/surveys/:id', async (req, res) => {
    try {
        console.log('Fetching single survey:', req.params.id);
        const shop = req.query.shop;
        
        if (!shop) {
            console.log('No shop provided');
            return res.status(400).json({ error: 'No shop provided' });
        }

        const survey = await Survey.findOne({ 
            _id: req.params.id,
            shop: shop,
            active: true
        });
        
        if (!survey) {
            console.log('Survey not found:', req.params.id, 'for shop:', shop);
            return res.status(404).json({ error: 'Survey not found' });
        }
        
        console.log('Survey found:', survey);
        res.json(survey);
    } catch (err) {
        console.error('Survey fetch error:', err);
        logger.error('Survey fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch survey' });
    }
});

app.put('/api/surveys/:id', async (req, res) => {
    try {
        const shop = req.query.shop;
        const { name, description, questions, discountSettings, active } = req.body;

        const survey = await Survey.findOneAndUpdate(
            { _id: req.params.id, shop: shop },
            { name, description, questions, discountSettings, active },
            { new: true }
        );

        if (!survey) {
            console.log('Survey not found for update:', req.params.id);
            return res.status(404).json({ error: 'Survey not found' });
        }

        console.log('Survey updated:', survey);
        res.json(survey);
    } catch (err) {
        console.error('Survey update error:', err);
        logger.error('Survey update error:', err);
        res.status(500).json({ error: 'Failed to update survey' });
    }
});

app.delete('/api/surveys/:id', async (req, res) => {
    try {
        const shop = req.query.shop;
        const survey = await Survey.findOneAndDelete({ 
            _id: req.params.id,
            shop: shop 
        });

        if (!survey) {
            console.log('Survey not found for deletion:', req.params.id);
            return res.status(404).json({ error: 'Survey not found' });
        }

        console.log('Survey deleted:', req.params.id);
        res.json({ message: 'Survey deleted successfully' });
    } catch (err) {
        console.error('Survey deletion error:', err);
        logger.error('Survey deletion error:', err);
        res.status(500).json({ error: 'Failed to delete survey' });
    }
});

app.post('/api/surveys/deploy', async (req, res) => {
    try {
        const { surveyId } = req.body;
        const shop = 'survey-saver.myshopify.com';
        
        // Update survey status
        await Survey.updateMany(
            { shop },
            { $set: { isActiveCheckout: false } }
        );
        
        await Survey.findByIdAndUpdate(
            surveyId,
            { $set: { isActiveCheckout: true } }
        );

        console.log('Deployed survey', surveyId, 'for shop', shop);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deploying survey:', error);
        res.status(500).json({ error: error.message });
    }
});

// Survey Response Routes
app.post('/api/checkout/complete', async (req, res) => {
    try {
        console.log('Processing survey response:', req.body);
        const { shop, surveyId, responses } = req.body;

        // Validate shop
        if (!shop) {
            throw new Error('No shop provided');
        }

        // Validate surveyId
        if (!surveyId) {
            throw new Error('No survey ID provided');
        }

        // Validate responses
        if (!responses || !Array.isArray(responses)) {
            throw new Error('Invalid responses format');
        }

        // Create discount code
        const discountCode = `SURVEY_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Save survey response
        const surveyResponse = new SurveyResponse({
            shop,
            surveyId,
            responses,
            discountCode
        });

        await surveyResponse.save();
        console.log('Survey response saved:', surveyResponse);

        res.json({ 
            success: true, 
            discountCode,
            message: 'Survey response recorded successfully'
        });

    } catch (err) {
        console.error('Survey processing error:', err);
        logger.error('Survey processing error:', err);
        res.status(500).json({ 
            error: 'Failed to process survey',
            details: err.message
        });
    }
});

// Add this new endpoint to get stats
app.get('/api/stats', async (req, res) => {
    try {
        const { shop } = req.query;
        console.log('Fetching stats for shop:', shop);

        // Get total surveys created
        const totalSurveys = await Survey.countDocuments({ shop });
        console.log('Total surveys:', totalSurveys);

        // Get total responses
        const totalResponses = await SurveyResponse.countDocuments({ shop });
        console.log('Total responses:', totalResponses);

        res.json({
            totalResponses: totalSurveys,
            totalDiscounts: totalResponses
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Add or update these endpoints

// Get all responses for a shop
app.get('/api/responses', async (req, res) => {
    try {
        const { shop, surveyId } = req.query;
        
        let query = { shop };
        if (surveyId) {
            query.surveyId = surveyId;
        }

        const responses = await SurveyResponse.find(query)
            .populate('surveyId')
            .sort({ createdAt: -1 });

        const formattedResponses = responses.map(response => {
            const survey = response.surveyId;
            const responseArray = response.responses || [];

            const formattedAnswers = survey.questions.map(question => {
                const answerObj = responseArray.find(r => r.questionId === question._id.toString());
                return {
                    questionText: question.text,
                    answer: answerObj ? answerObj.answer : 'No answer provided'
                };
            });

            return {
                date: response.createdAt,
                surveyName: survey.name,
                responses: formattedAnswers,
                discountCode: response.discountCode
            };
        });

        res.json({
            success: true,
            responses: formattedResponses
        });

    } catch (error) {
        console.error('Error fetching responses:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch responses: ' + error.message
        });
    }
});

// Get responses for a specific survey
app.get('/api/surveys/:surveyId/responses', async (req, res) => {
    try {
        const { surveyId } = req.params;
        const { shop } = req.query;
        
        console.log(`Fetching responses for survey ${surveyId} from shop ${shop}`);

        if (!surveyId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Survey ID is required' 
            });
        }

        // First get the survey details
        const survey = await Survey.findById(surveyId);
        if (!survey) {
            return res.status(404).json({ 
                success: false, 
                error: 'Survey not found' 
            });
        }

        // Then get the responses
        const responses = await SurveyResponse.find({ 
            surveyId,
            shop 
        }).sort({ createdAt: -1 });

        console.log(`Found ${responses.length} responses for survey ${surveyId}`);

        const formattedResponses = responses.map(response => ({
            date: response.createdAt,
            surveyId: survey._id,
            surveyName: survey.name,
            discountCode: response.discountCode,
            responses: response.responses || []
        }));

        res.json({
            success: true,
            responses: formattedResponses
        });
    } catch (error) {
        console.error('Error fetching survey responses:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch survey responses' 
        });
    }
});

// Get a single survey's details
app.get('/api/surveys/:surveyId', async (req, res) => {
    try {
        const { surveyId } = req.params;
        const { shop } = req.query;

        const survey = await Survey.findOne({ _id: surveyId, shop });
        if (!survey) {
            return res.status(404).json({ 
                success: false, 
                error: 'Survey not found' 
            });
        }

        res.json(survey);
    } catch (error) {
        console.error('Error fetching survey:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch survey' 
        });
    }
});

// Add this with your other routes
app.get('/api/responses', async (req, res) => {
    try {
        const { shop, surveyId } = req.query;
        console.log('Fetching responses for shop:', shop, 'surveyId:', surveyId);

        let query = { shop };
        if (surveyId) {
            query.surveyId = surveyId;
        }

        const responses = await SurveyResponse.find(query)
            .populate({
                path: 'surveyId',
                select: 'name questions'
            })
            .sort({ createdAt: -1 });

        console.log(`Found ${responses.length} responses`);

        const formattedResponses = responses.map(response => {
            const survey = response.surveyId;
            return {
                date: response.createdAt,
                surveyName: survey ? survey.name : 'Unknown Survey',
                responses: response.answers.map((answer, index) => ({
                    questionText: survey?.questions[index]?.text || 'Unknown Question',
                    answer: answer
                })),
                discountCode: response.discountCode
            };
        });

        res.json({
            success: true,
            responses: formattedResponses
        });

    } catch (error) {
        console.error('Error fetching responses:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch responses'
        });
    }
});

// Add a route for survey statistics
app.get('/api/survey-stats/:surveyId', async (req, res) => {
    try {
        const { surveyId } = req.params;
        const { shop } = req.query;

        const responses = await SurveyResponse.find({ 
            shop, 
            surveyId 
        });

        // Calculate statistics for each question
        const survey = await Survey.findById(surveyId);
        const stats = survey.questions.map((question, index) => {
            const answers = responses.map(r => r.answers[index]);
            const answerCounts = {};
            
            answers.forEach(answer => {
                answerCounts[answer] = (answerCounts[answer] || 0) + 1;
            });

            return {
                question: question.text,
                totalResponses: answers.length,
                answerDistribution: answerCounts
            };
        });

        res.json({
            success: true,
            stats,
            totalResponses: responses.length
        });

    } catch (error) {
        console.error('Error fetching survey stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch survey statistics'
        });
    }
});

app.post('/api/surveys/submit', async (req, res) => {
    try {
        const { shop, surveyId, responses } = req.body;

        // Validate shop and surveyId
        if (!shop || !surveyId) {
            return res.status(400).json({ error: 'Missing shop or survey ID' });
        }

        // Process the survey responses
        // (e.g., save to database, generate discount code, etc.)

        // Example: Generate a discount code
        const discountCode = `SURVEY_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Respond with the discount code
        res.json({ discountCode });
    } catch (error) {
        console.error('Error processing survey submission:', error);
        res.status(500).json({ error: 'Failed to process survey submission' });
    }
});

// Add this endpoint back to your server.js
app.post('/api/deploy-survey', async (req, res) => {
    try {
        const { surveyId, shop } = req.body;

        // Find the survey to deploy
        const survey = await Survey.findById(surveyId);
        if (!survey) {
            return res.status(404).json({
                success: false,
                error: 'Survey not found'
            });
        }

        // Update all surveys to be inactive
        await Survey.updateMany(
            { shop },
            { isActiveCheckout: false }
        );

        // Set the selected survey as active
        survey.isActiveCheckout = true;
        await survey.save();

        res.json({
            success: true,
            message: 'Survey deployed successfully'
        });

    } catch (error) {
        console.error('Error deploying survey:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to deploy survey: ' + error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    logger.error('Global error:', err);
    res.status(500).json({ 
        error: 'Something went wrong!',
        details: err.message,
        requestId: req.id
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    logger.info(`Server started on port ${PORT}`);
});
