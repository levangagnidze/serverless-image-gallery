'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.createNewUser = async event => {
  console.log("Event received from congnito");
  console.log(event);

  const timestamp = new Date().getTime();
  
  if (typeof event.userName !== 'string') {
      console.error('Validation Failed');
      return event;
  }

  let params = {
    TableName: process.env.USER_TABLE_NAME,
    Item: {
      username: event.userName,
      ...(event.request.userAttributes.phone_number ? {phone : event.request.userAttributes.phone_number}: {} ),
      ...(event.request.userAttributes.email ? {email : event.request.userAttributes.email}: {} ),
      ...(event.request.userAttributes.name ? {name : event.request.userAttributes.name}: {} ),
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  console.log("item-> " , JSON.stringify(params));
  
  try
  {
      await dynamoDb.put(params).promise();
  }
  catch(err)
  {
      console.log("error->",err);
  }
  
  return event;
};
