/* eslint-disable no-console */
/* eslint-disable comma-dangle */
// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');
const moment = require('moment');
const uuidv4 = require('uuid/v4');

class ShareService {
  constructor() {
    this.bucket = process.env.FILE_BUCKET_NAME;
    this.dynamoDbTable = process.env.DYNAMODB_TABLE_NAME;
    this.cognitoPoolId = process.env.COGNITO_IDENTITY_POOL_ID;
    this.siteAddress = process.env.WEBSITE_URL;
    this.sharePath = process.env.SHARE_PATH;
    this.dynamoDbTableToIdx = process.env.DYNAMODB_TABLE_TO_IDX;
    this.dynamoDbTableFromIdx = process.env.DYNAMODB_TABLE_FROM_IDX;
  }

  shareFile(filePath, to, from) {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const cognito = new AWS.CognitoIdentityServiceProvider();
    const s3 = new AWS.S3();
    const shareId = uuidv4();
    console.log(`Sharing file ${filePath} with id ${shareId} from ${from} to ${to}`);
    return s3.headObject({ Bucket: this.bucket, Key: filePath }).promise()
      .then(metadata => dynamodb.put({
        TableName: this.dynamoDbTable,
        Item: {
          shareId,
          to,
          from,
          filePath,
          ttl: moment(metadata.LastModified).add(7, 'd').unix(),
        }
      }).promise())
      .then(() => cognito.adminGetUser({ UserPoolId: this.cognitoPoolId, Username: to }).promise())
      .catch(() => this.sendInvite(to, from))
      .then(() => this.sendShareEmail(to, from, shareId))
      .then(() => shareId);
  }

  getShareLink(shareId) {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const s3 = new AWS.S3();
    return dynamodb.get({ TableName: this.dynamoDbTable, Key: { shareId } }).promise()
      .then((record) => {
        if (record.Item !== undefined) {
          return Promise.resolve(
            s3.getSignedUrl('getObject', {
              Bucket: this.bucket,
              Key: record.Item.filePath,
              Expires: moment(record.Item.ttl).add(7, 'd').unix() - Math.ceil((Date.now() / 1000))
            })
          );
        }
        return Promise.reject(new Error('Invalid record'));
      });
  }

  listSharedFilesTo(email) {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    return dynamodb.query({
      TableName: this.dynamoDbTableToIdx,
      KeyConditionExpression: 'to = :hkey',
      ExpressionAttributeValues: {
        ':hkey': email,
      }
    }).promise().then(res => res.Items);
  }

  listSharedFilesFrom(email) {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    return dynamodb.query({
      TableName: this.dynamoDbTableFromIdx,
      KeyConditionExpression: 'from = :hkey',
      ExpressionAttributeValues: {
        ':hkey': email,
      }
    }).promise().then(res => res.Items);
  }

  sendInvite(to, from) {
    const ses = new AWS.SES();
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

  sendShareEmail(to, from, id) {
    const ses = new AWS.SES();
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
            Data: `The file url is ${this.siteAddress}/${this.sharePath}/${id}`,
          },
        },
      },
    ).promise();
  }
}

module.exports = ShareService;
