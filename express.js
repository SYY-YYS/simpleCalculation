
import express from 'express';
import cors from "cors";
import {executeCrudOperation} from "./mongoOperation.js";
import dataO from "./router/dataOperation.js";

const app = express()
import dotenv from 'dotenv';

dotenv.config();


app.use(cors());
app.use(function (req, res, next) {
    console.log(req.ip, Date.now())
    next();
})

app.use("/dataOperation", dataO);


app.get("/", (req, res) => {
    // executeCrudOperation();
    res.send("This app tries to store test results.");
})

app.listen(8030, () => {
    console.log("Server started on port 8030");
})
