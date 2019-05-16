/* eslint-disable import/no-extraneous-dependencies */
const AWS = require('aws-sdk');

module.exports.disable = (e, ctx, cb) => {
  const cognito = new AWS.CognitoIdentityServiceProvider();
  const ses = new AWS.SES();
  cognito.adminDisableUser({ UserPoolId: e.userPoolId, Username: e.request.userAttributes.email })
    .promise()
    .then(() => ses.sendEmail(
      {
        Source: process.env.ADMIN_EMAIL,
        Destination: {
          ToAddresses: [process.env.ADMIN_EMAIL],
        },
        Message: {
          Body: {
            Text: {
              Charset: 'UTF-8',
              Data: `Verify user ${e.request.userAttributes.email}`,
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: 'DropBucket user requires activation',
          },
        },
      },
    ).promise())
    .then(() => {
      cb(null, e);
    });
};
