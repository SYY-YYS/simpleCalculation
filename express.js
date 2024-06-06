
import express from 'express';

import cors from "cors";
import {executeCrudOperation} from "./mongoOperation.js";
import UserModel from './Model/UserModel.js';
import dataO from "./router/dataOperation.js";
import ejs from 'ejs';

const app = express()


import dotenv from 'dotenv';
dotenv.config();



// session for cookies
import session from 'express-session';
import MongoDBSession from 'connect-mongodb-session';

let MongoSession = MongoDBSession(session);

// tried a new uri for mongoose
const uri = process.env.Mongoose_URI;

const store = new MongoSession({
    uri: uri,
    databaseName: "testapi",
    collection: "mySessions"
})

import mongoose from "mongoose";

mongoose.connect(uri).then((res) => {
    console.log("MongoDB connected by mongoose.")
});


// password hashing
import bcrypt from 'bcrypt';

app.set("view engine", "ejs")

app.use(session({
    secret: "sign cookie",
    resave: false,
    saveUninitialized: false,
    store: store
}))

// for parsing body (post method)
app.use(express.urlencoded({extended: true}))
app.use(cors());
app.use(function (req, res, next) {
    console.log(req.ip, Date.now())
    next();
})


app.use("/dataOperation", dataO);


const isAuth = (req, res, next) => {
    if(req.session.isAuth) {
        next()

    } else {
        res.redirect("/login")
    }
}

app.get("/", (req, res) => {
    // executeCrudOperation();
    // res.send("This app tries to store test results.");
    res.render('index')
})

app.get("/userProfile", isAuth, (req,res) => {
    res.render("userProfile", {username: req.session.username});
})
app.get("/login", (req, res) => {
    res.render("login");
})
app.get("/register", (req, res) => {
    res.render("register");
})
app.post("/login", async (req, res) => {
    const {username, password} = req.body;

    const user = await UserModel.findOne({username})

    if(!user) {
        return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        console.log("login failed")
        return res.redirect('register')
    }

    req.session.isAuth = true;
    // try to set expiry time to one day
    req.session.cookie.expires = new Date(Date.now() + 3600000*24);
    req.session.username = username;
    console.log(username, "has logged in")
    res.redirect("/userProfile")
})
app.post("/register", async (req, res) => {
    const {username, email, password} = req.body;

    let user = await UserModel.findOne({username});

    if(user) {
        return res.redirect('/register')
    }

    const hashedPw = await bcrypt.hash(password, 12);
    user = new UserModel({
        username,
        email,
        password: hashedPw
    });

    await user.save();

    res.redirect('/login')
})

app.post("/logout", (req, res) => {
    req.session.destroy((err)=>{
        if(err) throw err
        res.redirect('/login')
    })
})


app.listen(8030, () => {
    console.log("Server started on port 8030");
})
