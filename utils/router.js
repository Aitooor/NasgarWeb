const express = require('express');
const fs = require('fs');
const path = require('path');

async function registerRoutes(pathToRead, app) {
  const files = fs.readdirSync(pathToRead);
  await Promise.all(files.map(file => {
    const fileRequired = require(path.join(pathToRead + '/' + file))
    if (fileRequired.router) app.use('/', fileRequired.router)
    if (fileRequired.start) fileRequired.start(app)
  }))
}

module.exports = { registerRoutes }