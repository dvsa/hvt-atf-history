interface Config {
  awsRegion: string,
  nodeEnv: string,
  sqsAvailabilityHistoryQueueUrl: string,
  dynamoUrl: string,
  tableName: string,
}

export const getConfig = (): Config => {
  [
    'AWS_DEFAULT_REGION',
    'NODE_ENV',
    'SQS_AVAILABILITY_HISTORY_QUEUE_URL',
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
    sqsAvailabilityHistoryQueueUrl: process.env.SQS_AVAILABILITY_HISTORY_QUEUE_URL,
    dynamoUrl: process.env.DYNAMO_URL,
    tableName: process.env.TABLE_NAME,
  };
};
