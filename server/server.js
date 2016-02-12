'use strict'
const express = require('express'),
    multer = require('multer'),
    cors = require('cors'),
    jsonfile = require('jsonfile'),
    util = require('util'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    //    cluster = require('cluster'),
    ObjectId = mongoose.Schema.Types.ObjectId,
	morgan = require('morgan');

const commentsDir = './comments/';
let fileName = undefined;
let voicesDir = 'public/uploads/';

let storage = multer.diskStorage({
    destination(req, file, cb) {
            cb(null, voicesDir);
        },
        filename(req, file, cb) {
            fileName = Date.now() + '.wav';
            cb(null, fileName);
        }
});

//const numCPUs = require('os').cpus().length;

let socket = undefined;

const upload = multer({
    storage
});
//if (cluster.isMaster) {
//    // Fork workers.
//    for (var i = 0; i < numCPUs; i++) {
//        cluster.fork();
//    }
//
//    cluster.on('exit', (worker, code, signal) => {
//        console.log(`worker ${worker.process.pid} died`);
//    });
//} else {
//TODO:Data Base
const url = 'mongodb://localhost:27017/VideoSubtitleComments';
mongoose.connect(url);
const Schema = mongoose.Schema;

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
                    from: String,
                    body: {
                        type: String,
                        default: ""
                    },
                    createdAt: {
                        type: Date,
                        default: Date.now
                    },
                    url: {
                        type: String,
                        default: ""
                    },
                    id: {
                        type: ObjectId //_id
                    }
                }],
                default: []
            }
    }],
        default: []
    }
});

const SubtitlesTable = mongoose.model('Subtitles', Subtitles);
//
const app = express(),
    size = {
        limit: '50mb'
    };
app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json(size)); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
})); // for parsing application/x-www-form-urlencoded
const router = express.Router();

router.post('/uploads/voice', upload.single('voice'), (req, res, next) => {
    res.json({
        url: `/uploads/${fileName}`
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
        if (err || null) {
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
            SubtitlesTable.findById(_id, (err, doc) => {
                let message;
                if (err) {
                    message = err;
                } else {
                    message = doc;
                }
                socket.emit('update', message);
                socket.broadcast.emit('update', message);
            });

            return res.json(req.body);
        }
    })
});

router.get('/subtitles/:from/:video/findOne', (req, res) => {
    let from = req.params.from,
        video = encodeURIComponent(req.params.video);
    SubtitlesTable.findOne({
        //            from, video
        video
    }, (err, subtitle) => {
        if (err || subtitle == null) {
            return res.status(404).json(err);
        }
        res.json(subtitle);
    })
});

const skip=(req, res) => { return res.statusCode < 400 };
app.use(morgan('combined', {
	skip
}));//Express.Log API
app.use('/', router);
const https = require('https'),
    fs = require('fs'),
    sslOptions = {
        key: fs.readFileSync(__dirname + '/SSL/keys/educstpf.pem'),
        cert: fs.readFileSync(__dirname + '/SSL/csr/educstpf.crt')
    },
    server = https.createServer(sslOptions, app),
io = require('socket.io')(server);
io.on('connection', function (_socket) {
    socket = _socket;
    socket.emit('status', {
        status: 'connected'
    });
});
server.listen(443);
//}