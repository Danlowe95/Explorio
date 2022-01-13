import * as anchor from "@project-serum/anchor";

import * as spl from "@solana/spl-token";
import { AnchorTest } from "../target/types/anchor_test";
import assert = require("assert");

import {
  RESULTS_FILE,
  USER_ACCOUNTS_FILE,
  DATA_FILE,
  USER_GROUP_SIZE,
  NONE_ID,
  SHORTSWORD_ID,
  LEATHER_ARMOR_ID,
  DAGGER_ID,
  SHORTBOW_ID,
  LONGSWORD_ID,
  CHAINMAIL_ARMOR_ID,
  CROSSBOW_ID,
  PLATE_ARMOR_ID,
  CUTTHROATS_DAGGER_ID,
  EXCALIBUR_ID,
  TREASURE_SCROLL_ID,
  POT_OF_SWIFTNESS_ID,
  POT_OF_STRENGTH_ID,
  POT_OF_MENDING_ID,
  POT_OF_RESILIENCE_ID,
  GRAIL_ID,
  NONE_POTION_ID,
  NONE_GEAR_ID,
  TREASURE_NAMES,
  MintMap,
  MintMapValues,
  FakeUser,
  EnteredExplorer,
} from "./consts";

export const createFakeUser = async (
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
      shortswordMint: mintMap[SHORTSWORD_ID].publicKey,
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
export const createFakeUsers = async (
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

export const createMintNumArray = () => ({
  1: 0,
  2: 0,
  3: 0,
  4: 0,
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

export const usableGearAvailable = (holdings: MintMapValues): boolean => {
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
export const getBestGearAvailable = (holdings: MintMapValues): number => {
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
  return 0;
};

export const usablePotionAvailable = (holdings: MintMapValues): boolean => {
  return (
    holdings[POT_OF_SWIFTNESS_ID] > 0 ||
    holdings[POT_OF_STRENGTH_ID] > 0 ||
    holdings[POT_OF_MENDING_ID] > 0 ||
    holdings[POT_OF_RESILIENCE_ID] > 0
  );
};

export const getBestPotionAvailable = (holdings: MintMapValues): number => {
  if (holdings[POT_OF_SWIFTNESS_ID] > 0) return POT_OF_SWIFTNESS_ID;
  if (holdings[POT_OF_STRENGTH_ID] > 0) return POT_OF_STRENGTH_ID;
  if (holdings[POT_OF_MENDING_ID] > 0) return POT_OF_MENDING_ID;
  if (holdings[POT_OF_RESILIENCE_ID] > 0) return POT_OF_RESILIENCE_ID;
  return 0;
};

export const updateAccountHoldings = async (
  fakeUser: FakeUser,
  mintMap: MintMap
) => {
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

export const fetchUserGroupHoldings = async (
  userGroup: FakeUser[],
  mintMap: MintMap
) => {
  await Promise.all(
    userGroup.map(async (fakeUser) => {
      fakeUser.accountHoldings = await updateAccountHoldings(fakeUser, mintMap);
    })
  );
};

export const airdropUserGroupIfNeeded = async (
  program: anchor.Program<AnchorTest>,
  userGroup: FakeUser[],
  mintMap: MintMap,
  mintAuth: anchor.web3.PublicKey,
  stateAccount: anchor.web3.PublicKey
) => {
  await Promise.all(
    userGroup.map(async (fakeUser) => {
      if (!usableGearAvailable(fakeUser.accountHoldings)) {
        fakeUser.accountHoldings[SHORTSWORD_ID] += 1;
        await program.rpc.airdropStarter({
          accounts: {
            user: fakeUser.user.publicKey,
            userShortswordAssociatedAccount:
              fakeUser.userAssociatedAccountMintMap[SHORTSWORD_ID],
            shortswordMint: mintMap[SHORTSWORD_ID].publicKey,
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
export const recreateFromInitializedUsers = (initializedUsers): FakeUser[] =>
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

export const logAccountState = (userGroup: FakeUser[]) => {
  userGroup.map((user, ind) => {
    const { accountHoldings } = user;
    console.log(
      `User #${ind + 1}: ${Object.entries(accountHoldings)
        .map(([id, num]) =>
          num !== 0 ? `${TREASURE_NAMES[id]}: ${num}` : null
        )
        .filter(Boolean)
        .join(", ")}`
    );
  });
};

export const doFetchVrfAndProcessHunt = async ({
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

export const doFetchVrf = async ({
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

export const doProcessHunt = async ({
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

export const doEnterHunt = async (
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
      providingPotion ? potionToProvide : NONE_POTION_ID
    ];
  const providedPotionMint =
    mintMap[providingPotion ? potionToProvide : NONE_POTION_ID];

  await program.rpc.enterHunt(
    fakeUser.explorerEscrowAccountBump,
    providingPotion,
    gearToProvide,
    potionToProvide,
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

export const doChecksAndClaimHunt = async (
  fakeUser: FakeUser,
  { program, mintAuth, explorerMint, mintMap, stateAccount, ...other },
  id?: number
) => {
  let { results, doLog = true } = other || {};

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
  if (doLog) {
    console.log(
      `Combat - User #${id || 0}; Provided gear: ${
        TREASURE_NAMES[providedGearMintId]
      }; Found treasure: ${foundTreasure}; Treasure: ${
        TREASURE_NAMES[treasureMintId]
      }; Won combat: ${wonCombat}; Won gear: ${wonCombatGear}; combatReward: ${
        TREASURE_NAMES[combatRewardMintId]
      } potionProvided: ${
        providedPotion ? TREASURE_NAMES[providedPotionMintId] : "None"
      } potionUsed: ${usedPotion};`
    );
  }
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
  if (providedPotion) {
    assert(
      fakeUser.accountHoldings[providedPotionMintId] ===
        expectedAccountHoldings[providedPotionMintId]
    );
  }

  if (wonCombatGear) {
    assert(
      fakeUser.accountHoldings[combatRewardMintId] ===
        expectedAccountHoldings[combatRewardMintId]
    );
  }
  if (foundTreasure) {
    assert(
      fakeUser.accountHoldings[treasureMintId] ===
        expectedAccountHoldings[treasureMintId]
    );
  }

  huntState = await program.account.huntState.fetch(stateAccount);
  huntStateArr = huntState.huntStateArr as Array<any>;
  // Confirm the user's explorer is no longer in the state.
  assert(
    !huntStateArr.find((x) =>
      x.explorerEscrowAccount.equals(fakeUser.explorerEscrowAccount)
    )
  );
};
export const doClaimHunt = async (
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
        fakeUser.userAssociatedAccountMintMap[
          providedPotionMintId != 0 ? providedPotionMintId : NONE_POTION_ID
        ],
      userAssociatedCombatRewardAccount:
        combatRewardMintId !== 0
          ? fakeUser.userAssociatedAccountMintMap[combatRewardMintId]
          : fakeUser.userAssociatedAccountMintMap[NONE_GEAR_ID],
      // todo, defaulting to gear when mint is 0. we need to figure out the best 'default/unset' account to pass.
      // Example: Calling claimhunt when hunt has not processed means it is impossible to pass a assTreasureAccount that matches treasureMint
      // because treasureMintID in state is going to be 0. That's fine actually. let the error happen and catch above.
      userAssociatedTreasureAccount:
        treasureMintId !== 0
          ? fakeUser.userAssociatedAccountMintMap[treasureMintId]
          : fakeUser.userAssociatedAccountMintMap[NONE_GEAR_ID],
      explorerEscrowAccount: enteredExplorer.explorerEscrowAccount,
      mintAuthPda: mintAuth,
      explorerMint: explorerMint.publicKey,
      providedGearMint: mintMap[providedGearMintId].publicKey,
      providedPotionMint:
        mintMap[
          providedPotionMintId !== 0 ? providedPotionMintId : NONE_POTION_ID
        ].publicKey,
      combatRewardMint:
        mintMap[combatRewardMintId !== 0 ? combatRewardMintId : NONE_GEAR_ID]
          .publicKey,
      // defaulting to gear1 if no mint id set. could default to a bogus mint instead and let it fail with "a token mint constraint was violated."
      treasureMint:
        mintMap[treasureMintId !== 0 ? treasureMintId : NONE_GEAR_ID].publicKey,
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

export const runUserGroupTest = async ({
  userGroup,
  program,
  explorerMint,
  mintMap,
  mintAuth,
  stateAccount,
  vrfAccount,
  programUstAccount,
  fs,
  results,
  doLog,
}) => {
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
            doLog,
          },
          id + 1
        )
    )
  );
  if (doLog) {
    logAccountState(userGroup);
  }

  //   fs.writeFileSync(RESULTS_FILE, JSON.stringify(results));

  huntState = await program.account.huntState.fetch(stateAccount);
  huntStateArr = huntState.huntStateArr as Array<any>;
  // Confirm there are no non-empty slots in the array now.
  assert(huntStateArr.every((x) => x.isEmpty));
};
