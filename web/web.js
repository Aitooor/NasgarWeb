const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const { registerRoutes } = require('../utils/router')
const passport = require('passport')
const Strategy = require('passport-local').Strategy
const session = require('express-session')
const cookieParser = require('cookie-parser')
const userModel = require('../database/User')
const bcrypt = require('bcrypt')

app.use(express.urlencoded({ extended: true }))
app.use(express.json({ extended: true }))
app.use(express.text())
app.use(express.raw())

app.use(cookieParser('theoSempaiiElMasFachero'))
app.use(session({
  secret: 'theoSempaiiElMasFachero',
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())

passport.use('local', new Strategy(async (username, password, done) => {
  const dbUser = await userModel.findOne({ username: username })
  if (!dbUser) return done(null, false)
  const isValid = await bcrypt.compare(password, dbUser.password)
  if (!dbUser || !isValid) return done(null, false)
  done(null, dbUser)
}))

passport.serializeUser((user, done) => {
  done(null, user.username)
})

passport.deserializeUser(async (id, done) => {
  const dbUser = await userModel.findOne({ username: id })
  done(null, dbUser)
})

global.passport = passport

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/less", express.static(path.join(__dirname, "less")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/img", express.static(path.join(__dirname, "img")));
app.use("/misc", express.static(path.join(__dirname, "misc")));
app.get('/sw.js', (req,res)=> res.sendFile(path.join(__dirname, '/js/sw.js')))

registerRoutes(path.join(__dirname, 'routes'), app)


module.exports = app