import { getConfig } from './config/helper';
import { Near } from 'near-api-js';
import { ValidatorMetadata } from './types';
import { globalCache } from './InMemoryCache';

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
  if (!config.poolDetailContractId) {
    return [];
  }

  let metadatas = globalCache.get('validatorMetadatas') as
    | ValidatorMetadata[]
    | undefined;
  if (metadatas) {
    return metadatas;
  }

  const { near } = await initNear();
  const metadataRecord = (await near.connection.provider.callFunction(
    config.poolDetailContractId,
    'get_all_fields',
    {
      from_index: 0,
      limit: 1000,
    },
  )) as Record<string, ValidatorMetadata>;

  metadatas = Object.keys(metadataRecord).map((accountId) => {
    return {
      ...metadataRecord[accountId],
      accountId,
    };
  });

  globalCache.set('validatorMetadatas', metadatas);

  return metadatas;
}
