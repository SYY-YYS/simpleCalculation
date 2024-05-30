import mongoose from 'mongoose';
import express from 'express';
import cors from "cors";

const app = express()
import dotenv from 'dotenv';

dotenv.config();


app.use(cors());

// router
// app.use("/serial", serial);


app.get("/", (req, res) => {
    res.send("This app tries to store test results.")
})

app.listen(8030, () => {
    console.log("Server started on port 8030");
})
