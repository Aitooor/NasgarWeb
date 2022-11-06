const express = require('express');
const router = express.Router();
const categoryModel = require('../../database/Category')
const dayjs = require('dayjs');

//#region Category

router.get('/panel/subcategory', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  const products = await categoryModel.find({ type: "sub" })
  if (req.user && req.user._doc.lang == 'es') return res.render('panelCategoryES', { content: products, type: 'main', user: req.user._doc, ref: req.headers.referer, categoryType: "sub" });
  res.render('panelCategory', { content: products, type: 'main', user: req.user._doc, ref: req.headers.referer, categoryType: "sub" })
})

router.get('/panel/subcategory/:id', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/subcategory')
  if (req.params.id == 'create') {
    if (req.user && req.user._doc.lang == 'es') return res.render('panelCategoryES', { type: 'create', user: req.user._doc, ref: req.headers.referer, categoryType: "sub" });
    return res.render('panelCategory', { type: 'create', user: req.user._doc, ref: req.headers.referer, categoryType: "sub" })
  }
  const product = await categoryModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/subcategory')
  if (req.user && req.user._doc.lang == 'es') return res.render('panelCategoryES', { content: product, type: 'manage', user: req.user._doc, ref: req.headers.referer, categoryType: "sub" });

  res.render('panelCategory', { content: product, type: 'manage', user: req.user._doc, ref: req.headers.referer, categoryType: "sub" })
})

router.get('/panel/subcategory/:id/delete', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/subcategory')
  const product = await categoryModel.findOneAndDelete({ id: req.params.id })
  res.redirect('/panel/subcategory')
})

router.post('/panel/subcategory/create', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  const { name } = req.body
  console.log(req.body)
  const product = await categoryModel.create({
    name: name || 'Name',
    id: dayjs().unix(),
    type: "sub"
  })
  res.redirect('/panel/subcategory')
})

router.get('/panel/subcategory/:id/clone', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/subcategory')
  if (req.params.id == 'create') return res.render('panelCategory', { type: 'create', user: req.user._doc, ref: req.headers.referer, categoryType: "sub" })
  const product = await categoryModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/subcategory')
  await categoryModel.create({
    name: product.name,
    id: product.id,
    type: "sub"
  })
  res.redirect('/panel/subcategory')
})

router.post('/panel/subcategory/:id', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/subcategory')
  if (req.params.id == 'create') return res.render('panelCategory', { type: 'create', user: req.user._doc, ref: req.headers.referer, categoryType: "sub" })
  const product = await categoryModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/subcategory')
  const { name } = req.body
  product.name = name || product.name
  await product.save()
  if (req.user && req.user._doc.lang == 'es') return res.render('panelCategoryES', { content: product, type: 'manage', user: req.user._doc, ref: req.headers.referer, categoryType: "sub" });

  res.render('panelCategory', { content: product, type: 'manage', user: req.user._doc, ref: req.headers.referer, categoryType: "sub" })
})


//#endregion

module.exports = { router }