const express = require('express');
const router = express.Router();
const productModel = require('../../database/Product');
const fetch = require('node-fetch')
const orderModel = require('../../database/Order')
const categoryModel = require('../../database/Category');

router.get('/shop', async (req, res) => {
  let products = await productModel.find({})
  const all = products
  const pos = []
  if (req.query.type1) {
    products = products.filter(p => p.categories[0] == req.query.type1)
    pos.push(req.query.type1)
  }
  if (req.query.type2) {
    products = products.filter(p => p.categories[1] == req.query.type2)
    pos.push(req.query.type2)
  }
  if (req.query.max) products = products.filter(p => p.price < req.query.max)
  if (req.query.product) products = products.filter(p => p.name.toLowerCase().includes(req.query.product.toLowerCase()) || p.description.toLowerCase().includes(req.query.product.toLowerCase()))
  if (req.user && req.user._doc.lang == 'es') return res.render('shopES', { content: products, user: req.user, all: all, paypalClient: process.env.PAYPALID, pos: pos });
  res.render('shop', { content: products, user: req.user, all: all, paypalClient: process.env.PAYPALID, pos: pos })
})

router.get('/shop/:id', async (req, res) => {
  const product = await productModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/shop')
  res.render('product', { content: product, user: req.user })
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

  console.log(data, getOrder)
  if (data.details.status == 'COMPLETED' && getOrder.status == "COMPLETED") {
    const product = await productModel.findOne({ id: data.productID })
    await orderModel.create({
      id: data.details.id,
      product: product,
      createdAt: new Date(),
      used: false,
      paid: true,
      user: data.user
    })
  }



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
