const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

const checkSession = (ses)=>{
    const jsonSes = JSON.parse(ses);
    if (jsonSes.authorization){
        return jsonSes.authorization;
    }
}

app.use(express.json());

app.use("/customer", session({secret:"fingerprint_customer", resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    // Check if user is logged in and has valid access token
    var activeSession = Object.values(req.sessionStore.sessions).map((ses) => checkSession(ses)).filter((ses) => ses)
    if (activeSession.length > 0) {
        let token = activeSession[0]['accessToken'];
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
