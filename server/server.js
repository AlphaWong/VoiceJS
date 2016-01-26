"use strict"
var express = require('express'),
    multer = require('multer'),
    cors = require('cors'),
    jsonfile = require('jsonfile'),
    util = require('util'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    upload = multer(),
    ObjectId = mongoose.Schema.Types.ObjectId;

var fileName = undefined;
var commentsDir = './comments/';

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

//TODO:Data Base
var url = 'mongodb://localhost:27017/VideoSubtitleComments';
mongoose.connect(url);
var Schema = mongoose.Schema;
var Comments = new Schema({
    "video": String,
    "comments": {
        type: [{
            "_id": {
                type: ObjectId,
                default: ObjectId
            },
            "from": String,
            "body": String
    }],
        default: []
    }
});
var CommentsTable = mongoose.model('Comments', Comments);
//
var app = express()
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
})); // for parsing application/x-www-form-urlencoded
var router = express.Router();

router.post('/uploads/voice', upload.single('voice'), function (req, res, next) {
    res.sendStatus(200).json({
        url: fileName
    });
});

router.get('/comments/:comment_id', function (req, res) {
    var comment_id = req.params.comment_id;
    CommentsTable.findById(comment_id, function (err, doc) {
        res.json(doc);
    });
});

router.post('/comments/', function (req, res) {
    console.log('comment post');
    CommentsTable.create(req.body, function (err, doc) {
        if (err) {
            return res.json(err);
        } else {
            return res.json(req.body);
        }
        //            // saved!
    });
});

app.use('/', router);
app.use(cors());

app.listen(3000);