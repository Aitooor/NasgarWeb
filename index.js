const fs = require('fs');
const https = require('https');
const http = require('http');
// const privateKey = fs.readFileSync('./key.pem', 'utf8');
// const certificate = fs.readFileSync('./cert.pem', 'utf8');
// const credentials = { key: privateKey, cert: certificate };
const mongoose = require('mongoose');
const mysql = require('promise-mysql')

global.mongo = mongoose
require('dotenv').config()

const webApp = require('./web/web')




async function start() {

  mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });

  global.db = await mysql.createConnection(process.env.MYSQL_URL)

  // const server = process.env.SSL && process.env.SSL.toLowerCase() == 'true' ? https.createServer(credentials, webApp) : http.createServer(webApp)
  const server = http.createServer(webApp)

  server.listen(process.env.PORT || 80, () => console.log('Server started'))
  
}

start()

