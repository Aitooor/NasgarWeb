const {
    model,
    Schema
} = require('mongoose');

module.exports = model('Product', new Schema({
    id: String,
    createdAt: Date,
    price: Number,
    english: {
        name: String,
        description: String,
        categories: [],
        image: String,
        commands: Array,
        serverName: String
    },
    spanish: {
        name: String,
        description: String,
        categories: [],
        image: String,
        commands: Array,
        serverName: String
    }
}));