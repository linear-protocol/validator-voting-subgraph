import axios from 'axios';
import { getConfig } from './config/helper';
import path from 'path';
import { GetReceiptResponseData } from './types';

async function getReceiptsPaged(
  accountId: string,
  method: string,
  cursor?: string,
  pageSize?: number, // MAX: 100
  afterTimestampNanosec?: string,
): Promise<GetReceiptResponseData> {
  const config = await getConfig();

  const res = await axios.get(
    path.join(config.nearBlocksApiUrl, 'account', accountId, 'receipts'),
    {
      params: {
        method,
        per_page: pageSize,
        cursor,
        order: 'desc', // by timestamp
        after_timestamp: afterTimestampNanosec,
      },
    },
  );

  return res.data;
}

export async function getReceipts(
  accountId: string,
  method: string,
  afterTimestampNanosec?: string,
): Promise<GetReceiptResponseData> {
  const txns: GetReceiptResponseData['txns'] = [];

  let cursor: string | undefined = undefined;

  while (true) {
    const response = await getReceiptsPaged(
      accountId,
      method,
      cursor,
      25, // Note: Each increment of 25 will count towards rate limit. For example, per page 50 will use 2 credits.
      afterTimestampNanosec,
    );

    txns.push(...response.txns);

    cursor = response.cursor;

    if (cursor === undefined) {
      break;
    }

    await sleep(10 * 1000); // resolve query limit
  }

  return {
    txns,
  };
}

async function sleep(ms: number) {
  await new Promise<void>((resolve) => setTimeout(resolve, ms));
}
