require("dotenv").config();
//framework
const express=require("express");
const mongoose = require("mongoose");

//database
const database = require("./database/index.js");

//Models
const BookModel = require("./database/book.js");
const AuthorModel = require("./database/author.js");
const PublicationModel = require("./database/publication.js");


//initializing express
const shapeAI=express();

//configuration
shapeAI.use(express.json());

// Establish Database connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log("connection established!!"));

/*
Route           /
Description     get all books
Access          Public
Parameters      None
Method          Get
*/ 

shapeAI.get("/", async (req, res) => {
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

shapeAI.get("/is/:isbn", async(req, res) => {

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

shapeAI.get("/c/:category", async(req, res) => {

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
Route           /author
Description     get all author
Access          Public
Parameters      none
Method          Get
*/ 

shapeAI.get("/author", async (req, res) => {
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

shapeAI.get("/author/:isbn", (req, res) => {
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
Route           /publications
Description     get all publications
Access          Public
Parameters      none
Method          Get
*/ 

shapeAI.get("/publications", (req, res) => {
    return res.json({publications: database.publications});
});

/*
Route           /book/new
Description     add new books  
Access          Public
Parameters      none
Method          post
*/ 

shapeAI.post("/book/new", async (req, res) => {
    const {newBook} = req.body;

    BookModel.create(newBook);

    return res.json({ message: "book was added"});
});

/*
Route           /author/new
Description     add new author  
Access          Public
Parameters      none
Method          post
*/

shapeAI.post("/author/new", (req, res) => {
    const { newAuthor } = req.body;

    AuthorModel.create(newAuthor);

    return res.json({message: "author was added" });
});

/*
Route           /book/update/
Description     update title of a book  
Access          Public
Parameters      isbn
Method          put
*/

shapeAI.put("/book/update/:isbn", async (req, res) => {

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

shapeAI.put("/book/author/update/:isbn", async (req, res) => {

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
Route           /publication/update/book
Description     update/add new book to a publication
Access          Public
Parameters      isbn
Method          put
*/

shapeAI.put("/publication/update/book/:isbn", (req, res) => {
    database.publications.forEach((publication) => {
        if( publication.id === req.body.pubId) {
            return publication.books.push(req.params.isbn);
        }
    });

    database.books.forEach((book) => {
    if (book.ISBN === req.params.isbn) {
        book.publication = req.body.pubId;
        return;
    }
    });

    return res.json({
        books: database.books,
        publications: database.publications,
        message: "Successfully updated publication",
    });
});

/*
Route           /book/delete
Description     delete a book
Access          Public
Parameters      isbn
Method          delete
*/

shapeAI.delete("/book/delete/isbn", (req, res) => {

    

    const updatedBookDatabase = database.books.filter(
        (book) => book.ISBN !== req.params.isbn 
    );

    database.books = updatedBookDatabase;
    return res.json({ books: database.books });
});

/*
Route           /book/delete/author
Description     delete a author from a book
Access          Public
Parameters      isbn
Method          delete
*/

shapeAI.delete("/book/delete/author/:isbn/:authorId", (req, res) => {
    database.books.forEach((book) => {
        if(book.ISBN === req.params.isbn){
            const newAuthorList = book.authors.filter(
                (author) => author !== parseInt(req.params.authorId)
            );
            book.authors = newAuthorList;
            return;
        }
    });

    database.authors.forEach((author) => {
        if(author.id === parseInt(req.params.authorId)){
            const newBookList = author.books.filter(
                (book) => book !== req.params.isbn
            );

            author.books = newBookList;
            return;
        }
    });

    return res.json({ 
        book: database.books,
        author: database.authors,
        message: "author was deleted!!",
    });
});

/*
Route           /publication/delete/book
Description     delete a book from publication
Access          Public
Parameters      isbn, publication id
Method          delete
*/

shapeAI.delete("/publication/delete/book/:isbn/:pubId", (req, res) => {
    database.publications.forEach((publication) => {
        if (publication.id === parseInt(req.params.pubId)){
            const newBookList = publication.books.filter(
                (book) => book !== req.params.isbn
            );

            publication.books = newBookList;
            return;
        }
    });

    database.books.forEach((book) => {
        if(book.ISBN === req.params.isbn){
            book.publication = 0;
            return;
        }
    }); 

    return res.json({ books: database.books, publications: database.publication})
});

shapeAI.listen(3000, ()=> console.log("Server Running!!"));