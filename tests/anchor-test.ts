import * as anchor from "@project-serum/anchor";
import { NodeWallet } from "@project-serum/anchor/dist/cjs/provider";

import * as spl from "@solana/spl-token";
import assert = require("assert");
import { AnchorTest } from "../target/types/anchor_test";
import env from "../local/env.json";
const fs = require("fs");

const SHORTSWORD_ID = 1;
const LEATHER_ARMOR_ID = 2;
const DAGGER_ID = 3;
const SHORTBOW_ID = 4;
const LONGSWORD_ID = 5;
const CHAINMAIL_ARMOR_ID = 6;
const CROSSBOW_ID = 7;
const PLATE_ARMOR_ID = 8;
const CUTTHROATS_DAGGER_ID = 9;
const EXCALIBUR_ID = 10;
const TREASURE_SCROLL_ID = 11;

const POT_OF_SWIFTNESS_ID = 12;
const POT_OF_STRENGTH_ID = 13;
const POT_OF_MENDING_ID = 14;
const POT_OF_RESILIENCE_ID = 15;

const GRAIL_ID = 16;

const TREASURE_NAMES = {
  0: "None",
  [SHORTSWORD_ID]: "Shortsword",
  [LEATHER_ARMOR_ID]: "LeatherArmor",
  [DAGGER_ID]: "Dagger",
  [SHORTBOW_ID]: "Shortbow",
  [LONGSWORD_ID]: "Longsword",
  [CHAINMAIL_ARMOR_ID]: "ChainMailArmor",
  [CROSSBOW_ID]: "Crossbow",
  [PLATE_ARMOR_ID]: "PlateArmor",
  [CUTTHROATS_DAGGER_ID]: "CutthroatsDagger",
  [EXCALIBUR_ID]: "Excalibur",
  [TREASURE_SCROLL_ID]: "TreasureScroll",
  [POT_OF_SWIFTNESS_ID]: "PotOfSwiftness",
  [POT_OF_STRENGTH_ID]: "PotOfStrength",
  [POT_OF_MENDING_ID]: "PotOfMending",
  [POT_OF_RESILIENCE_ID]: "PotOfRes",
  [GRAIL_ID]: "Grail",
};
interface MintMap {
  [mintId: number]: spl.Token;
}
interface AssociatedAccountMintMap {
  [mintId: number]: anchor.web3.PublicKey;
}
interface MintMapValues {
  [mintId: number]: number;
}

interface FakeUser {
  user: anchor.web3.Keypair;
  explorerAccount: anchor.web3.PublicKey;
  explorerEscrowAccount: anchor.web3.PublicKey;
  explorerEscrowAccountBump: number;
  ustAccount: anchor.web3.PublicKey;
  userAssociatedAccountMintMap: AssociatedAccountMintMap;
  accountHoldings: MintMapValues;
}
interface EnteredExplorer {
  isEempty: boolean;
  explorerEscrowAccount: anchor.web3.PublicKey;
  providedGearMintId: number;
  providedPotionMintId: number;
  explorerEscrowBump: number;
  providedPotion: boolean;
  hasHunted: boolean;
  providedGearKept: boolean;
  wonCombat: boolean;
  wonCombatGear: boolean;
  foundTreasure: boolean;
  usedPotion: boolean;
  combatRewardMintId: number;
  treasureMintId: number;
}

interface MintInfo {
  id: number;
  address: string;
}

// Pull in local mint data (after generate_mints_config)
const { mints } = env;
// Pull in any already initialized state data
const DATA_FILE = "./local/initialized_data.json";
const RESULTS_FILE = "./local/results.json";
const USER_ACCOUNTS_FILE = `./local/initialized_accounts.json`;

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

