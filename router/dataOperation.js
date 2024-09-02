import express from 'express';
// import mongoose from "mongoose";
import UserModel from '../Model/UserModel.js';
import session from 'express-session';

import jwt from 'jsonwebtoken'

const jwtSecret = process.env.JWT_SECRET;

let router = express.Router();

import { executeCrudOperation } from '../mongoOperation.js';


// mongoose.connect(uri).then((res) => {
//     console.log("MongoDB connected by mongoose.")
// }).catch((err)=>{
//     if(err) throw err;
// });


// router.use(cors())

router.route("/")
.get(async (req, res) => {
    // executeCrudOperation("checkCurrentSize", true);
    console.log(req.session)
    // res.set("Access-Control-Allow-Origin", "http://localhost:3000")
    // res.set("Access-Control-Allow-Credentials", 'true')
    if (req.session.isAuth) {
        console.log("session is fine")
        res.send("loggedin")
    } else {
        console.log("session is failed")
        res.send("failed")
        // res.redirect('/login')
    }
});

// Logic:
// set a updateFirstData
router.route("/update").post(async (req, res) => {
    const {timesOfCalculating, minTime, averagetime, trialnumber} = req.body;
    const email = (req.session.email) ? req.session.email : req.session.passport.user.email;
    console.log(timesOfCalculating, minTime, averagetime, trialnumber, email)

    // check localstorage token user after checking cookie
    if(!email) {
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
                email = decoded.email
            }
        } else {
            res.status(401).send(false);
        }
    }

    const userCheck = await UserModel.findOne(
        {email: email,
        OperationStat : {$exists : true}}
    )
    console.log("usercheck: " + userCheck)
    // got error here "userCheck"
    if (userCheck != []) {
        const user = await executeCrudOperation('update', email, timesOfCalculating, parseFloat(minTime),parseFloat(averagetime),parseFloat(trialnumber))
        console.log(user)
        res.send('updated')
        // res.json(user)
    } else {
        console.log('welcome new user')
        const user = await updateFirstData(email, timesOfCalculating, parseFloat(minTime), parseFloat(averagetime), parseFloat(trialnumber))
        console.log(user)
        res.send('updated')
        // res.json(user)
    }
})

export async function updateFirstData(email, timesOfCalculating, minTime, averagetime, trialnumber) {
    const user = await UserModel.findOne({email: email})

    user.OperationStat = {
        [timesOfCalculating]: {
            averagetime: averagetime,
            mintime: minTime,
            trialnumber: trialnumber
        }
    };
    
    console.log("averagetime: " + averagetime, typeof(averagetime))
    user.averageTimeOf1Calculation = averagetime;
    user.TotalTrialNumber = trialnumber;
    user.minTime = minTime;

    await user.save()

    return user;
}

export default router;