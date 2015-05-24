var express = require('express');
var router = express.Router();

var raspbianMjpeg = require('raspbian-mjpeg');

var mJpeg = new raspbianMjpeg({
    statusFilePath: 'status_mjpeg.txt',
    fifoFilePath: 'FIFO',
    mJpegFilePath: '/run/shm/mjpeg/cam.jpg',
    mediaFolder: 'media/',
    fps: 25
});

/* GET home page. */
router.get('/', function (req, res, next) {
    mJpeg.startCamera(function () {
        res.render('four-pictures', {title: 'Express'});
    });
});

module.exports = router;
