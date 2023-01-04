const express = require('express');
const router = express.Router();
const productModel = require('../../database/Product');
const fetch = require('node-fetch')
const orderModel = require('../../database/Order')
const marked = require("marked")
const userModel = require("../../database/User")



router.get('/shop', async (req, res) => {
  let products = await productModel.find({})
  const all = await productModel.find({})
  const pos = []
  if (req.query.type1) {
    products = products.filter(p => p.en.categories[0].toLowerCase() == req.query.type1.toLowerCase() || p.es.categories[0].toLowerCase() == req.query.type1.toLowerCase())
    pos.push(req.query.type1)
  }

  if (req.query.type2) {
    products = products.filter(p => p.en.categories[1].toLowerCase() == req.query.type2.toLowerCase() || p.es.categories[1].toLowerCase() == req.query.type2.toLowerCase())
    pos.push(req.query.type2)
  }

  products = products.map(n => {
    n.en.description = n.en.description.replaceAll('<br>', '\n')
    n.en.description = marked.marked.parse(n.en.description)
    n.es.description = n.es.description.replaceAll('<br>', '\n')
    n.es.description = marked.marked.parse(n.es.description)
    return n
  })




  if (req.query.max) products = products.filter(p => p.price <= req.query.max)
  if (req.query.product) products = products.filter(p => p.en.name.toLowerCase().includes(req.query.product.toLowerCase()) || p.en.description.toLowerCase().includes(req.query.product.toLowerCase()) || p.es.name.toLowerCase().includes(req.query.product.toLowerCase()) || p.es.description.toLowerCase().includes(req.query.product.toLowerCase()))
  if (req.query.lang && req.query.lang == 'es') return res.render('shopES', { content: products, user: req.user, all: all, paypalClient: process.env.PAYPALID, pos: pos, ref: req.headers.referer, translate: true });
  if (req.user && req.user._doc.lang == 'es') return res.render('shopES', { content: products, user: req.user, all: all, paypalClient: process.env.PAYPALID, pos: pos, ref: req.headers.referer, translate: false });
  res.render('shop', { content: products, user: req.user, all: all, paypalClient: process.env.PAYPALID, pos: pos, ref: req.headers.referer, translate: false })
})

router.get('/shop/cart', async (req, res) => {
  res.render('cart', { user: req.user, paypalClient: process.env.PAYPALID, ref: req.headers.referer, translate: false })
})

router.get('/shop/:id', async (req, res) => {
  const product = await productModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/shop')
  res.render('product', { content: product, user: req.user, ref: req.headers.referer })
})

router.post('/shop/verify', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  next()
}, async (req, res) => {
  const data = JSON.parse(req.body)
  const token = 'Bearer ' + (await getToken()).access_token
  const getOrder = await (await fetch(process.env.PAYPALAPIURL + "/v2/checkout/orders/" + data.details.id, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    }
  })).json()

  if (data.details.status == 'COMPLETED' && getOrder.status == "COMPLETED") {
    const products = await Promise.all(data.products.map(async p => {
      return await productModel.findOne({ id: p })
    }))
    await orderModel.create({
      id: data.details.id,
      products: products,
      createdAt: new Date(),
      used: false,
      paid: true,
      user: data.user,
      paypal: getOrder
    })
  }

  const mailService = require('../../utils/mailService')
  const user = await userModel.findOne({ username: data.user })

  // mailService.sendMail(data.details.id, getOrder.payer.email_address, user.lang)
  mailService.sendMail(data.details.id, "emanuel250gameryt@gmail.com", user.lang)


  res.send({ message: 'ok' })
})

async function getToken() {
  const token = await fetch(process.env.PAYPALAPIURL + '/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${process.env.PAYPALID}:${process.env.PAYPALSECRET}`)
    },
    body: new URLSearchParams({
      'grant_type': 'client_credentials'
    })
  });
  return await token.json()
}



module.exports = { router }
