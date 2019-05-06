/* eslint-disable no-console */
const { exec } = require('child_process');
const fs = require('fs');


function setSSMParam(data) {
  exec(`aws ssm put-parameter --name "/ctrl-alt-del/drop-bucket/COGNITO_IDENTITY_POOL_ID" --value "${data.IdentityPoolId}" --region ${data.DeploymentRegion} --profile ${data.DeploymentAwsProfile} --type String --overwrite`, (error, stdout, stderr) => {
    if (error) {
      console.log(error);
    } else {
      console.log(stdout);
      console.log(stderr);
    }
  });
}

function buildClientUI() {
  exec('cd client && npm i && npm run build && cd ..', (error, stdout, stderr) => {
    if (error) {
      console.log(error);
    } else {
      console.log(stdout);
      console.log(stderr);
    }
  });
}

function writeConfig(data) {
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
  exec(`sls client deploy -s ${data.DeploymentStage} --no-confirm --aws-profile ${data.DeploymentAwsProfile} --region ${data.DeploymentRegion} `, (error, stdout, stderr) => {
    if (error) {
      console.log(error);
    } else {
      console.log(stdout);
      console.log(stderr);
    }
  });
}

function process(data) {
  console.log('Received Stack Output, running post-deployment');
  console.log('Setting SSM parameters');
  setSSMParam(data);
  console.log('Writing config');
  writeConfig(data);
  console.log('Building client UI');
  buildClientUI();
  console.log('Deploying client UI');
  deployClient(data);
}

module.exports = { process };
