interface Config {
  awsRegion: string,
  nodeEnv: string,
  dynamoUrl: string,
  tableName: string,
}

export const getConfig = (): Config => {
  [
    'AWS_DEFAULT_REGION',
    'NODE_ENV',
    'DYNAMO_URL',
    'TABLE_NAME',
  ].forEach((envVar) => {
    if (!process.env[`${envVar}`]) {
      throw new Error(`Environment variable ${envVar} seems to be missing.`);
    }
  });
  return {
    awsRegion: process.env.AWS_DEFAULT_REGION,
    nodeEnv: process.env.NODE_ENV,
    dynamoUrl: process.env.DYNAMO_URL,
    tableName: process.env.TABLE_NAME,
  };
};
