const { exec } = require('child_process');
const fs = require('fs');

function execPromise(command) {
  return new Promise(function(resolve, reject) {
      exec(command, (error, stdout, stderr) => {
          if (error) {
              reject(error);
              return;
          }

          resolve(stdout.trim());
      });
  });
}

function process (data) {
    console.log('Received Stack Output, running post-deployment');

    console.log("Setting SSM parameters");
    // Set SSM parameter for name of dynamodb table (for use by Lambdas)
    execPromise(`aws ssm put-parameter --name "/ctrl-alt-del/drop-bucket/COGNITO_IDENTITY_POOL_ID" --value ${data.IdentityPoolId} --region ${data.DeploymentRegion} --profile ${data.DeploymentAwsProfile} --type String --overwrite`)
    .then(res => {
      console.log(res);
      return Promise.resolve(true);
    })
    .then(() => {
      console.log("Writing client configuration");
      // Load in client config and update client/src/config.js
      fs.writeFileSync(
        "client/src/config.js",
        fs.readFileSync("client/src/config.dist.js")
          .toString()
          .replace(/%%REGION%%/g, data.DeploymentRegion)
          .replace('%%FILE_BUCKET%%', data.FileBucketName)
          .replace('%%USER_POOL_ID%%', data.UserPoolId)
          .replace('%%APP_CLIENT_ID%%', data.UserPoolClientId)
          .replace('%%IDENTITY_POOL_ID%%', data.IdentityPoolId)
          .replace('%%SERVICE_URL%%', data.ServiceEndpoint));  
      return Promise.resolve(true);
    })
    .then(() => {
      console.log("Building client UI");
      return execPromise(`cd client && npm run build && cd ..`);
    })
    .then(output => {
      console.log(output);
      // Deploy UI
      console.log("Deploying client UI");
      return execPromise(`sls client deploy -s ${data.DeploymentStage} --no-confirm --aws-profile ${data.DeploymentAwsProfile} --region ${data.DeploymentRegion} `);
    })
    .then(output => {
      console.log(output);
    })
    .catch(err => {
      console.log(err.message);
    });
  }

  module.exports = { process }