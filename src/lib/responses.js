const createResponse = (statusCode, body)=> {
    return {
        statusCode: statusCode,
        headers: {
          "Access-Control-Allow-Origin" : "*",
          "Access-Control-Allow-Credentials" : true
        },
        body: JSON.stringify(body)
      };
} 

let t = createResponse(200,{message:"Hello there"});
console.log(t);

module.exports = {
    createResponse
}