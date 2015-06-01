var express = require('express');
var fs = require('fs');
var net = require('net');

var router = express.Router();

var gphoto2 = require('gphoto2');
var GPhoto = new gphoto2.GPhoto2();

var camera;
// List cameras / assign list item to variable to use below options
GPhoto.list(function (list) {
    if (list.length === 0) return;
    camera = list[0];
    console.log('Found', camera.model);
});


/* GET home page. */
router.get('/', function (req, res, next) {
    var time = Date.now();
    var newDir = req.app.locals.mediaFolder + time;
    fs.mkdir(newDir, function () {
    });
    res.render('four-pictures', {title: 'Express', id: time});
});

/* GET home page. */
router.post('/take-picture', function (req, res, next) {

    var id = req.body.id;
    var counter = req.body.counter;

    var newPicturePath = id + "/" + counter + ".jpg";
    camera.takePicture({download: true}, function (err, data) {
        console.log(err)
        fs.writeFileSync(req.app.locals.mediaFolder + newPicturePath, data);
        res.send({picture: "/media/" + newPicturePath});

    });

});


module.exports = router;
