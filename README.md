# DropBucket

DropBucket is a self-hosted file sharing tool. It relies on AWS infrastructure for implementing storage, user authentication, and the service infrastructure.

It's meant to be used to share files with people in a transient way.

## Use cases

You are security conscious and you need to share files with collegues, but don't want to email them, send them over slack, etc... 

You have regulatory or contractual provisions that prevent you from sharing files unsecurely and need to know exactly where your data is being stored and how it's being managed.

You need to share big-ish files.

You'd like ot make sure that when people send you files, they are automatically scanned for viruses.

## Security

All client-server operations (authentication, directory listing, uploads, downloads) are secured by strong transport encryption (TLS). At rest, files are encrypted in S3 using server-side AES-256 encryption.

The standards-based identity component (Cognito) is managed by AWS and is compliant to multiple certifications (HIPAA, PCI DSS, SOC, ISO/EIC 27001, ISO/EIC 27017, ISO/EIC 27018, and ISO 9001). It can be federated with a variety of identity providers if desired.

The file storage component (S3) is designed for 99.99% availability, and 99.999999999% durability.

All files are scanned for viruses automatically on upload by the Clam Anti-Virus software. Virus definitions are updated daily.

Policy on the storage backend will prevent access to files that have been tagged as being infected by viruses.

All files are automatically deleted after 7 days via S3 bucket lifecycle policy.

You get to control which AWS region your files are stored in.

## Scalability

As this is a serverless architecture relying heavily on AWS infrastructure, it could easily scale to millions of users storing petabytes of data without requiring any specific scaling actions (with the possible exception of increasing service limits for API Gateway/Lambda/S3).

The client application is a single-page application, and communicates directly with the S3 API.

## Limitations

The default installation will host the website on S3 static website hosting. This is non HTTPS, although it's easy enough to create a CloudFront distribution in front of it and force SSL from CloudFront.

The tool currently will limit uploads to 300 Mb, as that is a limitation of the virus scanning. The limit is imposed due to the relatively small amount of disk space that is available to Lambda functions (500 Mb). When factoring in the virus scanner and virus definitions, there's only about 300 Mb of usable space left. I'm erring on the side of caution, if a file can't be scanned or doesn't have a clean scan, it is not accessible.

This is a browser based application. If your browser is old, this might not work for you.

It doesn't keep your files in sync, it's up to you to upload files.

It's not a collaboration tool, it doesn't do any versioning.

## Pricing scenario

This scenario assumes the US-EAST-1 AWS region.

You have 50 users who each need to store 100 files each, totalling 1 GB per user.

### S3

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

If our users somehow generated 5000 requests to the Lambdas with a mid-size provisioned Lambda (1.5Gb RAM) and each execution took 30 seconds, the execution cost for Lambda would be 3.08$ USD. 

Lambda sub-total: 3.08$ 

### Cognito

The first 50,000 monthly active users in Cognito are free.

Cognito sub-total: 0$

### Total

So the total all-in costs for this solution for our scenario is about 13$ per month. 

If in a given month users upload half as many files, the price would drop by half.

### Cost analysis

Looking at some of the other options out there, you can get approximately 1 Tb of storage for about 10$ per month per user. That's a pretty good price per user if all your users need 1 Tb of storage, but in scenarios where they only need a few gigabytes it's pretty steep.

1 Tb of storage in S3 is about 20$ per month. Definitely more pricey than some of the cloud storage options out there, on the long run I'd imagine the pay-per-use model of DropBucket is cheaper if you don't need all the fancy features.

It's hard to be the resiliency, speed, and scalability of S3, as you start going into the terabyte ranges the prices per Gb start dropping off.

# Testing virus scanning

Create a text file with the following content:

```
X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*
```

Upload it via the UI. Wait for scan to occur and check object tags, should report the file as infected.

# Configuration

You'll need to update the `serverless.yml` file and update the bucket configurations in the `custom` section. Ex:

```
custom:
  stage: ${opt:stage, self:provider.stage}
  client:
    bucketName: BUCKET_NAME_FOR_THE_WEB_CLIENT_UI
    distributionFolder: client/build
    errorDocument: index.html
  avDefsBucketName: BUCKET_NAME_FOR_STORING_THE_ANTIVIRUS_DEFINITIONS
  fileBucketName: BUCKET_NAME_THAT_WILL_STORE_THE_USER_UPLOADED_FILES
```

# Building the API

```
sudo npm i serverless -g
npm i
```

# Deploying

Note: Before attempting to deploy you'll need to have your AWS credentials setup in a configuration profile. AWS has excellent documentation on how to do this. The deployment script assumes that you've done this. Trying to deploy without it will fail while trying to deploy the client code.


```
sls deploy -s STAGENAME --region REGION --aws-profile YOURAWSPROFILENAMEIFYOUAREUSINGONE
```

ex:

```
sls deploy -s dev --region us-east-1 --aws-profile ctrl-alt-del
```

And there you go, the whole thing has been deployed with a bit of configuration and one command.


# Credits

## Virus scanning approach

https://engineering.upside.com/s3-antivirus-scanning-with-lambda-and-clamav-7d33f9c5092e

https://blog.truework.com/2018-07-09-s3-antivirus-lambda-function

## UI inspiration

https://serverless-stack.com/

# TODO

Docs on the process for updating the virus scanning engine.

Make object expiration configurable at upload time by creating lifecycle rules that operate on object tags? Seems easy enough...