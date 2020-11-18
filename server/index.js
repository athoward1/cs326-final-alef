"use strict";

import * as _pgp from "pg-promise";
import * as _express from "express";
import * as _crypto from "../miniCrypt";


const PORT = process.env.PORT || 8081;
const HASH_KEY = process.env.HASH_KEY || 123456;

const express = _express["default"];
const crypto = _crypto["default"];
const pgp = _pgp["default"]({
    connect(client) {
        console.log('Connected to database:', client.connectionParameters.database);
    },

    disconnect(client) {
        console.log('Disconnected from database:', client.connectionParameters.database);
    }
});

//Express Config
const app = express();
app.use(express.json());

//MiniCrypt Config
const mc = new minicrypt();

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
    await newWorkspace(req.body.userid, req.body.workspaceid, req.body.chatid, req.body.plannerid, req.body.taskid, req.body.timelineid, req.body.image_url);
    res.send("FAKE workspace added.");
});


async function newWorkspace(userid,workspaceid,chatid,plannerid,taskid,timelineid,image_url){
    return await connectAndRun(db => db.none("INSERT INTO workspaces VALUES ($1, $2, $3, $4, $5, $6, $7);", [userid,workspaceid,chatid,plannerid,taskid,timelineid,image_url]));
}

app.get("/localGet", async (req, res) => {
    console.log("GET recieved");
    res.send("Gotchu");
});

app.use('/', express.static('./client'));

app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`)
});


app.post("/createAccount", [findUser, createAccount]);

app.get("/login", [checkPassword, async (req, res) => {
    res.send(JSON.stringify({result: "User not yet exist"}));
}]);

async function checkPassword(req, res) {
    //  See if username exits
    let username = await connectAndRun(db => db.any("SELECT * FROM logins WHERE username = ($1);", req.body.username));
    if (username.length === 0){
        next();
        return;
    }
    //  Compare passwords
    let hash = mc.hash(req.body.password);
    let matched = await connectAndRun(db => db.any("SELECT * FROM logins WHERE username = ($1) AND salt = ($2) AND hash = ($3);", [req.body.username, hash[1], hash[2]]));
    console.log("Matched:" + matched);
    if (matched.length === 0){
        res.send(JSON.stringify({result: "Wrong Password"}));
        console.log("Wrong Password");
    }else{
        res.send(JSON.stringify("Login successful"));
        console.log("Login Success");
    }

}

async function findUser (req, res, next) {
    console.log("Checking for existing username");
    let duplicate = await connectAndRun(db => db.any("SELECT * FROM logins WHERE username = ($1);", [req.body.username]));
    if(duplicate.length > 0){
        res.send(JSON.stringify({result: "duplicate"}));
    }else{
        next();
    }
}

async function createAccount (req, res){
    let alreadyexists = await connectAndRun(db => db.none("INSERT INTO logins VALUES ($1, $2, $3, $4);", [req.body.username,req.body.password,"salt?","hash?"]));
    console.log(`Added user ${req.body.username} to the database`);
    res.send(JSON.stringify({result: "ok"}));
    return alreadyexists;
}

//Hashing

let hasher = crypto.createHash("sha256");

console.log(hasher.update("Username").digest("hex"));

