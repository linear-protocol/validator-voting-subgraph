import { getConfig } from './config/helper';
import { Near } from 'near-api-js';
import { ValidatorMetadata } from './types';

export async function initNear() {
  const config = await getConfig();
  const near = new Near({
    networkId: config.networkId,
    nodeUrl: config.nodeUrl,
  });
  return { near };
}

export async function getValidatorMetadatas(): Promise<ValidatorMetadata[]> {
  const config = await getConfig();
  const { near } = await initNear();
  const metadatas = (await near.connection.provider.callFunction(
    config.poolDetailContractId,
    'get_all_fields',
    {
      from_index: 0,
      limit: 1000,
    },
  )) as Record<string, ValidatorMetadata>;
  return Object.keys(metadatas).map((accountId) => {
    return {
      ...metadatas[accountId],
      accountId,
    };
  });
}
