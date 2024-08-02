const express = require('express');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login\n"});
        } else {
            return res.status(404).json({message: "User already exists!\n"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    const get_data = new Promise((resolve, reject) => {
        resolve(res.send(JSON.stringify(books, null, 4) + "\n"));
    });
    get_data.then(() => console.log("get books resolved"));

});


// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const get_data = new Promise((resolve, reject) => {
        resolve(res.send(JSON.stringify(books[req.params.isbn], null, 4) + "\n"));
    });
    get_data.then(() => console.log("get isbn resolved"));

 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const get_data = new Promise((resolve, reject) => {
        var booksByAuthor = new Array();
        Object.entries(books).forEach(([k,v]) => {
            if (v.author === req.params.author){
                booksByAuthor.push(v);
            }
        })
        resolve(res.send(JSON.stringify(booksByAuthor, null, 4) + "\n"));
    });
    get_data.then(() => console.log("get books by author resolved"));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const get_data = new Promise((resolve, reject) => {
        var booksByTitle = new Array();
        Object.entries(books).forEach(([k,v]) => {
            if (v.title === req.params.title){
                booksByTitle.push(v);
            }
        })
        resolve(res.send(JSON.stringify(booksByTitle, null, 4) + "\n"));
    });
    get_data.then(() => console.log("get books by title resolved"));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    res.send(JSON.stringify(books[req.params.isbn].reviews, null, 4) + "\n")
});

module.exports.general = public_users;
