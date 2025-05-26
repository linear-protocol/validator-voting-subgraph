import { Config } from '../types';
import { optionalEnv } from './helper';

const config: Config = {
  networkId: 'mainnet',
  nodeUrl: optionalEnv('NEAR_RPC') || 'https://rpc.mainnet.near.org',
  poolDetailContractId: 'pool-details.near',
  subgraphApiUrl: '',
  port: 3000,
};

export default config;
