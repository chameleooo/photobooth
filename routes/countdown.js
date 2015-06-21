var express = require('express');

var router = express.Router();

/* GET countdown. */
router.get('/', function (req, res, next) {
    res.render('countdown', {title: 'Photobooth'});
});

module.exports = router;
