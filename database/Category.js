const {
  model,
  Schema
} = require('mongoose');


module.exports = model('Category', new Schema({
  id: String,
  en: {
    name: String,
    subcategories: [String],
    subsubcategories: [String]
  },
  es: {
    name: String,
    subcategories: [String],
    subsubcategories: [String]
  }


}));