const createFakeUser = async (
  program: anchor.Program<AnchorTest>,
  {
    explorerMint,
    ustMint,
    mintMap,
    mintAuth,
    stateAccount,
  }: {
    explorerMint: spl.Token;
    ustMint: spl.Token;
    mintMap: MintMap;
    mintAuth: anchor.web3.PublicKey;
    stateAccount: anchor.web3.PublicKey;
  }
): Promise<FakeUser> => {
  const fakeUser = anchor.web3.Keypair.generate();
  const userAssociatedMintMap: { [mintId: number]: anchor.web3.PublicKey } = {};
  const fakeUserExplorerAccount =
    await explorerMint.createAssociatedTokenAccount(fakeUser.publicKey);

  const fakeUserUstAccount = await ustMint.createAssociatedTokenAccount(
    fakeUser.publicKey
  );

  await Promise.all(
    Object.entries(mintMap).map(async ([id, mint]) => {
      userAssociatedMintMap[id] = await mint.createAssociatedTokenAccount(
        fakeUser.publicKey
      );
    })
  );

  await explorerMint.mintTo(
    fakeUserExplorerAccount,
    program.provider.wallet.publicKey,
    [],
    1
  );
  await program.rpc.airdropStarter({
    accounts: {
      user: fakeUser.publicKey,
      userShortswordAssociatedAccount: userAssociatedMintMap[SHORTSWORD_ID],
      userStrengthPotionAssociatedAccount:
        userAssociatedMintMap[POT_OF_STRENGTH_ID],
      shortswordMint: mintMap[SHORTSWORD_ID].publicKey,
      strengthPotionMint: mintMap[POT_OF_STRENGTH_ID].publicKey,
      mintAuth: mintAuth,
      stateAccount: stateAccount,
      tokenProgram: spl.TOKEN_PROGRAM_ID,
      associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    },
    signers: [fakeUser],
  });
  // fund some sol to fakeUser1 for the enterHunt transaction
  await program.provider.connection.confirmTransaction(
    await program.provider.connection.requestAirdrop(
      fakeUser.publicKey,
      // 1 SOL I think
      1_000_000_000
    ),
    "confirmed"
  );
  const [explorerEscrowAccount, expEscrowBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("explorer")),
        explorerMint.publicKey.toBuffer(),
        fakeUser.publicKey.toBuffer(),
      ],
      program.programId
    );
  const accountHoldings = createMintNumArray();
  accountHoldings[SHORTSWORD_ID] = 1;
  accountHoldings[POT_OF_STRENGTH_ID] = 1;
  return {
    user: fakeUser,
    explorerAccount: fakeUserExplorerAccount,
    explorerEscrowAccount: explorerEscrowAccount,
    explorerEscrowAccountBump: expEscrowBump,
    ustAccount: fakeUserUstAccount,
    userAssociatedAccountMintMap: userAssociatedMintMap,
    accountHoldings: accountHoldings,
  };
};
const createFakeUsers = async (
  num: number,
  program: anchor.Program<AnchorTest>,
  {
    explorerMint,
    ustMint,
    mintMap,
    mintAuth,
    stateAccount,
  }: {
    explorerMint: spl.Token;
    ustMint: spl.Token;
    mintMap: MintMap;
    mintAuth: anchor.web3.PublicKey;
    stateAccount: anchor.web3.PublicKey;
  }
) => {
  const arr = [];
  for (let i = 0; i < num; i++) {
    arr.push(
      await createFakeUser(program, {
        explorerMint,
        ustMint,
        mintMap,
        mintAuth,
        stateAccount,
      })
    );
  }
  return arr;
};

const createMintNumArray = () => ({
  1: 0,
  2: 0,
  3: 0,
  5: 0,
  6: 0,
  7: 0,
  8: 0,
  9: 0,
  10: 0,
  11: 0,
  12: 0,
  13: 0,
  14: 0,
  15: 0,
  16: 0,
});

const usableGearAvailable = (holdings: MintMapValues): boolean => {
  return (
    holdings[SHORTSWORD_ID] > 0 ||
    holdings[LEATHER_ARMOR_ID] > 0 ||
    holdings[DAGGER_ID] > 0 ||
    holdings[SHORTBOW_ID] > 0 ||
    holdings[LONGSWORD_ID] > 0 ||
    holdings[CHAINMAIL_ARMOR_ID] > 0 ||
    holdings[CROSSBOW_ID] > 0 ||
    holdings[PLATE_ARMOR_ID] > 0 ||
    holdings[CUTTHROATS_DAGGER_ID] > 0 ||
    holdings[EXCALIBUR_ID] > 0 ||
    holdings[TREASURE_SCROLL_ID] > 0
  );
};
const getBestGearAvailable = (holdings: MintMapValues): number | null => {
  if (holdings[TREASURE_SCROLL_ID] > 0) return TREASURE_SCROLL_ID;
  if (holdings[EXCALIBUR_ID] > 0) return EXCALIBUR_ID;
  if (holdings[CUTTHROATS_DAGGER_ID] > 0) return CUTTHROATS_DAGGER_ID;
  if (holdings[PLATE_ARMOR_ID] > 0) return PLATE_ARMOR_ID;
  if (holdings[CROSSBOW_ID] > 0) return CROSSBOW_ID;
  if (holdings[CHAINMAIL_ARMOR_ID] > 0) return CHAINMAIL_ARMOR_ID;
  if (holdings[LONGSWORD_ID] > 0) return LONGSWORD_ID;
  if (holdings[SHORTBOW_ID] > 0) return SHORTBOW_ID;
  if (holdings[DAGGER_ID] > 0) return DAGGER_ID;
  if (holdings[LEATHER_ARMOR_ID] > 0) return LEATHER_ARMOR_ID;
  if (holdings[SHORTSWORD_ID] > 0) return SHORTSWORD_ID;
  return null;
};

