/* eslint-disable no-console */
const ListService = require('./lib/list-service.js');

module.exports.list = (e, ctx, cb) => {
  if (!e.requestContext.identity.cognitoIdentityId) {
    cb(null, {
      statusCode: 403,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: 'Missing authentication',
    });
    return;
  }
  
  const ls = new ListService();
  ls.listFiles(`private/${e.requestContext.identity.cognitoIdentityId}/`)
    .then(files => cb(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(files),
    }))
    .catch((err) => {
      console.log(err);
      cb(null, {
        statusCode: err.code || 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: err.message,
      });
    });
};
