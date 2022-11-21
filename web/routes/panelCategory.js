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
    if (req.user && req.user._doc.lang == 'es') return res.render('panelCategoryES', { type: 'create', user: req.user._doc, ref: req.headers.referer, categoryType: "main" });
    return res.render('panelCategory', { type: 'create', user: req.user._doc, ref: req.headers.referer, categoryType: "main" })
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
  const { name } = req.body
  console.log(req.body)
  const product = await categoryModel.create({
    name: name || 'Name',
    id: dayjs().unix(),
    type: "main",
    subCategories: req.body.subcategories.split(','),
    subsubCategories: req.body.subcategories.split(',')
  })
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
  await categoryModel.create({
    name: product.name,
    id: product.id,
    subcategories: product.subCategories,
    subsubCategories: product.subsubcategories,
    type: "main"
  })
  res.redirect('/panel/category')
})

router.post('/panel/category/:id', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/category')
  if (req.params.id == 'create') return res.render('panelCategory', { type: 'create', user: req.user._doc, ref: req.headers.referer, categoryType: "main" })
  const product = await categoryModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/category')
  const { name, subcategories, subsubcategories } = req.body
  product.name = name || product.name
  product.subCategories = subcategories.split(',') || product.subCategories
  product.subsubCategories = subsubcategories.split(',') || product.subsubCategories
  
  await product.save()
  if (req.user && req.user._doc.lang == 'es') return res.render('panelCategoryES', { content: product, type: 'manage', user: req.user._doc, ref: req.headers.referer, categoryType: "main" });

  res.render('panelCategory', { content: product, type: 'manage', user: req.user._doc, ref: req.headers.referer, categoryType: "main" })
})


//#endregion

module.exports = { router }