export function getValidRecord() : Record<string, unknown> {
  return {
    messageId: validMessageId,
    receiptHandle: 'gvjxhsgayqxjneypkfnbfyvnvoeajirwkwlgmoioigyqijuqaembinhjsrkpaxvyhp',
    mD5OfBody: 'fb4823f6e5532530878d696331b20f3c',
    body: getEventRecordItem(),
    attributes: {
      SenderId: 'AIDAIT2UOQQY3AUEKVGXU',
      SentTimestamp: '1616672505599',
      ApproximateReceiveCount: '1',
      ApproximateFirstReceiveTimestamp: '1616672530339',
    },
  };
}

export const validMessageId = '4f80239a-03c9-4fce-d68a-104001cbc5cb';

export function getEventRecordItem(mockHistoryEventId = '123-123-123') :string {
  return JSON.stringify({
    Type: 'Notification',
    MessageId: 'b5c987c9-508b-416d-aff9-38fd81c4fb73',
    Token: null,
    Message: JSON.stringify({
      id: mockHistoryEventId,
      name: 'Derby Cars Ltd.',
      email: 'hello@email.com',
      availability: {
        isAvailable: false,
        lastUpdated: '2020-10-09T12:31:46.518Z',
        endDate: '2020-11-03T14:21:45.000Z',
        startDate: '2020-10-06T14:21:45.000Z',
      },
      token: 'eyJhbGciOiJIUzI1Ni',
    }),
  });
}
