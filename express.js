
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

// for allowing connection with frontend?
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    next();
});


// for parsing body (post method)
app.use(express.urlencoded({extended: true}))
// app.use(cors());
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

app.get("/userProfile", isAuth, async (req,res) => {
    const username = req.session.username;
    const user = await UserModel.findOne({username});

    res.render("userProfile", {
        username: username,
        mintime: user.minTime,
        averagetime: user.averageTimeOf1Calculation,
        totoltrialnumber: user.TotalTrialNumber
    });
})
app.get("/login", (req, res) => {
    if(req.session.username) {
        res.redirect("userprofile");
    }else {
        res.render("login");
    }
})
app.get("/register", (req, res) => {
    res.render("register");
})

// app.get("/dataOperation", async (req,res) => {
//     console.log(req.session)
//     if (req.session.isAuth) {
//         console.log("session is fine")
//         res.send("loggedin")
//     } else {
//         console.log("session is failed")
//         res.send("failed")
//         // res.redirect('/login')
//     }
// })

app.post("/login", async (req, res) => {
    const {username, password} = req.body;

    const user = await UserModel.findOne({username})

    if(!user) {
        return res.redirect('http://localhost:3000/login');
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        console.log("login failed")
        return res.redirect('http://localhost:3000/register')
    }

    req.session.isAuth = true;
    // try to set expiry time to one day
    req.session.cookie.expires = new Date(Date.now() + 3600000*24);
    // req.session.cookie.sameSite = 'lax';
    req.session.username = username;
    
    console.log(username, "has logged in")
    // send cookies to frontend?
    res.cookie("id", req.session.id,{
        httpOnly: false,
        sameSite: 'lax',

    });
    res.redirect('http://localhost:3000/mathapp')
    // res.redirect('userprofile')
    // res.redirect("file:///C:/Users/18048/OneDrive/Desktop/GitHub/previous/react/math-training-by-python/index.html")
})
app.post("/register", async (req, res) => {
    const {username, email, password} = req.body;

    let user = await UserModel.findOne({username});

    if(user) {
        return res.redirect('http://localhost:3000/register')
    }

    const hashedPw = await bcrypt.hash(password, 12);
    user = new UserModel({
        username,
        email,
        password: hashedPw
    });

    await user.save();

    res.redirect('http://localhost:3000/login')
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
