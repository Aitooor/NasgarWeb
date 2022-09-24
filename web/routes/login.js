const express = require('express');
const router = express.Router();
const newModel = require('../../database/News');

router.get('/login', async (req, res, next) => {
  if (req.isAuthenticated()) return res.redirect('/panel')
  next()
}, (req, res) => {
  if (req.user && req.user._doc.lang == 'es') return res.render('loginES', { user: req.user });
  res.render('login', { user: req.user })
})

router.get('/logout', async (req, res) => {
  req.logout()
  res.redirect('/login')
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/panel',
  failureRedirect: '/login?code=1',
}))

module.exports = { router }