import * as anchor from "@project-serum/anchor";
import { NodeWallet } from "@project-serum/anchor/dist/cjs/provider";

import * as spl from "@solana/spl-token";
import assert = require("assert");
import { AnchorTest } from "../target/types/anchor_test";
import env from "../local/env.json";

import {
  DATA_FILE,
  USER_ACCOUNTS_FILE,
  RESULTS_FILE,
  USER_GROUP_SIZE,
  NONE_ID,
  SHORTSWORD_ID,
  POT_OF_STRENGTH_ID,
  NONE_POTION_ID,
  NONE_GEAR_ID,
  TREASURE_NAMES,
  MintMap,
  FakeUser,
  EnteredExplorer,
} from "./consts";

import {
  createFakeUser,
  createFakeUsers,
  createMintNumArray,
  getBestGearAvailable,
  usablePotionAvailable,
  getBestPotionAvailable,
  updateAccountHoldings,
  airdropUserGroupIfNeeded,
  recreateFromInitializedUsers,
  logAccountState,
  doFetchVrf,
  doFetchVrfAndProcessHunt,
  doProcessHunt,
  doEnterHunt,
  doChecksAndClaimHunt,
  doClaimHunt,
  runUserGroupTest,
  fetchUserGroupHoldings,
} from "./helpers";

const fs = require("fs");

// Pull in local mint data (after generate_mints_config)
const { mints } = env;
// Pull in any already initialized state data

let initializedData: {
  stateAccount: anchor.web3.PublicKey | null;
  vrfAccount: anchor.web3.PublicKey | null;
  explorerMint: spl.Token | null;
  ustMint: spl.Token | null;
};

let initializedUsers; // untyped, FakeUser[]-like
// If file is initialized, it's expected to be a valid config.
if (fs.existsSync(USER_ACCOUNTS_FILE)) {
  const res = fs.readFileSync(USER_ACCOUNTS_FILE);
  const parsedData = JSON.parse(res);
  initializedUsers = parsedData;
}

