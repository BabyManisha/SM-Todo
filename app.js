var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var base64 = require("base-64");
var mongoose = require("mongoose");
var todoRoutes = require("./backend/todoRoutes");
var userAuth = require("./backend/userAuth");
var Todo = require("./models/todo");
var cors = require("cors");
var server = require('http').createServer(app);
var io = require("socket.io")({
    path: '/apps/todo/socket.io'
});
io.attach(server);

var { Client } = require("pg");

var activeUsers = {};

// mongoose.connect("mongodb://localhost:27017/tododb6")
mongoose.connect("mongodb://mongodb:27017/tododb")
    .then(() => {
        console.log("Connected to MOngoDB");
    }, error => {
        console.log("There is an error while commecting to the MongoDB ", error);
    });

app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(cors());

app.get('/apps/todo/index', (req, res) => {
    res.sendFile(__dirname+'/frontend/app.html');
})

app.use('/apps/todo/static/public', express.static(__dirname + '/frontend'));
// app.use('/apps/todo/static', express.static(__dirname + '/node_modules'));

var pgclient = new Client({
    host: 'sessiondb',
    port: 5432,
    user: 'sessiondb',
    database: 'sessiondb'
});

pgclient.connect((err) => {
    if(err){
        console.log('PGDB COnnection Error', err.stack);
    }else{
        console.log('connected to PastgressDB');
    }
})

var uName  = "";


app.use('/', (req, res, next)=> {
    console.log(req.method);
    console.log(req.path);
    console.log(req.headers['x-access-token']);
    console.log(req.cookies);
    var session_key = req.cookies['sessionid'] || req.cookies['JSESSIONID'];
    var access_token = req.headers['x-access-token'];

    pgclient.query('SELECT * FROM django_session where session_key = $1',[session_key] , (err, res) => {
        if(err){
            console.log("error in the query....", err);
        }else{
            console.log("PGDB response is:", res);
            if(res.rowCount == 1){
                let sessionDatab64 = res.rows[0]['session_data'];
                console.log(base64.decode(sessionDatab64));
                let sessionData = base64.decode(sessionDatab64);
                let sIndex = sessionData.indexOf(':');
                let sData = JSON.parse(sessionData.slice(sIndex+1));
                let appsDetails = sData['apps'][access_token];
                req['userName'] = sData['username'];
                req['appDetails'] = appsDetails;
                // uName = sData['TENANT'];
                // console.log(uName);
                next();
            }else{
                console.log("invalid session");
                res.JSON("msg", "Invalid Session");
            }
        }
    })
});

app.use("/apps/todo/user", userAuth);
app.use("/apps/todo/todo", todoRoutes);

//var socketns = io.of('/apps/todo');
io.on('connection', (client) => {
    console.log("connected to client......");
    console.log(client.handshake.headers['x-username']);
    let activeUserKeys = Object.keys(activeUsers);
    console.log(activeUserKeys.indexOf(client.handshake.headers['x-username']));
    if(activeUserKeys.indexOf(client.handshake.headers['x-username']) == -1){
        activeUsers[client.handshake.headers['x-username']] = [];
    }
    activeUsers[client.handshake.headers['x-username']].push(client);
    console.log(activeUsers[client.handshake.headers['x-username']].length);

    client.on('join', (data) => {
        console.log(data);
        client.emit('message', "message from the server");
    })

    client.on('disconnecting', (data) => {
        console.log(activeUsers[client.handshake.headers['x-username']].length);
        activeUsers[client.handshake.headers['x-username']].pop(client);
        console.log(activeUsers[client.handshake.headers['x-username']].length);
        if(activeUsers[client.handshake.headers['x-username']].length == 0){
            delete activeUsers[client.handshake.headers['x-username']];
        }
        console.log("User Disconnected.....");
    })
});

var lastChecked = new Date();

setInterval((data)=> {
    console.log("every 5secs......");
    console.log("active Users::::");
    console.log(Object.keys(activeUsers));

    Todo.find({'updatedAt': {$gt: lastChecked} }, (err, todos) => {
        lastChecked = new Date();
        if(err){
            console.log(err);
        }else{
            if(todos.length){
                console.log(todos);
                for(let ai in activeUsers){
                    for(let aui in activeUsers[ai]){
                        let client = activeUsers[ai][aui];
                        for(let td in todos){
                            if(todos[td]['userName'] == ai){
                                client.emit('dataUpdated', todos[td]);
                            }
                        }
                    }
                }
            }
        }
    });
}, 5000);

server.listen(6789, () => {
    console.log("Node app is listening @6789 port....");
});