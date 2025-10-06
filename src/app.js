import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

dotenv.config({path:'./.env'})

const app = express();
app.use(cors({                                      /*this is used to allows different origin's url 
                                                        to send requests for data   OR used for "Cross Origin Resource Sharing"*/
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:'16kb'}));              /* this is used to accept json formatted data and 
                                                        then it converts that data into javascript objects */
app.use(express.urlencoded({extended:true, limit:'16kb'}))   /* it has nothing to do with url */
                            /* Use this when the client sends data from an HTML form.

                                Form data looks like this in the request body:

                                name=Kapil&age=22


                                express.urlencoded() parses it so you can access it javascript object:

                                req.body.name // "Kapil"
                                req.body.age  // "22" 
                            */
app.use(express.static('public')) /* this is used to store static assests like pdf an all*/ 

app.use(cookieParser());          /* used to access and set cookies from users browser*/ 

import userRouter from './routes/user.routes.js';

app.use("/api/users", userRouter);


export default app;