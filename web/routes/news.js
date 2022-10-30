const express = require('express');
const router = express.Router();
const newModel = require('../../database/News');
const marked = require("marked")

router.get('/news', async (req, res) => {
  let news = await newModel.find({})
  if (req.query.content) news = news.filter(n => n.content.includes(req.query.content))
  news = news.map(n => {
    n.content = marked.marked.parse(n.content)
    return n
  })
  if (req.query.lang && req.query.lang == 'es') return res.render('newsES', { content: news.filter(n => n.lang == "es"), user: req.user, ref: req.headers.referer, translate: true });
  if (req.user && req.user._doc.lang == 'es') return res.render('newsES', { content: news.filter(n => n.lang == "es"), user: req.user, ref: req.headers.referer, translate: false });
  res.render('news', { content: news.filter(n => n.lang == "en"), user: req.user, ref: req.headers.referer, translate: false })
})

router.get('/news/:id', async (req, res) => {
  const news = await newModel.findOne({ id: req.params.id })
  if (!news) return res.redirect('/news')
  news.content = marked.marked.parse(news.content);
  if (req.query.lang && req.query.lang == 'es') return res.render('newES', { content: news, user: req.user, ref: req.headers.referer, translate: true });

  if (req.user && req.user._doc.lang == 'es') return res.render('newES', { content: news, user: req.user, ref: req.headers.referer, translate: false });
  res.render('new', { content: news, user: req.user, ref: req.headers.referer, translate: false })
})

module.exports = { router }