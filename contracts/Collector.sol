// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Collector is Ownable {
  error noEthDeposited();
  error noEthToWithdraw();
  error noEthSent();

  uint public constant usdDecimals = 2;
  uint public ownerEthAmountToWithdraw;

  address public oracleEthUsdPrice;

  AggregatorV3Interface public ethUsdOracle;

  mapping(address user => uint256 amount) public userEthDeposit;

  /**
   * Network: mainnet
   * Aggregator: ETH/USD
   * Address: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
   */

  constructor(address clEthUsd) {
    oracleEthUsdPrice = clEthUsd;
    ethUsdOracle = AggregatorV3Interface(oracleEthUsdPrice);
  }

  function getLastPrice() public view returns (int) {
    (, int price, , , ) = ethUsdOracle.latestRoundData();
    return price;
  }

  receive() external payable {
    registerUserEthDeposit(msg.sender);
  }

  function registerUserEthDeposit(address sender) internal {
    if (msg.value == 0) {
      revert noEthSent();
    }
    userEthDeposit[sender] += msg.value;
  }

  function getPriceDecimals() public view returns (uint) {
    return uint(ethUsdOracle.decimals());
  }

  function convertEthInUSD(address user) public view returns (uint) {
    uint userUSDDeposit = 0;
    if (userEthDeposit[user] > 0) {
      uint ethPriceDecimals = getPriceDecimals();
      uint ethPrice = uint(getLastPrice());
      uint divDecs = 18 + ethPriceDecimals - usdDecimals;
      userUSDDeposit = (userEthDeposit[user] * ethPrice) / (10 ** divDecs);
    }
    return userUSDDeposit;
  }

  function convertUSDInEth(uint usdAmount) public view returns (uint) {
    uint convertAmountInEth = 0;
    if (usdAmount > 0) {
      uint ethPriceDecimals = getPriceDecimals();
      uint ethPrice = uint(getLastPrice());
      uint mulDecs = 18 + ethPriceDecimals - usdDecimals;
      convertAmountInEth = (usdAmount * (10 ** mulDecs)) / ethPrice;
    }
    return convertAmountInEth;
  }

  function userETHWithdraw() external {
    if (userEthDeposit[msg.sender] == 0) {
      revert noEthDeposited();
    }
    uint tempValue = userEthDeposit[msg.sender];
    userEthDeposit[msg.sender] = 0;

    (bool sent, ) = msg.sender.call{ value: tempValue }("");
    if (!sent) {
      revert noEthSent();
    }
  }
}
