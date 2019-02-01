/* eslint-disable no-console */
// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');
const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const constants = require('./constants');

module.exports.update = (e, ctx, cb) => {
  const S3 = new AWS.S3();
  fs.mkdirSync(constants.PATH_TO_AV_DEFINITIONS);
  cp.execSync(`LD_LIBRARY_PATH=${constants.EXEC_PATH} ${constants.EXEC_PATH}/freshclam --config-file=${constants.FRESHCLAM_CONFIG} --datadir=${constants.PATH_TO_AV_DEFINITIONS}`);
  const promises = [];
  constants.CLAMAV_DEFINITIONS_FILES.forEach((filenameToUpload) => {
    console.log('Attempting to upload ', filenameToUpload);
    const options = {
      Bucket: constants.CLAMAV_BUCKET_NAME,
      Key: filenameToUpload,
      Body: fs.createReadStream(path.join(constants.PATH_TO_AV_DEFINITIONS, filenameToUpload)),
    };
    promises.push(S3.putObject(options).promise());
  });
  return Promise.all(promises).then(() => {
    console.log('Uploaded all files');
    cb(null);
  });
};
