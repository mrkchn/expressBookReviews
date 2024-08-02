const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

const sessionStoreToDict = (sessionStore) => {
    const jsonSessions = Object.values(sessionStore.sessions).map((obj) => JSON.parse(obj));
    var tokensDict = [];
    jsonSessions.forEach((jsonSess) => {
        if ("authorization" in jsonSess) {
            tokensDict.push([jsonSess.authorization.username, jsonSess.authorization.accessToken]);
        }
    });
    return Object.fromEntries(tokensDict)
}

app.use(express.json());

app.use("/customer", session({
    secret:"yabba-dabba-doo", 
    resave: false, 
    saveUninitialized: true,
    cookie: {secure: false}
}))

app.use("/customer/auth/*", function auth(req,res,next){
    // Check if user is logged in and has valid access token
    const tokensDict = sessionStoreToDict(req.sessionStore)
    console.log(tokensDict)
    // req.session does not have the json web token, which makes it impossible to identify which user is logged in.
    // I believe this is because I'm behind a proxy, so the session is not saved.
    console.log(req.session)
    if (tokensDict){
        let token = Object.values(tokensDict)[0];
        // Verify JWT token
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next(); // Proceed to the next middleware
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in!!" });
    }
});

 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
