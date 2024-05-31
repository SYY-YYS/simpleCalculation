import express from 'express';
let router = express.Router();

import { executeCrudOperation } from '../mongoOperation.js';


router.route("/")
.get((req, res) => {
    executeCrudOperation();
    res.send("enter the detailed info")
});


export default router;