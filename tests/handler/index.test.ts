import type { Context, SQSEvent } from 'aws-lambda';
import { PutItemOutput } from 'aws-sdk/clients/dynamodb';
import { handler } from '../../src/handler';
import * as importData from '../../src/lib/import-data';
import * as logger from '../../src/util/logger';
import * as mocks from '../mocks/validRecord';
import { getExpectedEventItem } from '../mocks/validParsedRecord';
import * as dynamodb from '../../src/service/dynamodb.service';

describe('Availability history lambda index tests', () => {
  let eventMock: SQSEvent;
  let contextMock: Context;
  const loggerErrorMessage = 'Queue item failed: Could not update the following items:';
  const loggerProcessingMessage = (total: number, successful: number, failed: number) :string => `History queue finished processing. Total items processed: ${total}, successful: ${successful}, failed: ${failed}.`;

  const loggerInfoSpy = jest.fn();
  const loggerErrorSpy = jest.fn();
  const validRecord = {
    messageId: '4f80239a-03c9-4fce-d68a-104001cbc5cb',
    receiptHandle: 'gvjxhsgayqxjneypkfnbfyvnvoeajirwkwlgmoioigyqijuqaembinhjsrkpaxvyhp',
    mD5OfBody: 'fb4823f6e5532530878d696331b20f3c',
    // eslint-disable-next-line max-len
    body: '{"Type": "Notification", "MessageId": "baff9", "Token": null, "TopicArn": "topicarn", "Message": "message body", "SigningCertURL": "https://sns.us-east-1..com/SimpleNotificationService-.pem", "Subject": "New AvailabilityHistory message sent to SNS"}',
    attributes: {
      SenderId: 'AIDAIT2UOQQY3AUEKVGXU',
      SentTimestamp: '1616672505599',
      ApproximateReceiveCount: '1',
      ApproximateFirstReceiveTimestamp: '1616672530339',
    },
  };

  beforeAll(() => {
    contextMock = <Context> {};

    jest.spyOn(logger, 'createLogger').mockReturnValue(<logger.Logger> <unknown> {
      debug: jest.fn(),
      info: loggerInfoSpy,
      warn: jest.fn(),
      error: loggerErrorSpy,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should complete successfully if no errors', async () => {
    jest.spyOn(importData, 'parsePayload').mockReturnValue(getExpectedEventItem('456-456-456'));
    jest.spyOn(dynamodb, 'create').mockReturnValue(Promise.resolve(<PutItemOutput>{ id: '456-456-456' }));

    eventMock = <SQSEvent> <unknown>{
      Records: [mocks.getValidRecord()],
    };
    await handler(eventMock, contextMock);

    expect(loggerInfoSpy).toHaveBeenCalledTimes(2);
    expect(loggerInfoSpy).nthCalledWith(2, loggerProcessingMessage(1, 1, 0));
  });

  test('should log out error if problem parsing input data', async () => {
    jest.spyOn(importData, 'parsePayload').mockImplementation(() => { throw new Error('Unable to parse request body. Unexpected token at JSON[0]'); });

    eventMock = <SQSEvent> <unknown>{
      Records: [mocks.getValidRecord()],
    };
    await handler(eventMock, contextMock);

    expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
    expect(loggerErrorSpy).nthCalledWith(1, `${loggerErrorMessage} unknown - failed to parse input data. MessageId: ${mocks.validMessageId}`);

    expect(loggerInfoSpy).toHaveBeenCalledTimes(2);
    expect(loggerInfoSpy).nthCalledWith(2, loggerProcessingMessage(1, 0, 1));
  });

  test('should log out error if problem posting item to database', async () => {
    const atfId = '7db12eed-0c3f-4d27-8221-5699f4e3ea22';
    const errorMessage = 'Unexpected error saving to the database';
    jest.spyOn(importData, 'parsePayload').mockReturnValue(getExpectedEventItem('123-123-123', atfId));
    jest.spyOn(dynamodb, 'create').mockReturnValue(Promise.reject(new Error(errorMessage)));

    eventMock = <SQSEvent> <unknown>{
      Records: [mocks.getValidRecord()],
    };

    await handler(eventMock, contextMock);

    expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
    expect(loggerErrorSpy).nthCalledWith(1, `${loggerErrorMessage} ${atfId} - Error: ${errorMessage}`);

    expect(loggerInfoSpy).toHaveBeenCalledTimes(2);
    expect(loggerInfoSpy).nthCalledWith(2, loggerProcessingMessage(1, 0, 1));
  });
});
