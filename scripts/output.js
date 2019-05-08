/* eslint-disable no-console */
const cp = require('child_process');
const proc = require('process');
const fs = require('fs');

const cwd = proc.cwd();

function setSSMParam(data) {
  console.log('Setting SSM parameters');
  console.log(cp.execSync(`/usr/local/bin/aws ssm put-parameter --name "/ctrl-alt-del/drop-bucket/COGNITO_IDENTITY_POOL_ID" --value "${data.IdentityPoolId}" --region ${data.DeploymentRegion} --profile ${data.DeploymentAwsProfile} --type String --overwrite`).toString());
}

function buildClientUI() {
  console.log('Building client UI');
  console.log(cp.execSync('/usr/local/bin/npm i', { cwd: `${cwd}/client` }).toString());
  console.log(cp.execSync('/usr/local/bin/npm run build', { cwd: `${cwd}/client` }).toString());
}

function writeConfig(data) {
  console.log('Writing config');
  fs.writeFileSync(
    'client/src/config.js',
    fs.readFileSync('client/src/config.dist.js')
      .toString()
      .replace(/%%REGION%%/g, data.DeploymentRegion)
      .replace('%%FILE_BUCKET%%', data.FileBucketName)
      .replace('%%USER_POOL_ID%%', data.UserPoolId)
      .replace('%%APP_CLIENT_ID%%', data.UserPoolClientId)
      .replace('%%IDENTITY_POOL_ID%%', data.IdentityPoolId)
      .replace('%%SERVICE_URL%%', data.ServiceEndpoint),
  );
}

function deployClient(data) {
  console.log('Deploying client UI');
  console.log(cp.execSync(`/usr/local/bin/sls client deploy -s ${data.DeploymentStage} --no-confirm --aws-profile ${data.DeploymentAwsProfile} --region ${data.DeploymentRegion}`).toString());
}

function process(data) {
  setSSMParam(data);
  writeConfig(data);
  buildClientUI();
  deployClient(data);
}

module.exports = { process };
