const express = require('express');
const router = express.Router();
const orderModel = require('../../database/Order')
const userModel = require('../../database/User')

router.get('/public/orders/:id', async (req, res) => {
  const order = await orderModel.findOne({ id: req.params.id });
  if (!order) return res.redirect('/');

  const user = await userModel.findOne({ username: order.user });


  if (user.lang == 'es') return res.render('orderES', { user: req.user, translate: false, order: order._doc });
  res.render('order', { user: req.user, translate: false, order: order._doc });

})







module.exports = { router }
