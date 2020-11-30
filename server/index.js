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

app.get("/localGet", async (req, res) => {
    console.log("GET recieved");
    res.send("Gotchu");
});

app.use('/', express.static('./client'));

app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`)
});

//
//app.get("/workspace.html", async (req, res) => {    res.sendFile('client/workspace.html', { 'root' : __dirname });  });

//  In the table called LOGINS with (unique) username w/ salt and hash: (user, salt, hash)
app.post("/changePassword", deleteAccount, createAccount);
app.post("/createAccount", findUser, createAccount);
app.post("/login", checkPassword);


//  All settings stuff is under USERINFO, by the unique username: (username, image_url, email, firstname, lastname, country)
app.post("/createSettings", createSettings);
app.post("/updateEmail", updateEmail);
app.post("/updateFirstName", updateFirstName);
app.post("/updateLastName", updateLastName);
app.post("/updateRegion", updateRegion);
app.post("/changeProfPic", updateProfPic);
app.post("/getUserInfo", getUserInfo);


//  WORKSPACEINFO table. Keeps track of which users are shared with which workspace: (owner, workspaceid, shared)
app.post("/shared", getShared);
app.post("/addNewShare", share);
app.post("/uninvite", uninvite);
app.post("/uninviteAll", uninviteAll);

/**
 * Side note: There were (and are) much better ways to do this. For one, we don't need two seperate tables for the workspace information,
 * instead we could store the shared users in an array in WORKSPACES.
 */


//  The information of each workspace called WORKSPACES that distinguishes by user when loading all, and by workspaceid when getting specific.
// (username text, workspaceid text, chatid text, plannerid text, taskid text, timelineid text, title text, image_url text)
app.post("/newWorkspace", newWorkspace);
app.post("/getWorkspaceInfo", workspacesUnderUser);
app.post("/deleteWorkspace", deleteWorkspace);
app.post("/updateWorkspaceTitle", updateWorkspaceTitle);
app.post("/updateWorkspaceImage", updateWorkspaceImage);
app.post("/checkUniqueWorkspaceName", checkUnique);


//  The sticky and image data under each workspaceid. STICKYDATA: (userid, workspaceid, sheader, sbody, positions)
app.post("/createSticky", createSticky);
app.post("/updateStickyPosition", updateStickyPosition);
app.post("/getStickies", getStickies);
app.post("/deleteSticky", deleteSticky);

//  The "positions" is a length-4 array of measurements. IMAGEDATA: (userid, workspaceid, image_url, positions)
app.post("/createImage", createImage);
app.post("/getImages", getImages);
app.post("/updateImagePosition", updateImagePosition);
app.post("/deleteImage", deleteImage);

async function share(req, res){
    await connectAndRun(db => db.none("INSERT INTO workspaceinfo VALUES ($1, $2, $3);", [req.body.userid, req.body.title, req.body.invite]));
    res.send(JSON.stringify({result: "success"}));
}


async function newWorkspace(req, res){
    await connectAndRun(db => db.none("INSERT INTO workspaces VALUES ($1, $2, $3, $4, $5, $6, $7, $8);",
    [req.body.userid, req.body.workspaceid, req.body.chatid, req.body.plannerid, req.body.taskid, req.body.timelineid, req.body.title, req.body.image_url]));
    res.send(JSON.stringify({result: "Workspace added."}));
}

async function deleteImage(req, res){
    console.log("deleting image from db");
    await connectAndRun(db => db.none("DELETE FROM imagedata WHERE workspaceid=($1) AND image_url=($2);", [req.body.workspaceid, req.body.image_url]));
    res.send(JSON.stringify({result: "success"}));
}

async function updateImagePosition(req, res){
    console.log(`UPDATE image SET positions=(${req.body.positions}) WHERE workspaceid=(${req.body.workspaceid}) AND image_url=(${req.body.image_url})`);
    await connectAndRun(db => db.none("UPDATE imagedata SET positions=($1) WHERE workspaceid=($2) AND image_url=($3);", [req.body.positions, req.body.workspaceid, req.body.image_url]));
    res.send(JSON.stringify({result: "success"}));
}

async function deleteSticky(req, res){
    console.log("deleting sticky from db");
    await connectAndRun(db => db.none("DELETE FROM stickydata WHERE workspaceid=($1) AND sheader=($2) AND sbody=($3);", [req.body.workspaceid, req.body.header, req.body.body]));
    res.send(JSON.stringify({result: "success"}));
}

async function createSticky(req, res){
    console.log("adding new sticky to db");
    await connectAndRun(db => db.none("INSERT INTO stickydata VALUES ($1, $2, $3, $4, $5);", [req.body.userid, req.body.workspaceid, req.body.header, req.body.body, req.body.positions]));
    res.send(JSON.stringify({result: "success"}));
}

async function addChat(req, res){
    console.log("adding chat message to db");
    await connectAndRun(db => db.none("INSERT INTO Chat VALUES ($1, $2, $3, $4, $5, $6);", [req.body.userid, req.body.workspaceid, req.body.header, req.body.text, req.body.dateSent]));
    res.send(JSON.stringify({result: "success"}));
}

async function createImage(req, res){
    console.log("adding new image to db");
    await connectAndRun(db => db.none("INSERT INTO imagedata VALUES ($1, $2, $3, $4);", [req.body.userid, req.body.workspaceid, req.body.image_url, req.body.positions]));
    res.send(JSON.stringify({result: "success"}));
}


async function getImages(req, res){
    console.log("Selecting images under user");
    let imgs = await connectAndRun(db => db.any("SELECT * FROM imagedata WHERE workspaceid=($1);", [req.body.workspaceid]));
    res.send(JSON.stringify({result: imgs}));
}
async function updateStickyPosition(req, res){
    console.log(`UPDATE stickydata SET positions=(${req.body.positions}) WHERE workspaceid=(${req.body.workspaceid}) AND sheader=(${req.body.header}) AND sbody=(${req.body.body});`);
    //Stickies with the same data are problematic...
    await connectAndRun(db => db.none("UPDATE stickydata SET positions=($1) WHERE workspaceid=($2) AND sheader=($3) AND sbody=($4);", [req.body.positions, req.body.workspaceid, req.body.header, req.body.body]));
    res.send(JSON.stringify({result: "success"}));
}

async function getStickies(req, res){
    console.log("Selecting stickies under user");
    let stickies = await connectAndRun(db => db.any("SELECT * FROM stickydata WHERE workspaceid=($1);", [req.body.workspaceid]));
    res.send(JSON.stringify({result: stickies}));
}


async function updateWorkspaceImage(req, res){
    console.log("Updating workspace image");
    await connectAndRun(db => db.none("UPDATE workspaces SET image_url = ($1) WHERE username = ($2) AND title = ($3);", [req.body.image_url, req.body.userid, req.body.title]));
    console.log("image changed");
    res.send(JSON.stringify({result: "success"}));
}


async function updateWorkspaceTitle(req, res){
    console.log("Updating title to " + req.body.oldtitle + "and" + req.body.userid);
    let workspaceid = await connectAndRun(db => db.one("SELECT workspaceid FROM workspaces WHERE username = ($1) AND title = ($2);", [req.body.userid, req.body.oldtitle]));
    console.log("Got workspaceid: " + workspaceid);
    await connectAndRun(db => db.none("UPDATE workspaces SET title = ($1) WHERE workspaceid = ($2);", [req.body.newtitle, workspaceid]));
    res.send(JSON.stringify({result: "success"}));
}

async function deleteWorkspace(req,res){
    console.log("deleting workspace");
    let workspaceid = await connectAndRun(db => db.one("SELECT workspaceid FROM workspaces WHERE username = ($1) AND title = ($2);", [req.body.userid, req.body.title]));
    console.log(workspaceid + " found.");
    await connectAndRun(db => db.none("DELETE FROM workspaces WHERE workspaceid = ($1);", [workspaceid]));
    await connectAndRun(db => db.none("DELETE FROM stickydata WHERE workspaceid = ($1);", [workspaceid]));
    await connectAndRun(db => db.none("DELETE FROM imagedata WHERE workspaceid = ($1);", [workspaceid]));

    console.log("Deleted " + req.body.workspaceid);
    res.send(JSON.stringify({result: "success"}));
}

async function checkUnique(req,res){
    console.log("checking duplicate workspace name");
    let entries = await connectAndRun(db => db.any("SELECT * FROM workspaces WHERE username = ($1) AND title = ($2);", [req.body.userid, req.body.newtitle]));
    console.log(entries);
    if (entries.length === 0){
        res.send(JSON.stringify({result: "unique"}));
    }else{
        res.send(JSON.stringify({result: "multiple"}))
    }
}

async function updateProfPic(req, res){
    console.log("changing profile pic");
    await connectAndRun(db => db.none("UPDATE userinfo SET image_url = ($1) WHERE username = ($2);", [req.body.image_url, req.body.username]));
    res.send(JSON.stringify({result: "success"}));
}

async function uninvite(req,res){
    console.log("uninviting");
    await connectAndRun(db => db.none("DELETE FROM workspaceinfo WHERE userid = ($1) AND title = ($2) AND shared = ($3);", [req.body.userid, req.body.title, req.body.shared]));
    console.log("Uninvited " + req.body.shared);
    res.send(JSON.stringify({result: "success"}));
}

async function uninviteAll(req,res){
    console.log("uninviting all");
    await connectAndRun(db => db.none("DELETE FROM workspaceinfo WHERE userid = ($1) AND title = ($2);", [req.body.userid, req.body.title]));
    console.log("Uninvited all");
    res.send(JSON.stringify({result: "success"}));
}

async function getUserInfo(req, res){
    console.log("Finding info for user");
    //check if this user exists
    let exists = await connectAndRun(db => db.any("SELECT * FROM userinfo WHERE username =($1);", [req.body.userid]));
    if (exists.length === 0){
        res.send(JSON.stringify({result: "No such userinfo"}));
        return;
    }
    let entries = await connectAndRun(db => db.one("SELECT * FROM userinfo WHERE username =($1);", [req.body.userid]));
    res.send(JSON.stringify({result: entries}));
}

async function getShared(req, res){
    console.log("Finding shared with users");
    let entries = await connectAndRun(db => db.any("SELECT * FROM workspaceinfo WHERE userid =($1) AND title = ($2);", [req.body.userid, req.body.title]));
    res.send(JSON.stringify({result: entries}));
}

async function workspacesUnderUser(req, res){
    console.log("Selecting workspaces under user");
    let wsps = await connectAndRun(db => db.any("SELECT * FROM workspaces WHERE username =($1);", [req.body.userid]));
    res.send(JSON.stringify({result: wsps}));
}

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
    await connectAndRun(db => db.none("UPDATE userinfo SET country = ($1) WHERE username = ($2);", [req.body.value, req.body.userid]));
    res.send(JSON.stringify({result:"success"}));
}
