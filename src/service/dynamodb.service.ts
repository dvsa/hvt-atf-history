import { DynamoDB } from 'aws-sdk';
import { PutItemOutput } from 'aws-sdk/clients/dynamodb';
import { getConfig } from '../lib/config';

const config = getConfig();
const { tableName } = config;

const client = new DynamoDB.DocumentClient({
  endpoint: config.dynamoUrl,
  region: config.awsRegion,
});

export const create = async (item: Record<string, unknown>): Promise<PutItemOutput> => {
  const params = {
    Item: item,
    TableName: tableName,
  };
  return client.put(params).promise();
};
