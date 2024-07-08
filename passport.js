import GoogleStrategy from "passport-google-oauth20";
import passport from "passport";
import UserModel from './Model/UserModel.js';


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
        async function verify(accessToken, refreshToken, profile, callback) {
            console.log(profile)
            let user = await UserModel.findOne({email: profile.email})

            // first: check if any records (email)
            if (user) {
                return callback(null, profile)
            } else { //update a new user

                // check if same name taken?
                const username = profile.displayName;
                const email = profile.email;

                user = new UserModel({
                    username,
                    email,
                });
            
                await user.save()
                .then(savedUser => {
                    console.log(savedUser)
                    res.send("registered!")
                }).catch((err) => {
                    console.log(err)
                })
                return callback(null, profile)
            }            
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