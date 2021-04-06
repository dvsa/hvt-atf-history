import { v4 } from 'uuid';
import { parsePayload } from '../../src/lib/import-data';
import * as mocks from '../mocks/validRecord';

const mockHistoryEventId = '7db12eed-0c3f-4d27-8221-5699f4e3ea22';
const input = mocks.getEventRecordItem(mockHistoryEventId);

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('123-456-789'),
}));

describe('parsePayload()', () => {
  it('should create a new atfId attribute with the value of the old record id', () => {
    const result = parsePayload(input);
    expect(result).toHaveProperty('atfId');
    expect(result.atfId).toEqual(mockHistoryEventId);
  });

  it('should set a new item id so it is not using the atfId for the db key column', () => {
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

    const result = () => {
      parsePayload(requestBody);
    };

    expect(result).toThrow(Error);
  });

  it('throws an error if payload is missing the availability Message data attribute', () => {
    const requestBody = JSON.stringify({
      Type: 'Notification',
      MessageId: 'b5c987c9-508b-416d-aff9-38fd81c4fb73',
      Token: null,
    });

    const result = () => {
      parsePayload(requestBody);
    };

    expect(result).toThrow(Error);
  });

  it('throws an error if payload contains invalid JSON', () => {
    const requestBody = 'asdf1234!@£$';

    const result = () => {
      parsePayload(requestBody);
    };

    expect(result).toThrow(Error);
  });
});
