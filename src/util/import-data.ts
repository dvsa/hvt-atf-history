import { v4 } from 'uuid';

type HistoryData = {'id': string, 'atfId': string, 'token'?: string };

export const parsePayload = (requestBody: string): Record<string, unknown> => {
  try {
    const body : Record<string, string> = <Record<string, string>> JSON.parse(requestBody);
    const message : Record<string, string> = <Record<string, string>> JSON.parse(body.Message);
    const historyData = message as HistoryData;

    if (!historyData.id) {
      throw new Error('missing id');
    }

    historyData.atfId = historyData.id;
    historyData.id = v4();

    // delete the token for security - why bother keeping it?
    delete historyData.token;

    return historyData;
  } catch (err) {
    const errorMsg: string = <string> err || '';
    throw new Error(`Unable to parse request body. ${errorMsg}`);
  }
};
