const express = require('express');
const router = express.Router();
const categoryModel = require('../../database/Category')
const dayjs = require('dayjs');

//#region Category

router.get('/panel/category', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  const products = await categoryModel.find({ type: "main" })
  if (req.user && req.user._doc.lang == 'es') return res.render('panelCategoryES', { content: products, type: 'main', user: req.user._doc, ref: req.headers.referer, categoryType: "main" });
  res.render('panelCategory', { content: products, type: 'main', user: req.user._doc, ref: req.headers.referer, categoryType: "main" })
})

router.get('/panel/category/:id', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/category')
  if (req.params.id == 'create') {
    if (req.user && req.user._doc.lang == 'es') return res.render('panelCategoryES', { type: 'create', user: req.user._doc, ref: req.headers.referer, categoryType: "main",content:false });
    return res.render('panelCategory', { type: 'create', user: req.user._doc, ref: req.headers.referer, categoryType: "main", content:false })
  }
  const product = await categoryModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/category')
  if (req.user && req.user._doc.lang == 'es') return res.render('panelCategoryES', { content: product, type: 'manage', user: req.user._doc, ref: req.headers.referer, categoryType: "main" });

  res.render('panelCategory', { content: product, type: 'manage', user: req.user._doc, ref: req.headers.referer, categoryType: "main" })
})

router.get('/panel/category/:id/delete', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/category')
  const product = await categoryModel.findOneAndDelete({ id: req.params.id })
  res.redirect('/panel/category')
})

router.post('/panel/category/create', (req, res, next) => {
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
    en: en,
    es: es
  }

  const product = await categoryModel.create(productInfo)
  res.redirect('/panel/category')
})

router.get('/panel/category/:id/clone', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/category')
  if (req.params.id == 'create') return res.render('panelCategory', { type: 'create', user: req.user._doc, ref: req.headers.referer, categoryType: "main" })
  const product = await categoryModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/category')
  product._doc.id = dayjs().unix()
  product._doc._id = null
  await categoryModel.create(product._doc)
  res.redirect('/panel/category')
})

router.post('/panel/category/:id', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/category')
  if (req.params.id == 'create') return res.render('panelCategory', { type: 'create', user: req.user._doc, ref: req.headers.referer, categoryType: "main", content:false })
  const product = await categoryModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/category')

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

  Object.keys(product).forEach(k => {
    if(productInfo[k] != undefined) product[k] = productInfo[k]
  })


  await product.save()
  if (req.user && req.user._doc.lang == 'es') return res.render('panelCategoryES', { content: product, type: 'manage', user: req.user._doc, ref: req.headers.referer, categoryType: "main" });

  res.render('panelCategory', { content: product, type: 'manage', user: req.user._doc, ref: req.headers.referer, categoryType: "main" })
})


//#endregion

module.exports = { router }