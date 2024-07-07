import { Double } from "mongodb";
import mongoose from "mongoose";


const UserSchema = new mongoose.Schema(
    {
        username : {
            type: String,
            required: true,
            max: [20, 'username too long']
        },
        email : {
            type: String,
            required: true,
            unique: true
        },
        password : {
            type: String,
            max: [20, 'password too long']
        },
        OperationStat : {
            type: Object,
        },
        averageTimeOf1Calculation : {
            type: mongoose.Types.Decimal128,
        },
        TotalTrialNumber : {
            type: mongoose.Types.Decimal128,
        },
        minTime : {
            type: mongoose.Types.Decimal128,
        }

    }
);

export default mongoose.model("userdatas", UserSchema);