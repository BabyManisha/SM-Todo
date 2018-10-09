var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var TodoSchema = new Schema({
    todoItem: String,
    userName: String
},{
    timestamps: true
});

module.exports = mongoose.model('Todo', TodoSchema);