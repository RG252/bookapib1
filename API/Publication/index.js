const Router = require("express").Router();

const PublicationModel = require("../../database/publication");

/*
Route           /publications
Description     get all publications
Access          Public
Parameters      none
Method          Get
*/ 

Router.get("/", (req, res) => {
    return res.json({publications: database.publications});
});

/*
Route           /publication/update/book
Description     update/add new book to a publication
Access          Public
Parameters      isbn
Method          put
*/

Router.put("/update/book/:isbn", (req, res) => {
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
Route           /publication/delete/book
Description     delete a book from publication
Access          Public
Parameters      isbn, publication id
Method          delete
*/

Router.delete("/delete/book/:isbn/:pubId", (req, res) => {
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

module.exports = Router;