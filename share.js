/* eslint-disable no-console */
const ShareService = require('./lib/share-service.js');
const UserService = require('./lib/user-service.js');

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
  const us = new UserService();
  const ss = new ShareService();
  console.log(e);
  const req = JSON.parse(e.body);
  console.log(req);
  const cognitoId = e.requestContext.identity.cognitoAuthenticationProvider.replace(/.*CognitoSignIn:/, '');
  console.log(`CognitoId: ${cognitoId}`);
  us.getUserInfo(cognitoId).then(user => ss.shareFile(`private/${e.requestContext.identity.cognitoIdentityId}/${req.filePath}`, user.email, req.to))
    .then((shareId) => {
      console.log(shareId);
      cb(null, JSON.stringify({ status: 'ok', shareId }));
    });
};
