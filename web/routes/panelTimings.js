const express = require('express');
const router = express.Router();
const userModel = require('../../database/User')
const dayjs = require('dayjs');

//#region Timings
router.get('/panel/timings', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  const timings = await getStaffTimings()
  if (req.user && req.user._doc.lang == 'es') return res.render('panelTimingsES', { content: timings, type: 'main', user: req.user._doc, ref: req.headers.referer });
  res.render('panelTimings', { content: timings, type: 'main', user: req.user._doc, ref: req.headers.referer })
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
    content: timings.get(req.params.id), type: 'manage', user: req.user._doc, ref: req.headers.referer, getTime: (ms) => {
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
    ref: req.headers.referer,
    content: timings.get(req.params.id), type: 'manage', user: req.user._doc, ref: req.headers.referer, getTime: (ms) => {
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
  if (req.user && req.user._doc.lang == 'es') return res.render('panelTimingsES', { content: timings, type: 'main', user: req.user._doc, ref: req.headers.referer });
  res.render('panelTimings', { content: timings, type: 'main', user: req.user._doc, ref: req.headers.referer })
})


router.get('/panel/timings/user', (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return res.redirect('/login')
  const u = req.user._doc
  if (!u.admin) return res.redirect('/panel')
  next()
}, async (req, res) => {
  let timings = await getStaffTimings()
  if (!req.query.name) req.query.name = ''
  timings = [...timings.values()].filter(m => m.username.toLowerCase() == req.query.username.toLowerCase())
  if (req.user && req.user._doc.lang == 'es') return res.render('panelTimingsES', { content: timings, type: 'main', user: req.user._doc, ref: req.headers.referer });
  res.render('panelTimings', { content: timings, type: 'main', user: req.user._doc, ref: req.headers.referer })
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



module.exports = { router }