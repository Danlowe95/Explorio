import * as anchor from "@project-serum/anchor";
import { NodeWallet } from "@project-serum/anchor/dist/cjs/provider";

import * as spl from "@solana/spl-token";
import assert = require("assert");
import { AnchorTest } from "../target/types/anchor_test";
import env from "../local/env.json";

import {
  USER_GROUP_SIZE,
  MintMap,
  FakeUser,
  TREASURE_NAMES,
  HUNT_ACCOUNT_SIZE,
  VRF_ACCOUNT_SIZE,
  HISTORY_ACCOUNT_SIZE,
  GEARDROP_ACCOUNT_SIZE,
} from "./consts";

import {
  createFakeUser,
  createFakeUsers,
  airdropUserGroupIfNeeded,
  fetchUserGroupHoldings,
  recreateFromInitializedUsers,
  runUserGroupTest,
  createMintNumArray,
  logAccountState,
} from "./helpers";

const fs = require("fs");

// Pull in local mint data (after generate_mints_config)
const { mints } = env;
// Pull in any already initialized state data
const DATA_FILE = "./local/initialized_data.json";
const RESULTS_FILE = "./local/results.json";
const USER_ACCOUNTS_FILE = `./local/initialized_accounts.json`;

let initializedData: {
  stateAccount: anchor.web3.PublicKey | null;
  vrfAccount: anchor.web3.PublicKey | null;
  switchboardVrfAccount: anchor.web3.PublicKey | null;
  historyAccount: anchor.web3.PublicKey | null;
  geardropAccount: anchor.web3.PublicKey | null;
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

describe("50-user-repeated", () => {
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
  let geardropStateAccount: anchor.web3.PublicKey;
  let geardropStateAccountBump: number;
  // TODO don't require copy/paste of this

  let userGroup: FakeUser[] = [];
  let programUstAccount: anchor.web3.PublicKey;
  let programUstAccountBump: number;
  let switchboardVrfAccount: anchor.web3.PublicKey;
  let switchboardVrfAccountBump: number;
  let stateAccount: anchor.web3.PublicKey;
  let vrfAccount: anchor.web3.PublicKey;
  let historyAccount: anchor.web3.PublicKey;
  let geardropAccount: anchor.web3.PublicKey;
  // Experimental
  let mintMap: MintMap = {};
  let firstRun = true;

  before(async () => {
    wallet = program.provider.wallet as NodeWallet;

    [mintAuth, mintAuthBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode("mint_auth"))],
      program.programId
    );
    [geardropStateAccount, geardropStateAccountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode("geardrop"))],
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
        geardropAccount: new anchor.web3.PublicKey(parsedData.geardropAccount),
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
      geardropAccount = initializedData.geardropAccount;
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
      const geardropAccountKeypair = anchor.web3.Keypair.generate();

      stateAccount = stateAccountKeypair.publicKey;
      vrfAccount = vrfAccountKeypair.publicKey;
      historyAccount = historyAccountKeypair.publicKey;
      geardropAccount = geardropAccountKeypair.publicKey;
      console.log("State account key (for saving): " + stateAccount);
      console.log("VRF account key (for saving): " + vrfAccount);
      console.log("History account key (for saving): " + historyAccount);
      console.log("Explorer mint key (for saving): " + explorerMint.publicKey);
      console.log("Geardrop account key (for saving): " + geardropAccount);
      console.log("UST mint key (for saving): " + ustMint.publicKey);
      // Write these two accounts so they can be referenced later
      fs.writeFileSync(
        DATA_FILE,
        JSON.stringify({
          stateAccount: stateAccount.toString(),
          vrfAccount: vrfAccount.toString(),
          switchboardVrfAccount: switchboardVrfAccount.toString(),
          historyAccount: historyAccount.toString(),
          geardropAccount: geardropAccount.toString(),
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
            historyAccount: historyAccountKeypair.publicKey,
            switchboardVrfAccount: switchboardVrfAccount,
            geardropStateAccount: geardropAccountKeypair.publicKey,
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
            geardropAccountKeypair,
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
            await program.account.geardropState.createInstruction(
              geardropAccountKeypair,
              GEARDROP_ACCOUNT_SIZE
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
  });
  it("Creates all test users and airdrops them", async () => {
    // Load userGroup from saved file (if available) or create them and store.
    if (initializedUsers && initializedUsers.length !== 0) {
      userGroup = recreateFromInitializedUsers(initializedUsers);
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
  const resultString = (num) => `./local/results/results_${num}.json`;
  const PERSISTED_DATA_FILE = "./local/results/persisted_totals.json";
  it(`${USER_GROUP_SIZE} user test!`, async () => {
    let runNumber = 0;
    const results = {
      totalProcessed: 0,
      treasureFound: 0,
      treasureById: createMintNumArray(),
      numCombatRewards: 0,
      numCombats: 0,
    };
    let totalResults = {
      totalProcessed: 0,
      treasureFound: 0,
      treasureById: createMintNumArray(),
      numCombatRewards: 0,
      numCombats: 0,
    };
    if (fs.existsSync(PERSISTED_DATA_FILE)) {
      const res = fs.readFileSync(PERSISTED_DATA_FILE);
      totalResults = JSON.parse(res);
    }
    await fetchUserGroupHoldings(userGroup, mintMap);

    // logAccountState(userGroup);

    while (runNumber < 20) {
      await airdropUserGroupIfNeeded(
        program,
        userGroup,
        mintMap,
        mintAuth,
        stateAccount
      );
      await runUserGroupTest({
        userGroup,
        program,
        explorerMint,
        historyAccount,
        mintMap,
        mintAuth,
        stateAccount,
        vrfAccount,
        switchboardVrfAccount,
        programUstAccount,
        fs,
        results,
        doLog: runNumber % 10 == 0,
      });
      runNumber++;
      if (runNumber % 10 == 0) {
        // Health checks: Slice of history Arr, slice of vrfArray, write results so far to file
        let historyState = await program.account.historyState.fetch(
          historyAccount
        );
        console.log("Writeind: " + historyState.writeInd);
        console.log(
          historyState.historyArr.slice(
            historyState.writeInd - 3,
            historyState.writeInd - 1
          )
        );
        const {
          totalExplorers,
          totalGearBurned,
          totalHunts,
          totalPer,
          historyArr,
          writeInd,
        } = historyState;
        const prettifiedResults = {
          ...results,
          treasureById: Object.fromEntries(
            Object.entries(results.treasureById).map(([id, num]) => [
              TREASURE_NAMES[id],
              num,
            ])
          ),
          totalExplorers: totalExplorers.toNumber(),
          totalGearBurned: totalGearBurned.toNumber(),
          totalHunts: totalHunts.toNumber(),
          totalPer: Object.fromEntries(
            totalPer.map((entry, ind) => [
              TREASURE_NAMES[ind],
              entry.toNumber(),
            ])
          ),
          recentHistoryRow: historyArr[writeInd - 2],
        };
        // Confirm our results array matches up with on-chain history state data.
        // assert(
        //   totalExplorers.toNumber() ===
        //     results.totalProcessed + totalResults.totalProcessed
        // );
        // totalPer.map((entry, ind) => [
        //   TREASURE_NAMES[ind],
        //   results.treasureById[ind] + totalResults.treasureById[ind] ==
        //     entry.toNumber(),
        // ]);

        fs.writeFileSync(
          resultString(runNumber),
          JSON.stringify(prettifiedResults)
        );
      }
    }
    const prettifiedResults = {
      ...results,
      treasureById: Object.fromEntries(
        Object.entries(results.treasureById).map(([id, num]) => [
          TREASURE_NAMES[id],
          num,
        ])
      ),
    };
    console.log(results);
    console.log(
      Object.fromEntries(
        Object.entries(results.treasureById).map(([id, num]) => [
          TREASURE_NAMES[id],
          num,
        ])
      )
    );
    fs.writeFileSync(PERSISTED_DATA_FILE, JSON.stringify(prettifiedResults));
  });
});
