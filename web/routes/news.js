const express = require('express');
const router = express.Router();
const newModel = require('../../database/News');

router.get('/news', async (req, res) => {
  let news = await newModel.find({})
  if (req.query.content) news = news.filter(n => n.content.includes(req.query.content))
  if (req.user && req.user._doc.lang == 'es') return res.render('newsES', { content: news, user: req.user });
  res.render('news', { content: news, user: req.user })
})

router.get('/news/:id', async (req, res) => {
  const news = await newModel.findOne({ id: req.params.id })
  if (!news) return res.redirect('/news')
  if (req.user && req.user._doc.lang == 'es') return res.render('newES', { content: news.filter(n => n.lang && n.lang == 'es'), user: req.user });
  res.render('new', { content: news.filter(n => n.lang && n.lang == 'en'), user: req.user })
})

module.exports = { router }