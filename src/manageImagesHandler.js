'use strict';

const {getUserName} = require('./lib/utils.js');
const {createResponse} = require('./lib/responses.js');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

async function getSignedURL(backetName,operation ,key, name){
    
    const params = {
            Bucket: backetName, 
            Key: key, 
            Metadata: {
                ...(name ? {'name' : name}: {} )
            }};
    
    return s3.getSignedUrlPromise(operation , params);
}

module.exports.manageImages = async (event, context, callback) => {
    console.log("event=>",event);
    console.log("context=>",context);
    
    if(event.httpMethod === 'POST'){
        let objectId = new Date().getTime();
        let objectKey = `Folder/${objectId}.jpeg`;
        
        let url = await getSignedURL(process.env.IMAGE_GALLERY_BUCKET,'putObject',objectKey,'test');
        let response = createResponse(200,{signedURL: url});
        return callback(null, response);
    }
    
    let response = createResponse(500,{message: "Something went wroing in the function"});
    callback(null, response);  
};

module.exports.manageImage = async (event, context, callback) => {
    console.log("event=>",event);
    console.log("context=>",context);
  
    let response = createResponse(200,{message: "Hello from manage image function"});
    callback(null, response);  
};
