const express = require('express')
const router = express.Router()

/* GET home page. */
router.get('/dothething', function mainHandler(req, res, next) {
  throw new Error("somebody visited the page~!");
  res.render('debug')
})

module.exports = router
