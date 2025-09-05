import  Router  from "express";
import {registerUser, loginUser, logoutUser} from "../controllers/user.controllers.js";
import upload from "../middlewares/multer.middleware.js"
import verifyjwt from "../middlewares/auth.middlewares.js"
const userRouter = Router();


userRouter.post('/register', upload.fields([
    {
        name:"avatar",              //same name should be given to the field accepting the image
        maxCount:1

    },
    {
        name:"coverImage",              //same name should be given to the field accepting the image
        maxCount:1
    }
]), registerUser)

userRouter.post('/login', loginUser)

userRouter.post('/logout', verifyjwt,logoutUser)

export default userRouter;