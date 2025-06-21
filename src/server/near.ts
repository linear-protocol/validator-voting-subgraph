import { getConfig } from './config/helper';
import { JsonRpcProvider } from '@near-js/providers';
import { ValidatorMetadata } from './types';
import { globalCache } from './InMemoryCache';

export async function initNear() {
  const config = await getConfig();
  const nearRpc = new JsonRpcProvider({
    url: config.nodeUrl,
  });
  return { nearRpc };
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

  const { nearRpc } = await initNear();
  const metadataRecord = (await nearRpc.callFunction(
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
