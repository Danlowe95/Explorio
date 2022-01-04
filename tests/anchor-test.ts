import * as anchor from "@project-serum/anchor";
import { NodeWallet } from "@project-serum/anchor/dist/cjs/provider";

import * as spl from "@solana/spl-token";

import assert = require("assert");
import { AnchorTest } from "../target/types/anchor_test";

interface FakeUser {
  user: anchor.web3.Keypair;
  explorerAccount: anchor.web3.PublicKey;
  ustAccount: anchor.web3.PublicKey;
  gearAccount: anchor.web3.PublicKey;
  potionAccount: anchor.web3.PublicKey;
}

const GEAR_MINT = new anchor.BN("2sHzUbXC5V6r4sn1RYFsK2Ui1rEckUFHBWLKt6SA3tqr");
const POTION_MINT = new anchor.BN(
  "2sHzUbXC5V6r4sn1RYFsK2Ui1rEckUFHBWLKt6SA3tqr"
);
const UST_MINT = new anchor.BN("CymnnQf3L2hCxWVWEETSTQEhPMZbiBNiB7oyoePM2Djm");

const createFakeUser = async (
  program: anchor.Program<AnchorTest>,
  explorerMint: spl.Token,
  ustMint: spl.Token,
  gearMint: spl.Token,
  potionMint: spl.Token
): Promise<FakeUser> => {
  const fakeUser = anchor.web3.Keypair.generate();
  const fakeUserExplorerAccount =
    await explorerMint.createAssociatedTokenAccount(fakeUser.publicKey);
  const fakeUserUstAccount = await ustMint.createAssociatedTokenAccount(
    fakeUser.publicKey
  );
  const fakeUserGearAccount = await gearMint.createAssociatedTokenAccount(
    fakeUser.publicKey
  );
  const fakeUserPotionAccount = await potionMint.createAssociatedTokenAccount(
    fakeUser.publicKey
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
  // fund some sol to fakeUser1 for the enterHunt transaction
  await program.provider.connection.confirmTransaction(
    await program.provider.connection.requestAirdrop(
      fakeUser.publicKey,
      10000000000
    ),
    "confirmed"
  );
  // await anchor.web3.SystemProgram.transfer({
  //   fromPubkey: program.provider.wallet.publicKey,
  //   lamports: 1_000_000_000, // 1 sol
  //   toPubkey: fakeUser.publicKey,
  // });
  return {
    user: fakeUser,
    explorerAccount: fakeUserExplorerAccount,
    ustAccount: fakeUserUstAccount,
    gearAccount: fakeUserGearAccount,
    potionAccount: fakeUserPotionAccount,
  };
};

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
  let mintAuth: anchor.web3.PublicKey;
  let mintAuthBump: number;
  let stateAccount: anchor.web3.PublicKey;
  let userArr: FakeUser[] = [];

  before(async () => {
    wallet = program.provider.wallet as NodeWallet;

    ustMint = await spl.Token.createMint(
      program.provider.connection,
      wallet.payer,
      wallet.publicKey,
      wallet.publicKey,
      0,
      spl.TOKEN_PROGRAM_ID
    );

    const [mintAuthorityPda, mintAuthorityPdaBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("mint_auth", "utf-8")],
        program.programId
      );
    mintAuth = mintAuthorityPda;
    mintAuthBump = mintAuthorityPdaBump;
    explorerMint = await spl.Token.createMint(
      program.provider.connection,
      wallet.payer,
      wallet.publicKey,
      wallet.publicKey,
      0,
      spl.TOKEN_PROGRAM_ID
    );
    gearMint = await spl.Token.createMint(
      program.provider.connection,
      wallet.payer,
      wallet.publicKey,
      wallet.publicKey,
      0,
      spl.TOKEN_PROGRAM_ID
    );
    potionMint = await spl.Token.createMint(
      program.provider.connection,
      wallet.payer,
      wallet.publicKey,
      wallet.publicKey,
      0,
      spl.TOKEN_PROGRAM_ID
    );

    const fakeUser1: FakeUser = await createFakeUser(
      program,
      explorerMint,
      ustMint,
      gearMint,
      potionMint
    );
    userArr.push(fakeUser1);

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
  it("Is initializes!", async () => {
    const stateAccountKeypair = anchor.web3.Keypair.generate();
    stateAccount = stateAccountKeypair.publicKey;

    const [programUstAccount, programUstAccountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("fund", "utf-8")],
        program.programId
      );

    await program.rpc.initializeProgram(programUstAccountBump, mintAuthBump, {
      accounts: {
        owner: provider.wallet.publicKey,
        stateAccount: stateAccountKeypair.publicKey,
        programUstAccount: programUstAccount,
        ustMint: ustMint.publicKey,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
        associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [stateAccountKeypair],
      instructions: [
        await program.account.huntState.createInstruction(
          stateAccountKeypair,
          280043
        ),
      ],
    });
    // const onChainState = await program.provider.connection.getAccountInfo(
    //   stateAccountKeypair.publicKey
    // );
    // TODO 'Error: Invalid option undefined' when running this fetch. Probably related to deserializing the hunt_state_arr which blows.
    // let huntState = await program.account.huntState.fetch(stateAccount);
    // console.log("huntState:");
    // console.log(huntState.isInitialized);
    // console.log(huntState.mintAuthAccountBump);
    // console.log(huntState.owner);
    // console.log(huntState.huntStateArr);
  });
  it("allows a user to enter their explorer", async () => {
    // enter fakeUser1 into hunt.
    const fakeUser1 = userArr[0];
    let user1ExplorerAccount = await explorerMint.getAccountInfo(
      fakeUser1.explorerAccount
    );
    assert(user1ExplorerAccount.amount.toNumber() === 1);
    let user1GearAccount = await gearMint.getAccountInfo(fakeUser1.gearAccount);
    assert(user1GearAccount.amount.toNumber() === 1);

    const [explorerEscrowAccount, expEscrowBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("explorer")),
          explorerMint.publicKey.toBuffer(),
          fakeUser1.user.publicKey.toBuffer(),
        ],
        program.programId
      );

    await program.rpc.enterHunt(expEscrowBump, {
      accounts: {
        user: fakeUser1.user.publicKey,
        userExplorerAccount: fakeUser1.explorerAccount,
        userProvidedGearAssociatedAccount: fakeUser1.gearAccount,
        explorerEscrowAccount: explorerEscrowAccount,
        providedGearMint: gearMint.publicKey,
        explorerMint: explorerMint.publicKey,
        mintAuth: mintAuth,
        stateAccount: stateAccount,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [fakeUser1.user],
    });
    user1ExplorerAccount = await explorerMint.getAccountInfo(
      fakeUser1.explorerAccount
    );
    assert(user1ExplorerAccount.amount.toNumber() === 0);
    user1GearAccount = await gearMint.getAccountInfo(fakeUser1.gearAccount);
    assert(user1GearAccount.amount.toNumber() === 0);
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
