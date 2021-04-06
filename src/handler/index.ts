import 'dotenv/config';
import type { Context, SQSEvent } from 'aws-lambda';
import { createLogger, Logger } from '../util/logger';
import * as dynamodb from '../service/dynamodb.service';
import { parsePayload, HistoryData } from '../lib/import-data';

export const handler = async (event: SQSEvent, context: Context): Promise<void> => {
  const logger: Logger = createLogger(context);
  logger.info('History SQS lambda triggered.');

  const promises = event.Records.map((record) => {
    logger.debug(`Processing record: ${JSON.stringify(record.attributes)}`);
    let item: HistoryData;

    try {
      item = parsePayload(record.body);
    } catch (err) {
      return { id: 'unknown', result: 'failure', message: `failed to parse input data. MessageId: ${record.messageId}` };
    }

    return dynamodb.create(item)
      .then(() => ({ id: item.id, result: 'success', message: '' }))
      .catch((err: string) => ({ id: item.atfId, result: 'failure', message: err }));
  });

  const results = await Promise.all(promises);

  const successful = results.filter((job) => job.result === 'success');
  const failed = results.filter((job) => job.result === 'failure').map(({ id, message }) => `${id} - ${message}`);

  if (failed.length > 0) {
    logger.error(`Queue item failed: Could not update the following items: ${failed.join(', ')}`);
  }

  logger.info(`History queue finished processing. Total items processed: ${promises.length}, \
successful: ${successful.length}, failed: ${failed.length}.`);
};
