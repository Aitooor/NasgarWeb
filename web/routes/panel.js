const express = require('express');
const router = express.Router();
const productModel = require('../../database/Product')
const newModel = require('../../database/News')
const categoryModel = require('../../database/Category')
const userModel = require('../../database/User')
const dayjs = require('dayjs');

router.get('/panel', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  if (req.user && req.user._doc.lang == 'es') return res.render('panelHomeES', { user: req.user._doc });
  res.render('panelHome', { user: req.user._doc })
})

router.get('/panel/lang/:lang', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const user = await userModel.findOne({
    username: req.user._doc.username
  })
  user.lang = req.params.lang
  await user.save()
  res.redirect('/panel')
})

//#region Timings
router.get('/panel/timings', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  const timings = await getStaffTimings()
  if (req.user && req.user._doc.lang == 'es') return res.render('panelTimingsES', { content: timings, type: 'main', user: req.user._doc });
  res.render('panelTimings', { content: timings, type: 'main', user: req.user._doc })
})

router.get('/panel/timings/member/:id', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  const timings = await getStaffTimings()
  if (!timings.has(req.params.id)) return res.redirect('/panel/timings')
  if (req.user && req.user._doc.lang == 'es') return res.render('panelTimingsES', {
    content: timings.get(req.params.id), type: 'manage', user: req.user._doc, getTime: (ms) => {
      ms = Number(ms)
      let text = ""
      if (ms >= 86400000) {
        const days = Math.floor(ms / 86400000)
        const hours = Math.floor(((ms - (days * 86400000)) / 3600000))
        const minutes = Math.floor(((ms - (hours * 3600000) - (days * 86400000)) / 60000))
        const seconds = Math.floor((ms - (minutes * 60000) - (hours * 3600000) - (days * 86400000)) / 1000)
        text += `${days} days, ${hours} hours, ${minutes} minutes`
      }
      else if (ms >= 3600000) {
        const hours = Math.floor(ms / 3600000)
        const minutes = Math.round(((ms - (hours * 3600000)) / 60000))
        const seconds = Math.abs(Math.round((ms - (minutes * 60000) - (hours * 3600000)) / 1000))
        text += `${hours} hours, ${minutes} minutes, ${seconds} seconds`
      }
      else if (ms >= 60000) {
        const minutes = Math.floor(ms / 60000)
        const seconds = Math.round((ms - (minutes * 60000)) / 1000)
        text += `${minutes} minutes, ${seconds} seconds`
      }
      else {
        text += `${Math.round(ms / 1000)} seconds`
      }
      return text
    }
  });
  res.render('panelTimings', {
    content: timings.get(req.params.id), type: 'manage', user: req.user._doc, getTime: (ms) => {
      ms = Number(ms)
      let text = ""
      if (ms >= 86400000) {
        const days = Math.floor(ms / 86400000)
        const hours = Math.floor(((ms - (days * 86400000)) / 3600000))
        const minutes = Math.floor(((ms - (hours * 3600000) - (days * 86400000)) / 60000))
        const seconds = Math.floor((ms - (minutes * 60000) - (hours * 3600000) - (days * 86400000)) / 1000)
        text += `${days} days, ${hours} hours, ${minutes} minutes`
      }
      else if (ms >= 3600000) {
        const hours = Math.floor(ms / 3600000)
        const minutes = Math.round(((ms - (hours * 3600000)) / 60000))
        const seconds = Math.abs(Math.round((ms - (minutes * 60000) - (hours * 3600000)) / 1000))
        text += `${hours} hours, ${minutes} minutes, ${seconds} seconds`
      }
      else if (ms >= 60000) {
        const minutes = Math.floor(ms / 60000)
        const seconds = Math.round((ms - (minutes * 60000)) / 1000)
        text += `${minutes} minutes, ${seconds} seconds`
      }
      else {
        text += `${Math.round(ms / 1000)} seconds`
      }
      return text
    }
  })
})

