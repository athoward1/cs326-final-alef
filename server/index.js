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




app.get("/localGet", async (req, res) => {
    console.log("GET recieved");
    res.send("Gotchu");
});

app.use('/', express.static('./client/'));

app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`)
});
