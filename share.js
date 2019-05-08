/* eslint-disable no-console */
const ShareService = require('./lib/share-service.js');


module.exports.shareFile = (e, ctx, cb) => {
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
  const ss = new ShareService();
  
  // ls.listFiles(`private/${e.requestContext.identity.cognitoIdentityId}/`)
  //   .then(files => cb(null, {
  //     statusCode: 200,
  //     headers: {
  //       'Access-Control-Allow-Origin': '*',
  //       'Access-Control-Allow-Credentials': true,
  //     },
  //     body: JSON.stringify(files),
  //   }))
  //   .catch((err) => {
  //     console.log(err);
  //     cb(null, {
  //       statusCode: err.code || 500,
  //       headers: {
  //         'Access-Control-Allow-Origin': '*',
  //         'Access-Control-Allow-Credentials': true,
  //       },
  //       body: err.message,
  //     });
  //   });
};
