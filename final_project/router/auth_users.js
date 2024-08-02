const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return false;
    } else {
        return true;
    }
}

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: username
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("\n" + username + " successfully logged in\n");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    // Check if user is logged in and has valid access token
    books[req.params.isbn]["reviews"][req.user.data] = req.body.review;
    res.send(books[req.params.isbn])
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    // Check if user is logged in and has valid access token
    delete books[req.params.isbn]["reviews"][req.user.data];
    res.send(books[req.params.isbn])
});

// Get logged in user
regd_users.get("/auth/whoami/", (req, res) => {
    res.send(req.user.data)
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
