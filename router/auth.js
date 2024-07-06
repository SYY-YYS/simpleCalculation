import express from 'express';
let router = express.Router();
import passport from 'passport';


router.get("/login/failed", (req,res) =>{
    res.status(401).json({
        error: true,
        message: "Log in failure"
    })
})


router.get(
    "/google/callback",
    passport.authenticate("google",{
        successRedirect: process.env.Client_URL,
        failureRedirect: "/login/failed"
    })
)

export default router;