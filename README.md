# Features

- Cognito for managing users
- Default bucket policy has encryption (via bucket policy)
- Files auto-delete in 7 days (bucket lifecycle)
- Files automatically scanned for virus on upload (lambda bucket hook)
- Virus defs update daily (lambda cloudwatch scheduled event)
- Files tagged as infected cannot be read (via bucket policy)
- Completely serverless, the API runs on Lambda, the UI is hosted in S3.

# Testing virus scanning

Create a text file with the following content:

```
X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*
```

Upload it to the s3 bucket. Wait for scan to occur and check object tags, should report the file as infected.

# Update virus scanning engine

TODO: Docs

# Building the API

```
sudo npm i serverless -g
npm i
```

# Deploying the API

Customize the serverless.yml to change the bucket names, then:

```
sls deploy -s dev --aws-profile ctrl-alt-del --region us-east-1
```

# Building the UI

Customize the file `client/src/config.js` with your endpoints.

```
npm run build
```

## Deploy the UI

```
cd client
sls client deploy -s dev --aws-profile ctrl-alt-del --region us-east-1
```

# Credits

## Virus scanning approach

https://engineering.upside.com/s3-antivirus-scanning-with-lambda-and-clamav-7d33f9c5092e

https://blog.truework.com/2018-07-09-s3-antivirus-lambda-function

## UI inspiration

https://serverless-stack.com/
