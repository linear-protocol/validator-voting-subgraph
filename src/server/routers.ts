import { t } from './trpc';
import { getSubgraphClient } from './subgraph';
import { gql } from '@urql/core';
import { getValidatorMetadatas } from './near';
import { globalCache } from './InMemoryCache';
import { Validator } from './types';
import { getReceipts } from './nearblocks';
import { getConfig } from './config/helper';

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

let nearBlocksFetcher: NodeJS.Timeout | undefined;
let nearBlocksValidators: Validator[] | undefined;
let nearBlocksLastTimestampNanosec: string | undefined;

export async function getValidators(
  source: 'TheGraph' | 'NearBlocks' = 'NearBlocks',
): Promise<Validator[]> {
  if (source === 'TheGraph') {
    let validators = globalCache.get('validators') as Validator[] | undefined;
    if (validators) {
      return validators;
    }
    validators = await getValidatorsFromSubgraph();
    globalCache.set('validators', validators);
    return validators;
  } else {
    if (!nearBlocksFetcher) {
      const task = async () => {
        try {
          const result = await getValidatorsFromNearBlocks(
            nearBlocksLastTimestampNanosec,
          );
          nearBlocksValidators = result.validators;
          nearBlocksLastTimestampNanosec = result.lastTimestampNanosec;
        } catch (e: unknown) {
          console.error(e);
        }
      };
      setTimeout(task, 0); // Run immediately
      nearBlocksFetcher = setInterval(task, 30 * 60 * 1000);
      return [];
    } else {
      return nearBlocksValidators ?? [];
    }
  }
}

async function getValidatorsFromSubgraph(): Promise<Validator[]> {
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
    throw result.error;
  }
  return result.data!.validators;
}

async function getValidatorsFromNearBlocks(
  afterTimestampNanosec?: string,
): Promise<{
  validators: Validator[];
  lastTimestampNanosec: string;
}> {
  const config = await getConfig();
  const { txns } = await getReceipts(
    config.votingContractId,
    'vote',
    afterTimestampNanosec,
  );
  const validators: Record<string, Validator> = {};
  for (const txn of txns) {
    const validatorAccountId = txn.predecessor_account_id;
    if (validators[validatorAccountId]) {
      continue;
    }
    const voteAction = txn.actions.find((action) => action.method === 'vote');
    if (!voteAction) {
      throw Error('Vote action not found');
    }
    const args: { is_vote: boolean } = JSON.parse(voteAction.args);
    validators[validatorAccountId] = {
      id: validatorAccountId,
      accountId: validatorAccountId,
      isVoted: args.is_vote,
      lastVoteReceiptHash: txn.receipt_id,
      lastVoteTimestamp: (
        BigInt(txn.block.block_timestamp) / 1_000_000n
      ).toString(),
    };
  }
  return {
    validators: Object.values(validators),
    lastTimestampNanosec: txns[0].block.block_timestamp,
  };
}
