const express = require('express');
const router = express.Router();
const newModel = require('../../database/News')
const dayjs = require('dayjs');



//#region News
router.get('/panel/news', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  const products = await newModel.find({})
  if (req.user && req.user._doc.lang == 'es') return res.render('panelNewsES', { content: products, type: 'main', user: req.user._doc, ref: req.headers.referer });

  res.render('panelNews', { content: products, type: 'main', user: req.user._doc, ref: req.headers.referer })
})

router.get('/panel/news/:id', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/news')
  if (req.params.id == 'create') {
    if (req.user && req.user._doc.lang == 'es') return res.render('panelNewsES', { type: 'create', user: req.user._doc, ref: req.headers.referer });
    return res.render('panelnews', { type: 'create', user: req.user._doc, ref: req.headers.referer })
  }
  const product = await newModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/news')
  if (req.user && req.user._doc.lang == 'es') return res.render('panelNewsES', { content: product, type: 'manage', user: req.user._doc, ref: req.headers.referer });

  res.render('panelNews', { content: product, type: 'manage', user: req.user._doc, ref: req.headers.referer })
})

router.get('/panel/news/:id/delete', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/news')
  const product = await newModel.findOneAndDelete({ id: req.params.id })
  res.redirect('/panel/news')
})

router.post('/panel/news/create', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  const { title, content, image } = req.body
  const product = await newModel.create({
    title: title || 'Title',
    content: content || 'Content',
    image: image || '/img/background.png',
    id: dayjs().unix(),
    createdAt: dayjs(),
    lang: req.body.lang || 'en'
  })
  res.redirect('/panel/news')
})

router.post('/panel/news/:id', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/news')
  if (req.params.id == 'create') return res.render('panelNews', { type: 'create', ref: req.headers.referer })
  const product = await newModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/news')
  const { title, content, image, lang } = req.body
  product.image = image || product.image
  product.title = title || product.title
  product.content = content || product.content
  product.lang = lang || product.lang
  await product.save()
  res.redirect('/panel/news')
})

router.get('/panel/news/:id/clone', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/news')
  if (req.params.id == 'create') return res.render('panelNews', { type: 'create', ref: req.headers.referer })
  const product = await newModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/news')

  const clone = await newModel.create({
    title: product.title || 'Title',
    content: product.content || 'Content',
    image: product.image || '/img/background.png',
    id: dayjs().unix(),
    createdAt: dayjs(),
    lang: product.lang
  })

  res.redirect('/panel/news')
})
//#endregion


module.exports = { router }