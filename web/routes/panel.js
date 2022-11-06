const express = require('express');
const router = express.Router();
const userModel = require('../../database/User')

router.get('/panel', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  if (req.user && req.user._doc.lang == 'es') return res.render('panelHomeES', { user: req.user._doc, ref: req.headers.referer });
  res.render('panelHome', { user: req.user._doc, ref: req.headers.referer })
})

router.get('/panel/lang/:lang', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const user = await userModel.findOne({
    username: req.user._doc.username
  })
  user.lang = req.params.lang
  await user.save()
  res.redirect('/panel')
})



module.exports = { router }