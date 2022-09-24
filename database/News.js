const {
    model,
    Schema
} = require('mongoose');

module.exports = model('New', new Schema({
    id: String,
    title: String,
    content: String,
    date: String,
    image: String,
    lang: String
}));