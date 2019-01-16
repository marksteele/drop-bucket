Cognito for managing users

Files uploaded to s3 must be encrypted (via bucket policy)

After file uploaded, scanned for viruses via lambda
https://engineering.upside.com/s3-antivirus-scanning-with-lambda-and-clamav-7d33f9c5092e

https://blog.truework.com/2018-07-09-s3-antivirus-lambda-function

Bucket policy prevents reading infected files.

Virus definitions stored in separate s3 bucket updated via lambda triggered by cloudwatch cron event

Files auto-delete after 7 days

Need:

- s3 bucket for virus defs
- s3 bucket for files
- s3 bucket for ui
- 