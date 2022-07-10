import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { Transfer } from "../generated/imUSD/imUSD";
import { CONTRACT_ADDRESS } from "../src/im-usd";

export function createNewTransferEvent(
  from: Address,
  to: Address,
  amount: BigInt
): Transfer {
  const mockEvent = newMockEvent();
  let contractAddress = Address.fromString(CONTRACT_ADDRESS);

  const transferEvent = new Transfer(
    contractAddress,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    null
  );

  transferEvent.parameters = new Array();
  let fromParam = new ethereum.EventParam(
    "from",
    ethereum.Value.fromAddress(from)
  );
  let toParam = new ethereum.EventParam("to", ethereum.Value.fromAddress(to));
  let amountParam = new ethereum.EventParam(
    "amount",
    ethereum.Value.fromUnsignedBigInt(amount)
  );

  log.info("event creation: from: {}, to: {}, amount: {}", [
    from.toHexString(),
    to.toHexString(),
    amount.toString(),
  ]);
  transferEvent.parameters.push(fromParam);
  transferEvent.parameters.push(toParam);
  transferEvent.parameters.push(amountParam);

  return transferEvent;
}
