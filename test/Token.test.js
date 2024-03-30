// Import necessary dependencies
const {
    BN,
    constants,
    expectEvent,
    expectRevert,
    time,
  } = require("@openzeppelin/test-helpers");
const { inTransaction } = require("@openzeppelin/test-helpers/src/expectEvent");
  const {web3} = require("@openzeppelin/test-helpers/src/setup");
const { expect } = require("chai");
  const { ZERO_ADDRESS } = constants;

  
  // Import contract artifacts
  const Token = artifacts.require("Token");

  contract("Token", async (accounts) => {
    const [owner, account1, account2, account3] = accounts;
  
    it("check if deployed", async () => {
        //Vado a prendere il token deployato passando per la migration
        this.token = await Token.deployed();
        // Controllo se l'indirizzo del token è diverso da 0
        expect(this.token.address).to.not.equal(ZERO_ADDRESS);
        //Controllo della sintassi dell'indirizzo
        expect(this.token.address).to.match(/0x[0-9a-fA-F]{40}/);
        console.log("New token address: ", this.token.address);
        //Grazie alla Ownable, controllo se l'owner del token è l'account1
        console.log("Token owner: ",+ await this.token.owner());
      });

    it("Controllo balance dell'account2 prima e dopo il mint e il transfer da owner ad account2 ok", async () => { 
        //Controllo quanto è il balance dell'account2
        bal = await this.token.balanceOf(account2);
        console.log(web3.utils.fromWei(bal));

        //Minto 50 token all'account2
        await this.token.mint(account2, web3.utils.toWei("100"), { from: owner });

        //Minto 50 token all'account1
        await this.token.mint(account1, web3.utils.toWei("50"), { from: owner });

        //Minto 200 token per l'owner del contratto
        await this.token.mint(owner, web3.utils.toWei("200"), { from: owner });

        //Trasferisco 10 token al secondo account
        await this.token.transfer(account2, web3.utils.toWei("10"), { from: owner });

        //Controllo quanto è il balance dell'account2 dopo il mint e il transfer
        bal = await this.token.balanceOf(account2);
        console.log("Balance of account2: " + web3.utils.fromWei(bal));

        //Controllo quanto è il balance dell'owner dopo il mint e il transfer
        bal = await this.token.balanceOf(owner);
        console.log("Balance of owner: " + web3.utils.fromWei(bal));

      })

      it("Prova di trasferimento token da account 2 ad account 1", async () => {
        //Trasferisco 10 token al secondo account dall'account1
        await this.token.transfer(account1, web3.utils.toWei("10"), { from: account2 });

        //Controllo quanto è il balance dell'account2 dopo il transfer
        bal = await this.token.balanceOf(account1);
        console.log("Balance of account2: " + web3.utils.fromWei(bal));

        //Controllo quanto è il balance dell'account1 dopo il transfer
        bal = await this.token.balanceOf(account2);
        console.log("Balance of account1: " + web3.utils.fromWei(bal));
      })

      it("Proviamo ad utilizzare la transferFrom abilitando l'account 2 a spendere 30 token dell'account 1 e trasferiamone 15", async () => {
        //Abilito l'account2 a spendere 30 token dell'account1
        await this.token.approve(account2, web3.utils.toWei("30"), { from: account1 });

        //Trasferisco 15 token al secondo account dall'account1
        await this.token.transferFrom(account1, account2, web3.utils.toWei("15"), { from: account2 });

        //Controllo quanto è il balance dell'account2 dopo il transfer
        bal = await this.token.balanceOf(account1);
        console.log("Balance of account2: " + web3.utils.fromWei(bal));

        //Controllo quanto è il balance dell'account1 dopo il transfer
        bal = await this.token.balanceOf(account2);
        console.log("Balance of account1: " + web3.utils.fromWei(bal));
      })

      it("Proviamo a bruciare 10 token dall'account1", async () => {
        //Brucio 10 token dall'account1
        await this.token.burn(web3.utils.toWei("10"), { from: account1 });

        //Controllo quanto è il balance dell'account1 dopo il burn
        bal = await this.token.balanceOf(account1);
        console.log("Balance of account1: " + web3.utils.fromWei(bal));
      })
  });