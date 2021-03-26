import 'dotenv/config';
import type { Context, SQSEvent } from 'aws-lambda';
import { createLogger, Logger } from '../util/logger';
import * as dynamodb from '../service/dynamodb.service';
import { parsePayload } from '../util/import-data';

export const handler = async (event: SQSEvent, context: Context): Promise<void> => {
  const logger: Logger = createLogger(null, context);
  logger.info('History SQS lambda triggered.');

  const promises = event.Records.map((record) => {
    logger.debug(`Processing record: ${JSON.stringify(record.attributes)}`);
    let item: Record<string, unknown>;

    try {
      item = parsePayload(record.body);
    } catch (err) {
      return { result: 'failure' };
    }

    return dynamodb.create(item)
      .then(() => ({ id: item.id, result: 'success' }))
      .catch(() => ({ id: item.id, result: 'failure' }));
  });

  const results = await Promise.all(promises);

  const successful = results.filter((job) => job.result === 'success');
  const failed = results.filter((job) => job.result === 'failure');

  if (failed.length > 0) {
    logger.warn(`Queue item failed: Could not update the following items: ${failed.join(', ')}`);
  }

  logger.info(`History queue done. Total items processed: ${promises.length}, \
 successful: ${successful.length}, failed: ${failed.length}.`);
};
