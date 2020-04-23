'use strict';

module.exports.manageUser = (event, context, callback) => {
  console.log("event=>",event);
  console.log("context=>",context);
  
  if(event.headers["Authorization"]){
      let username = getUserName(event.headers["Authorization"]);
      console.log("user name",username);
      const response = {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin" : "*",
            "Access-Control-Allow-Credentials" : true
          },
          body: JSON.stringify({
            username: `Hello ${username}`
          })
        };
        
      return callback(null, response);    
  }

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin" : "*",
      "Access-Control-Allow-Credentials" : true
    },
    body: JSON.stringify({
      message: 'Hello There'
    }),
  };

  callback(null, response);
};


function getUserName(authHeader){
    let id_token = authHeader.split(" ")[1];
    let body = id_token.split(".")[1];
    let bodyObj = Buffer.from(body, 'base64').toString('ascii');

    console.log("bodyObj=>",bodyObj);
    
    return JSON.parse(bodyObj)["cognito:username"];
}