router.get('/panel/timings/group/:name', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  let timings = await getStaffTimings()
  if (!req.params.name) req.params.name = ''
  timings = [...timings.values()].filter(m => m.primary_group == req.params.name.toLowerCase() || m.permissions.permission.includes(req.params.name.toLowerCase()))
  if (req.user && req.user._doc.lang == 'es') return res.render('panelTimingsES', { content: timings, type: 'main', user: req.user._doc });
  res.render('panelTimings', { content: timings, type: 'main', user: req.user._doc })
})

//#endregion

async function getStaffTimings() {
  await db.query(`USE bungee;`)
  const lPlayers = await db.query('SELECT * FROM `luckperms_players`')
  const lPermissions = await db.query('SELECT * FROM `luckperms_user_permissions`')
  const sTm = await db.query('SELECT * FROM `StaffTimings`')
  const pMap = new Map()
  await Promise.all(lPlayers.map(async (player, pos) => {
    const lp = lPermissions.find(p => p.uuid == player.uuid)
    const utm = sTm.filter(t => t.UUID == player.uuid)

    if (lp && (lp.permission.includes('owner') || lp.permission.includes('admin') || lp.permission.includes('mod') || lp.permission.includes('*'))) {
      player.permissions = lp
      player.timings = utm
      pMap.set(player.uuid, player)
      console.log(player)
    }

  }))
  return pMap
}

//#region News
router.get('/panel/news', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  const products = await newModel.find({})
  if (req.user && req.user._doc.lang == 'es') return res.render('panelNewsES', { content: products, type: 'main', user: req.user._doc });

  res.render('panelNews', { content: products, type: 'main', user: req.user._doc })
})

router.get('/panel/news/:id', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/news')
  if (req.params.id == 'create') {
    if (req.user && req.user._doc.lang == 'es') return res.render('panelNewsES',  { type: 'create', user: req.user._doc });
    return res.render('panelnews', { type: 'create', user: req.user._doc })
  }
  const product = await newModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/news')
  if (req.user && req.user._doc.lang == 'es') return res.render('panelNewsES', { content: product, type: 'manage', user: req.user._doc });

  res.render('panelNews', { content: product, type: 'manage', user: req.user._doc })
})

router.get('/panel/news/:id/delete', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/news')
  const product = await newModel.findOneAndDelete({ id: req.params.id })
  res.redirect('/panel/news')
})

router.post('/panel/news/create', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  const { title, content, image } = req.body
  const product = await newModel.create({
    title: title || 'Title',
    content: content || 'Content',
    image: image || '/img/background.png',
    id: dayjs().unix(),
    createdAt: dayjs()
  })
  res.redirect('/panel/news')
})

router.post('/panel/news/:id', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/news')
  if (req.params.id == 'create') return res.render('panelNews', { type: 'create' })
  const product = await newModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/news')
  const { title, content, image, } = req.body
  product.image = image || product.image
  product.title = title || product.title
  product.content = content || product.content
  await product.save()
  res.redirect('/panel/news')
})

router.get('/panel/news/:id/clone', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/news')
  if (req.params.id == 'create') return res.render('panelNews', { type: 'create' })
  const product = await newModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/news')

  const clone = await newModel.create({
    title: product.title || 'Title',
    content: product.content || 'Content',
    image: product.image || '/img/background.png',
    id: dayjs().unix(),
    createdAt: dayjs()
  })

  res.redirect('/panel/news')
})
//#endregion

//#region Shop

router.get('/panel/shop', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  const products = await productModel.find({})
  if (req.user && req.user._doc.lang == 'es') return res.render('panelShopES', { content: products, type: 'main', user: req.user._doc });

  res.render('panelShop', { content: products, type: 'main', user: req.user._doc })
})

