const express = require('express')
const router = express.Router()

/* GET home page. */
router.get('/dothething', function mainHandler(req, res, next) {
  res.render('debug')
  var err =  new Error("somebody visited the page~!");
  next(err)
})

module.exports = router
