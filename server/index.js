"use strict";
import * as _pgp from "pg-promise";
import * as _express from "express";

const PORT = process.env.PORT || 8081;

const express = _express["default"];

const app = express();
app.use(express.json());

const pgp = _pgp["default"]({
    connect(client) {
        console.log('Connected to database:', client.connectionParameters.database);
    },

    disconnect(client) {
        console.log('Disconnected from database:', client.connectionParameters.database);
    }
});


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

app.use('/', express.static('./client/'));

app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`)
});