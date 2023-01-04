const {
    model,
    Schema
} = require('mongoose');

module.exports = model('User', new Schema({
    id: String,
    username: String,
    password: String,
    lang: String,
    owner: Boolean,
    admin: Boolean
}));