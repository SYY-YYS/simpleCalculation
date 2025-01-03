
import express from 'express';

import cors from "cors";
import {executeCrudOperation} from "./mongoOperation.js";
import UserModel from './Model/UserModel.js';
import dataO from "./router/dataOperation.js";
import ejs from 'ejs';

import jwt from 'jsonwebtoken'
import cookies from 'cookie-parser'

import passport from 'passport';

const app = express();

// const clientUrl = 'https://syy-yys.github.io/math-training-by-python'

// import { LocalStorage } from 'node-localstorage';
// localStorage = new LocalStorage()

import dotenv from 'dotenv';
dotenv.config();

const clientUrl = process.env.CLIENT_URL;

const clientDomain = process.env.CORS_DOMAIN;


// session for cookies
import session from 'express-session';
import MongoDBSession from 'connect-mongodb-session';

let MongoSession = MongoDBSession(session);

// tried a new uri for mongoose
const uri = process.env.MONGOOSE_URI;

const jwtSecret = process.env.JWT_SECRET;

const store = new MongoSession({
    uri: uri,
    databaseName: "testapi",
    collection: "mySessions"
})

import mongoose from "mongoose";

mongoose.connect(uri).then((res) => {
    console.log("MongoDB connected by mongoose.")
});

import passportSetup from "./passport.js"

// password hashing
import bcrypt from 'bcrypt';

app.set("view engine", "ejs")

app.set('trust proxy', 1)

// app.use(cors({
//     credentials: true,
// }))

app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        secure: true, 
        sameSite: 'none',
        partitioned: true,
        httpOnly: true,
        maxAge: 3600000*24,
        domain: '.samuelsiu.work',
        path: "/"
    }
}))


app.use(passport.initialize());
app.use(passport.session());

import useragent from 'express-useragent';

app.use(useragent.express())

app.use(cookies())


// for allowing connection with frontend?
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", clientDomain);
    res.set("Access-Control-Allow-Credentials", 'true');
    res.set("Access-Control-Allow-Headers", 'Authorization')
    next();
});


