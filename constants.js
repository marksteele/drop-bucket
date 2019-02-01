/* eslint-disable prefer-destructuring */
const path = require('path');

const CLAMAV_BUCKET_NAME = process.env.CLAMAV_BUCKET_NAME;
const PATH_TO_AV_DEFINITIONS = '/tmp/av/';
const EXEC_PATH = process.env.IS_OFFLINE
  ? 'av/bin'
  : path.resolve(
    process.env.LAMBDA_TASK_ROOT,
    '_optimize',
    process.env.AWS_LAMBDA_FUNCTION_NAME,
    'av/bin',
  );

const FRESHCLAM_CONFIG = process.env.IS_OFFLINE
  ? 'av/etc/freshclam.conf'
  : path.resolve(
    process.env.LAMBDA_TASK_ROOT,
    '_optimize',
    process.env.AWS_LAMBDA_FUNCTION_NAME,
    'av/etc/freshclam.conf',
  );

// Constants for tagging file after a virus scan.
const STATUS_CLEAN_FILE = 'CLEAN';
const STATUS_INFECTED_FILE = 'INFECTED';
const STATUS_ERROR_PROCESSING_FILE = 'ERROR';
const STATUS_SKIPPED_FILE = 'SKIPPED';
const VIRUS_SCAN_STATUS_KEY = 'virusScanStatus';
const VIRUS_SCAN_TIMESTAMP_KEY = 'virusScanTimestamp';
const MAX_FILE_SIZE = 300000000;

// List of CLAMAV definition files. These are the compressed files.
const CLAMAV_DEFINITIONS_FILES = ['main.cvd', 'daily.cvd', 'bytecode.cvd'];

module.exports = {
  CLAMAV_BUCKET_NAME,
  PATH_TO_AV_DEFINITIONS,
  EXEC_PATH,
  FRESHCLAM_CONFIG,
  CLAMAV_DEFINITIONS_FILES,
  STATUS_CLEAN_FILE,
  STATUS_INFECTED_FILE,
  STATUS_ERROR_PROCESSING_FILE,
  STATUS_SKIPPED_FILE,
  VIRUS_STATUS_STATUS_KEY: VIRUS_SCAN_STATUS_KEY,
  VIRUS_SCAN_TIMESTAMP_KEY,
  MAX_FILE_SIZE,
};
