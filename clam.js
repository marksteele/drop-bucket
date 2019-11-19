/* eslint-disable no-console */
// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');
const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const constants = require('./constants');

const checkFileChecksum = (bucket, file, destinationFile) => {
  const S3 = new AWS.S3();
  if (fs.existsSync(destinationFile) && fs.existsSync(`${destinationFile}.md5`)) {
    const fileStat = fs.statSync(destinationFile);
    if (Date.now() - fileStat.mtimeMs > 86400) {
      console.log(`Cached file too old: timesetamp is ${fileStat.mtimeMs} diff is ${Date.now() - fileStat.mtimeMs}`);
      return false;
    }
    const localCheckSum = fs.readFileSync(`${destinationFile}.md5`, 'utf8');
    const options = {
      Bucket: bucket,
      Key: file,
    };
    return S3.headObject(options).promise().then((metadata) => {
      if (localCheckSum === metadata.ETag) {
        console.log('Local checksum matches remote');
        return true;
      }
      console.log('Local checksum does not match remote');
      return false;
    });
  }
  console.log(`No local checksum file found: ${destinationFile}.md5`);
  return false;
};

const downloadFile = (bucket, file, destinationFile) => {
  const S3 = new AWS.S3();
  console.log(`Downloading ${bucket}/${file} to ${destinationFile}`);
  if (!fs.existsSync(path.dirname(destinationFile))) {
    fs.mkdirSync(path.dirname(destinationFile), { recursive: true });
  }
  const options = {
    Bucket: bucket,
    Key: file,
  };
  // Write ETag to a file so that we can do conditional gets...
  return S3.headObject(options).promise().then((meta) => {
    fs.writeFileSync(`${destinationFile}.md5`, meta.ETag);
    return new Promise((resolve, reject) => {
      const localFileWriteStream = fs.createWriteStream(destinationFile);
      const s3ReadStream = S3.getObject(options).createReadStream().on('end', () => {
        resolve();
      }).on('error', () => {
        reject();
      });
      s3ReadStream.pipe(localFileWriteStream);
    });
  });
};

const tagFile = (bucket, file, status) => {
  const s3 = new AWS.S3();
  console.log(`Tagging ${bucket}/${file} with tag ${status}`);
  const taggingParams = {
    Bucket: bucket,
    Key: file,
    Tagging: {
      TagSet: [
        {
          Key: constants.VIRUS_STATUS_STATUS_KEY,
          Value: status,
        },
        {
          Key: constants.VIRUS_SCAN_TIMESTAMP_KEY,
          Value: new Date().getTime().toString(),
        },
      ],
    },
  };
  return s3.putObjectTagging(taggingParams).promise().then(() => Promise.resolve(status));
};

const downloadAvDefinitions = () => {
  const promises = [];
  if (!fs.existsSync(constants.PATH_TO_AV_DEFINITIONS)) {
    fs.mkdirSync(constants.PATH_TO_AV_DEFINITIONS, { recursive: true });
  }
  constants.CLAMAV_DEFINITIONS_FILES.forEach((filenameToDownload) => {
    const destinationFile = path.join(constants.PATH_TO_AV_DEFINITIONS, filenameToDownload);
    if (!checkFileChecksum(constants.CLAMAV_BUCKET_NAME, filenameToDownload, destinationFile)) {
      promises.push(
        downloadFile(constants.CLAMAV_BUCKET_NAME, filenameToDownload, destinationFile),
      );
    }
  });
  return Promise.all(promises);
};

const cleanup = (file) => {
  try {
    fs.unlinkSync(file);
  } catch (err) {
    console.log(`Error removing file ${file}`);
    console.log(err);
  }
  return Promise.resolve(true);
};

const scanFile = (bucket, file) => {
  console.log(`Scanning ${bucket}/${file}`);
  const destinationFile = path.join('/tmp/scan', file.replace(/[^a-zA-Z0-9-_]/gi, '_'));
  return downloadAvDefinitions().then(() => downloadFile(bucket, file, destinationFile)
    .then(() => {
      try {
        cp.execSync(`LD_LIBRARY_PATH=${constants.EXEC_PATH} ${constants.EXEC_PATH}/clamscan -v -a --stdout -d ${constants.PATH_TO_AV_DEFINITIONS} '${destinationFile}'`);
        return tagFile(bucket, file, constants.STATUS_CLEAN_FILE);
      } catch (err) {
        if (err.status === 1) {
          console.log('Scan returned infected file!');
          return tagFile(bucket, file, constants.STATUS_INFECTED_FILE);
        }
        console.log('Error scanning file');
        console.log(err);
        return tagFile(bucket, file, constants.STATUS_ERROR_PROCESSING_FILE);
      }
    })
    .then(() => cleanup(destinationFile)));
};

const scan = (e, ctx, cb) => {
  const element = e.Records[0];
  const file = decodeURIComponent(element.s3.object.key.replace(/\+/g, ' '));
  if (element.s3.object.size > constants.MAX_FILE_SIZE) {
    tagFile(
      element.s3.bucket.name,
      file,
      constants.STATUS_SKIPPED_FILE,
    )
      .then(() => {
        cb(null);
      });
  }
  scanFile(element.s3.bucket.name, file)
    .then(() => {
      cb(null);
    });
};

module.exports.scan = scan;
