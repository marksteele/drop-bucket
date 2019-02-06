/* eslint-disable no-console */
/* eslint-disable comma-dangle */
// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');
const moment = require('moment');
const APIError = require('./APIError.js');

class ListService {
  constructor() {
    this.bucket = process.env.FILE_BUCKET_NAME;
  }

  getTags(file) {
    const s3 = new AWS.S3();
    return s3.getObjectTagging({ Bucket: this.bucket, Key: file }).promise();
  }

  getUrl(file, lastModified) {
    // Links expire at the same time as files scheduled to be deleted...
    const s3 = new AWS.S3();
    const params = { Bucket: this.bucket, Key: file, Expires: moment(lastModified).add(7, 'd').unix() - Math.ceil((Date.now() / 1000)) };
    return s3.getSignedUrl('getObject', params);
  }

  listAllKeys(params, out = []) {
    const s3 = new AWS.S3();
    return s3.listObjectsV2(params)
      .promise()
      .then(({ Contents, IsTruncated, NextContinuationToken }) => {
        Contents.forEach((item) => {
          const file = {};
          Object.assign(file, item);
          file.Key = file.Key.replace(params.Prefix, '');
          out.push(file);
        });
        return !IsTruncated
          ? out
          : this.listAllKeys(
            Object.assign(params, { ContinuationToken: NextContinuationToken }),
            out,
          );
      }).catch((err) => {
        console.log(err.message);
        throw new APIError('Error fetching keys', 500);
      });
  }

  listFiles(prefix) {
    return this.listAllKeys({ Bucket: this.bucket, Prefix: prefix })
      .then((files) => {
        const promises = [];
        files.forEach((file) => {
          promises.push(
            this.getTags(`${prefix}${file.Key}`)
              .then((res) => {
                const fileWithTags = {};
                const tags = {};
                res.TagSet.forEach((tag) => {
                  tags[tag.Key] = tag.Value;
                });
                Object.assign(fileWithTags, file, { Tags: tags, Url: this.getUrl(`${prefix}${file.Key}`, file.LastModified) });
                return Promise.resolve(fileWithTags);
              })
          );
        });
        return Promise.all(promises);
      });
  }
}

module.exports = ListService;
