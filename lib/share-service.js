/* eslint-disable no-console */
/* eslint-disable comma-dangle */
// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');
const moment = require('moment');
const crypto = require('crypto');

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

  shareFile(filePath, from, to) {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const s3 = new AWS.S3();
    const shareId = crypto.createHash('md5').update(filePath + from + to).digest('hex');
    return s3.headObject({ Bucket: this.bucket, Key: filePath }).promise()
      .then(metadata => dynamodb.put({
        TableName: this.dynamoDbTable,
        Item: {
          shareId,
          email_to: to,
          email_from: from,
          filePath,
          ttl: moment(metadata.LastModified).add(7, 'd').unix(),
        }
      }).promise())
      .then(() => this.sendShareEmail(to, from))
      .then(() => shareId);
  }

  deleteShare(shareId, field, target) {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    return dynamodb.get({ TableName: this.dynamoDbTable, Key: { shareId } }).promise()
      .then((record) => {
        if (record.Item !== undefined) {
        // Maybe something to delete...
          if (record.Item[field] === target) {
            return dynamodb.delete({ TableName: this.dynamoDbTable, Key: { shareId } }).promise();
          }
        }
        throw new Error('Record not found');
      });
  }

  shareLink(shareId, to) {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const s3 = new AWS.S3();
    return dynamodb.get({ TableName: this.dynamoDbTable, Key: { shareId } }).promise()
      .then((record) => {
        if (record.Item !== undefined && record.Item.email_to === to) {
          return Promise.resolve({
            file: record.Item.filePath,
            url: s3.getSignedUrl('getObject', {
              Bucket: this.bucket,
              Key: record.Item.filePath,
              Expires: 300
            })
          });
        }
        return Promise.reject(new Error('Invalid record'));
      });
  }

  listSharedFiles(type, email) {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    return dynamodb.query({
      TableName: this.dynamoDbTable,
      IndexName: type === 'email_to' ? this.dynamoDbTableToIdx : this.dynamoDbTableFromIdx,
      KeyConditionExpression: `${type} = :hkey`,
      ExpressionAttributeValues: {
        ':hkey': email,
      }
    }).promise().then(res => res.Items);
  }

  sendShareEmail(to, from) {
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
              Data: `Please login to ${this.siteAddress} to see what has been shared!`
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: `${from} wants to share a file with you using DropBucket`
          },
        },
      },
    ).promise();
  }
}

module.exports = ShareService;
