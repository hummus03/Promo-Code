const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    id: String,
    shop: String,
    state: String,
    isOnline: Boolean,
    accessToken: String,
    scope: String,
    expires: Date
});

module.exports = mongoose.model('Session', sessionSchema); 