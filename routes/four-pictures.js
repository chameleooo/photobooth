var express = require('express');
var fs = require('fs');

var router = express.Router();

var raspbianMjpeg = require('raspbian-mjpeg');

var mediaFolder = "/home/pi/devel/photobooth/public/media/";

var mJpeg = new raspbianMjpeg({
    statusFilePath: '/var/www/status_mjpeg.txt',
    fifoFilePath: '/var/www/FIFO',
    mJpegFilePath: '/dev/shm/mjpeg/cam.jpg',
    mediaFolder: '/var/www/media/',
    fps: 25
});

mJpeg.setResolution({
    videoWidth: 460,
    videoHeight: 560,
    videoFps: 25,
    boxingFps: 25,
    imageWidth: 1597,
    imageHeight: 1944
}, function () {
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
