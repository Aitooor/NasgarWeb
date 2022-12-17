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

    if (req.user && req.user._doc.lang == 'es') return res.render('panelShopES', { type: 'create', user: req.user._doc, categories: await categoryModel.find({}), ref: req.headers.referer, content: false });

    return res.render('panelShop', { type: 'create', user: req.user._doc, categories: await categoryModel.find({}), ref: req.headers.referer, content: false })
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
  const keysES = Object.keys(req.body).filter(k => k.endsWith("ES"))
  const keysEN = Object.keys(req.body).filter(k => k.endsWith("EN"))

  const en = { categories: [], commands: [] }
  const es = { categories: [], commands: [] }

  keysEN.forEach(k => {
    if (k.includes('c_')) en.categories.push(req.body[k])
    else en[k.replace('-EN', "")] = req.body[k]
  })

  keysES.forEach(k => {

    if (k.includes('c_')) es.categories.push(req.body[k])
    else es[k.replace('-ES', "")] = req.body[k]
  })


  const productInfo = {
    id: dayjs().unix(),
    createdAt: dayjs(),
    en: en,
    es: es
  }

  es.commands = req.body['commands-ES'].split(",").filter(v => v != "")
  en.commands = req.body['commands-EN'].split(",").filter(v => v != "")


  if (isNaN(req.body.price)) productInfo.price = 10
  else productInfo.price = req.body.price


  const product = await productModel.create(productInfo)

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
  if (!product) return res.redirect('/panel/category')
  product._doc.id = dayjs().unix()
  product._doc._id = null
  await productModel.create(product._doc)
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

  const keysES = Object.keys(req.body).filter(k => k.endsWith("ES"))
  const keysEN = Object.keys(req.body).filter(k => k.endsWith("EN"))

  const en = { categories: [], commands: [] }
  const es = { categories: [], commands: [] }

  keysEN.forEach(k => {
    if (k.includes('c_')) en.categories.push(req.body[k])
    else en[k.replace('-EN', "")] = req.body[k]
  })

  keysES.forEach(k => {

    if (k.includes('c_')) es.categories.push(req.body[k])
    else es[k.replace('-ES', "")] = req.body[k]
  })


  const productInfo = {
    id: dayjs().unix(),
    createdAt: dayjs(),
    en: en,
    es: es
  }

  es.commands = req.body['commands-ES'].split(",").filter(v => v != "")
  en.commands = req.body['commands-EN'].split(",").filter(v => v != "")


  if (isNaN(req.body.price)) productInfo.price = 10
  else productInfo.price = req.body.price

  Object.keys(product._doc).forEach(k => {
    if(productInfo[k] != undefined) product[k] = productInfo[k]
  })



  await product.save()
  if (req.user && req.user._doc.lang == 'es') return res.render('panelShopES', { content: product, type: 'manage', user: req.user._doc, categories: await categoryModel.find({}), ref: req.headers.referer });
  res.render('panelShop', { content: product, type: 'manage', user: req.user._doc, categories: await categoryModel.find({}), ref: req.headers.referer })
})


//#endregion

module.exports = { router }