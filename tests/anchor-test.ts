import * as anchor from "@project-serum/anchor";
import assert = require("assert");
import { Program } from "@project-serum/anchor";
import { AnchorTest } from "../target/types/anchor_test";

describe("anchor-test", () => {
  // Configure the client to use the local cluster.\
  // const provider = anchor.Provider.env();
  // anchor.setProvider(provider);

  // const program = anchor.workspace.AnchorTest as Program<AnchorTest>;
  // const baseAccountLocal = anchor.web3.Keypair.generate();

  // // Set up test NFT
  // it("Is initialized!", async () => {
  //   // Add your test here.
  //   const tx = await program.rpc.basicTest({});
  //   console.log("Your transaction signature", tx);
  // });
  // it("allows enter hunt", async () => {
  //   const tx = await program.rpc.enterHunt({
  //     accounts: {
  //       user: provider.wallet.publicKey,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     },
  //     signers: [baseAccountLocal],
  //   });
  //   const baseAccountData = await program.account.baseAccount.fetch(
  //     baseAccountLocal.publicKey
  //   );
  //   const newCount = baseAccountData.count;
  //   console.log("newCount: " + newCount);
  //   assert.ok(newCount.toString() == "0");
  //   // _baseAccount = baseAccount;
  // });
  // it("increments", async () => {
  //   // const base
  //   const tx = await program.rpc.increment({
  //     accounts: { baseAccount: baseAccountLocal.publicKey },
  //     // signers: [baseAccountLocal],
  //   });
  //   const baseAccountData = await program.account.baseAccount.fetch(
  //     baseAccountLocal.publicKey
  //   );
  //   assert.ok(baseAccountData.count.toString() == "1");
  // });
  assert.ok(true);
});
