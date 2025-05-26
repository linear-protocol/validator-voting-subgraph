import { Config } from '../types';
import { optionalEnv, requiredEnv } from './helper';

const config: Config = {
  networkId: 'testnet',
  nodeUrl: optionalEnv('NEAR_RPC') || 'https://rpc.testnet.near.org',
  subgraphApiUrl:
    'https://api.studio.thegraph.com/query/112225/validator-voting-testnet/v0.0.1',
  port: Number(requiredEnv('PORT')),
};

export default config;
