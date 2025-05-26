export type Config = {
  networkId: string;
  nodeUrl: string;
  subgraphApiUrl: string;
  poolDetailContractId?: string;
  port: number;
};

export type Validator = {
  id: string;
  accountId: string;
  isVoted: boolean;
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
