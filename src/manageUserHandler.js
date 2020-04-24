'use strict';

const {getUserName} = require('./lib/utils.js');
const {itemToUser} = require('./lib/mappers.js');
const {createResponse} = require('./lib/responses.js');
const AWS = require('aws-sdk');

var dynamodb = new AWS.DynamoDB();

module.exports.manageUser = async (event, context, callback) => {
  console.log("event=>",event);
  console.log("context=>",context);
  
      try{
        let username = getUserName(event);
        console.log("user name",username);
        
        let params = {
          Key: {
           "username": {
             S: username
            }
          }, 
          TableName: process.env.USER_TABLE_NAME
         };

        let data = await dynamodb.getItem(params).promise();
        
        const response = createResponse(200,itemToUser(data));
        return callback(null, response);   

      }catch(error){
        const response = createResponse(400,{
          message: error.message
        });
        callback(null, response);
      }  
};
