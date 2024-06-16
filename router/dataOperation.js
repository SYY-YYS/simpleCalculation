import express from 'express';
// import mongoose from "mongoose";
import UserModel from '../Model/UserModel.js';
import session from 'express-session';



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
    const username = req.session.username;
    console.log(timesOfCalculating, minTime, averagetime, trialnumber, username)

    const userCheck = await UserModel.findOne(
        {username: username,
        OperationStat : {$exists : true}}
    )
    if (userCheck) {
        const user = await executeCrudOperation('update', username, timesOfCalculating, parseFloat(minTime),parseFloat(averagetime),parseFloat(trialnumber))
        console.log(user)
        res.send('updated')
        // res.json(user)
    } else {
        console.log('welcome new user')
        const user = await updateFirstData(username, timesOfCalculating, parseFloat(minTime), parseFloat(averagetime), parseFloat(trialnumber))
        console.log(user)
        res.send('updated')
        // res.json(user)
    }
})

export async function updateFirstData(username, timesOfCalculating, minTime, averagetime, trialnumber) {
    const user = await UserModel.findOne({username: username})

    user.OperationStat = {
        [timesOfCalculating]: {
            averagetime: averagetime,
            mintime: minTime,
            trialnumber: trialnumber
        }
    };

    user.averageTimeOf1Calculation = averagetime;
    user.TotalTrialNumber = trialnumber;
    user.minTime = minTime;

    await user.save()

    return user;
}

export default router;