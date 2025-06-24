import { JSONValue } from '@graphprotocol/graph-ts';
import { Receipt, saveValidator } from '../helper/common';

export function handleVotedEvent(
  eventData: JSONValue[],
  receipt: Receipt,
): void {
  for (let i = 0; i < eventData.length; i++) {
    const eachEventData = eventData[i].toObject();
    const accountId = eachEventData.mustGet('validator_id').toString();
    const vote = eachEventData.mustGet('vote').toString();
    saveValidator(accountId, vote, receipt.timestamp, receipt.receiptHash);
  }
}
