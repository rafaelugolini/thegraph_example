import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  afterAll,
  assert,
  beforeAll,
  clearStore,
  createMockedFunction,
  describe,
  test,
} from "matchstick-as/assembly/index";
import { Transfer } from "../generated/imUSD/imUSD";
import {
  handleTransferContract,
  handleTransferSave,
  CONTRACT_ADDRESS,
  NULL_ADDRESS,
} from "../src/im-usd";
import { createNewTransferEvent } from "./utils";

const contractAddress = Address.fromString(CONTRACT_ADDRESS);
const nullAddress = Address.fromString(NULL_ADDRESS);

const testWallets = [
  Address.fromString("0x735700008C8905CEe3ab86c09593B37f4bC00000"),
  Address.fromString("0x735700008C8905CEe3ab86c09593B37f4bC00001"),
  Address.fromString("0x735700008C8905CEe3ab86c09593B37f4bC00002"),
  Address.fromString("0x735700008C8905CEe3ab86c09593B37f4bC00003"),
];

const amount = BigInt.fromI32(1000);

// If added in `beforeAll`, it will run issues.
// ERROR AS100: Not implemented: Closures
let event: Transfer;
describe("handleTransferSave()", () => {
  beforeAll(() => {
    event = createNewTransferEvent(nullAddress, testWallets[0], amount);
    handleTransferSave(event);
    event = createNewTransferEvent(testWallets[0], testWallets[1], amount);
    handleTransferSave(event);
  });

  afterAll(() => {
    clearStore();
  });
  test("test balance", () => {
    assert.fieldEquals("Balance", testWallets[0].toHexString(), "amount", "0");

    assert.fieldEquals(
      "Balance",
      testWallets[1].toHexString(),
      "amount",
      amount.toString()
    );
  });
  test("test transactions", () => {
    assert.fieldEquals(
      "Transaction",
      event.transaction.hash.toHexString() + "-" + testWallets[0].toHexString(),
      "amount",
      (-amount).toString()
    );
    assert.fieldEquals(
      "Transaction",
      event.transaction.hash.toHexString() + "-" + testWallets[1].toHexString(),
      "amount",
      amount.toString()
    );
  });
});

describe("handleTransferContract()", () => {
  beforeAll(() => {
    event = createNewTransferEvent(nullAddress, testWallets[0], amount);
    // no need to mock `balanceOf` `nullAddress` because it is ignored
    // mock `balanceOf` using the `to` address
    createMockedFunction(
      contractAddress,
      "balanceOf",
      "balanceOf(address):(uint256)"
    )
      .withArgs([ethereum.Value.fromAddress(testWallets[0])])
      .returns([ethereum.Value.fromUnsignedBigInt(amount)]);
    handleTransferContract(event);
    event = createNewTransferEvent(testWallets[0], testWallets[1], amount);
    // mock `balanceOf` using the `from` address
    createMockedFunction(
      contractAddress,
      "balanceOf",
      "balanceOf(address):(uint256)"
    )
      .withArgs([ethereum.Value.fromAddress(testWallets[0])])
      .returns([ethereum.Value.fromI32(0)]);
    // mock `balanceOf` using the `to` address
    createMockedFunction(
      contractAddress,
      "balanceOf",
      "balanceOf(address):(uint256)"
    )
      .withArgs([ethereum.Value.fromAddress(testWallets[1])])
      .returns([ethereum.Value.fromUnsignedBigInt(amount)]);
    handleTransferContract(event);
  });

  afterAll(() => {
    clearStore();
  });
  test("test balance", () => {
    assert.fieldEquals("Balance", testWallets[0].toHexString(), "amount", "0");

    assert.fieldEquals(
      "Balance",
      testWallets[1].toHexString(),
      "amount",
      amount.toString()
    );
  });
  test("test transactions", () => {
    assert.fieldEquals(
      "Transaction",
      event.transaction.hash.toHexString() + "-" + testWallets[0].toHexString(),
      "amount",
      (-amount).toString()
    );
    assert.fieldEquals(
      "Transaction",
      event.transaction.hash.toHexString() + "-" + testWallets[1].toHexString(),
      "amount",
      amount.toString()
    );
  });
});
