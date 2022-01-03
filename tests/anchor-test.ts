import * as anchor from "@project-serum/anchor";
import { NodeWallet } from "@project-serum/anchor/dist/cjs/provider";

import * as spl from "@solana/spl-token";

import assert = require("assert");
import { AnchorTest } from "../target/types/anchor_test";

describe("anchor-test", () => {
  // Configure the client to use the local cluster.\
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorTest as anchor.Program<AnchorTest>;

  let wallet: NodeWallet;
  let ustMint: spl.Token;
  let explorerMint: spl.Token;
  let gearMint: spl.Token;
  let potionMint: spl.Token;
  let fakeUserExplorerAccount: anchor.web3.PublicKey;
  let fakeUserGearAccount: anchor.web3.PublicKey;
  let fakeUserPotionAccount: anchor.web3.PublicKey;
  let fakeUserUstAccount: anchor.web3.PublicKey;

  before(async () => {
    wallet = program.provider.wallet as NodeWallet;

    const [mintAuthorityPda, mintAuthorityPdaBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("mint_auth", "utf-8")],
        program.programId
      );

    ustMint: spl.Token = await spl.Token.createMint(
      program.provider.connection,
      wallet.payer,
      wallet.publicKey,
      wallet.publicKey,
      0,
      spl.TOKEN_PROGRAM_ID
    );
    explorerMint: spl.Token = await spl.Token.createMint(
      program.provider.connection,
      wallet.payer,
      wallet.publicKey,
      wallet.publicKey,
      0,
      spl.TOKEN_PROGRAM_ID
    );
    gearMint: spl.Token = await spl.Token.createMint(
      program.provider.connection,
      wallet.payer,
      wallet.publicKey,
      wallet.publicKey,
      0,
      spl.TOKEN_PROGRAM_ID
    );
    potionMint: spl.Token = await spl.Token.createMint(
      program.provider.connection,
      wallet.payer,
      wallet.publicKey,
      wallet.publicKey,
      0,
      spl.TOKEN_PROGRAM_ID
    );

    fakeUserExplorerAccount: anchor.web3.PublicKey =
      await explorerMint.createAssociatedTokenAccount(
        program.provider.wallet.publicKey
      );
    fakeUserUstAccount: anchor.web3.PublicKey =
      await ustMint.createAssociatedTokenAccount(
        program.provider.wallet.publicKey
      );
    fakeUserGearAccount: anchor.web3.PublicKey =
      await gearMint.createAssociatedTokenAccount(
        program.provider.wallet.publicKey
      );
    fakeUserPotionAccount: anchor.web3.PublicKey =
      await potionMint.createAssociatedTokenAccount(
        program.provider.wallet.publicKey
      );
    await ustMint.mintTo(
      fakeUserUstAccount,
      program.provider.wallet.publicKey,
      [],
      1000
    );
    await explorerMint.mintTo(
      fakeUserExplorerAccount,
      program.provider.wallet.publicKey,
      [],
      1
    );
    await gearMint.mintTo(
      fakeUserGearAccount,
      program.provider.wallet.publicKey,
      [],
      1
    );
    await potionMint.mintTo(
      fakeUserPotionAccount,
      program.provider.wallet.publicKey,
      [],
      1
    );
    await gearMint.setAuthority(
      gearMint.publicKey,
      mintAuthorityPda,
      "MintTokens",
      wallet.publicKey,
      []
    );
    await potionMint.setAuthority(
      potionMint.publicKey,
      mintAuthorityPda,
      "MintTokens",
      wallet.publicKey,
      []
    );
  });
  it("Is initialized!", async () => {
    const [stateAccount, stateAccountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("state", "utf-8")],
        program.programId
      );
    const [programUstAccount, programUstAccountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("fund", "utf-8")],
        program.programId
      );

    await program.rpc.initializeProgram({
      stateAccountBump,
      programUstAccountBump,
      accounts: {
        owner: provider.wallet.publicKey,
        stateAccount: stateAccount,
        programUstAccount: programUstAccount,
        ustMint: ustMint,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
        associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [],
    });
    const state_account = await program.provider.connection.getAccountInfo(
      stateAccount
    );
    const state_data = state_account.data;
    console.log("test");
  });

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
