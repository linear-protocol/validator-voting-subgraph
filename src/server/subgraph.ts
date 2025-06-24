import { cacheExchange, Client, fetchExchange } from '@urql/core';
import { getConfig } from './config/helper';

export async function getSubgraphClient(): Promise<Client> {
  const config = await getConfig();
  const headers = config.subgraphAPiKey
    ? {
        Authorization: `Bearer ${config.subgraphAPiKey}`,
      }
    : undefined;
  return new Client({
    exchanges: [fetchExchange, cacheExchange],
    url: config.subgraphApiUrl,
    fetchOptions: {
      headers,
    },
  });
}
