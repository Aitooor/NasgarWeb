const {
  model,
  Schema,
  createConnection
} = require('mongoose');

const con    = createConnection(process.env.MONGO_URL.replace("Web", "StaffCore"));

module.exports = con.model('Punishments', new Schema({
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