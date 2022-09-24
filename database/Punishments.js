const {
  model,
  Schema
} = require('mongoose');

module.exports = model('Punishments', new Schema({
  uuid: String,
  type: String,
  targetID: String,
  addedReason: String,
  addedAt: String,
  silent: Boolean,
  staffName: String,
  victimName: String,
  addedBy: String,
}));