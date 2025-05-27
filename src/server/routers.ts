import { t } from './trpc';
import { getSubgraphClient } from './subgraph';
import { gql } from '@urql/core';
import { getValidatorMetadatas } from './near';
import { globalCache } from './InMemoryCache';
import { Validator } from './types';

export const getValidatorsProcedure = t.procedure.query(async () => {
  const [validators, metadatas] = await Promise.all([
    getValidators(),
    getValidatorMetadatas(),
  ]);
  return validators.map((validator) => {
    return {
      ...validator,
      lastVoteTimestamp: Number(validator.lastVoteTimestamp),
      metadata: metadatas.find(
        (metadata) => metadata.accountId === validator.accountId,
      ),
    };
  });
});

async function getValidators() {
  let validators = globalCache.get('validators') as Validator[] | undefined;
  if (validators) {
    return validators;
  }

  const client = await getSubgraphClient();
  const sql = gql<{
    validators: Validator[];
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
  validators = result.data!.validators;
  globalCache.set('validators', validators);
  return validators;
}