const usablePotionAvailable = (holdings: MintMapValues): boolean => {
  return (
    holdings[POT_OF_SWIFTNESS_ID] > 0 ||
    holdings[POT_OF_STRENGTH_ID] > 0 ||
    holdings[POT_OF_MENDING_ID] > 0 ||
    holdings[POT_OF_RESILIENCE_ID] > 0
  );
};

const getBestPotionAvailable = (holdings: MintMapValues): number | null => {
  if (holdings[POT_OF_SWIFTNESS_ID] > 0) return POT_OF_SWIFTNESS_ID;
  if (holdings[POT_OF_STRENGTH_ID] > 0) return POT_OF_STRENGTH_ID;
  if (holdings[POT_OF_MENDING_ID] > 0) return POT_OF_MENDING_ID;
  if (holdings[POT_OF_RESILIENCE_ID] > 0) return POT_OF_RESILIENCE_ID;
  return null;
};

const updateAccountHoldings = async (fakeUser: FakeUser, mintMap: MintMap) => {
  const accountHoldings = createMintNumArray();
  // Fetch the number of every mint the user has and add to an object.
  await Promise.all(
    Object.entries(fakeUser.userAssociatedAccountMintMap).map(
      async ([id, accPubkey]) => {
        const account = await mintMap[id].getAccountInfo(accPubkey);
        accountHoldings[id] = account.amount.toNumber();
      }
    )
  );
  return accountHoldings;
};

