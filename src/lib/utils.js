const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const getSignedURL = async (backetName,operation ,key)=>{
    
    const params = {
            Bucket: backetName, 
            Key: key
    }
    return s3.getSignedUrlPromise(operation , params);
}

const getUserName = (event) => {
    
    if(!event.headers["Authorization"]){
        throw new Error('Authorization not provided');
    }

    try{

        let id_token = event.headers["Authorization"].split(" ")[1];
        let body = id_token.split(".")[1];
        let bodyObj = Buffer.from(body, 'base64').toString('ascii');

        console.log("bodyObj=>",bodyObj);
        return JSON.parse(bodyObj)["cognito:username"];
    }catch(error){
        console.log(error);
        throw(error);
    }
}

module.exports = {
    getUserName,
    getSignedURL
};




