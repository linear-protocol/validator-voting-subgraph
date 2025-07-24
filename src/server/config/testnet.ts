import { Config } from '../types';
import { optionalEnv, requiredEnv } from './helper';

const config: Config = {
  networkId: 'testnet',
  nodeUrl: optionalEnv('NEAR_RPC') || 'https://neart.lava.build',
  subgraphApiUrl:
    optionalEnv('SUBGRAPH_API_URL') ||
    'https://api.studio.thegraph.com/query/112225/validator-voting-testnet/v0.0.3',
  subgraphAPiKey: optionalEnv('SUBGRAPH_API_KEY'),
  nearBlocksApiUrl: 'https://api-testnet.nearblocks.io/v2',
  votingContractId: 'mock-proposal-alpha.testnet',
  port: Number(requiredEnv('PORT')),
};

export default config;
