import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { imUSD, Transfer } from "../generated/imUSD/imUSD";
import { Balance, Transaction } from "../generated/schema";

// imUSD
export const CONTRACT_ADDRESS = "0x30647a72Dc82d7Fbb1123EA74716aB8A317Eac19".toLowerCase();
export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000".toLowerCase();
const simUSD = imUSD.bind(Address.fromString(CONTRACT_ADDRESS));

const createOrLoadBalance = (id: string): Balance => {
  const balance = Balance.load(id);
  if (balance == null) {
    const newBalance = new Balance(id);
    newBalance.amount = BigInt.fromI32(0);
    return newBalance;
  }
  return balance;
};

/**
 * In this implementation, the balance amount is calculated from the first event.
 * @param hash transaction hash in hex string `has.toHexString()`
 * @param address address in hex string `address.toHexString()`
 * @param amount amount in BigInt
 */
const save = (hash: string, address: string, amount: BigInt): void => {
  const tx = new Transaction(hash + "-" + address);
  const balance = createOrLoadBalance(address);
  tx.address = address;
  tx.amount = amount;
  balance.amount = balance.amount.plus(amount);
  tx.save();
  balance.save();
  log.info("save: {},{},{}", [hash, address, amount.toString()]);
};

/**
 * Use `save` to store the events
 * @param event Transfer event
 */
export function handleTransferSave(event: Transfer): void {
  const hash = event.transaction.hash.toHexString();
  const from = event.params.from.toHexString();
  const to = event.params.to.toHexString();
  const amount = event.params.amount;

  log.info("handleTransfer: hash: {}, from: {}, to: {}, amount: {}", [
    hash,
    from,
    to,
    amount.toString(),
  ]);

  // From
  save(hash, from, amount.neg());

  // To
  save(hash, to, amount);
}

/**
 * In this implementation, the balance amount is calculated from the contract `balanceOf`.
 * @param hash transaction hash in hex string `has.toHexString()`
 * @param address address in hex string `address.toHexString()`
 * @param amount amount in BigInt
 */
const saveContract = (hash: string, address: string, amount: BigInt): void => {
  const tx = new Transaction(hash + "-" + address);
  const balance = createOrLoadBalance(address);
  tx.address = address;
  tx.amount = amount;
  balance.amount = simUSD.balanceOf(Address.fromString(address));
  tx.save();
  balance.save();
  log.info("save: {},{},{}", [hash, address, amount.toString()]);
};

/**
 * Ignore mint/burn from `null` address and use `saveContract` to store the events
 * @param event Transfer event
 */
export function handleTransferContract(event: Transfer): void {
  const hash = event.transaction.hash.toHexString();
  const from = event.params.from.toHexString();
  const to = event.params.to.toHexString();
  const amount = event.params.amount;

  log.info("handleTransferContract: hash: {}, from: {}, to: {}, amount: {}", [
    hash,
    from,
    to,
    amount.toString(),
  ]);

  if (event.params.from.toHexString() == NULL_ADDRESS) {
    // Mint
    saveContract(hash, to, amount);
  } else if (event.params.to.toHexString() == NULL_ADDRESS) {
    // Burn
    saveContract(hash, from, amount.neg());
  } else {
    // Transfer
    saveContract(hash, to, amount);
    saveContract(hash, from, amount.neg());
  }
}
