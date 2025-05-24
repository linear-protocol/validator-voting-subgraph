import { Validator } from '../../generated/schema';
import { BigInt, Bytes, near } from '@graphprotocol/graph-ts';

export const EVENT_PREFIX = 'EVENT_JSON:';

export class Receipt {
  logs: string[];
  receiptHash: Bytes;
  blockHeight: u64;
  timestamp: u64;
  receiverId: string;

  constructor(
    logs: string[],
    receiptHash: Bytes,
    blockHeight: u64,
    timestamp: u64,
    receiverId: string,
  ) {
    this.logs = logs;
    this.receiptHash = receiptHash;
    this.blockHeight = blockHeight;
    this.timestamp = timestamp;
    this.receiverId = receiverId;
  }
}

export function transformReceipt(receipt: near.ReceiptWithOutcome): Receipt {
  return new Receipt(
    receipt.outcome.logs,
    receipt.receipt.id,
    receipt.block.header.height,
    receipt.block.header.timestampNanosec / 1000000,
    receipt.receipt.receiverId,
  );
}

export function getValidatorOrDefault(accountId: string): Validator {
  let account = Validator.load(accountId);
  if (!account) {
    account = new Validator(accountId);
    account.accountId = accountId;
    account.isVoted = false;
    account.lastVoteTimestamp = BigInt.zero();
  }
  return account;
}

export function saveValidator(
  accountId: string,
  isVoted: boolean,
  lastVoteTimestamp: u64,
  lastVoteReceiptHash: Bytes,
): void {
  const validator = getValidatorOrDefault(accountId);
  validator.isVoted = isVoted;
  validator.lastVoteTimestamp = BigInt.fromU64(lastVoteTimestamp);
  validator.lastVoteReceiptHash = lastVoteReceiptHash.toBase58();
  validator.save();
}
