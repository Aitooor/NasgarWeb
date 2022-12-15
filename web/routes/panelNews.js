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
    if (req.user && req.user._doc.lang == 'es') return res.render('panelNewsES', { type: 'create', user: req.user._doc, ref: req.headers.referer, content: false });
    return res.render('panelnews', { type: 'create', user: req.user._doc, ref: req.headers.referer, content: false })
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
  const keysES = Object.keys(req.body).filter(k => k.endsWith("ES"))
  const keysEN = Object.keys(req.body).filter(k => k.endsWith("EN"))

  const en = {}
  const es = {}

  keysEN.forEach(k => {
    if (k.includes("category") || k.includes("categorie")) en[k.replace('-EN', "")] = req.body[k].split(",").filter(v => v != "")
    else en[k.replace('-EN', "")] = req.body[k]
  })

  keysES.forEach(k => {
    if (k.includes("category") || k.includes("categorie")) es[k.replace('-ES', "")] = req.body[k].split(",").filter(v => v != "")
    else es[k.replace('-ES', "")] = req.body[k]
  })

  const productInfo = {
    id: dayjs().unix(),
    date: new dayjs(),
    en: en,
    es: es
  }

  const product = await newModel.create(productInfo)
  res.redirect('/panel/news')
})

router.post('/panel/news/:id', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  console.log(req.body)
  if (!req.params.id) return res.redirect('/panel/news')
  if (req.params.id == 'create') return res.render('panelNews', { type: 'create', ref: req.headers.referer })
  const product = await newModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/news')

  const keysES = Object.keys(req.body).filter(k => k.endsWith("ES"))
  const keysEN = Object.keys(req.body).filter(k => k.endsWith("EN"))

  const en = {}
  const es = {}

  keysEN.forEach(k => {
    if (k.includes("category") || k.includes("categorie")) en[k.replace('-EN', "")] = req.body[k].split(",")
    else en[k.replace('-EN', "")] = req.body[k]
  })

  keysES.forEach(k => {
    if (k.includes("category") || k.includes("categorie")) es[k.replace('-ES', "")] = req.body[k].split(",")
    else es[k.replace('-ES', "")] = req.body[k]
  })

  const productInfo = {
    id: dayjs().unix(),
    en: en,
    es: es
  }

  Object.keys(product._doc).forEach(k => {
    if (productInfo[k] != undefined) product[k] = productInfo[k]
  })
  
  await product.save()
  res.redirect('/panel/news/' + req.params.id)
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

  product._doc.id = dayjs().unix()
  product._doc._id = null
  await newModel.create(product._doc)

  res.redirect('/panel/news')
})
//#endregion


module.exports = { router }