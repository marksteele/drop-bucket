const dev = {
  s3: {
    REGION: "us-east-1",
    BUCKET: "dev-drop-bucket-files"
  },
  cognito: {
    REGION: "us-east-1",
    USER_POOL_ID: "us-east-1_1eY63GPP7",
    APP_CLIENT_ID: "4funjihbko4fnfje2roiq07b6j",
    IDENTITY_POOL_ID: "us-east-1:2efbcc5d-2384-45c8-a62c-5bc932b5c3b9"
  },
  apiGateway: {
    REGION: "us-east-1",
    URL: "https://jcitdf8i4b.execute-api.us-east-1.amazonaws.com/dev"
  },
};

const prod = {
  s3: {
    REGION: "us-east-1",
    BUCKET: "dev-drop-bucket-files"
  },
  cognito: {
    REGION: "us-east-1",
    USER_POOL_ID: "us-east-1_1eY63GPP7",
    APP_CLIENT_ID: "4funjihbko4fnfje2roiq07b6j",
    IDENTITY_POOL_ID: "us-east-1:2efbcc5d-2384-45c8-a62c-5bc932b5c3b9"
  },
  apiGateway: {
    REGION: "us-east-1",
    URL: "https://jcitdf8i4b.execute-api.us-east-1.amazonaws.com/dev"
  },
};

// Default to dev if not set
const config = process.env.REACT_APP_STAGE === 'prod'
  ? prod
  : dev;

export default {
  // Add common config values here
  MAX_ATTACHMENT_SIZE: 300000000,
  ...config
};
