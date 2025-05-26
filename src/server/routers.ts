import { t } from './trpc';
import { getSubgraphClient } from './subgraph';
import { gql } from '@urql/core';
import { getValidatorMetadatas } from './near';
import { InMemoryCache } from './InMemoryCache';
import { Validator } from './types';

export const getValidatorsProcedure = t.procedure.query(async () => {
  const validators = await getValidators();
  const metadatas = await getValidatorMetadatas();
  return validators.map((validator) => {
    return {
      ...validator,
      metadata: metadatas.find(
        (metadata) => metadata.accountId === validator.accountId,
      ),
    };
  });
});

const subgraphCache = new InMemoryCache<Validator[]>(60 * 60 * 1000, 60 * 1000);

async function getValidators() {
  let validators = subgraphCache.get('validators');
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
  subgraphCache.set('validators', validators);
  return validators;
}
