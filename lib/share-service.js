/* eslint-disable no-console */
/* eslint-disable comma-dangle */
// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');
const moment = require('moment');

class ShareService {
  constructor() {
    this.bucket = process.env.FILE_BUCKET_NAME;
    this.dynamoDbTable = process.env.DYNAMODB_TABLE_NAME;
    this.cognitoPoolId = process.env.COGNITO_IDENTITY_POOL_ID;
    this.siteAddress = process.env.WEBSITE_URL;
    this.sharePath = process.env.SHARE_PATH;
  }

  shareFile(filePath, to, from) {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const cognito = new AWS.CognitoIdentityServiceProvider();
    const s3 = new AWS.S3();
    const ses = new AWS.SES();
    return cognito.adminGetUser({ UserPoolId: this.cognitoPoolId, Username: email }).promise()
      .then(user => {
        // Check user status. If user isn't active
      });
      s3.headObject({ Bucket: this.bucket, Key: filePath }).promise()
      .then(metadata => dynamodb.put({
        TableName: this.dynamoDbTable,
        Item: {
          email,
          filePath,
          ttl: moment(metadata.LastModified).add(7, 'd').unix(),
        }
      }).promise())
      .then(() => )
      .then(user => {

        
      })
      .catch(err => {
        // Send an invite & a notification
      });
  }

  getShareLink(filePath, email) {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const s3 = new AWS.S3();
    return dynamodb.get({
      TableName: this.dynamoDbTable,
      Key: {
        filePath,
        email
      }
    })
      .then((record) => {
        if (record.Item !== undefined) {
          return Promise.resolve(
            s3.getSignedUrl('getObject', {
              Bucket: this.bucket,
              Key: filePath,
              Expires: moment(record.Item.ttl).add(7, 'd').unix() - Math.ceil((Date.now() / 1000))
            })
          );
        }
        return Promise.reject(new Error('Invalid record'));
      });
  }

  listSharedFiles(email) {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    return dynamodb.query({
      TableName: this.dynamoDbTable,
      KeyConditionExpression: 'email = :hkey',
      ExpressionAttributeValues: {
        ':hkey': email,
      }
    }).promise().then(res => res.Items);
  }

  sendInvite(to, from) {
    return ses.sendEmail(
      {
        Source: process.env.ADMIN_EMAIL,
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Body: {
            Text: {
              Charset: 'UTF-8',
              Data: `${from} wants to invite you to share files with DropBucket`,
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: `Please create an account at ${this.siteAddress} in order to gain access to shared files.`,
          },
        },
      },
    ).promise();
  }

  sendShareEmail(to, from, url) {
    return ses.sendEmail(
      {
        Source: process.env.ADMIN_EMAIL,
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Body: {
            Text: {
              Charset: 'UTF-8',
              Data: `${from} wants to share a file with you using DropBucket`,
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: `The file url is ${url}`,
          },
        },
      },
    ).promise();
  }
}

module.exports = ShareService;
