import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import {User} from '../models/users.model.js'
import UploadonCloudinary from '../utils/cloudinary.js';
dotenv.config({path:'./.env'})
const generateAccessandrefreshToken = async (userId) => {
    try{
        const user = await User.findById(userId);
        const Accesstoken = await user.generateAccessToken()
        const Refreshtoken = await user.generateRefreshToken()
        user.refreshToken = Refreshtoken;
        await user.save({validateBeforeSave : false});

        return {Accesstoken, Refreshtoken};
    }
    catch(error){
        throw new ApiError(500, "Something went wrong while genterating tokens")

    }


}


export const registerUser = asyncHandler( async (req, res, next)=>{
        console.log("req.body:", req.body);
        const {fullname, email, username, password} = req.body;
        console.log("email: ", email)

        if(
            [fullname, email, username, password].some((field) => field?.trim()==="")
        ){
            throw new ApiError(400, "All fields are required")
        }
        // else
        // {    
        //     {return res
        //     .status(200)
        //     .json(new ApiResponse(200, "ok", { fullname, email, username }));
        //     }
        // }

        const existedUser = await User.findOne({
            $or : [{email}, {username}]
        })

        if(existedUser){
            throw new ApiError(409, "User already existed")
        }

        const avatarLocalPath = req.files?.avatar?.[0]?.path;
        const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

        if(!avatarLocalPath){
            throw new ApiError(400, "Avatar is required");
        }
        const avatar = await UploadonCloudinary(avatarLocalPath);
        // const coverImage = await UploadonCloudinary(coverImageLocalPath);
        let coverImage = null;
        if (coverImageLocalPath) 
        {
            coverImage = await UploadonCloudinary(coverImageLocalPath);
        }


        if(!avatar ){
            throw new ApiError(400, "Avatar is required");
        }

        const user = await User.create({
            fullname,
            email,
            password,
            username:username.toLowerCase(),
            avatar : avatar.url,
            coverImage : coverImage?.url || ""
        })

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
        if(!createdUser){
            throw new ApiError(500, "something went wrong while registering the user")
        }

        return res.status(201).json(
            new ApiResponse(201, createdUser, "user registered successfully")
        )

})


export const loginUser = asyncHandler( async (req, res) => {
    const {email, password} = req.body;

    if(!email){
        throw new ApiError(400, "email is required")
    }

    const user = await User.findOne(
        {email}
    )

    if(!user){
        throw new ApiError(400, "User does not exist")
    }

    const isPasswordValidated = await user.isPasswordCorrect(password)

    if(!isPasswordValidated){
        throw new ApiError(401, "Incorrect password")
    }

    const {Accesstoken, Refreshtoken} = await generateAccessandrefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("AccessToken", Accesstoken, options)
    .cookie("RefreshToken", Refreshtoken, options)
    .json(
        new ApiResponse(200, {user:loggedInUser, Accesstoken, Refreshtoken}, 
            "user logged in successfully")
    )
})

export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {refreshToken : undefined}
        },
        {
            new:true
        }
    
    )
    const options = {
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("AccessToken", options)
    .clearCookie("RefreshToken", options)
    .json(
        new ApiResponse(200, {}, "user logged out")
    )
})

export const refreshAccessToken = asyncHandler( async (req, res)=>{
    const incomingrefreshtoken  = req.cookies?.RefreshToken 

    if(!incomingrefreshtoken) {
        throw new ApiError(401, "unauthorized request");
    }
    try {
        const decodedrefreshtoken = await jwt.verify(incomingrefreshtoken, process.env.REFRESH_TOKEN_SECRET)
        
        const user = await User.findById(decodedrefreshtoken?._id);
    
        if(user.refreshToken !== incomingrefreshtoken){
            throw new ApiError(401, "refresh token is expired or used");
        }
    
        const {Accesstoken, Refreshtoken} = await generateAccessandrefreshToken(user._id);
    
        const options = {
            httpOnly:true,
            secure:true
        }
        res.status(200)
        .cookie("AccessToken", Accesstoken, options)
        .cookie("RefreshToken", Refreshtoken, options)
        .json(
            new ApiResponse(200, {
                Accesstoken, Refreshtoken
            }, "New Access Token is created")
        )
    
    } catch (error) {
        throw new ApiError(400, "Invailed reresh token")
    }
})


// export default {registerUser, loginUser, logoutUser};


