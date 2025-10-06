import dotenv from 'dotenv'
import {v2 as cloudinary} from 'cloudinary'
import fs from "fs"
dotenv.config({path:'./.env'})

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret : process.env.API_SECRET
})

const UploadonCloudinary = async (localfilepath) =>{
    try{
        if(localfilepath){
            const response = await cloudinary.uploader.upload(localfilepath, 
            {
                resource_type:'auto'
            })
            console.log("File is uploaded on cloudinary", response.url)
            fs.unlinkSync(localfilepath) 
            return response
            
        }
        else{
            return null
        }
    }
    catch(error){
        fs.unlinkSync(localfilepath)            /* removes the locally saved temporary 
                                        files as the upload operation  got failed */
        return null
    }
}

export default UploadonCloudinary;
