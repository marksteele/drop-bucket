const config = {
  s3: {
    REGION: "%%REGION%%",
    BUCKET: "%%FILE_BUCKET%%"
  },
  cognito: {
    REGION: "%%REGION%%",
    USER_POOL_ID: "%%USER_POOL_ID%%",
    APP_CLIENT_ID: "%%APP_CLIENT_ID%%",
    IDENTITY_POOL_ID: "%%IDENTITY_POOL_ID%%"
  },
  apiGateway: {
    REGION: "%%REGION%%",
    URL: "%%SERVICE_URL%%"
  },
};

export default {
  // Add common config values here
  MAX_ATTACHMENT_SIZE: 300000000,
  ...config
};
