interface Config {
  awsRegion: string,
  nodeEnv: string,
  snsAvailabilityHistoryTopicName: string,
  sqsAvailabilityHistoryQueueUrl: string
}

export const getConfig = (): Config => {
  [
    'AWS_DEFAULT_REGION',
    'NODE_ENV',
    'SNS_AVAILABILITY_HISTORY_TOPIC_NAME',
    'SQS_AVAILABILITY_HISTORY_QUEUE_URL'
  ].forEach((envVar) => {
    if (!process.env[`${envVar}`]) {
      throw new Error(`Environment variable ${envVar} seems to be missing.`);
    }
  });
  return {
    awsRegion: process.env.AWS_DEFAULT_REGION,
    nodeEnv: process.env.NODE_ENV,
    snsAvailabilityHistoryTopicName: process.env.SNS_AVAILABILITY_HISTORY_TOPIC_NAME,
    sqsAvailabilityHistoryQueueUrl: process.env.SQS_AVAILABILITY_HISTORY_QUEUE_URL
  };
};
