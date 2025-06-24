import { Config } from '../types';
import { optionalEnv, requiredEnv } from './helper';

const config: Config = {
  networkId: 'mainnet',
  nodeUrl: optionalEnv('NEAR_RPC') || 'https://near.lava.build',
  subgraphApiUrl: optionalEnv('SUBGRAPH_API_URL') || '', // TODO
  nearBlocksApiUrl: 'https://api.nearblocks.io/v2',
  poolDetailContractId: 'pool-details.near',
  votingContractId: '', // TODO
  port: Number(requiredEnv('PORT')),
};

export default config;
