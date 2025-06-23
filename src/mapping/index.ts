import { json, near } from '@graphprotocol/graph-ts';
import { EVENT_PREFIX, transformReceipt } from '../helper/common';
import { handleVotedEvent } from './handlers';

export function handleReceipt(receipt: near.ReceiptWithOutcome): void {
  handleEvents(receipt);
}

export function handleEvents(receipt: near.ReceiptWithOutcome): void {
  const tReceipt = transformReceipt(receipt);

  for (let i = 0; i < tReceipt.logs.length; i++) {
    const msg = tReceipt.logs[i];
    if (!msg.startsWith(EVENT_PREFIX)) {
      continue;
    }

    const event = json.fromString(msg.replace(EVENT_PREFIX, '')).toObject();
    const eventName = event.mustGet('event').toString();
    const eventData = event.mustGet('data').toArray();

    if (eventName == 'voted') {
      handleVotedEvent(eventData, tReceipt);
    }
  }
}
