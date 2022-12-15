const express = require('express');
const router = express.Router();
const newModel = require('../../database/News');
const marked = require("marked")

router.get('/news', async (req, res) => {
  let news = await newModel.find({})
  if (req.query.content) {
    const original = await newModel.find({})
    news = news.filter(n => n.en.content.includes(req.query.content))
    news.concat(original.filter(n => n.es.content.includes(req.query.content)))
  }
  news = news.map(n => {
    n.en.content = marked.marked.parse(n.en.content)
    n.es.content = marked.marked.parse(n.es.content)
    return n
  })
  if (req.query.lang && req.query.lang == 'es') return res.render('newsES', { content: news, user: req.user, ref: req.headers.referer, translate: true });
  if (req.user && req.user._doc.lang == 'es') return res.render('newsES', { content: news, user: req.user, ref: req.headers.referer, translate: false });
  res.render('news', { content: news, user: req.user, ref: req.headers.referer, translate: false })
})

router.get('/news/:id', async (req, res) => {
  const news = await newModel.findOne({ id: req.params.id })
  if (!news) return res.redirect('/news')
  news.en.content = marked.marked.parse(news.en.content);
  news.es.content = marked.marked.parse(news.es.content);
  if (req.query.lang && req.query.lang == 'es') return res.render('newES', { content: news, user: req.user, ref: req.headers.referer, translate: true });

  if (req.user && req.user._doc.lang == 'es') return res.render('newES', { content: news, user: req.user, ref: req.headers.referer, translate: false });
  res.render('new', { content: news, user: req.user, ref: req.headers.referer, translate: false })
})

module.exports = { router }