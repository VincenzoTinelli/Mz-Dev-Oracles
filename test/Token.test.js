// Import necessary dependencies
const {
  BN,
  constants,
  expectEvent,
  expectRevert,
  time,
} = require("@openzeppelin/test-helpers");
const { inTransaction } = require("@openzeppelin/test-helpers/src/expectEvent");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const { ZERO_ADDRESS } = constants;
const { expect } = require("chai");

const Collector = artifacts.require("Collector");

const fromWei = (x) => web3.utils.fromWei(x.toString());
const toWei = (x) => web3.utils.toWei(x.toString());
const fromWei8Decimals = (x) => x / Math.pow(10, 8);
const toWei8Decimals = (x) => x * Math.pow(10, 8);
const fromWei2Decimals = (x) => x / Math.pow(10, 2);
const toWei2Decimals = (x) => x * Math.pow(10, 2);

// Test case for the Collector contract
contract("Collector test", function (accounts) {
  const [deployer, firstAccount, secondAccount, fakeAccount] = accounts;

  // Test retrieving the deployed contract
  it("retrive deployed contract", async function () {
    collectorContract = await Collector.deployed();
    expect(collectorContract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(collectorContract.address).to.match(/0x[0-9a-fA-F]{40}/);

    console.log(await collectorContract.oracleEthUsdPrice());
  });

  // Test getting the price feed
  it("get price feed", async function () {
    console.log(
      "1 ETH = " +
        fromWei8Decimals(await collectorContract.getLatestPrice()) +
        " USD"
    );
  });

  // Test sending ETH from FirstAccount and getting user deposit in dollars
  it("send some eth and get user deposit in dollars", async () => {
    await collectorContract.sendTransaction({
      from: firstAccount,
      value: toWei(1),
    });
    console.log(
      fromWei(await collectorContract.userEthDeposit(firstAccount)) + " ETH"
    );
    console.log(
      fromWei2Decimals(await collectorContract.convertEthInUSD(firstAccount)) +
        " USD"
    );
  });

  // Test sending ETH from SecondAccount and getting user deposit in dollars
  it("send some eth and get user deposit in dollars", async () => {
    await collectorContract.sendTransaction({
      from: secondAccount,
      value: toWei(1.5),
    });
    console.log(
      fromWei(await collectorContract.userEthDeposit(secondAccount)) + " ETH"
    );
    console.log(
      fromWei2Decimals(await collectorContract.convertEthInUSD(secondAccount)) +
        " USD"
    );
  });

  // Test getting the smart contract balance in ETH
  it("get smart contract balance in ETH", async function () {
    const contractBalance = await web3.eth.getBalance(
      collectorContract.address
    );
    console.log(fromWei(contractBalance) + " ETH");
  });

  it("test withdraw from firstAccount and check the total amount of ETH in the contract", async function () {
    await collectorContract.userETHWithdraw({ from: firstAccount });
    console.log(
      fromWei(await collectorContract.getNativeCoinsBalance()) + " ETH"
    );
  });

  it("test withdraw from secondAccount and check the total amount of ETH in the contract", async function () {
    await collectorContract.userETHWithdraw({ from: secondAccount });
    console.log(
      fromWei(await collectorContract.getNativeCoinsBalance()) + " ETH"
    );
  });
  it("test withdraw from secondAccount (expect to fail)", async function () {
    await expectRevert(
      collectorContract.userETHWithdraw({ from: secondAccount }),
      "Insufficient balance"
    );
  });
});
