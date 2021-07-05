//Prefix : /book

//Initializing Express Router
const Router = require("express").Router();

//Database models
const BookModel = require("../../database/book");

/*
Route           /
Description     get all books
Access          Public
Parameters      None
Method          Get
*/ 

Router.get("/", async (req, res) => {
    const getAllBooks = await BookModel.find();
    return res.json(getAllBooks);
});

/*
Route           /
Description     get specific book based on isbn
Access          Public
Parameters      isbn
Method          Get
*/ 

Router.get("/is/:isbn", async(req, res) => {

    const getSpecificBook = await BookModel.findOne({ISBN: req.params.isbn});

    if(!getSpecificBook)    {
        return res.json({
            error: `No book found for the ISBN of ${req.params.isbn}`,
    });
    }

    return res.json({ book: getSpecificBook});

});

/*
Route           /c
Description     get specific books based on category
Access          Public
Parameters      category
Method          Get
*/ 

Router.get("/c/:category", async(req, res) => {

    const getSpecificBooks = await BookModel.findOne({
        category: req.params.category
    });

        if(!getSpecificBooks)    {

        return res.json({
            error: `No book found for the category of ${req.params.category}`,
    });
    }

    return res.json({ book: getSpecificBooks});
});

/*
Route           /book/new
Description     add new books  
Access          Public
Parameters      none
Method          post
*/ 

Router.post("/new", async (req, res) => {
    const {newBook} = await req.body;

    BookModel.create(newBook);

    return res.json({ message: "book was added"});
});

/*
Route           /book/update/
Description     update title of a book  
Access          Public
Parameters      isbn
Method          put
*/

Router.put("/update/:isbn", async (req, res) => {

    const updatedBook = await BookModel.findOneAndUpdate(
        {
            ISBN: req.params.isbn,
        },
        {
            title: req.body.bookTitle,
        },
        {
            new: true,
        }
    );
    
    return res.json({ books: updatedBook});
});

/*
Route           /book/author/update
Description     update/add new author
Access          Public
Parameters      isbn
Method          put
*/

Router.put("/author/update/:isbn", async (req, res) => {

    const updatedBook = await BookModel.findOneAndUpdate(
        {
            ISBN: req.params.isbn,
        },
        {
            $addToSet: {
                authors: req.body.newAuthor,
            },
        },
        {
            new: true,
        }
    );

    const updatedAuthor = await AuthorModel.findOneAndUpdate(
        {
            id: req.body.newAuthor,
        },
        {
            $addToSet: {
                books: req.params.isbn,
            },
        },
        {
            new: true,
        }
    );

    return res.json({
        books: updatedBook,
        authors: updatedAuthor,
        message: "New author was added",
    });
});

/*
Route           /book/delete
Description     delete a book
Access          Public
Parameters      isbn
Method          delete
*/

Router.delete("/delete/:isbn", async (req, res) => {

    const updatedBookDatabase =await BookModel.findOneAndDelete({
        ISBN: req.params.isbn,
    });
    
    return res.json({ books: updatedBookDatabase });
});

/*
Route           /book/delete/author
Description     delete a author from a book
Access          Public
Parameters      isbn
Method          delete
*/

Router.delete("/delete/author/:isbn/:authorId", async (req, res) => {

    const updatedBook = await BookModel.findOneAndUpdate({
        ISBN: req.params.isbn,
    },
    {
        $pull: {
            authors: parseInt(req.params.authorId),
        },
    },
    {
        new: true,
    }
    );

    const updatedAuthor = await AuthorModel.findOneAndUpdate({
        id: parseInt(req.params.authorId),
    },
    {
        $pull: {
            books: req.params.isbn,
        },
    },
    {
        new: true,
    }
    );

    return res.json({ 
        book: updatedBook,
        author: updatedAuthor,
        message: "author was deleted!!",
    });
});



module.exports = Router;