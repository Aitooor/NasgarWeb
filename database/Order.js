const {
    model,
    Schema
} = require('mongoose');

module.exports = model('Order', new Schema({
    id: { type: String, required: true},
    products: [],
    createdAt: { type: Date, required: true},
    used: Boolean,
    paid: Boolean,
    user: String,
    paypal: {}
}));