router.get('/panel/shop/:id', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/shop')
  if (req.params.id == 'create') {

    if (req.user && req.user._doc.lang == 'es') return res.render('panelShopES',   { type: 'create', user: req.user._doc, categories: await categoryModel.find({}) });

    return res.render('panelShop', { type: 'create', user: req.user._doc, categories: await categoryModel.find({}) })
  }
  const product = await productModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/shop')
  if (req.user && req.user._doc.lang == 'es') return res.render('panelShopES',  { content: product, type: 'manage', user: req.user._doc, categories: await categoryModel.find({}) });

  res.render('panelShop', { content: product, type: 'manage', user: req.user._doc, categories: await categoryModel.find({}) })
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
  const { name, description, image, type, price, commands, server } = req.body
  const productCategories = Object.keys(req.body).filter(c => c.includes('c_')).map(c => req.body[c])
  const product = await productModel.create({
    name: name || 'Name',
    description: description || 'Description',
    image: image || '/img/mine.png',
    categories: productCategories,
    price: price || 0,
    commands: commands ? commands.split(',') : [],
    id: dayjs().unix(),
    createdAt: dayjs(),
    serverName: server
  })
  res.redirect('/panel/shop')
})

router.get('/panel/shop/:id/clone', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/shop')
  if (req.params.id == 'create') return res.render('panelShop', { type: 'create', user: req.user._doc })
  const product = await productModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/shop')
  await productModel.create({
    name: product.name,
    description: product.description,
    image: product.image,
    categories: product.categories,
    price: product.price,
    commands: product.commands,
    id: dayjs().unix(),
    createdAt: dayjs(),
    serverName: product.server
  })
  res.redirect('/panel/shop')
})

router.post('/panel/shop/:id', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/shop')
  if (req.params.id == 'create') return res.render('panelShop', { type: 'create', user: req.user._doc, categories: await categoryModel.find({}) })
  const product = await productModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/shop')
  const productCategories = Object.keys(req.body).filter(c => c.includes('c_')).map(c => req.body[c])
  const { name, description, image, type, price, commands } = req.body
  product.name = name || product.name
  product.description = description || product.description
  product.image = image || product.image
  product.categories = productCategories
  product.price = price || product.price
  product.commands = commands ? commands.split(',') : product.commands
  console.log(req.body)
  await product.save()
  res.render('panelShop', { content: product, type: 'manage', user: req.user._doc, categories: await categoryModel.find({}) })
})


//#endregion

//#region Category

router.get('/panel/category', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  const products = await categoryModel.find({})
  if (req.user && req.user._doc.lang == 'es') return res.render('panelCategoryES',  { content: products, type: 'main', user: req.user._doc });
  res.render('panelCategory', { content: products, type: 'main', user: req.user._doc })
})

router.get('/panel/category/:id', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/category')
  if (req.params.id == 'create') {
    if (req.user && req.user._doc.lang == 'es') return res.render('panelCategoryES',   { type: 'create', user: req.user._doc });
    return res.render('panelCategory', { type: 'create', user: req.user._doc })
  }
  const product = await categoryModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/category')
  if (req.user && req.user._doc.lang == 'es') return res.render('panelCategoryES',  { content: product, type: 'manage', user: req.user._doc });

  res.render('panelCategory', { content: product, type: 'manage', user: req.user._doc })
})

router.get('/panel/shop/:id/delete', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/category')
  const product = await categoryModel.findOneAndDelete({ id: req.params.id })
  res.redirect('/panel/category')
})

router.post('/panel/category/create', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  const { name } = req.body
  console.log(req.body)
  const product = await categoryModel.create({
    name: name || 'Name',
    id: dayjs().unix(),
  })
  res.redirect('/panel/category')
})

router.get('/panel/category/:id/clone', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/category')
  if (req.params.id == 'create') return res.render('panelCategory', { type: 'create', user: req.user._doc })
  const product = await categoryModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/category')
  await categoryModel.create({
    name: product.name,
    id: product.id
  })
  res.redirect('/panel/category')
})

router.post('/panel/category/:id', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  if (!req.params.id) return res.redirect('/panel/category')
  if (req.params.id == 'create') return res.render('panelCategory', { type: 'create', user: req.user._doc })
  const product = await productModel.findOne({ id: req.params.id })
  if (!product) return res.redirect('/panel/category')
  const { name } = req.body
  product.name = name || product.name
  await product.save()
  if (req.user && req.user._doc.lang == 'es') return res.render('panelCategoryES',  { content: product, type: 'manage', user: req.user._doc });

  res.render('panelCategory', { content: product, type: 'manage', user: req.user._doc })
})


//#endregion

module.exports = { router }