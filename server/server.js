"use strict"
var express = require('express');
var multer = require('multer');
var cors = require('cors');
var fileName = undefined;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        fileName = Date.now() + '.wav';
        cb(null, fileName);
    }
});

var upload = multer({
    storage: storage
});

var objectid = require('objectid');
var app = express()
var router = express.Router();

router.post('/voice', upload.single('voice'), function (req, res, next) {
    res.sendStatus(200).json({
        url: fileName
    });
});

app.use('/uploads', router);
app.use(cors());

app.listen(3000);