const fetchHoldingsAndAirdropIfNeeded = async (
  program: anchor.Program<AnchorTest>,
  userGroup: FakeUser[],
  mintMap: MintMap,
  mintAuth: anchor.web3.PublicKey,
  stateAccount: anchor.web3.PublicKey
) => {
  await Promise.all(
    userGroup.map(async (fakeUser) => {
      const holdings = await updateAccountHoldings(fakeUser, mintMap);
      fakeUser.accountHoldings = holdings;
      if (
        !usableGearAvailable(holdings) ||
        // TODO remove after potion made optional
        !usablePotionAvailable(holdings)
      ) {
        fakeUser.accountHoldings[SHORTSWORD_ID] += 1;
        fakeUser.accountHoldings[POT_OF_STRENGTH_ID] += 1;
        await program.rpc.airdropStarter({
          accounts: {
            user: fakeUser.user.publicKey,
            userShortswordAssociatedAccount:
              fakeUser.userAssociatedAccountMintMap[SHORTSWORD_ID],
            userStrengthPotionAssociatedAccount:
              fakeUser.userAssociatedAccountMintMap[POT_OF_STRENGTH_ID],
            shortswordMint: mintMap[SHORTSWORD_ID].publicKey,
            strengthPotionMint: mintMap[POT_OF_STRENGTH_ID].publicKey,
            mintAuth: mintAuth,
            stateAccount: stateAccount,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
            associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
          signers: [fakeUser.user],
        });
      }
    })
  );
};
// The data read in from file needs to be transformed into the proper classes.
const recreateFromInitializedUsers = (initializedUsers): FakeUser[] =>
  initializedUsers.map((userData) => ({
    user: anchor.web3.Keypair.fromSecretKey(
      new Uint8Array(Object.values(userData.user._keypair.secretKey))
    ),
    explorerAccount: new anchor.web3.PublicKey(userData.explorerAccount),
    explorerEscrowAccount: new anchor.web3.PublicKey(
      userData.explorerEscrowAccount
    ),
    explorerEscrowAccountBump: userData.explorerEscrowAccountBump,
    ustAccount: new anchor.web3.PublicKey(userData.ustAccount),
    userAssociatedAccountMintMap: Object.fromEntries(
      Object.entries(userData.userAssociatedAccountMintMap).map(
        ([key, val]) => [key, new anchor.web3.PublicKey(val)]
      )
    ),
    accountHoldings: userData.accountHoldings,
  }));

const logAccountState = (userGroup: FakeUser[]) => {
  userGroup.map((user, ind) => {
    const { accountHoldings } = user;
    console.log(
      `User #${ind + 1}: ${Object.entries(accountHoldings)
        .map(([id, num]) => `${TREASURE_NAMES[id]}: ${num}`)
        .join(", ")}`
    );
  });
};

const USER_GROUP_SIZE = 2;
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
      await fetchHoldingsAndAirdropIfNeeded(
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
    assert(fakeUserPotionOfStrengthAccount.amount.toNumber() === 1);

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
    assert(enteredExplorer.providedPotionMintId === POT_OF_STRENGTH_ID);
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
    logAccountState(userGroup);

    await Promise.all(
      userGroup.map(
        async (user) =>
          await doEnterHunt(user, {
            program,
            explorerMint,
            mintMap,
            mintAuth,
            stateAccount,
          })
      )
    );
    let huntState = await program.account.huntState.fetch(stateAccount);
    let huntStateArr = huntState.huntStateArr as Array<any>;
    assert(
      huntStateArr.filter((x) => x.isEmpty).length === 5000 - USER_GROUP_SIZE
    );
    assert(huntStateArr.filter((x) => !x.isEmpty).length === USER_GROUP_SIZE);
    // Confirm we haven't modified any of the empty array slots.
    assert(huntStateArr.filter((x) => x.isEmpty && x.hasHunted).length === 0);
    let enteredExplorers = huntStateArr.filter((x) => !x.isEmpty);

    // Don't fetch because already fetchedVrf in earlier test in preparation.
    await doFetchVrfAndProcessHunt({
      program,
      stateAccount,
      vrfAccount,
      programUstAccount,
    });
    huntState = await program.account.huntState.fetch(stateAccount);
    huntStateArr = huntState.huntStateArr as Array<any>;
    enteredExplorers = huntStateArr.filter((x) => !x.isEmpty);
    // Confirm all entered explorers have had their hasHunted bools flipped after processing.
    assert(enteredExplorers.length === USER_GROUP_SIZE);
    assert(enteredExplorers.every((x) => x.hasHunted));

    const results = {
      totalProcessed: 0,
      treasureFound: 0,
      treasureById: createMintNumArray(),
      numCombatRewards: 0,
      numCombats: 0,
    };
    await Promise.all(
      userGroup.map(
        async (user, id) =>
          await doChecksAndClaimHunt(
            user,
            {
              program,
              explorerMint,
              mintMap,
              mintAuth,
              stateAccount,
              results,
            },
            id + 1
          )
      )
    );

    logAccountState(userGroup);

    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results));

    huntState = await program.account.huntState.fetch(stateAccount);
    huntStateArr = huntState.huntStateArr as Array<any>;
    // Confirm there are no non-empty slots in the array now.
    assert(huntStateArr.every((x) => x.isEmpty));
  });
});

const doFetchVrfAndProcessHunt = async ({
  program,
  stateAccount,
  vrfAccount,
  programUstAccount,
}) => {
  await doFetchVrf({
    program,
    stateAccount: stateAccount,
    vrfAccount: vrfAccount,
    programUstAccount: programUstAccount,
  });
  await doProcessHunt({
    program,
    stateAccount: stateAccount,
    vrfAccount: vrfAccount,
    programUstAccount: programUstAccount,
  });
};
const doFetchVrf = async ({
  program,
  stateAccount,
  vrfAccount,
  programUstAccount,
}) => {
  await program.rpc.fetchVrf({
    accounts: {
      stateAccount: stateAccount,
      vrfAccount: vrfAccount,
      programUstAccount: programUstAccount,
      systemProgram: anchor.web3.SystemProgram.programId,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    },
  });
};

