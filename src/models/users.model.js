import dotenv from 'dotenv'
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
dotenv.config({path:'./.env'})

const userSchema = new mongoose.Schema({
    watchHistory : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Video'
    }],
    username : {
        type : String,
        required : true,
        unique : true,
        index : true,                   /* helps in search for usernames */
        trim : true,
        lowercase : true
    },
    email : {
        type : String,
        required : true,
        trim : true,
        unique:true
    },
    fullname : {
        type : String,
        required : true,
        trim : true,
        index:true
    },
    avatar : {                          /* used to storing urls only  */
        type : String,              /* we r going to use "cloudinary url service" */
        required : true,
        
        
    },
    coverImage : {
        type : String,              /* we r going to use "cloudinary url service" */
    
    },
    password : {
        type : String,
        required : [true, 'Password is required'],
       
    },
    refreshToken : {
        type : String,
        
    },
}, {timestamps:true});


userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
    else{
        next();
    }
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function() {
    return jwt.sign({
        _id: this._id,
        email:this.email,
        username : this.username,
        fullname:this.fullname
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    })
}
userSchema.methods.generateRefreshToken = async function() {
    return jwt.sign({
        _id: this._id,
        email:this.email,
        username : this.username,
        fullname:this.fullname
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    })
}

export const User = mongoose.model('User', userSchema);
