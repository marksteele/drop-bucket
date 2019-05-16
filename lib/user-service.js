/* eslint-disable no-console */
/* eslint-disable comma-dangle */
// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');

class UserService {
  constructor() {
    this.cognitoUserPoolId = null;
  }

  getUserInfo(cognitoId) {
    const cognito = new AWS.CognitoIdentityServiceProvider();
    const ssm = new AWS.SSM();
    return new Promise((resolve) => {
      if (this.cognitoUserPoolId) {
        resolve(this.cognitoUserPoolId);
      }
      resolve(
        ssm.getParameter({ Name: process.env.COGNITO_USER_POOL_ID })
          .promise().then((data) => {
            this.cognitoUserPoolId = data.Parameter.Value;
            return this.cognitoUserPoolId;
          })
      );
    })
      .then(cognitoUserPoolId => cognito.adminGetUser(
        { UserPoolId: cognitoUserPoolId, Username: cognitoId }
      ).promise())
      .then((userInfo) => {
        console.log(userInfo);
        const User = {};
        User.Username = userInfo.Username;
        userInfo.UserAttributes.forEach((attr) => {
          User[attr.Name] = attr.Value;
        });
        console.log(User);
        return User;
      });
  }
}

module.exports = UserService;
