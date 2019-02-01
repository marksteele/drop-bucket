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
    URL: "https://api.serverless-stack.seed-demo.club/dev"
  },
};

const prod = {
  STRIPE_KEY: "pk_test_v1amvR35uoCNduJfkqGB8RLD",
  s3: {
    REGION: "us-east-1",
    BUCKET: "notes-app-2-api-prod-attachmentsbucket-1h5n5ttet1hy0"
  },
  apiGateway: {
    REGION: "us-east-1",
    URL: "https://api.serverless-stack.seed-demo.club/prod"
  },
  cognito: {
    REGION: "us-east-1",
    USER_POOL_ID: "us-east-1_TwYpMXIJH",
    APP_CLIENT_ID: "6kfg0o7qo2i3ndk2ur906sc5fd",
    IDENTITY_POOL_ID: "us-east-1:f4c754b4-24f0-4754-8596-30afedece1fc"
  }
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
