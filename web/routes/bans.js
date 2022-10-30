const express = require('express');
const { mongo } = require('mongoose');
const router = express.Router();
const punishModel = require('../../database/Punishments');

router.get('/bans', async (req, res) => {
  const filter = {}
  if (req.query.type) filter.type = req.query.type
  if (req.query.victimName) filter.victimName = req.query.victimName

  const bans = await punishModel.find(filter)
  if (req.query.lang && req.query.lang == 'es') return res.render('bansES', { content: bans, user: req.user, dayjs: require('dayjs'), ref: req.headers.referer, translate: true });
  if (req.user && req.user._doc.lang == 'es') return res.render('bansES', { content: bans, user: req.user, dayjs: require('dayjs'), ref: req.headers.referer, translate: false });
  res.render('bans', { content: bans, user: req.user, dayjs: require('dayjs'), ref: req.headers.referer, translate: false });
})


module.exports = { router }