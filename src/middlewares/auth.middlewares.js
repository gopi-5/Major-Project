import dotenv from "dotenv"
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/users.model.js";
dotenv.config({path:'./.env'})
const verifyjwt = asyncHandler(async (req, res, next) => {


    try {
        const token = req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer ", "")
    
    
    
        if (!token) {
          throw new ApiError(401, "Unauthorized request");
        }
    
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decoded._id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiError(404, "Invalid Access Token")
    
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid Access Token")
    }
})
export default verifyjwt;