const doProcessHunt = async ({
  program,
  stateAccount,
  vrfAccount,
  programUstAccount,
}) => {
  await program.rpc.processHunt({
    accounts: {
      stateAccount: stateAccount,
      vrfAccount: vrfAccount,
      programUstAccount: programUstAccount,
      systemProgram: anchor.web3.SystemProgram.programId,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    },
  });
};

const doEnterHunt = async (
  fakeUser: FakeUser,
  { program, explorerMint, mintAuth, mintMap, stateAccount }
) => {
  // Decide potion to use, if any.
  const providingPotion = usablePotionAvailable(fakeUser.accountHoldings);
  const potionToProvide = getBestPotionAvailable(fakeUser.accountHoldings);
  // Decide what gear mint the user is giving.
  const gearToProvide = getBestGearAvailable(fakeUser.accountHoldings);
  const providedGearAccount =
    fakeUser.userAssociatedAccountMintMap[gearToProvide];
  const providedGearMint = mintMap[gearToProvide];
  // a potion account always must be provided. TODO this will change once potions are optional
  const providedPotionAccount =
    fakeUser.userAssociatedAccountMintMap[
      providingPotion ? potionToProvide : POT_OF_STRENGTH_ID
    ];
  const providedPotionMint =
    mintMap[providingPotion ? potionToProvide : POT_OF_STRENGTH_ID];
  await program.rpc.enterHunt(
    fakeUser.explorerEscrowAccountBump,
    providingPotion,
    {
      accounts: {
        user: fakeUser.user.publicKey,
        userExplorerAccount: fakeUser.explorerAccount,
        userProvidedGearAssociatedAccount: providedGearAccount,
        userPotionAssociatedAccount: providedPotionAccount,
        explorerEscrowAccount: fakeUser.explorerEscrowAccount,
        providedGearMint: providedGearMint.publicKey,
        providedPotionMint: providedPotionMint.publicKey,
        explorerMint: explorerMint.publicKey,
        mintAuth: mintAuth,
        stateAccount: stateAccount,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      },
      signers: [fakeUser.user],
    }
  );
};

