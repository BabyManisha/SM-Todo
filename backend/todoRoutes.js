var Todo = require("../models/todo");

var express = require("express");
var router = express.Router();


router.get('/list', (req, res) => {
    console.log("In the routes");
    // res.send("Welcome to MY First Node APP");

    // TODO -- need to get all the todos from db

    // Todo.find((err, todos) => {
    //     if(err){
    //         console.log(err);
    //     }else{
    //         res.json(todos);
    //         // res.sendfile('./frontend/app.html');
    //     }
    // });

    Todo.find({'userName': { '$regex' : req.query.userName, '$options' : 'i' } }, (err, todos) => {
        if(err){
            console.log(err);
        }else{
            res.json(todos);
            // res.sendfile('./frontend/app.html');
        }
    });

});

router.post('/create', (req, res) => {
    var todo = new Todo(req.body);
    todo.save()
        .then( todo => {
            res.status(200).json({'msg': "New Todo added Successfully!!"});
        })
        .catch(err => {
            res.status(400).json({'msg': "Something went Wrong!!"});
        });
});

module.exports = router;