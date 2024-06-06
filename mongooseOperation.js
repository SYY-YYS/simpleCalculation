// deprecated for now: direct logic at dataOperation.js

import mongoose from "mongoose";
import UserModel from './Model/UserModel.js';

const uri = process.env.Mongoose_URI;



export async function mongooseExecute(){
    mongoose.connect(uri).then((res) => {
        console.log("MongoDB connected by mongoose.")
    }).catch((err)=>{
        if(err) throw err;
    });


}

export async function updateFirstData(){

}