const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  if (req.query.lang && req.query.lang == 'es') return res.render('homeES', { user: req.user, translate: true });
  if (req.user && req.user._doc.lang == 'es') return res.render('homeES', { user: req.user, translate: false});
  res.render('home', { user: req.user, translate: false });
})


router.get("/vote", (req, res) => {
  res.redirect("https://www.40servidoresmc.es/nasgar-network")
})

module.exports = { router }