const mongoose = require("mongoose");

//author schema
const AuthorSchema = mongoose.Schema({
    id: Number,
    name: String,
    books: [String],
});

//Author model
const AuthorModel = mongoose.model(AuthorSchema);

module.exports = AuthorModel;