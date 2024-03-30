// This script is used to deploy the contracts to the blockchain.
const Token = artifacts.require("Token");

module.exports = async function (deployer) {
  await deployer.deploy(Token, "My Token","MYT");
  const token = await Token.deployed();
  console.log("Token deployed at @: " + token.address);
};
