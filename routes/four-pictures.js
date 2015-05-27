var express = require('express');
var fs = require('fs');
var net = require('net');

var router = express.Router();

var raspbianMjpeg = require('raspbian-mjpeg');

var mediaFolder = "/home/pi/devel/photobooth/public/media/";

var gphoto2 = require('gphoto2');
var GPhoto = new gphoto2.GPhoto2();

var camera;
// List cameras / assign list item to variable to use below options
GPhoto.list(function (list) {
    if (list.length === 0) return;
    camera = list[0];
    console.log('Found', camera.model);
});

var socketPath = '/tmp/preview.sock';

router.get('/preview.jpg', function( req, res ) {
    console.log("Hey !")
    var previewServer = net.createServer(function ( c ) {
        res.contentType('image/jpeg');
        c.on('end', function () {
            previewServer.close();
            res.end();
        });
        c.pipe(res); // pipes preview stream to HTTP client
    });
    previewServer.listen(socketPath, function () {
        camera.takePicture({preview:true, socket: socketPath}, function(er){
            // some logging, error handling
        });
    });
    // double-check EADDRINUSE
    previewServer.on('error', function(e) {
        if (e.code !== 'EADDRINUSE') throw e;
        net.connect({ path: socketPath }, function() {
            // really in use: re-throw
            throw e;
        });
    });

});

/* GET home page. */
router.get('/', function (req, res, next) {
    var time = Date.now();
    console.log(time)
    var newDir = req.app.locals.mediaFolder + time;
    fs.mkdir(newDir,function(){});
    res.render('four-pictures', {title: 'Express', id: time});
});

/* GET home page. */
router.post('/take-picture', function (req, res, next) {

    var id = req.body.id;
    var counter = req.body.counter;

    mJpeg.takePicture(function (err, pictures) {
        if (err != null) {
            console.log('ERROR: ' + err.message);
        }
        else {
            var picture = pictures[0];
            var newPicturePath = id + "/" + counter + ".jpg";
            fs.rename(picture, req.app.locals.mediaFolder + newPicturePath, function (err) {
                console.log(err)
                res.send({picture: "/media/" + newPicturePath});
            });
        }
    });

});


module.exports = router;
