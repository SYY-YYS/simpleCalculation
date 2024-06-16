
import express from 'express';

import cors from "cors";
import {executeCrudOperation} from "./mongoOperation.js";
import UserModel from './Model/UserModel.js';
import dataO from "./router/dataOperation.js";
import ejs from 'ejs';

import assert from 'assert'

const app = express();

// const clientUrl = 'https://syy-yys.github.io/math-training-by-python'

import dotenv from 'dotenv';
dotenv.config();

const clientUrl = process.env.Client_URL;


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

app.set('trust proxy', 1)

// app.use(cors({
//     credentials: true,
// }))

app.use(session({
    secret: "sign cookie",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        secure: true,
        sameSite: 'none',
        partitioned: true,
        httpOnly: true,
        // domain: 'localhost'
    }
}))


// for allowing connection with frontend?
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", clientUrl);
    res.set("Access-Control-Allow-Credentials", 'true')
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
app.get("/login", (req, res) => {
    console.log(req.session)
    if(req.session.isAuth) {
        res.send(req.session.username);
    }else {
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

    const user = await UserModel.findOne({username})

    if(!user) {
        return res.redirect(clientUrl + '/login');
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        console.log("login failed")
        return res.redirect(clientUrl + '/register')
    }
    

    req.session.isAuth = true;
    // try to set expiry time to one day
    req.session.cookie.expires = new Date(Date.now() + 3600000*24);
    // req.session.cookie.sameSite = 'none';
    // req.session.cookie.httpOnly = false;
    // req.session.cookie.secure = true;
    // google new policy: partitioned
    // req.session.cookie.partitioned = true;
    req.session.username = username;
    
    console.log(username, "has logged in", req.session)
    // send cookies to frontend?
    // res.cookie("id", req.session.id,{
    //     httpOnly: false,
    //     sameSite: 'none',
    //     secure: true,
    //     partitioned: true
    // });
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
    req.session.destroy((err)=>{
        if(err) throw err
        res.set("Access-Control-Allow-Origin", "http://localhost:3000")
        res.send('loggedout')
    })
    // res.redirect(clientUrl + '/login')
})


app.listen(8030, () => {
    console.log("Server started on port 8030");
})
