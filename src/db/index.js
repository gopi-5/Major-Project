import mongoose from "mongoose";

import DB_NAME from '../constants.js'




async function connect_DB(){
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        console.log(`MONGODB CONNECTED !! ${connectionInstance.connection.host}`);
    }
    catch(error){
        console.log(`Error: ${error}`);
        process.exit(1);
    }
}

export default connect_DB;