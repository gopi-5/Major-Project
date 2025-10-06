import app from "./app.js";
import connect_DB from "./db/index.js";
import dotenv from 'dotenv'

dotenv.config({path:'./.env'})


connect_DB()
.then(()=>{
    app.listen(process.env.PORT, ()=>{
        console.log(`server is running on port: ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log(`MONGODB CONNECTION FAILED !!! ${error} `)
    process.exit(1);
})