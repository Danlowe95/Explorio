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
  HUNT_ACCOUNT_SIZE,
  VRF_ACCOUNT_SIZE,
  HISTORY_ACCOUNT_SIZE,
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
  switchboardVrfAccount: anchor.web3.PublicKey | null;
  historyAccount: anchor.web3.PublicKey | null;
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
  let switchboardVrfAccount: anchor.web3.PublicKey;
  let switchboardVrfAccountBump: number;
  let historyAccount: anchor.web3.PublicKey;

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
    [switchboardVrfAccount, switchboardVrfAccountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode("vrf_num"))],
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
        switchboardVrfAccount: new anchor.web3.PublicKey(
          parsedData.switchboardVrfAccount
        ),
        historyAccount: new anchor.web3.PublicKey(parsedData.historyAccount),
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
      switchboardVrfAccount = initializedData.switchboardVrfAccount;

      historyAccount = initializedData.historyAccount;
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
      const historyAccountKeypair = anchor.web3.Keypair.generate();
      stateAccount = stateAccountKeypair.publicKey;
      vrfAccount = vrfAccountKeypair.publicKey;
      historyAccount = historyAccountKeypair.publicKey;
      console.log("State account key (for saving): " + stateAccount);
      console.log("VRF account key (for saving): " + vrfAccount);
      console.log("Explorer mint key (for saving): " + explorerMint.publicKey);
      console.log("UST mint key (for saving): " + ustMint.publicKey);
      console.log("history key (for saving): " + historyAccount);
      // Write these two accounts so they can be referenced later
      fs.writeFileSync(
        DATA_FILE,
        JSON.stringify({
          stateAccount: stateAccount.toString(),
          vrfAccount: vrfAccount.toString(),
          historyAccount: historyAccount.toString(),
          explorerMint: explorerMint.publicKey.toString(),
          ustMint: ustMint.publicKey.toString(),
        })
      );
      await program.rpc.initializeProgram(
        programUstAccountBump,
        mintAuthBump,
        switchboardVrfAccountBump,
        {
          accounts: {
            owner: provider.wallet.publicKey,
            stateAccount: stateAccountKeypair.publicKey,
            vrfAccount: vrfAccountKeypair.publicKey,
            switchboardVrfAccount: switchboardVrfAccount,
            historyAccount: historyAccountKeypair.publicKey,
            programUstAccount: programUstAccount,
            ustMint: ustMint.publicKey,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
            associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
          signers: [
            stateAccountKeypair,
            vrfAccountKeypair,
            historyAccountKeypair,
          ],
          instructions: [
            await program.account.huntState.createInstruction(
              stateAccountKeypair,
              HUNT_ACCOUNT_SIZE
            ),
            await program.account.vrfState.createInstruction(
              vrfAccountKeypair,
              VRF_ACCOUNT_SIZE
            ),
            await program.account.historyState.createInstruction(
              historyAccountKeypair,
              HISTORY_ACCOUNT_SIZE
            ),
          ],
        }
      );
    }

    // Fetch state after initialization.
    // Make sure hunt state is in expected state before continuing to tests
    let huntState = await program.account.huntState.fetch(stateAccount);
    assert(huntState.isInitialized === 1);
    assert(huntState.owner.equals(provider.wallet.publicKey));

    const huntStateArr: Array<any> = huntState.huntStateArr as Array<any>;
    // assert(huntStateArr.every((x) => x.isEmpty === true));
    let vrfState = await program.account.vrfState.fetch(vrfAccount);
    assert(vrfState.isInitialized === 1);

    let historyState = await program.account.historyState.fetch(historyAccount);
    // assert(historyState.totalHunts.toNumber() === 0);
    console.log("History:");
    console.log(historyState.totalHunts.toNumber());
    console.log(historyState.totalExplorers.toNumber());
  });
  it("Creates all test users and airdrops them", async () => {
    // Create single user for first set of tests
    fakeUser1 = await createFakeUser(program, {
      explorerId: 0,
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
    console.log(huntStateArr.slice(0, 1));
    assert(huntStateArr.filter((x) => x.isEmpty === 1).length === 4999);
    assert(huntStateArr.filter((x) => x.isEmpty === 0).length === 1);
    const enteredExplorer = huntStateArr.find((x) => x.isEmpty === 0);
    assert(
      enteredExplorer.explorerEscrowAccount.equals(
        fakeUser1.explorerEscrowAccount
      )
    );
    assert(enteredExplorer.providedGearMintId === SHORTSWORD_ID);
    // No potion entered, so providedPotionMintId should be 0
    assert(enteredExplorer.providedPotionMintId === NONE_ID);
    assert(enteredExplorer.hasHunted === 0);
    assert(enteredExplorer.foundTreasure === 0);
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
        historyAccount,
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
      switchboardVrfAccount,
      historyAccount,
    });

    let huntState = await program.account.huntState.fetch(stateAccount);
    const huntStateArr: Array<any> = huntState.huntStateArr as Array<any>;
    // Confirm the individual entries of hunt array are still as expected
    assert(huntStateArr.filter((x) => x.isEmpty === 1).length === 4999);
    assert(huntStateArr.filter((x) => x.isEmpty === 0).length === 1);
    // Confirm we haven't modified any of the empty array slots.
    assert(huntStateArr.filter((x) => x.isEmpty && x.hasHunted).length === 0);
    const enteredExplorers = huntStateArr.filter((x) => x.isEmpty === 0);
    assert(enteredExplorers.length === 1);
    // Confirm all entered explorers have had their hasHunted bools flipped after processing.
    assert(enteredExplorers.filter((x) => x.hasHunted === 1).length === 1);
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
    assert(vrfState.isUsable === 0);
    // VRF state was used, so should successfully refetch vrf.
    await doFetchVrf({
      program,
      stateAccount,
      switchboardVrfAccount,
      vrfAccount,
    });
    vrfState = await program.account.vrfState.fetch(vrfAccount);

    assert(vrfState.isUsable);
    // Then try again immediately after - should fail
    try {
      await doFetchVrf({
        program,
        stateAccount,
        switchboardVrfAccount,
        vrfAccount,
      });
      assert.ok(false);
    } catch (err) {
      const errMsg = "Randomness has already been requested.";
      assert.equal(errMsg, err.toString());
    }
    // Run another process to unlock VRF state. This should no-op since no explorers are entered.
    await doProcessHunt({
      program,
      stateAccount,
      programUstAccount,
      vrfAccount,
      historyAccount,
    });
    vrfState = await program.account.vrfState.fetch(vrfAccount);
    const historyState = await program.account.historyState.fetch(
      historyAccount
    );
    assert(vrfState.isUsable === 0);
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
      switchboardVrfAccount,
      historyAccount,
      programUstAccount,
      fs,
      results: undefined,
      doLog: true,
    });
  });
});
