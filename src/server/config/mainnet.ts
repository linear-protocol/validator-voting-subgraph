import { Config } from '../types';
import { optionalEnv, requiredEnv } from './helper';

const config: Config = {
  networkId: 'mainnet',
  nodeUrl: optionalEnv('NEAR_RPC') || 'https://near.lava.build',
  poolDetailContractId: 'pool-details.near',
  subgraphApiUrl: '', // TODO
  port: Number(requiredEnv('PORT')),
};

export default config;
