const express = require('express');
const router = express.Router();
const productModel = require('../../database/Product')
const categoryModel = require('../../database/Category')
const dayjs = require('dayjs');


//#region Shop

router.get('/panel/shop', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  let products = await productModel.find({})
  if (req.query.category) {
    products = products.filter(c => c.categories.includes(req.query.category))
  }
  if (req.user && req.user._doc.lang == 'es') return res.render('panelShopES', { content: products, type: 'main', user: req.user._doc, ref: req.headers.referer, categories: await categoryModel.find({}) });

  res.render('panelShop', { content: products, type: 'main', user: req.user._doc, ref: req.headers.referer, categories: await categoryModel.find({}) })
})

router.get('/panel/shop/:id', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/shop')
  if (req.params.id == 'create') {

    if (req.user && req.user._doc.lang == 'es') return res.render('panelShopES', { type: 'create', user: req.user._doc, categories: await categoryModel.find({}), ref: req.headers.referer });

    return res.render('panelShop', { type: 'create', user: req.user._doc, categories: await categoryModel.find({}), ref: req.headers.referer })
  }
  const product = await productModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/shop')
  if (req.user && req.user._doc.lang == 'es') return res.render('panelShopES', { content: product, ref: req.headers.referer, type: 'manage', user: req.user._doc, categories: await categoryModel.find({}) });

  res.render('panelShop', { content: product, type: 'manage', ref: req.headers.referer, user: req.user._doc, categories: await categoryModel.find({}) })
})

router.get('/panel/shop/:id/delete', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/shop')
  const product = await productModel.findOneAndDelete({ id: req.params.id })
  res.redirect('/panel/shop')
})

router.post('/panel/shop/create', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  const { name, description, image, type, price, commands, server, lang } = req.body
  const productCategories = Object.keys(req.body).filter(c => c.includes('c_')).map(c => req.body[c])
  const product = await productModel.create({
    name: name || 'Name',
    description: description || 'Description',
    image: image || '/img/mine.png',
    categories: productCategories,
    price: price || 0,
    commands: commands ? commands.split(',') : [],
    id: dayjs().unix(),
    createdAt: dayjs(),
    serverName: server || "world",
    lang: lang
  })
  res.redirect('/panel/shop')
})

router.get('/panel/shop/:id/clone', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/shop')
  if (req.params.id == 'create') return res.render('panelShop', { type: 'create', ref: req.headers.referer, user: req.user._doc })
  const product = await productModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/shop')
  await productModel.create({
    name: product.name,
    description: product.description,
    image: product.image,
    categories: product.categories,
    price: product.price,
    commands: product.commands,
    id: dayjs().unix(),
    createdAt: dayjs(),
    serverName: product.server,
    lang: product.lang
  })
  res.redirect('/panel/shop')
})

router.post('/panel/shop/:id', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/shop')
  if (req.params.id == 'create') return res.render('panelShop', { type: 'create', user: req.user._doc, categories: await categoryModel.find({}), ref: req.headers.referer })
  const product = await productModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/shop')
  const productCategories = Object.keys(req.body).filter(c => c.includes('c_')).map(c => req.body[c])
  const { name, description, image, type, price, commands, lang } = req.body
  product.name = name || product.name
  product.description = description || product.description
  product.image = image || product.image
  product.categories = productCategories
  product.price = price || product.price
  product.commands = commands ? commands.split(',') : product.commands
  product.lang = lang || product.lang
  await product.save()
  if (req.user && req.user._doc.lang == 'es') return res.render('panelShopES', { content: product, type: 'manage', user: req.user._doc, categories: await categoryModel.find({}), ref: req.headers.referer });
  res.render('panelShop', { content: product, type: 'manage', user: req.user._doc, categories: await categoryModel.find({}), ref: req.headers.referer })
})


//#endregion

module.exports = { router }