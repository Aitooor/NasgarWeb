const {
    model,
    Schema
} = require('mongoose');

module.exports = model('New', new Schema({
    id: String,
    date: String,
    en: {
        title: String,
        content: String,
        image: String,
    },
    es: {
        title: String,
        content: String,
        image: String,
    }
}));