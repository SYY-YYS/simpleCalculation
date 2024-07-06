import GoogleStrategy from "passport-google-oauth20";
import passport from "passport";


import dotenv from 'dotenv';
dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.Client_ID,
            clientSecret: process.env.Client_SECRET,
            callbackURL: '/oauth2/redirect/google',
            scope: ["profile", "email"],
        },
        function verify(accessToken, refreshToken, profile, callback) {
            console.log(profile)
            return callback(null, profile)
        }
    )
)

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((obj, done) => {
    done(null, obj);
});

export default passport;