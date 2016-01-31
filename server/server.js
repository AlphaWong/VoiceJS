'use strict'
const express = require('express'),
    multer = require('multer'),
    cors = require('cors'),
    jsonfile = require('jsonfile'),
    util = require('util'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

const commentsDir = './comments/';
let fileName = undefined;

let storage = multer.diskStorage({
    destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            fileName = Date.now() + '.wav';
            cb(null, fileName);
        }
});

const upload = multer({
    storage
});

//TODO:Data Base
const url = 'mongodb://localhost:27017/VideoSubtitleComments';
mongoose.connect(url);
const Schema = mongoose.Schema;
const Comments = new Schema({
    video: String,
    comments: {
        type: [{
            '_id': {
                type: ObjectId,
                default: ObjectId
            },
            from: String,
            body: String
    }],
        default: []
    }
});
const CommentsTable = mongoose.model('Comments', Comments);

const Subtitles = new Schema({
    video: String,
    from: String,
    subtitles: {
        type: [{
            startTime: String,
            endTime: String,
            text: String,
            comments: {
                type: [{
                    '_id': {
                        type: ObjectId,
                        default: ObjectId
                    },
                    from: String,
                    body: String
                    }],
                default: []
            }
    }],
        default: []
    }
});

const SubtitlesTable = mongoose.model('Subtitles', Subtitles);
//
const app = express();
app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
})); // for parsing application/x-www-form-urlencoded
const router = express.Router();

router.post('/uploads/voice', upload.single('voice'), (req, res, next) => {
    res.sendStatus(200).json({
        url: fileName
    });
});

router.get('/subtitles2Json/:subtitle_id', (req, res) => {
    let _id = req.params.subtitle_id;
    SubtitlesTable.findById(_id, (err, doc) => {
        if (err) {
            return res.status(404).json(doc);
        }
        res.json(doc);
    });
});

router.get('/subtitles/:subtitle_id', (req, res) => {
    let _id = req.params.subtitle_id;
    SubtitlesTable.findById(_id, (err, doc) => {
        if (err) {
            return res.status(404).json(doc);
        }
        res.type('.vtt');
        let output = 'WEBVTT\n\n';
        for (var i = 0; i < doc.subtitles.length; ++i) {
            output += doc.subtitles[i].startTime + ' --> ';
            output += doc.subtitles[i].endTime + '\n';
            output += doc.subtitles[i].text + '\n';
            output += '\n';
        }
        res.send(output);
    });
});

router.post('/subtitles', (req, res) => {
    SubtitlesTable.create(req.body, (err, doc) => {
        if (err) {
            return res.status(500).json(err);
        } else {
            return res.json(doc);
        }
        // saved!
    });
});
router.put('/subtitles/:subtitle_id', (req, res) => {
    let _id = req.params.subtitle_id;
    SubtitlesTable.findOneAndUpdate({
        _id
    }, req.body, (err, doc) => {
        if (err) {
            return res.json(err);
        } else {
            return res.json(req.body);
        }
    })
});
router.get('/subtitles/:from/:video/findOne', (req, res) => {
    console.log(req.params.video)
    let from = req.params.from,
        video = encodeURIComponent(req.params.video);
    SubtitlesTable.findOne({
        from, video
    }, (err, subtitle) => {
        if (err || subtitle == null) {
            return res.status(404).json(err);
        }
        res.json(subtitle);
    })
});

app.use('/', router);
app.listen(3000);