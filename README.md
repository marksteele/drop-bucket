# DropBucket

DropBucket is a self-hosted file sharing tool. It relies on AWS infrastructure for implementing storage, user authentication, and the service infrastructure.

It's meant to be used to share files with people in a transient way.

## Pros

- User management is done via AWS Cognito (could easily be adapted to be a single-sign with various authentication providers)
- Files are stored in S3
  - It's cheap! It's reliable! It scales to infinity!
  - Default bucket policy has encryption (via s3 bucket policy)
  - Files auto-delete in 7 days (via s3 bucket lifecycle configuration)
  - The client application is browser based, so files are directly talking to the S3 API (there's no server intermediary for file uploads/downloads)
  - You get to choose which AWS region you want your data to live in.
- Files are automatically scanned for virus on upload
  - Files found to be infected cannot be accessed (s3 bucket policy)
  - Virus definitions update daily (lambda cloudwatch scheduled event)
- The backend API is serverless (lambda functions)
  - Pay per use pricing
  - Authenticated via AWS IAM policy/Cognito
- The client is written as a single page application, and is hosted in S3
  - It's cheap! It's reliable! It scales to infinity!

All these properties mean:
- There is no fixed cost to run this service. 
- It will scale from nothing (no cost) to any number of users servicing petabytes of data.
- There is no per-user fixed cost
- Pay for only s3 storage, data transfer fees (to and from S3) and API calls.

## Cons

- This is a browser based application. If your browser is old, this might not work for you.
- It doesn't keep your files in sync, it's up to you to upload files.
- It's not a collaboration tool, doesn't do any versioning.

## Pricing scenario

This scenario assumes the US-EAST-1 AWS region.

### S3

You have 50 users who each need to store 100 files each, totalling 1 GB per user.

The storage costs on that are $0.023 per GB * 50 GB: 1.15$ USD per month.

If each user writes their 100 files every month, the S3 operation costs are:

50 (users) * 100 (files) = 5000 requests * 0.005 per 1000 requests = 0.0025$ USD

Let's imagine the users generate 1000 list requests each per month, that would cost an additional 0.025$ USD

Furthermore, let's imagine that they each fetch all their 100 files once per month, the get operations would cost 0.0004 per 1000 requests, so that would cost 0.002$ USD.

Data transfer into S3 is free, so we only have to look at the downloads.

If every user downloads all their files once per month, the cost of that would be 50GB * 0.09 = 4.50$ USD

S3 sub-total: 5.6795$ USD per month

### API Gateway

Let's imagine those same users login 1000 times to the app per month, the costs for API gateway would be 3.50$ per million API calls. Let's highball it and assume one million calls.

API Gateway sub-total: 3.50$

### Lambda

There's a perpetual free-tier for Lambda functions, and it's highly likely that the service could run in the free tier with 50 users pretty much forever given the usage scenario I've described so far.

If our users somehow generated 50000 requests to the Lambdas with a mid-size Lambda of 1.5Gb and each execution took 30 seconds, the execution cost for Lambda would be 30.84$ USD. This is an extremely conservative estimate for this scenario.

Lambda sub-total: 30.84$ 

### Total

So the total all-in costs for this solution for our scenario is about 40$ per month or a little shy of 1$/month per user.

### Cost analysis

While this is a bit more expensive on a per-user basis than other solutions like Google Drive/DropBox/OneDrive, with DropBucket you get to chose where your files are stored and you don't have to trust in their processes/infrastructure management. Everything about DropBucket is easily auditable.

It's hard to be the resiliency, speed, and scalability of S3, as you start going into the terabyte ranges the prices per Gb start dropping off.

# Testing virus scanning

Create a text file with the following content:

```
X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*
```

Upload it to the s3 bucket. Wait for scan to occur and check object tags, should report the file as infected.


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

The API must be deployed before building the UI, as you'll need to customize the file `client/src/config.js` with your endpoints/cognito pool configuration. Once that's done:

```
cd client
npm run build
```

## Deploy the UI

```
sls client deploy -s dev --no-confirm --aws-profile ctrl-alt-del --region us-east-1
```

# Credits

## Virus scanning approach

https://engineering.upside.com/s3-antivirus-scanning-with-lambda-and-clamav-7d33f9c5092e

https://blog.truework.com/2018-07-09-s3-antivirus-lambda-function

## UI inspiration

https://serverless-stack.com/

# TODO

Docs on the process for updating the virus scanning engine.

It'd be nice to get the bucket policy which prevents unencrypted uploads working, but it's probably a shortcoming of the Amplify library.

