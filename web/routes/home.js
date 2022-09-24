const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  if (req.user && req.user._doc.lang == 'es') return res.render('homeES', { user: req.user });
  res.render('home', { user: req.user });
})



module.exports = { router }