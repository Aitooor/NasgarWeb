const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  if (req.user && req.user._doc.lang == 'es') return res.render('homeES', { user: req.user });
  res.render('home', { user: req.user });
})


router.get("/vote", (req,res)=>{
  res.redirect("https://www.40servidoresmc.es/nasgar-network")
})

module.exports = { router }