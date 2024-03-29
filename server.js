var chat_schema = require('./schema/chat_schema')
var conversation_schema = require('./schema/coversation_schema')
var user_schema = require('./schema/user_schema')
var mongoose = require('mongoose')
var express = require('express');
var bodyparser = require('body-parser')
var cors = require('cors')
var app = express();
var multer = require('multer')
var mongodb = require('mongodb')
var fs = require('fs');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var MONGOD_url = "mongodb+srv://sriram:sriram@cluster0-htdg9.mongodb.net/"
var DBname = "Chat"
mongoose.connection.on('connected', function () {
    console.log('Connection to Mongo established.');
    if (mongoose.connection.client.s.url.startsWith('mongodb+srv')) {
        mongoose.connection.db = mongoose.connection.client.db(DBname);
    }
});

mongoose.connect(MONGOD_url, { dbName: DBname }, function (err, client) {
    if (err) {
        console.log("mongo error", err);
        return;
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './app/profile');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    // limits: {
    //   fileSize: 1024 * 1024 * 5
    // },
    fileFilter: fileFilter
});


app.get('/', (req, res) => {
    res.json("connected");
    res.end();
})
app.post('/reg', (req, res) => {
    try {

        var user = new user_schema(req.body)
        user.save().then((result) => {
            res.json({ "result": result, "status": "success", "bool": true })
            res.end();
        })
    } catch (e) {
        res.json(e)
        res.end();
    }
})
app.post('/login', (req, res) => {
    try {
        user_schema.findOne(req.body).then(result => {
            if (result.length == 0) {
                res.json({ "user": false, "msg": "user Not found","bool": true })
                res.end();
            } else {
                res.json(result)
                res.end();
            }
        })

    } catch (e) {
        res.json(e)
        res.end();
    }
})

app.get('/listusers', (req, res) => {
    try {
        user_schema.find({}).then(result => {
            if (result.length == 0) {
                res.json({ "user": false, "msg": "user Not found","bool": true})
                res.end();
            } else {
                res.json(result)
                res.end();
            }
        })

    } catch (e) {
        res.json(e)
        res.end();
    }
})

app.post('/conversation', (req, res) => {
    try {

        console.log(req.body)
        conversation_schema.findOne({ "participants": { $all: [req.body['senderid'], req.body['receiverid']] } }).then(result => {
            console.log(result, "conversation ")
            if (result == null) {
                res.json({ "msg": "conversation Not found", "data": result,"bool": true })
                res.end();
            } else {
                console.log(result, "else")
                res.json(result)
                res.end();
            }
            res.end();
        })

    } catch (e) {
        res.json(e)
        res.end();
    }
})

app.post('/conversationdet', (req, res) => {
    try {

        console.log(req.body, "daily data")
        chat_schema.find(req.body).then(result => {
            // console.log(result, "conversation ")
            res.json({"data":result,"bool": true})
            res.end();
        })

    } catch (e) {
        res.json(e)
        res.end();
    }
})

app.post('/chat', (req, res) => {
    try {
        console.log("Chata",req.body)
        var convid = new Date();
        let senderId = req.body['senderid'];
        let receiverId = req.body['receiverid'];
        let messagE = req.body['message'];
        // {"participants":req.body['senderid'],"participants":req.body['receiverid']}
        conversation_schema.find({ "participants": { $all: [senderId,receiverId] } }).then(result => {
            console.log(result, "result")
            if (result == null || result.length <= 0) {
                console.log(result, "--------------------")
                var uniqueid = convid.getDate() + '' + convid.getMonth() + '' + convid.getFullYear() + '' + convid.getSeconds() + '' + convid.getMilliseconds()
                var conversation = new conversation_schema({
                    id: uniqueid,
                    participants: [senderId,receiverId]
                })
                conversation.save().then((saved) => {
                    var chat = new chat_schema({
                        senderid: senderId,
                        message: messagE,
                        conversationid: uniqueid
                    })
                    chat.save().then((data) => {
                        // console.log("chatentry chat if ===0 saved",data)               
                        let a = JSON.parse(data['conversationid'])
                        res.json({ "data":a, "msg": "new converstaion","bool": true});
                        res.end();
                    })
                })
            } else {
                console.log(result[0].id, "+++++++++++++++++++")
                var chat = new chat_schema({
                    senderid: senderId,
                    message: messagE,
                    conversationid: result[0].id
                })
                chat.save().then((data) => {
                    // console.log("chatentry chat saved",data)    
                    let a = JSON.parse(data['conversationid'])
                    res.json({ "data":a, "msg": "exits","bool": true})
                    res.end();
                })
            }
        })

    } catch (e) {
        res.json(e)
        res.end();
    }
})


app.post('/profile', upload.single('avatar'), (req, res, next) => {
    try {
        user_schema.findOneAndUpdate({ "username": req.headers['user'] }, { $set: { "profile": req.file.filename } }).then(result => {
            res.json({"data":result,"bool": true});
            res.end("Uploaded");
        })
    }
    catch (e) {
        res.json(e);
        res.end();
    }
})

app.get('/getprofile/:username', (req, res) => {
    try {
        user_schema.findOne({ "username": req.params.username }).then(result => {
            fs.readFile(__dirname + '/app/profile/' + result['profile'], (err, data) => {
                if (err) {
                    console.log(err)
                    res.json(err);
                    res.end();
                }
                if (data) {
                    res.writeHead(200, { 'Content-type': 'image/jpg' });
                    res.end(data);
                }
            })
        })
    } catch (e) {
        res.json(e);
        res.end();
    }
})

var port = process.env.PORT || 3000;
app.listen(port);
console.log("port is An Active:", port);
