const {
    model,
    Schema
} = require('mongoose');

module.exports = model('Product', new Schema({
    id: String,
    createdAt: Date,
    price: Number,
    en: {
        name: String,
        description: String,
        categories: [],
        image: String,
        commands: Array,
        serverName: String
    },
    es: {
        name: String,
        description: String,
        categories: [],
        image: String,
        commands: Array,
        serverName: String
    }
}));