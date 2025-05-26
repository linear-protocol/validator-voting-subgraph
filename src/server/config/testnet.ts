import { Config } from '../types';
import { optionalEnv } from './helper';

const config: Config = {
  networkId: 'testnet',
  nodeUrl: optionalEnv('NEAR_RPC') || 'https://rpc.testnet.near.org',
  subgraphApiUrl:
    'https://api.studio.thegraph.com/query/112225/validator-voting-testnet/v0.0.1',
  port: 3000,
};

export default config;
