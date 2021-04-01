import { HistoryData } from '../../src/lib/import-data';

export function getExpectedEventItem(id = '456-456-456'): HistoryData {
  const item = {
    id,
    atfId: '7db12eed-0c3f-4d27-8221-5699f4e3ea22',
    name: 'Derby Cars Ltd.',
    email: 'hello@email.com',
    availability: {
      isAvailable: 'false',
      lastUpdated: '2020-10-09T12:31:46.518Z',
      endDate: '2020-11-03T14:21:45.000Z',
      startDate: '2020-10-06T14:21:45.000Z',
    },
  };
  return item;
}
