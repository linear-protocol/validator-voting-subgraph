import { JSONValue } from '@graphprotocol/graph-ts';
import { Receipt, saveValidator } from '../helper/common';

export function handleVotedEvent(
  eventData: JSONValue[],
  receipt: Receipt,
): void {
  for (let i = 0; i < eventData.length; i++) {
    const eachEventData = eventData[i].toObject();
    const accountId = eachEventData.mustGet('validator_id').toString();
    const choice = eachEventData.mustGet('choice').toString();
    saveValidator(accountId, choice, receipt.timestamp, receipt.receiptHash);
  }
}