describe("anchor-test", () => {
  // Configure the client to use the local cluster.\
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);
  console.log("wallet account pubkey: " + provider.wallet.publicKey.toString());
  const program = anchor.workspace.AnchorTest as anchor.Program<AnchorTest>;

  let wallet: NodeWallet;
  let ustMint: spl.Token;
  let explorerMint: spl.Token;
  let mintAuth: anchor.web3.PublicKey;
  let mintAuthBump: number;
  // TODO don't require copy/paste of this

  let fakeUser1: FakeUser;
  let userGroup: FakeUser[] = [];
  let programUstAccount: anchor.web3.PublicKey;
  let programUstAccountBump: number;
  let stateAccount: anchor.web3.PublicKey;
  let vrfAccount: anchor.web3.PublicKey;

  // Experimental
  let mintMap: MintMap = {};
  let firstRun = true;

  before(async () => {
    wallet = program.provider.wallet as NodeWallet;

    const [mintAuthorityPda, mintAuthorityPdaBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode("mint_auth"))],
        program.programId
      );
    [programUstAccount, programUstAccountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode("fund"))],
        program.programId
      );

    mintAuth = mintAuthorityPda;
    mintAuthBump = mintAuthorityPdaBump;

    // If file is initialized, it's expected to be a valid config.
    if (fs.existsSync(DATA_FILE)) {
      const res = fs.readFileSync(DATA_FILE);
      const parsedData = JSON.parse(res);
      initializedData = {
        stateAccount: new anchor.web3.PublicKey(parsedData.stateAccount),
        vrfAccount: new anchor.web3.PublicKey(parsedData.vrfAccount),
        explorerMint: new spl.Token(
          program.provider.connection,
          new anchor.web3.PublicKey(parsedData.explorerMint),
          spl.TOKEN_PROGRAM_ID,
          wallet.payer
        ),
        ustMint: new spl.Token(
          program.provider.connection,
          new anchor.web3.PublicKey(parsedData.ustMint),
          spl.TOKEN_PROGRAM_ID,
          wallet.payer
        ),
      };
    }
    if (initializedData) {
      explorerMint = initializedData.explorerMint;
      ustMint = initializedData.ustMint;
      stateAccount = initializedData.stateAccount;
      vrfAccount = initializedData.vrfAccount;
    }

    firstRun = stateAccount == null;

    // Read all PublicKeys from mints object and generate spl.Token objects for each, storing Token in mintMap.
    await Promise.all(
      mints.map(async ({ id, address }) => {
        mintMap[id] = new spl.Token(
          program.provider.connection,
          new anchor.web3.PublicKey(address),
          spl.TOKEN_PROGRAM_ID,
          wallet.payer
        );
      })
    );
  });
  it("Is initializes!", async () => {
    if (firstRun) {
      // Create the mints to represent explorers and ust
      explorerMint = await spl.Token.createMint(
        program.provider.connection,
        wallet.payer,
        wallet.publicKey,
        wallet.publicKey,
        0,
        spl.TOKEN_PROGRAM_ID
      );
      ustMint = await spl.Token.createMint(
        program.provider.connection,
        wallet.payer,
        wallet.publicKey,
        wallet.publicKey,
        0,
        spl.TOKEN_PROGRAM_ID
      );
      // All mints are owned by provided.wallet after mint only because mintAuth isn't known
      // transfer ownership of all mints to the program now
      await Promise.all(
        Object.entries(mintMap).map(
          async ([, mint]) =>
            await mint.setAuthority(
              mint.publicKey,
              mintAuth,
              "MintTokens",
              wallet.publicKey,
              []
            )
        )
      );

      const stateAccountKeypair = anchor.web3.Keypair.generate();
      const vrfAccountKeypair = anchor.web3.Keypair.generate();
      stateAccount = stateAccountKeypair.publicKey;
      vrfAccount = vrfAccountKeypair.publicKey;
      console.log("State account key (for saving): " + stateAccount);
      console.log("VRF account key (for saving): " + vrfAccount);
      console.log("Explorer mint key (for saving): " + explorerMint.publicKey);
      console.log("UST mint key (for saving): " + ustMint.publicKey);
      // Write these two accounts so they can be referenced later
      fs.writeFileSync(
        DATA_FILE,
        JSON.stringify({
          stateAccount: stateAccount.toString(),
          vrfAccount: vrfAccount.toString(),
          explorerMint: explorerMint.publicKey.toString(),
          ustMint: ustMint.publicKey.toString(),
        })
      );
      await program.rpc.initializeProgram(programUstAccountBump, mintAuthBump, {
        accounts: {
          owner: provider.wallet.publicKey,
          stateAccount: stateAccountKeypair.publicKey,
          vrfAccount: vrfAccountKeypair.publicKey,
          programUstAccount: programUstAccount,
          ustMint: ustMint.publicKey,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
          associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [stateAccountKeypair, vrfAccountKeypair],
        instructions: [
          await program.account.huntState.createInstruction(
            stateAccountKeypair,
            225043
          ),
          await program.account.vrfState.createInstruction(
            vrfAccountKeypair,
            20010
          ),
        ],
      });
    }

    // Fetch state after initialization.
    // Make sure hunt state is in expected state before continuing to tests
    let huntState = await program.account.huntState.fetch(stateAccount);
    assert(huntState.isInitialized === true);
    assert(huntState.owner.equals(provider.wallet.publicKey));

    const huntStateArr: Array<any> = huntState.huntStateArr as Array<any>;
    // assert(huntStateArr.every((x) => x.isEmpty === true));
    let vrfState = await program.account.vrfState.fetch(vrfAccount);
    assert(vrfState.isInitialized === true);
  });
  it("Creates all test users and airdrops them", async () => {
    // Create single user for first set of tests
    fakeUser1 = await createFakeUser(program, {
      explorerMint,
      ustMint,
      mintMap,
      mintAuth,
      stateAccount,
    });
    // Load userGroup from saved file (if available) or create them and store.
    if (initializedUsers && initializedUsers.length !== 0) {
      userGroup = recreateFromInitializedUsers(initializedUsers);
      await fetchUserGroupHoldings(userGroup, mintMap);
      await airdropUserGroupIfNeeded(
        program,
        userGroup,
        mintMap,
        mintAuth,
        stateAccount
      );
    } else {
      userGroup = await createFakeUsers(USER_GROUP_SIZE, program, {
        explorerMint,
        ustMint,
        mintMap,
        mintAuth,
        stateAccount,
      });
      fs.writeFileSync(
        USER_ACCOUNTS_FILE,
        JSON.stringify(
          userGroup.map((userData) => ({
            ...userData,
            explorerAccount: userData.explorerAccount.toBase58(),
            explorerEscrowAccount: userData.explorerEscrowAccount.toBase58(),
            ustAccount: userData.ustAccount.toBase58(),
            userAssociatedAccountMintMap: Object.fromEntries(
              Object.entries(userData.userAssociatedAccountMintMap).map(
                ([key, val]) => [key, val.toBase58()]
              )
            ),
          }))
        )
      );
    } // Create X sized user group for test
  });
  it("EnterHunt: Single Explorer - takes proper tokens and succeeds", async () => {
    // Setup to enter fakeUser1 into hunt.
    let fakeUserExplorerAccount = await explorerMint.getAccountInfo(
      fakeUser1.explorerAccount
    );
    let fakeUserShortswordAccount = await mintMap[SHORTSWORD_ID].getAccountInfo(
      fakeUser1.userAssociatedAccountMintMap[SHORTSWORD_ID]
    );
    let fakeUserPotionOfStrengthAccount = await mintMap[
      POT_OF_STRENGTH_ID
    ].getAccountInfo(
      fakeUser1.userAssociatedAccountMintMap[POT_OF_STRENGTH_ID]
    );
    // basic checks: confirm the accounts are populated as expected.
    assert(fakeUserExplorerAccount.amount.toNumber() === 1);
    assert(fakeUserShortswordAccount.amount.toNumber() === 1);
    assert(fakeUserPotionOfStrengthAccount.amount.toNumber() === 0);

    // Do transaction
    await doEnterHunt(fakeUser1, {
      program,
      explorerMint,
      mintMap,
      mintAuth,
      stateAccount,
    });

    // Refetch data
    fakeUserExplorerAccount = await explorerMint.getAccountInfo(
      fakeUser1.explorerAccount
    );
    fakeUserShortswordAccount = await mintMap[SHORTSWORD_ID].getAccountInfo(
      fakeUser1.userAssociatedAccountMintMap[SHORTSWORD_ID]
    );
    fakeUserPotionOfStrengthAccount = await mintMap[
      POT_OF_STRENGTH_ID
    ].getAccountInfo(
      fakeUser1.userAssociatedAccountMintMap[POT_OF_STRENGTH_ID]
    );
    // Confirm the explorer+gear tokens were taken from the user.
    assert(fakeUserExplorerAccount.amount.toNumber() === 0);
    assert(fakeUserShortswordAccount.amount.toNumber() === 0);
    assert(fakeUserPotionOfStrengthAccount.amount.toNumber() === 0);

    // Confirm the escrow account now owns 1 explorer.
    const user1ExplorerEscrowAccount = await explorerMint.getAccountInfo(
      fakeUser1.explorerEscrowAccount
    );
    assert(user1ExplorerEscrowAccount.amount.toNumber() === 1);

    // Confirm state account now has a single entry with isEmpty: false, with proper data inside.
    let huntState = await program.account.huntState.fetch(stateAccount);
    let huntStateArr: Array<any> = huntState.huntStateArr as Array<any>;

    assert(huntStateArr.filter((x) => x.isEmpty).length === 4999);
    assert(huntStateArr.filter((x) => !x.isEmpty).length === 1);
    const enteredExplorer = huntStateArr.find((x) => x.isEmpty === false);
    assert(
      enteredExplorer.explorerEscrowAccount.equals(
        fakeUser1.explorerEscrowAccount
      )
    );
    assert(enteredExplorer.providedGearMintId === SHORTSWORD_ID);
    // No potion entered, so providedPotionMintId should be 0
    assert(enteredExplorer.providedPotionMintId === NONE_ID);
    assert(enteredExplorer.hasHunted === false);
    assert(enteredExplorer.foundTreasure === false);
    assert(
      enteredExplorer.explorerEscrowBump === fakeUser1.explorerEscrowAccountBump
    );
  });
  it("Does not allow claim until after processing", async () => {
    // This should fail
    try {
      await doClaimHunt(fakeUser1, {
        program,
        mintAuth,
        explorerMint,
        stateAccount,
        mintMap,
      });
      assert.ok(false);
    } catch (err) {
      const errMsg =
        "Claim is not possible yet as the Explorer has not hunted.";
      // const altErrMsg = "A token mint constraint was violated";
      assert.equal(errMsg, err.toString());
    }
    // Likely useless asserts below -- confirm that the transaction didn't modify anything.
    const huntState = await program.account.huntState.fetch(stateAccount);
    const huntStateArr = huntState.huntStateArr as Array<any>;
    // Confirm the user's explorer is still in the state.
    assert(
      huntStateArr.some((x) =>
        x.explorerEscrowAccount.equals(fakeUser1.explorerEscrowAccount)
      )
    );
    const fakeUserExplorerAccount = await explorerMint.getAccountInfo(
      fakeUser1.explorerAccount
    );
    const fakeUserShortswordAccount = await mintMap[
      SHORTSWORD_ID
    ].getAccountInfo(fakeUser1.userAssociatedAccountMintMap[SHORTSWORD_ID]);

    // Confirm the explorer+gear accounts still have 0.
    assert(fakeUserExplorerAccount.amount.toNumber() === 0);
    assert(fakeUserShortswordAccount.amount.toNumber() === 0);
  });
  it("Does not allow processing until after a vrf call", async () => {
    // This should fail
    try {
      await doProcessHunt({
        program,
        stateAccount,
        programUstAccount,
        vrfAccount,
      });
      assert.ok(false);
    } catch (err) {
      const errMsg = "Randomness has not been generated ahead of processing.";
      assert.equal(errMsg, err.toString());
    }
  });

  it("ProcessHunt: Single Explorer - modifies state account values properly", async () => {
    await doFetchVrfAndProcessHunt({
      program,
      stateAccount,
      programUstAccount,
      vrfAccount,
    });

    let huntState = await program.account.huntState.fetch(stateAccount);
    const huntStateArr: Array<any> = huntState.huntStateArr as Array<any>;
    // Confirm the individual entries of hunt array are still as expected
    assert(huntStateArr.filter((x) => x.isEmpty).length === 4999);
    assert(huntStateArr.filter((x) => !x.isEmpty).length === 1);
    // Confirm we haven't modified any of the empty array slots.
    assert(huntStateArr.filter((x) => x.isEmpty && x.hasHunted).length === 0);
    const enteredExplorers = huntStateArr.filter((x) => x.isEmpty === false);
    assert(enteredExplorers.length === 1);
    // Confirm all entered explorers have had their hasHunted bools flipped after processing.
    assert(enteredExplorers.filter((x) => x.hasHunted === true).length === 1);
  });
  it("ClaimHunt: Single Explorer - Allows retrieval of expected tokens", async () => {
    // Fetch required data from state account first.

    let fakeUserExplorerAccount = await explorerMint.getAccountInfo(
      fakeUser1.explorerAccount
    );
    let fakeUserShortswordAccount = await mintMap[SHORTSWORD_ID].getAccountInfo(
      fakeUser1.userAssociatedAccountMintMap[SHORTSWORD_ID]
    );

    // Confirm the explorer+gear accounts still have 0.
    assert(fakeUserExplorerAccount.amount.toNumber() === 0);
    assert(fakeUserShortswordAccount.amount.toNumber() === 0);
    await doChecksAndClaimHunt(
      fakeUser1,
      {
        program,
        mintAuth,
        explorerMint,
        stateAccount,
        mintMap,
      },
      1
    );
  });
  it("Sets up VRF for next and does not allow more than one vrf call", async () => {
    let vrfState = await program.account.vrfState.fetch(vrfAccount);
    console.log(vrfState.vrfArr.slice(0, 1));
    assert(vrfState.isUsable === false);
    // VRF state was used, so should successfully refetch vrf.
    await doFetchVrf({
      program,
      stateAccount,
      programUstAccount,
      vrfAccount,
    });
    vrfState = await program.account.vrfState.fetch(vrfAccount);

    assert(vrfState.isUsable);
    // Then try again immediately after - should fail
    try {
      await doFetchVrf({
        program,
        stateAccount,
        programUstAccount,
        vrfAccount,
      });
      assert.ok(false);
    } catch (err) {
      const errMsg = "Randomness has already been generated.";
      assert.equal(errMsg, err.toString());
    }
    // Run another process to unlock VRF state. This should no-op since no explorers are entered.
    await doProcessHunt({
      program,
      stateAccount,
      programUstAccount,
      vrfAccount,
    });
    vrfState = await program.account.vrfState.fetch(vrfAccount);

    assert(!vrfState.isUsable);
  });
  it(`${USER_GROUP_SIZE} user test!`, async () => {
    await runUserGroupTest({
      userGroup,
      program,
      explorerMint,
      mintMap,
      mintAuth,
      stateAccount,
      vrfAccount,
      programUstAccount,
      fs,
    });
  });
});
