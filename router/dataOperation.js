import express from 'express';

let router = express.Router();

import { executeCrudOperation } from '../mongoOperation.js';


router.route("/")
.get((req, res) => {
    // executeCrudOperation("checkCurrentSize", true);
    res.send("enter the detailed info")
});



// router.route("/register")
// .post((req, res) => {
//     // res.send("succeeded!");
//     res.status(200).send(req.body)
// });

export default router;