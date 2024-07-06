import GoogleStrategy from "passport-google-oauth20";
import passport from "passport";


import dotenv from 'dotenv';
dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.Client_ID,
            clientSecret: process.env.Client_SECRET,
            callbackURL: '/auth/google/callback',
            scope: ["profile", "email"],
        },
        function verify(accessToken, refreshToken, profile, callback) {
            callback(null, profile)
        }
    )
)


export default passport;