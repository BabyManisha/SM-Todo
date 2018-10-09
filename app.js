var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var todoRoutes = require("./backend/todoRoutes");
var Todo = require("./models/todo");
var cors = require("cors");
var server = require('http').createServer(app);
var io = require("socket.io")(server);

var activeUsers = {};

mongoose.connect("mongodb://localhost:27017/tododb6")
// mongoose.connect("mongodb://mongodb:27016/tododb")
    .then(() => {
        console.log("Connected to MOngoDB");
    }, error => {
        console.log("There is an error while commecting to the MongoDB ", error);
    });


app.use('/', (req, res, next)=> {
    console.log(req.method);
    console.log(req.path);
    next();
})

app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());

app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/frontend'));



app.get('/', (req, res) => {
    res.sendFile(__dirname+'/frontend/app.html');
})

app.use("/todo", todoRoutes);

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
    console.log("every 2secs......");
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
                        for(let td in todos){``
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