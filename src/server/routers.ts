import { t } from './trpc';
import { getSubgraphClient } from './subgraph';
import { gql } from '@urql/core';
import { getValidatorMetadatas, getValidatorTotalStakedBalance } from './near';
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

let subGraphFetcher: NodeJS.Timeout | undefined;
const subgraphValidators: Record<
  string,
  Validator & { totalStakedBalance?: string }
> = {};
let lastTimestampOfFetchTotalStakedBalance = 0;

let nearBlocksFetcher: NodeJS.Timeout | undefined;
const nearBlocksValidators: Record<string, Validator> = {};
let nearBlocksLastTimestampNanosec: string | undefined;

export async function getValidators(
  source: 'TheGraph' | 'NearBlocks' = 'TheGraph',
): Promise<Validator[]> {
  if (source === 'TheGraph') {
    if (!subGraphFetcher) {
      const task = async () => {
        try {
          const validators: (Validator & { totalStakedBalance?: string })[] =
            await getValidatorsFromSubgraph();

          if (
            Date.now() - lastTimestampOfFetchTotalStakedBalance >
            60 * 60 * 1000
          ) {
            for (const validator of validators) {
              validator.totalStakedBalance =
                await getValidatorTotalStakedBalance(validator.accountId);
            }
            lastTimestampOfFetchTotalStakedBalance = Date.now();
          } else {
            for (const validator of validators) {
              if (
                !subgraphValidators[validator.accountId]?.totalStakedBalance
              ) {
                validator.totalStakedBalance =
                  await getValidatorTotalStakedBalance(validator.accountId);
              }
            }
          }

          updateValidatorsWithBalance(subgraphValidators, validators);
        } catch (e: unknown) {
          console.error(e);
        }
      };
      setTimeout(task, 0); // Run immediately
      subGraphFetcher = setInterval(task, 60 * 1000);
      return [];
    } else {
      return Object.values(subgraphValidators);
    }
  } else {
    if (!nearBlocksFetcher) {
      const task = async () => {
        try {
          const result = await getValidatorsFromNearBlocks(
            nearBlocksLastTimestampNanosec,
          );
          updateValidators(
            nearBlocksValidators,
            Object.values(result.validators),
          );
          nearBlocksLastTimestampNanosec = result.lastTimestampNanosec;
        } catch (e: unknown) {
          console.error(e);
        }
      };
      setTimeout(task, 0); // Run immediately
      nearBlocksFetcher = setInterval(task, 30 * 60 * 1000);
      return [];
    } else {
      return Object.values(nearBlocksValidators);
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
        vote
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
  validators: Record<string, Validator>;
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
    const voteAction = txn.actions.find((action) => action.method === 'vote');
    if (!voteAction) {
      throw Error('Vote action not found');
    }

    const args: { choice: 'yes' | 'no'; staking_pool_id: string } = JSON.parse(
      voteAction.args,
    );
    const validatorAccountId = args.staking_pool_id;
    if (validators[validatorAccountId]) {
      continue;
    }

    validators[validatorAccountId] = {
      id: validatorAccountId,
      accountId: validatorAccountId,
      choice: args.choice,
      lastVoteReceiptHash: txn.receipt_id,
      lastVoteTimestamp: (
        BigInt(txn.block.block_timestamp) / 1_000_000n
      ).toString(),
    };
  }
  return {
    validators,
    lastTimestampNanosec: txns[0].block.block_timestamp,
  };
}

function updateValidators(dst: Record<string, Validator>, src: Validator[]) {
  src.forEach((validator) => {
    dst[validator.accountId] = validator;
  });
}

function updateValidatorsWithBalance(
  dst: Record<string, Validator & { totalStakedBalance?: string }>,
  src: (Validator & { totalStakedBalance?: string })[],
) {
  src.forEach((validator) => {
    const oldValidator = dst[validator.accountId];
    dst[validator.accountId] = {
      totalStakedBalance: oldValidator?.totalStakedBalance,
      ...validator,
    };
  });
}
