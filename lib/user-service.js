/* eslint-disable no-console */
/* eslint-disable comma-dangle */
// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');

class UserService {
  constructor() {
    this.cognitoPoolId = process.env.COGNITO_IDENTITY_POOL_ID;
  }

  getUserInfo(cognitoId) {
    const cognito = new AWS.CognitoIdentityServiceProvider();
    return cognito.adminGetUser({ UserPoolId: this.cognitoPoolId, Username: cognitoId }).promise();
  }
}

module.exports = UserService;
