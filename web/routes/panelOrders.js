const express = require('express');
const router = express.Router();
const userModel = require('../../database/User')
const dayjs = require('dayjs');
const orderModel = require('../../database/Order')

router.get('/panel/orders', async (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) {
    const content = await orderModel.find({ user: req.user.username })
    if (req.user && req.user._doc.lang == 'es') return res.render('panelOrdersES', { content: content, type: 'main', user: req.user._doc, ref: req.headers.referer });
    return res.render('panelOrders', { content: content, type: 'main', user: req.user._doc, ref: req.headers.referer })
  }
  next()
}, async (req, res) => {
  let content = await orderModel.find({})
  if (req.query.id) content = content.filter(c => c.id == req.query.id || req.query.id == c.user)
  if (req.user && req.user._doc.lang == 'es') return res.render('panelOrdersES', { content: content, type: 'main', user: req.user._doc, ref: req.headers.referer });
  res.render('panelOrders', { content: content, type: 'main', user: req.user._doc, ref: req.headers.referer })
})


router.get('/panel/orders/:id', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {

  let content = await orderModel.find({})


  if (!content.find(c => c.id == req.params.id)) return res.redirect('/panel/orders')

  content = content.find(c => c.id == req.params.id)

  const user = await userModel.findOne({ username: content.user })
  const lang = user.lang ? user.lang : 'en'

  content._doc.userLang = lang

  if (req.user && req.user._doc.lang == 'es') return res.render('panelOrdersES', {
    content: content, type: 'manage', user: req.user._doc, ref: req.headers.referer
  });

  res.render('panelOrders', {
    ref: req.headers.referer,
    content: content, type: 'manage', user: req.user._doc, ref: req.headers.referer
  })
})


module.exports = { router }