var express = require('express');
var fs = require('fs');
var net = require('net');
var im = require('imagemagick');
var caman = require('caman').Caman;

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

    var currentDir = req.app.locals.mediaFolder + "current/";

    if (!fs.existsSync(currentDir)) {
        fs.mkdirSync(currentDir);
    }

    rmDir(currentDir, false);

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
            width: 500
        }, function (err, stdout, stderr) {
            if (err) throw err;
            fs.writeFileSync(currentDir + "preview-none.jpg", stdout, 'binary');
            im.resize({
                srcData: fs.readFileSync(currentDir + "preview-none.jpg", 'binary'),
                height: 80,
                width: 120
            }, function (err, stdout, stderr) {
                if (err) throw err;

                fs.writeFileSync(currentDir + "thumbnail-none.jpg", stdout, 'binary');

                effects.forEach(function (e, index) {
                    var effect = e.effect;
                    if (effect != "none") {
                        caman(currentDir + "thumbnail-none.jpg", function () {
                            this[effect]();
                            this.render(function () {
                                this.save(currentDir + "/thumbnail-" + effect + ".jpg");
                                if (index == effects.length - 1) {
                                    res.render('four-pictures',
                                        {
                                            effects: effects
                                        });
                                }
                            });
                        });
                    }
                });

                effects.forEach(function (e, index) {
                    var effect = e.effect;
                    if (effect != "none") {
                        caman(currentDir + "preview-none.jpg", function () {
                            this[effect]();
                            this.render(function () {
                                this.save(currentDir + "/preview-" + effect + ".jpg");


                            });
                        });
                    }
                });
            });
        });
    });
});



function rmDir(dirPath, removeSelf) {
    if (removeSelf === undefined)
        removeSelf = true;
    try { var files = fs.readdirSync(dirPath); }
    catch(e) { return; }
    if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
            var filePath = dirPath + '/' + files[i];
            if (fs.statSync(filePath).isFile())
                fs.unlinkSync(filePath);
            else
                rmDir(filePath);
        }
    if (removeSelf)
        fs.rmdirSync(dirPath);
};

module.exports = router;