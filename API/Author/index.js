const Router = require("express").Router();

const AuthorModel = require("../../database/author");

/*
Route           /author
Description     get all author
Access          Public
Parameters      none
Method          Get
*/ 

Router.get("/", async (req, res) => {
    const getAllAuthors = await AuthorModel.find();
    return res.json({authors: getAllAuthors});
});

/*
Route           /author
Description     get all books based on author
Access          Public
Parameters      isbn
Method          Get
*/ 

Router.get("/:isbn", (req, res) => {
    const getSpecificAuthors = database.authors.filter(
        (author) => author.books.includes (req.params.isbn)
    );

    if(getSpecificAuthors.length === 0)    {
        return res.json({
            error: `No author found for the Book of ${req.params.isbn}`,
    });
    }

    return res.json({ author: getSpecificAuthors});
});

/*
Route           /author/new
Description     add new author  
Access          Public
Parameters      none
Method          post
*/

Router.post("/new", (req, res) => {
    const { newAuthor } = req.body;

    AuthorModel.create(newAuthor);

    return res.json({message: "author was added" });
});

module.exports = Router;