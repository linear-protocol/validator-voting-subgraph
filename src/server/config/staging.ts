import { Config } from '../types';
import { optionalEnv, requiredEnv } from './helper';

const config: Config = {
  networkId: 'mainnet',
  nodeUrl: optionalEnv('NEAR_RPC') || 'https://near.lava.build',
  subgraphApiUrl:
    'https://api.studio.thegraph.com/query/112225/validator-voting-staging/v0.0.1',
  nearBlocksApiUrl: 'https://api.nearblocks.io/v2',
  poolDetailContractId: 'pool-details.near',
  votingContractId: 'mock-proposal.near',
  port: Number(requiredEnv('PORT')),
};

export default config;
