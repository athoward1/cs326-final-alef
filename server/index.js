"use strict";

import * as _pgp from "pg-promise";
import * as _express from "express";
import * as _expressSession from "express-session";
import * as _passport from "passport";
import * as _localStrategy from "passport-local";
import * as _crypto from "../miniCrypt.js";

const miniCrypt = _crypto["default"];
const passport = _passport["default"];
const localStrategy = _localStrategy["default"].Strategy;   //What does this do?
const expressSession = _expressSession["default"];
const express = _express["default"];
const pgp = _pgp["default"]({
    connect(client) {
        console.log('Connected to database:', client.connectionParameters.database);
    },

    disconnect(client) {
        console.log('Disconnected from database:', client.connectionParameters.database);
    }
});

//  Do we need dotenv module to get environment variables??

const PORT = process.env.PORT || 8081;
const HASH_KEY = process.env.HASH_KEY || 123456;

// Session configuration

const session = {
    secret : process.env.HASH_KEY || '123456', // set this encryption key in Heroku config (never in GitHub)!
    resave : false,
    saveUninitialized: false
};

//Express Config
const app = express();
app.use(express.json());
app.use(expressSession(session));
/**
passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());
*/

// Passport configuration
/**
const strategy = new LocalStrategy(
    async (username, password, done) => {
	if (!findUser(username)) {
	    // no such user
	    return done(null, false, { 'message' : 'Wrong username' });
	}
	if (!validatePassword(username, password)) {
	    // invalid password
	    // should disable logins after N messages
	    // delay return to rate-limit brute-force attacks
	    await new Promise((r) => setTimeout(r, 2000)); // two second delay
	    return done(null, false, { 'message' : 'Wrong password' });
	}
	// success!
	// should create a user object here, associated with a unique identifier
	return done(null, username);
});​
*/
//MiniCrypt Config
const mc = new miniCrypt();

//Database Config
const url = process.env.DATABASE_URL || "No database";
const db = pgp(url);

async function connectAndRun(task) {
    let connection = null;

    try {
        connection = await db.connect();
        return await task(connection);
    } catch (e) {
        throw e;
    } finally {
        try {
            connection.done();
        } catch(ignored) {

        }
    }
}

//Routing
app.post("/newWorkspace", async (req, res) => {

    let added = await connectAndRun(db => db.none("INSERT INTO workspaces VALUES ($1, $2, $3, $4, $5, $6, $7);", [req.body.userid, req.body.workspaceid, req.body.chatid, req.body.plannerid, req.body.taskid, req.body.timelineid, req.body.image_url]));
    res.send("Workspace added.");
    return added;
});

app.get("/localGet", async (req, res) => {
    console.log("GET recieved");
    res.send("Gotchu");
});

app.use('/', express.static('./client'));

app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`)
});

app.post("/changePassword", deleteAccount, createAccount);

app.post("/createAccount", findUser, createAccount);

app.post("/createSettings", createSettings);

app.post("/updateEmail", updateEmail);
app.post("/updateFirstName", updateFirstName);
app.post("/updateLastName", updateLastName);
app.post("/updateRegion", updateRegion);



app.post("/login", checkPassword);

async function deleteAccount(req,res, next){
    await connectAndRun(db => db.none("DELETE FROM logins WHERE userid = ($1);", [req.body.username]));   //there better be exactly one
    console.log("Deleted account");
    next();
    
}

async function checkPassword(req, res) {
    //  See if username exits
    let entry = await connectAndRun(db => db.any("SELECT * FROM logins WHERE userid = ($1);", [req.body.username]));
    if (entry.length === 0){
        res.send(JSON.stringify({result: "No such user"}));
        return; //  No such user || there are multiple in which case much is wrong
    }
    //  Compare passwords
    if (mc.check(req.body.password, entry[0].salt, entry[0].hash)){
        console.log("correct hash");
        res.send(JSON.stringify({result:"Login successful"}));
    }else{

        //  Incorrect Password
        await new Promise((r) => setTimeout(r, 1000));
        res.send(JSON.stringify({result: "Wrong Password"}));
        console.log("hash not matched Password");

    }    
}

async function findUser (req, res, next) {
    console.log("Checking for existing username");
    let duplicate = await connectAndRun(db => db.any("SELECT * FROM logins WHERE userid = ($1);", [req.body.username]));
    if(duplicate.length > 0){
        res.send(JSON.stringify({result: "duplicate"}));
    }else{
        next();
    }
}

async function createAccount (req, res){
    let hash = mc.hash(req.body.password);
    await connectAndRun(db => db.none("INSERT INTO logins VALUES ($1, $2, $3);", [req.body.username, hash[0], hash[1]]));
    console.log(`Added user ${req.body.username} to the database`);
    res.send(JSON.stringify({result: "No such user"})); 
}


async function createSettings (req, res){
    await connectAndRun(db => db.none("INSERT INTO userinfo VALUES ($1, $2, $3, $4, $5, $6);", [req.body.username, "image_url", "email", "firstname", "lastname", "country"]));
    console.log(`Added settings for ${req.body.username} to the database`);
    res.send(JSON.stringify({result: "success"})); //  
}

async function updateEmail(req, res){
    console.log(`Set email of ${req.body.userid} to ${req.body.value}`);
    await connectAndRun(db => db.none("UPDATE userinfo SET email = ($1) WHERE username = ($2);", [req.body.value, req.body.userid]));
    res.send(JSON.stringify({result:"success"}));
}

async function updateFirstName(req, res){
    console.log(`Set firstname of ${req.body.userid} to ${req.body.value}`);
    await connectAndRun(db => db.none("UPDATE userinfo SET firstname = ($1) WHERE username = ($2);", [req.body.value, req.body.userid]));
    res.send(JSON.stringify({result:"success"}));
}

async function updateLastName(req, res){
    console.log(`Set lastname of ${req.body.userid} to ${req.body.value}`);
    await connectAndRun(db => db.none("UPDATE userinfo SET lastname = ($1) WHERE username = ($2);", [req.body.value, req.body.userid]));
    res.send(JSON.stringify({result:"success"}));
}

async function updateRegion(req, res){
    console.log(`Set region of ${req.body.userid} to ${req.body.value}`);
    await connectAndRun(db => db.none("UPDATE userinfo SET region = ($1) WHERE username = ($2);", [req.body.value, req.body.userid]));
    res.send(JSON.stringify({result:"success"}));
}