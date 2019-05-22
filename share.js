/* eslint-disable comma-dangle */
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
  const cognitoId = e.requestContext.identity.cognitoAuthenticationProvider.replace(/.*CognitoSignIn:/, '');
  us.getUserInfo(cognitoId).then(user => ss.shareFile(`private/${e.requestContext.identity.cognitoIdentityId}/${req.filePath}`, user.email, req.to))
    .then((shareId) => {
      cb(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ status: 'ok', shareId }),
      });
    });
};

module.exports.listShared = (e, ctx, cb) => {
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
  const cognitoId = e.requestContext.identity.cognitoAuthenticationProvider.replace(/.*CognitoSignIn:/, '');
  us.getUserInfo(cognitoId).then(user => ss.listSharedFiles(e.pathParameters.type, user.email))
    .then((filesWithPrefixes) => {
      const files = [];
      filesWithPrefixes.forEach((fwp) => {
        files.push(
          Object.assign(fwp, { filePath: fwp.filePath.replace(/private\/[^:]+:[^/]+\//, '') })
        );
      });
      cb(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ files }),
      });
    });
};

module.exports.deleteShare = (e, ctx, cb) => {
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
  const cognitoId = e.requestContext.identity.cognitoAuthenticationProvider.replace(/.*CognitoSignIn:/, '');
  us.getUserInfo(cognitoId)
    .then(user => ss.deleteShare(
      e.pathParameters.id,
      e.pathParameters.type,
      user.email
    ))
    .then(() => {
      cb(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: 'ok',
      });
    });
};


module.exports.shareLink = (e, ctx, cb) => {
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
  const cognitoId = e.requestContext.identity.cognitoAuthenticationProvider.replace(/.*CognitoSignIn:/, '');
  us.getUserInfo(cognitoId)
    .then(user => ss.shareLink(
      e.pathParameters.id,
      user.email
    ))
    .then((res) => {
      console.log(res);
      cb(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(res),
      });
    });
};
