export type Config = {
  networkId: string;
  nodeUrl: string;
  subgraphApiUrl: string;
  subgraphAPiKey?: string;
  nearBlocksApiUrl: string;
  poolDetailContractId?: string;
  votingContractId: string;
  port: number;
};

export type Validator = {
  id: string;
  accountId: string;
  choice: 'yes' | 'no';
  lastVoteTimestamp: string;
  lastVoteReceiptHash: string;
};

export type ValidatorMetadata = {
  accountId: string;
  name?: string;
  description?: string;
  url?: string;
  logo?: string;
  country?: string;
  country_code?: string;
  email?: string;
  telegram?: string;
  twitter?: string;
  github?: string;
};

export type GetReceiptResponseData = {
  cursor?: string;
  txns: {
    receipt_id: string;
    transaction_hash: string;
    predecessor_account_id: string;
    receiver_account_id: string;
    block: {
      block_hash: string;
      block_height: number;
      block_timestamp: string;
    };
    actions: {
      args: string;
      action: string;
      method: string;
      deposit: string;
    }[];
  }[];
};
