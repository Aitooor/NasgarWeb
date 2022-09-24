const express = require('express');
const router = express.Router();
const punishModel = require('../../database/Punishments');

router.get('/bans', async (req, res) => {
  const filter = {}
  if (req.query.type) filter.type = req.query.type
  if (req.query.victimName) filter.victimName = req.query.victimName
  punishModel.db.useDb("StaffCore")
  const bans = await punishModel.find(filter)
  if (req.user && req.user._doc.lang == 'es') return res.render('bansES', { content: bans, user: req.user, dayjs: require('dayjs') });
  res.render('bans', { content: bans, user: req.user, dayjs: require('dayjs') });
})


module.exports = { router }