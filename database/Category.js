const {
  model,
  Schema
} = require('mongoose');


module.exports = model('Category', new Schema({
  id: String,
  name: String,
}));