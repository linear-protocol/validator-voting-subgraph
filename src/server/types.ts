export type Config = {
  networkId: string;
  nodeUrl: string;
  subgraphApiUrl: string;
  poolDetailContractId: string;
  port: number;
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
