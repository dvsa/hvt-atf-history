import { v4 } from 'uuid';
import { parsePayload } from '../../src/lib/import-data';

const mockHistoryEventId = '7db12eed-0c3f-4d27-8221-5699f4e3ea22';

const input = JSON.stringify({
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

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('123-456-789'),
}));

describe('parsePayload()', () => {
  it('should set the id as a new atfId attribute', () => {
    const result = parsePayload(input);
    expect(result).toHaveProperty('atfId');
    expect(result.atfId).toEqual(mockHistoryEventId);
  });

  it('should change the id so it is not using the atfId', () => {
    const result = parsePayload(input);
    expect(result.id).not.toEqual(mockHistoryEventId);
  });

  it('should parse a payload as expected', () => {
    const expected: Record<string, unknown> = {
      id: v4(),
      atfId: '7db12eed-0c3f-4d27-8221-5699f4e3ea22',
      name: 'Derby Cars Ltd.',
      email: 'hello@email.com',
      availability: {
        isAvailable: false,
        lastUpdated: '2020-10-09T12:31:46.518Z',
        endDate: '2020-11-03T14:21:45.000Z',
        startDate: '2020-10-06T14:21:45.000Z',
      },
    };
    const result = parsePayload(input);

    expect(result).toEqual(expected);
  });

  it('throws an error if payload is missing the id field in the JSON', () => {
    const requestBody = JSON.stringify({
      Type: 'Notification',
      MessageId: 'b5c987c9-508b-416d-aff9-38fd81c4fb73',
      Token: null,
      Message: JSON.stringify({
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

    const t = () => {
      parsePayload(requestBody);
    };

    expect(t).toThrow(Error);
  });

  it('throws an error if payload is missing the availability Message data attribute', () => {
    const requestBody = JSON.stringify({
      Type: 'Notification',
      MessageId: 'b5c987c9-508b-416d-aff9-38fd81c4fb73',
      Token: null,
    });

    const t = () => {
      parsePayload(requestBody);
    };

    expect(t).toThrow(Error);
  });

  it('throws an error if payload contains invalid JSON', () => {
    const requestBody = 'asdf1234!@£$';

    const t = () => {
      parsePayload(requestBody);
    };

    expect(t).toThrow(Error);
  });
});
