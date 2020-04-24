'use strict';

const {getUserName} = require('./lib/utils.js');
const {getSignedURL} = require('./lib/utils.js');
const {createResponse} = require('./lib/responses.js');

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

module.exports.manageImages = async (event, context, callback) => {
    console.log("event=>",event);
    
    var username;
    let backetName = process.env.IMAGE_GALLERY_BUCKET
    try{
        username = getUserName(event); 
    }
    catch(error){
        console.error(error);
        let response = createResponse(400 ,error);
        return callback(null, response);   
    }
    
    if(event.httpMethod === 'POST'){

        let fileName = undefined;
        
        if(event.body){
            let body = JSON.parse(event.body);
            fileName = body.fileName;
        }
        
        let objectId = new Date().getTime();
        let objectKey = `${username}/${objectId}-${fileName}`;
        
        let url = await getSignedURL(backetName,'putObject',objectKey);
        let response = createResponse(200,{signedURL: url});
        return callback(null, response);
    }
    
    if(event.httpMethod === 'GET'){
        var params = {
           Bucket: backetName,
           Prefix: username
        };
        let result = await s3.listObjectsV2(params).promise();
        
        var data = [];
        
        if(result.Contents && Array.isArray(result.Contents)){
            
            data = result.Contents.map(value => {
               let path = value.Key.split("/");
               return {
                    Prefix : path[0],
                    FileName : path[1],
                    LastModified: value.LastModified
               }     
            });
        }
        
        console.log("result=>", result);
        
        let response = createResponse(200, {items:data});
        return callback(null, response);
    }
    
    let response = createResponse(500, {message: "Something went wroing in the function"});
    callback(null, response);  
};

module.exports.manageImage = async (event, context, callback) => {
    console.log("event=>",event);
    console.log("context=>",context);
    
    var username;
    let backetName = process.env.IMAGE_GALLERY_BUCKET
    try{
        username = getUserName(event); 
    }
    catch(error){
        console.error(error);
        let response = createResponse(400 ,error);
        return callback(null, response);   
    }

    let objectKey;
        
    if(event.pathParameters && event.pathParameters["imageid"]){
        let fileName = event.pathParameters["imageid"];
        objectKey = `${username}/${fileName}`;
    }else{
        let response = createResponse(400,{message : "imageid not found!"});
        return callback(null, response);
    }
    
    if(event.httpMethod === 'GET'){
        
        let url = await getSignedURL(backetName,'getObject',objectKey);
        let response = createResponse(200,{signedURL: url});
        return callback(null, response);
    }

    if(event.httpMethod === 'DELETE'){
        
        let url = await getSignedURL(backetName,'deleteObject',objectKey);
        let response = createResponse(200,{signedURL: url});
        return callback(null, response);
    }
  
    let response = createResponse(500, {message: "Something went wroing in the function"});
    callback(null, response);  
};
