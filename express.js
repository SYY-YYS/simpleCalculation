
import express from 'express';

import cors from "cors";
import {executeCrudOperation} from "./mongoOperation.js";
import UserModel from './Model/UserModel.js';
import dataO from "./router/dataOperation.js";
import ejs from 'ejs';

import jwt from 'jsonwebtoken'
import cookies from 'cookie-parser'


import passport from 'passport';
// import authRoute from './router/auth.js'




import assert from 'assert'

const app = express();

// const clientUrl = 'https://syy-yys.github.io/math-training-by-python'

import dotenv from 'dotenv';
dotenv.config();

const clientUrl = process.env.Client_URL;

const clientDomain = process.env.cors_domain;


// session for cookies
import session from 'express-session';
import MongoDBSession from 'connect-mongodb-session';

let MongoSession = MongoDBSession(session);

// tried a new uri for mongoose
const uri = process.env.Mongoose_URI;

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

import passportSetup from './passport.js'


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
        // secure: true,
        sameSite: 'lax',
        // partitioned: true,
        // httpOnly: true,
        maxAge: 3600000*24
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
    res.set("Access-Control-Allow-Credentials", 'true')
    res.set("Access-Control-Allow-Headers", clientDomain)
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

// app.use("/auth", authRoute);


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
    passport.authenticate('google', { failureRedirect: '/login/failed', failureMessage: true }),
    function(req, res) {
      res.redirect('/');
    });

app.get("/", (req, res) => {
    // executeCrudOperation();
    // res.send("This app tries to store test results.");
    res.render('index')
})

app.get("/login/failed", (req,res) => {
    res.send("login failed")
})

app.get("/userProfile", isAuth, async (req,res) => {
    const username = req.session.username;
    const user = await UserModel.findOne({username})

    // const sendingData = [
    //     username,
    //     user.minTime,
    //     user.averageTimeOf1Calculation,
    //     user.TotalTrialNumber
    // ]
    
    const sendingData = {
        username: username,
        mintime: parseFloat(user.minTime.toJSON()["$numberDecimal"]),
        averagetime: parseFloat(user.averageTimeOf1Calculation.toJSON()["$numberDecimal"]),
        totaltrialnumber: parseFloat(user.TotalTrialNumber.toJSON()["$numberDecimal"])
    };
    res.send(sendingData);
})

// function authenticateToken(req, res, next) {
//     const authHeader = req.headers['authorization']
//     const token = authHeader && authHeader.split(' ')[1]
//     if (token == null) return res.status(401)
    
//     jwt.verify(token,jwtSecret, (err, user) => {
//         if(err) return res.sendStatus(403)
//         req.user = user
//         next()
//     })
// }


app.get("/login", (req, res) => {
    console.log(req.session, req.cookies)
    const token = req.cookies.token;
    
    if (req.session.isAuth) return res.send(true)

    console.log(token)
    if (token) {
        const decoded = jwt.verify(token, jwtSecret)
        console.log(decoded)
        // check if expires
        if (decoded.exp < Date.now()/1000){
            res.send('token expired')
        } else {
            console.log(decoded.exp - Date.now()/1000)
            res.send(decoded.user)
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
    console.log(req.useragent.os)
    const {username, password} = req.body;

    const user = await UserModel.findOne({username})

    if(!user) {
        // return res.redirect(clientUrl + '/login');
        console.log(username + "not existed")
        return res.send('username not found')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        console.log(username + "login failed")
        // return res.redirect(clientUrl + '/register')
        return res.send("wrong password")
    }
    

    req.session.isAuth = true;
    req.session.username = username;


    // below try JWT
    const signingData = {
        user: user.username
    }
    
    const token = jwt.sign(signingData, jwtSecret, {expiresIn: 1000*60*60})

    
    console.log(username, "has logged in")
    // send cookies to frontend?
    // res.cookie("id", req.session.id,{
    //     httpOnly: false,
    //     sameSite: 'none',
    //     secure: true,
    //     partitioned: true
    // });


    res.cookie('token', token, {
        maxAge: 1000*60*15, 
        httpOnly: true,
        // secure: true,
        sameSite: 'lax'
    })


    res.send('loggedin')

    

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
