import 'dotenv/config';
import type { Context, SQSEvent } from 'aws-lambda';
import { getConfig } from '../lib/config';
import handle from '../util/handle-await-error';
import { createLogger, Logger } from '../util/logger';

export const handler = async (event: SQSEvent, context: Context): Promise<void> => {
  const logger: Logger = createLogger(null, context);
  logger.info('History SQS lambda triggered.');

  const config = getConfig();

  // Loop through each record
  const records = event.Records;
  records.forEach((record) => {
    // Do stuff with record
    logger.debug(`Processing record: ${JSON.stringify(record)}`);
  });

  logger.info('History SQS lambda done.');
};
