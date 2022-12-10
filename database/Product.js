const {
    model,
    Schema
} = require('mongoose');

module.exports = model('Product', new Schema({
    id: String,
    name: String,
    description: String,
    createdAt: Date,
    image: String,
    categories: [],
    price: Number,
    commands: Array,
    serverName: String,
    lang: String
}));