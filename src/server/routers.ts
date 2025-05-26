import { t } from './trpc';
import { getSubgraphClient } from './subgraph';
import { gql } from '@urql/core';

export const getValidatorsProcedure = t.procedure.query(async () => {
  return getValidators();
});

async function getValidators() {
  const client = await getSubgraphClient();
  const sql = gql<{
    validators: {
      id: string;
      accountId: string;
      isVoted: boolean;
      lastVoteTimestamp: string;
      lastVoteReceiptHash: string;
    }[];
  }>`
    query {
      validators(
        first: 1000
        orderBy: lastVoteTimestamp
        orderDirection: desc
      ) {
        id
        accountId
        isVoted
        lastVoteTimestamp
        lastVoteReceiptHash
      }
    }
  `;
  const result = await client.query(sql, {});
  if (result.error) {
    console.log(result.error);
    throw result.error;
  }
  return result.data!;
}