const doChecksAndClaimHunt = async (
  fakeUser: FakeUser,
  { program, mintAuth, explorerMint, mintMap, stateAccount, ...other },
  id?: number
) => {
  let { results } = other || {};

  let huntState = await program.account.huntState.fetch(stateAccount);
  let huntStateArr: Array<any> = huntState.huntStateArr as Array<any>;
  const enteredExplorer: EnteredExplorer = huntStateArr.find((x) =>
    x.explorerEscrowAccount.equals(fakeUser.explorerEscrowAccount)
  );
  const {
    providedGearMintId,
    providedPotionMintId,
    combatRewardMintId,
    treasureMintId,
    providedGearKept,
    wonCombat,
    wonCombatGear,
    foundTreasure,
    providedPotion,
    usedPotion,
  } = enteredExplorer;

  fakeUser.accountHoldings = await updateAccountHoldings(fakeUser, mintMap);
  const expectedAccountHoldings = JSON.parse(
    JSON.stringify(fakeUser.accountHoldings)
  );

  if (providedGearKept) {
    expectedAccountHoldings[providedGearMintId] += 1;
  }
  if (wonCombatGear) {
    expectedAccountHoldings[combatRewardMintId] += 1;
  }
  if (foundTreasure) {
    expectedAccountHoldings[treasureMintId] += 1;
  }
  if (providedPotion && !usedPotion) {
    expectedAccountHoldings[providedPotionMintId] += 1;
  }
  console.log(
    `Combat - User #${id || 0}; Provided gear: ${
      TREASURE_NAMES[providedGearMintId]
    }; Found treasure: ${foundTreasure}; Treasure: ${
      TREASURE_NAMES[treasureMintId]
    }; Won combat: ${wonCombat}; Won gear: ${wonCombatGear}; combatReward: ${
      TREASURE_NAMES[combatRewardMintId]
    } potionProvided: ${
      TREASURE_NAMES[providedPotionMintId]
    } potionUsed: ${usedPotion};`
  );
  if (results != null) {
    results.totalProcessed += 1;
    if (foundTreasure) {
      results.treasureFound += 1;
      results.treasureById[treasureMintId] += 1;
    }
    if (wonCombatGear) results.numCombatRewards += 1;
    if (wonCombat) results.numCombats += 1;
  }

  await doClaimHunt(fakeUser, {
    program,
    explorerMint,
    mintMap,
    mintAuth,
    stateAccount,
  });

  fakeUser.accountHoldings = await updateAccountHoldings(fakeUser, mintMap);

  // Refetch all account holdings data
  let fakeUserExplorerAccount = await explorerMint.getAccountInfo(
    fakeUser.explorerAccount
  );

  // Confirm that all tokens held by the user are as expected based on hunt results.
  assert(fakeUserExplorerAccount.amount.toNumber() === 1);

  assert(
    fakeUser.accountHoldings[providedGearMintId] ===
      expectedAccountHoldings[providedGearMintId]
  );
  assert(
    fakeUser.accountHoldings[providedPotionMintId] ===
      expectedAccountHoldings[providedPotionMintId]
  );
  // if (wonCombatGear) {
  assert(
    fakeUser.accountHoldings[combatRewardMintId] ===
      expectedAccountHoldings[combatRewardMintId]
  );
  // }
  // if (foundTreasure) {
  assert(
    fakeUser.accountHoldings[treasureMintId] ===
      expectedAccountHoldings[treasureMintId]
  );
  // }

  huntState = await program.account.huntState.fetch(stateAccount);
  huntStateArr = huntState.huntStateArr as Array<any>;
  // Confirm the user's explorer is no longer in the state.
  assert(
    !huntStateArr.find((x) =>
      x.explorerEscrowAccount.equals(fakeUser.explorerEscrowAccount)
    )
  );
};
const doClaimHunt = async (
  fakeUser: FakeUser,
  { program, mintAuth, mintMap, explorerMint, stateAccount }
) => {
  const huntState = await program.account.huntState.fetch(stateAccount);
  const huntStateArr: Array<any> = huntState.huntStateArr as Array<any>;
  const enteredExplorer = huntStateArr.find((x) =>
    x.explorerEscrowAccount.equals(fakeUser.explorerEscrowAccount)
  );
  const {
    providedGearMintId,
    providedPotionMintId,
    combatRewardMintId,
    treasureMintId,
  } = enteredExplorer;
  await program.rpc.claimHunt(enteredExplorer.explorerEscrowBump, {
    accounts: {
      user: fakeUser.user.publicKey,
      userAssociatedExplorerAccount: fakeUser.explorerAccount,
      userAssociatedProvidedGearAccount:
        fakeUser.userAssociatedAccountMintMap[providedGearMintId],
      userAssociatedPotionAccount:
        fakeUser.userAssociatedAccountMintMap[providedPotionMintId],
      userAssociatedCombatRewardAccount:
        combatRewardMintId !== 0
          ? fakeUser.userAssociatedAccountMintMap[combatRewardMintId]
          : fakeUser.userAssociatedAccountMintMap[SHORTSWORD_ID],
      // todo, defaulting to gear when mint is 0. we need to figure out the best 'default/unset' account to pass.
      // Example: Calling claimhunt when hunt has not processed means it is impossible to pass a assTreasureAccount that matches treasureMint
      // because treasureMintID in state is going to be 0. That's fine actually. let the error happen and catch above.
      userAssociatedTreasureAccount:
        treasureMintId !== 0
          ? fakeUser.userAssociatedAccountMintMap[treasureMintId]
          : fakeUser.userAssociatedAccountMintMap[SHORTSWORD_ID],
      explorerEscrowAccount: enteredExplorer.explorerEscrowAccount,
      mintAuthPda: mintAuth,
      explorerMint: explorerMint.publicKey,
      providedGearMint:
        mintMap[providedGearMintId !== 0 ? providedGearMintId : SHORTSWORD_ID]
          .publicKey,
      providedPotionMint:
        mintMap[
          providedPotionMintId !== 0 ? providedPotionMintId : POT_OF_STRENGTH_ID
        ].publicKey,
      combatRewardMint:
        mintMap[combatRewardMintId !== 0 ? combatRewardMintId : SHORTSWORD_ID]
          .publicKey,
      // defaulting to gear1 if no mint id set. could default to a bogus mint instead and let it fail with "a token mint constraint was violated."
      treasureMint:
        mintMap[treasureMintId !== 0 ? treasureMintId : SHORTSWORD_ID]
          .publicKey,
      stateAccount: stateAccount,
      tokenProgram: spl.TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
      // programUstAccount: programUstAccount,
    },
    signers: [fakeUser.user],
  });
};