// for parsing body (post method)
app.use(express.urlencoded({extended: true}))
// app.use(cors());
app.use(function (req, res, next) {
    console.log(req.ip,req.useragent.os, Date.now())
    // console.log(req.session)
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

// routes by google outh 20
app.get('/login/google', passport.authenticate('google'));

app.get('/oauth2/redirect/google',
    passport.authenticate('google', { 
        failureRedirect: '/login/failed', 
        failureMessage: true,
        // successRedirect: clientUrl,
    }),
    function(req, res) {
        req.session.isAuth = true;
        console.log("req.user:" + req.user)
        req.session.email = req.user.email


        // const signingData = {
        //     user: req.user.displayName
        // }
        // const token = jwt.sign(signingData, jwtSecret, {expiresIn: 1000*60*60})
        // res.cookie(
        // "token", token, {
        //         httpOnly: false,
        //         sameSite: 'none',
        //         secure: true,
        //         partitioned: true,
        //         domain: '.samuelsiu.work',
        //         path: "/"
        //     }
        // )

        console.log(req.user)
        res.redirect(clientUrl)
        // if(req.useragent.os == )
        // res.render("index", {clientUrl});
    });



app.get("/login/failed", (req,res) => {
    res.send("login failed")
})

app.get("/", (req, res) => {
    // executeCrudOperation();
    // res.send("This app tries to store test results.");
    res.render('index')
})

app.get("/userProfile", async (req,res) => {
    let email = req.session.email;

    console.log("req.user: " + req.user)

    let user;

    if (email) {
        user = await UserModel.findOne({email:email})
    } else {
        console.log("check req.user: " + req.user)

        const token =req.header("Authorization") ? req.header("Authorization").split(" ")[1]:'null'
        // console.log(token)
        if (token !== "null") {
            const decoded = jwt.verify(token, jwtSecret)
            console.log(decoded)
            // check if expires
            if (decoded.exp < Date.now()/1000){
                res.status(403).send('token expired')
            } else {
                console.log(decoded.exp - Date.now()/1000)
                user = await UserModel.findOne({email: email})
                // let username = user.username
            }
        } else {
            res.status(401).send(false);
        }
    }

    // try user.OperationStat to check if ppl check without any data
    if (user.OperationStat) {
        const sendingData = {
            username: user.username,
            mintime: parseFloat(user.minTime.toJSON()["$numberDecimal"]),
            averagetime: parseFloat(user.averageTimeOf1Calculation.toJSON()["$numberDecimal"]),
            totaltrialnumber: parseFloat(user.TotalTrialNumber.toJSON()["$numberDecimal"])
        };
        res.send(sendingData);
    } else {
        res.status(404).send(false);
    }
})
app.get("/login", (req, res) => {
    console.log(req.session, req.cookies)
    // const token = req.cookies.token;
    
    if (req.session.isAuth) return res.send(true)

    const token =req.header("Authorization") ? req.header("Authorization").split(" ")[1]:'null'
    console.log(token)
    if (token !== "null") {
        const decoded = jwt.verify(token, jwtSecret)
        console.log(decoded)
        // check if expires
        if (decoded.exp < Date.now()/1000){
            res.send('token expired')
        } else {
            console.log(decoded.exp - Date.now()/1000)
            res.send(decoded.email)
        }
    } else {
        res.send(false);
    }
});

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

    console.log(req.body)
    const {username, password} = req.body;

    // just find the username with password
    const user = await UserModel.findOne(
        {username:username, 
        password : {$exists : true}
    })

    if(!user) {
        // return res.redirect(clientUrl + '/login');
        console.log(username + "not existed")
        return res.status(403).send('user not found')
    }

    console.log("user.password: " +user.password)
    if (user.password == undefined) {
        return res.status(400).send("you may try gmail login")
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        console.log(username + "login failed")
        // return res.redirect(clientUrl + '/register')
        return res.status(403).send("wrong password")
    }
    

    req.session.isAuth = true;
    // deprecated
    // req.session.username = username;
    req.session.email = user.email;

    console.log(user.email, " has logged in")
    console.log(req.useragent.os)

    // below try JWT
    const signingData = {
        email: user.email
    }
    const token = jwt.sign(signingData, jwtSecret, {expiresIn: 1000*60*60})

    // if user is ios, then send jwt and let react set it
    if(req.useragent.os.includes("OS X")) {
        console.log("ios login")
        res.send(token)
    } else {
        console.log("non ios")
        res.send('loggedin')
    }
    
    
    
    // send cookies to frontend?
    // res.cookie("id", req.session.id,{
    //     httpOnly: false,
    //     sameSite: 'none',
    //     secure: true,
    //     partitioned: true
    // });

    // res.cookie('token', token, {
    //     maxAge: 1000*60*15, 
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: 'none',
    //     partitioned: true
    // })


    
    // res.redirect('userprofile')
    // res.redirect("file:///C:/Users/18048/OneDrive/Desktop/GitHub/previous/react/math-training-by-python/index.html")
})
app.post("/register", async (req, res) => {
    const {username, email, password} = req.body;

    let user = await UserModel.findOne({username});

    if(user) {
        return res.send('username was taken!')
    }
    console.log(email)
    let checkEmail = await UserModel.findOne({email: email});
    console.log(checkEmail)

    if(checkEmail) {
        return res.send('email was taken!')
    }



    const hashedPw = await bcrypt.hash(password, 12);
    user = new UserModel({
        username,
        email,
        password: hashedPw
    });


    // const error = user.validateSync();
    // assert.equal(error.errors['email'].message, '')

    await user.save()
    .then(savedUser => {
        console.log(savedUser)
        res.send("registered!")
    }).catch((err) => {
        console.log(err)
    })

    // UserModel.init()
    // .then(()=>UserModel.create(user))
    // .catch(err => {
    //     assert.ok(err);
    //     assert.ok(!err.errors);
    //     assert.ok(err.message.indexOf('duplicate key error') !== -1)
    // })


    
})

app.post("/logout", (req, res) => {
    console.log(req.session)
    // actually can send one more cookie as indicator of logout..
    req.session.destroy((err)=>{
        if(err) throw err
        res.set("Access-Control-Allow-Origin", clientDomain)
        res.send('loggedout')
    })
    // res.redirect(clientUrl + '/login')
})


app.listen(8030, () => {
    console.log("Server started on port 8030");
})
