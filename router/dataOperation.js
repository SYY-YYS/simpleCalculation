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


router.route("/")
.get(async (req, res) => {
    // executeCrudOperation("checkCurrentSize", true);
    if (req.session.isAuth) {
        res.send("enter the detailed info")
    } else {
        res.redirect('/login')
    }
});

// Logic:
// set a updateFirstData
router.route("/firstupdate").post(async (req, res) => {
    const username = req.session.username;
    // const {timesOfCalculating, minTime, averagetime, trialnumber} = req.body;
    
    const user = await updateFirstData(username, 1, 1.5,2.0,10)
    console.log(user)
    res.redirect('/')
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