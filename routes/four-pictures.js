var express = require('express');
var fs = require('fs');
var net = require('net');
var im = require('imagemagick');


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

var effects = [
    {effect: "none"},
    {effect: "vintage"},
    {effect: "lomo"},
    {effect: "clarity"},
    {effect: "sinCity"},
    {effect: "sunrise"},
    {effect: "crossProcess"},
    {effect: "orangePeel"},
    {effect: "love"},
    {effect: "grungy"},
    {effect: "jarques"},
    {effect: "pinhole"},
    {effect: "oldBoot"},
    {effect: "glowingSun"},
    {effect: "hazyDays"},
    {effect: "herMajesty"},
    {effect: "nostalgia"},
    {effect: "hemingway"},
    {effect: "concentrate"}
];


/* GET home page. */
router.get('/', function (req, res, next) {

    var time = Date.now();
    var newDir = req.app.locals.mediaFolder + time;
    fs.mkdir(newDir, function () {
    });

    var newPicturePath = newDir + "/raw.jpg";
    camera.takePicture({download: true}, function (err, data) {
        console.log(err)
        fs.writeFileSync(newPicturePath, data);
        im.resize({
            srcData: fs.readFileSync(newPicturePath, 'binary'),
            width: 850
        }, function (err, stdout, stderr) {
            if (err) throw err;
            fs.writeFileSync(newDir + "/preview.jpg", stdout, 'binary');
            im.resize({
                srcData: fs.readFileSync(newDir + "/preview.jpg", 'binary'),
                height: 120,
                width: 180
            }, function (err, stdout, stderr) {
                if (err) throw err;
                fs.writeFileSync(newDir + "/thumbnail.jpg", stdout, 'binary');
                res.render('four-pictures',
                    {
                        preview: "/media/" + time + "/preview.jpg",
                        thumbnail: "/media/" + time + "/thumbnail.jpg",
                        effects: effects
                    });
            });
        });
    });
});

module.exports = router;