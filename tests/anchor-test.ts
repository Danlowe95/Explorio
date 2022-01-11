import * as anchor from "@project-serum/anchor";
import { NodeWallet } from "@project-serum/anchor/dist/cjs/provider";

import * as spl from "@solana/spl-token";
import * as sol from "@solana/web3.js";
import assert = require("assert");
import { AnchorTest } from "../target/types/anchor_test";
import env from "../local/env.json";
const fs = require("fs");

interface FakeUser {
  user: anchor.web3.Keypair;
  explorerAccount: anchor.web3.PublicKey;
  explorerEscrowAccount: anchor.web3.PublicKey;
  explorerEscrowAccountBump: number;
  ustAccount: anchor.web3.PublicKey;
  gearAccount: anchor.web3.PublicKey;
  potionAccount: anchor.web3.PublicKey;
}

const SHORTSWORD_MINT_ID = 1;
const POTION_OF_STRENGTH_MINT_ID = 12;
const POTION_OF_MENDING_MINT_ID = 13;
interface MintInfo {
  id: number;
  address: string;
}

// Pull in local mint data (after generate_mints_config)
const { mints } = env;
// Pull in any already initialized state data
const DATA_FILE = "./local/initialized_data.json";
let initializedData: {
  stateAccount: anchor.web3.PublicKey | null;
  vrfAccount: anchor.web3.PublicKey | null;
};
// If file is initialized, it's expected to be a valid config.
if (fs.existsSync(DATA_FILE)) {
  const res = fs.readFileSync(DATA_FILE);
  const parsedData = JSON.parse(res);
  initializedData = {
    stateAccount: new anchor.web3.PublicKey(parsedData.stateAccount),
    vrfAccount: new anchor.web3.PublicKey(parsedData.vrfAccount),
  };
}

let { stateAccount, vrfAccount } = initializedData || {
  stateAccount: null,
  vrfAccount: null,
};
const firstRun = stateAccount == null;

const createFakeUser = async (
  program: anchor.Program<AnchorTest>,
  { explorerMint, ustMint, gearMint, potionMint, mintAuth, stateAccount }
): Promise<FakeUser> => {
  const fakeUser = anchor.web3.Keypair.generate();
  const fakeUserExplorerAccount =
    await explorerMint.createAssociatedTokenAccount(fakeUser.publicKey);

  const fakeUserUstAccount = await ustMint.createAssociatedTokenAccount(
    fakeUser.publicKey
  );
  //  TypeError: mint.toBuffer is not a function
  const fakeUserGearAccount = await gearMint.createAssociatedTokenAccount(
    fakeUser.publicKey
  );

  const fakeUserPotionAccount = await potionMint.createAssociatedTokenAccount(
    fakeUser.publicKey
  );
  //   await ustMint.mintTo(
  //     fakeUserUstAccount,
  //     program.provider.wallet.publicKey,
  //     [],
  //     1000
  //   );
  await explorerMint.mintTo(
    fakeUserExplorerAccount,
    program.provider.wallet.publicKey,
    [],
    1
  );
  await program.rpc.airdropStarter({
    accounts: {
      user: fakeUser.publicKey,
      userShortswordAssociatedAccount: fakeUserGearAccount,
      userStrengthPotionAssociatedAccount: fakeUserPotionAccount,
      shortswordMint: gearMint.publicKey,
      strengthPotionMint: potionMint.publicKey,
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
  return {
    user: fakeUser,
    explorerAccount: fakeUserExplorerAccount,
    explorerEscrowAccount: explorerEscrowAccount,
    explorerEscrowAccountBump: expEscrowBump,
    ustAccount: fakeUserUstAccount,
    gearAccount: fakeUserGearAccount,
    potionAccount: fakeUserPotionAccount,
  };
};
const createFakeUsers = async (
  num: number,
  program: anchor.Program<AnchorTest>,
  { explorerMint, ustMint, gearMint, potionMint, mintAuth, stateAccount }
) => {
  const arr = [];
  for (let i = 0; i < num; i++) {
    arr.push(
      await createFakeUser(program, {
        explorerMint,
        ustMint,
        gearMint,
        potionMint,
        mintAuth,
        stateAccount,
      })
    );
  }
  return arr;
};

const USER_GROUP_SIZE = 300;
describe("anchor-test", () => {
  // Configure the client to use the local cluster.\
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);
  console.log("wallet account pubkey: " + provider.wallet.publicKey.toString());
  const program = anchor.workspace.AnchorTest as anchor.Program<AnchorTest>;

  let wallet: NodeWallet;
  let ustMint: spl.Token;
  let explorerMint: spl.Token;
  let gearMint: spl.Token;
  let potionMint: spl.Token;
  let mintAuth: anchor.web3.PublicKey;
  let mintAuthBump: number;
  // TODO don't require copy/paste of this

  let fakeUser1: FakeUser;
  let userGroup: FakeUser[] = [];
  let programUstAccount: anchor.web3.PublicKey;
  let programUstAccountBump: number;

  // Experimental
  let mintMap: { [mintId: number]: spl.Token } = {};

  before(async () => {
    console.log(program.programId);
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
    explorerMint = await spl.Token.createMint(
      program.provider.connection,
      wallet.payer,
      wallet.publicKey,
      wallet.publicKey,
      0,
      spl.TOKEN_PROGRAM_ID
    );

    const shortswordPubkey = new anchor.web3.PublicKey(mints[0].address);
    const potOfStrengthPubkey = new anchor.web3.PublicKey(mints[11].address);

    gearMint = await new spl.Token(
      program.provider.connection,
      shortswordPubkey,
      spl.TOKEN_PROGRAM_ID,
      wallet.payer
    );

    potionMint = await new spl.Token(
      program.provider.connection,
      potOfStrengthPubkey,
      spl.TOKEN_PROGRAM_ID,
      wallet.payer
    );
    // All mints are owned by provided.wallet after mint - transfer ownership to program now
    if (firstRun) {
      await gearMint.setAuthority(
        gearMint.publicKey,
        mintAuth,
        "MintTokens",
        wallet.publicKey,
        []
      );
      await potionMint.setAuthority(
        potionMint.publicKey,
        mintAuth,
        "MintTokens",
        wallet.publicKey,
        []
      );
    }
    mintMap[SHORTSWORD_MINT_ID] = gearMint;
    mintMap[POTION_OF_STRENGTH_MINT_ID] = potionMint;
  });
  it("Is initializes!", async () => {
    if (firstRun) {
      const stateAccountKeypair = anchor.web3.Keypair.generate();
      const vrfAccountKeypair = anchor.web3.Keypair.generate();
      stateAccount = stateAccountKeypair.publicKey;
      vrfAccount = vrfAccountKeypair.publicKey;
      console.log("State account key (for saving): " + stateAccount);
      console.log("VRF account key (for saving): " + vrfAccount);
      // Write these two accounts so they can be referenced later
      fs.writeFileSync(
        DATA_FILE,
        JSON.stringify({
          stateAccount: stateAccount.toString(),
          vrfAccount: vrfAccount.toString(),
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
    assert(huntStateArr.every((x) => x.isEmpty === true));
    let vrfState = await program.account.vrfState.fetch(vrfAccount);
    assert(vrfState.isInitialized === true);
  });
  it("Creates all test users and airdrops them", async () => {
    // Create single user for first set of tests
    fakeUser1 = await createFakeUser(program, {
      explorerMint,
      ustMint,
      gearMint,
      mintAuth,
      potionMint,
      stateAccount,
    });

    // Create 10 user group for test
    userGroup = await createFakeUsers(USER_GROUP_SIZE, program, {
      explorerMint,
      ustMint,
      gearMint,
      potionMint,
      mintAuth,
      stateAccount,
    });
  });
  it("EnterHunt: Single Explorer - takes proper tokens and succeeds", async () => {
    // Setup to enter fakeUser1 into hunt.
    let user1ExplorerAccount = await explorerMint.getAccountInfo(
      fakeUser1.explorerAccount
    );
    let user1GearAccount = await gearMint.getAccountInfo(fakeUser1.gearAccount);
    let user1PotionAccount = await potionMint.getAccountInfo(
      fakeUser1.potionAccount
    );
    // basic checks: confirm the accounts are populated as expected.
    assert(user1ExplorerAccount.amount.toNumber() === 1);
    assert(user1GearAccount.amount.toNumber() === 1);
    assert(user1PotionAccount.amount.toNumber() === 1);

    // Do transaction
    await doEnterHunt(fakeUser1, {
      program,
      explorerMint,
      gearMint,
      potionMint,
      mintAuth,
      stateAccount,
    });

    // Refetch data
    user1ExplorerAccount = await explorerMint.getAccountInfo(
      fakeUser1.explorerAccount
    );
    user1GearAccount = await gearMint.getAccountInfo(fakeUser1.gearAccount);
    user1PotionAccount = await potionMint.getAccountInfo(
      fakeUser1.potionAccount
    );
    // Confirm the explorer+gear tokens were taken from the user.
    assert(user1ExplorerAccount.amount.toNumber() === 0);
    assert(user1GearAccount.amount.toNumber() === 0);
    assert(user1PotionAccount.amount.toNumber() === 0);

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
    assert(enteredExplorer.providedGearMintId === SHORTSWORD_MINT_ID);
    assert(enteredExplorer.providedPotionMintId === POTION_OF_STRENGTH_MINT_ID);
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
        gearMint,
        mintMap,
        potionMint,
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
    const user1ExplorerAccount = await explorerMint.getAccountInfo(
      fakeUser1.explorerAccount
    );
    const user1GearAccount = await gearMint.getAccountInfo(
      fakeUser1.gearAccount
    );

    // Confirm the explorer+gear accounts still have 0.
    assert(user1ExplorerAccount.amount.toNumber() === 0);
    assert(user1GearAccount.amount.toNumber() === 0);
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

    let user1ExplorerAccount = await explorerMint.getAccountInfo(
      fakeUser1.explorerAccount
    );
    let user1GearAccount = await gearMint.getAccountInfo(fakeUser1.gearAccount);

    // Confirm the explorer+gear accounts still have 0.
    assert(user1ExplorerAccount.amount.toNumber() === 0);
    assert(user1GearAccount.amount.toNumber() === 0);
    await doChecksAndClaimHunt(fakeUser1, {
      program,
      mintAuth,
      explorerMint,
      stateAccount,
      gearMint,
      mintMap,
      potionMint,
    });
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
    // await doInitialize();

    await Promise.all(
      userGroup.map(
        async (user) =>
          await doEnterHunt(user, {
            program,
            explorerMint,
            gearMint,
            potionMint,
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

    const results = [];
    await Promise.all(
      userGroup.map(
        async (user) =>
          await doChecksAndClaimHunt(user, {
            program,
            explorerMint,
            gearMint,
            mintMap,
            potionMint,
            mintAuth,
            stateAccount,
            results,
          })
      )
    );
    // const fs = require("fs");
    // results.forEach(({providedGearMintId,
    //   providedPotionMintId,
    //   combatRewardMintId,
    //   treasureMintId,
    //   providedGearKept,
    //   wonCombat,
    //   wonCombatGear,
    //   foundTreasure,
    //   providedPotion,
    //   usedPotion}) => `Found treasure: ${foundTreasure}; TreasureType: ${treasureMintId}; Won combat: ${wonCombat}; Won gear: ${wonCombatGear}; combatRewardType: ${combatRewardMintId}; Expected Gear total: ${gear1ExpectedGains}; Expected potion total: ${potion1ExpectedGains};`

    // fs.writeFileSync("./logs/run-log", `
    // Init
    // `);
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
  { program, gearMint, explorerMint, mintAuth, potionMint, stateAccount }
) => {
  const providingPotion = true;
  await program.rpc.enterHunt(
    fakeUser.explorerEscrowAccountBump,
    providingPotion,
    {
      accounts: {
        user: fakeUser.user.publicKey,
        userExplorerAccount: fakeUser.explorerAccount,
        userProvidedGearAssociatedAccount: fakeUser.gearAccount,
        userPotionAssociatedAccount: fakeUser.potionAccount,
        explorerEscrowAccount: fakeUser.explorerEscrowAccount,
        providedGearMint: gearMint.publicKey,
        providedPotionMint: potionMint.publicKey,
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
  {
    program,
    mintAuth,
    explorerMint,
    gearMint,
    mintMap,
    potionMint,
    stateAccount,
    ...other
  }
) => {
  let { results } = other || {};

  let huntState = await program.account.huntState.fetch(stateAccount);
  let huntStateArr: Array<any> = huntState.huntStateArr as Array<any>;
  const enteredExplorer = huntStateArr.find((x) =>
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
  // TODO this needs to handle dynamic gear list (or at least the full gear list)
  let gear1ExpectedGains = 0;
  let potion1ExpectedGains = 0;
  if (providedGearMintId === SHORTSWORD_MINT_ID && providedGearKept) {
    gear1ExpectedGains++;
  }
  if (combatRewardMintId === SHORTSWORD_MINT_ID && wonCombatGear) {
    gear1ExpectedGains++;
  }
  if (foundTreasure) {
    if (treasureMintId === POTION_OF_STRENGTH_MINT_ID) {
      potion1ExpectedGains++;
    } else if (treasureMintId === SHORTSWORD_MINT_ID) {
      gear1ExpectedGains++;
    }
  }
  if (
    providedPotionMintId === POTION_OF_STRENGTH_MINT_ID &&
    providedPotion &&
    !usedPotion
  ) {
    potion1ExpectedGains++;
  }
  console.log(
    `Found treasure: ${foundTreasure}; TreasureType: ${treasureMintId}; Won combat: ${wonCombat}; Won gear: ${wonCombatGear}; combatRewardType: ${combatRewardMintId}; Expected Gear total: ${gear1ExpectedGains}; Expected potion total: ${potion1ExpectedGains};`
  );
  if (results != null) results.push(enteredExplorer);

  await doClaimHunt(fakeUser, {
    program,
    explorerMint,
    gearMint,
    mintMap,
    potionMint,
    mintAuth,
    stateAccount,
  });
  let user1ExplorerAccount = await explorerMint.getAccountInfo(
    fakeUser.explorerAccount
  );
  let user1GearAccount = await gearMint.getAccountInfo(fakeUser.gearAccount);
  let user1PotionAccount = await potionMint.getAccountInfo(
    fakeUser.potionAccount
  );

  // Confirm the explorer+gear+potion tokens were given to the user.
  assert(user1ExplorerAccount.amount.toNumber() === 1);

  assert(user1GearAccount.amount.toNumber() === gear1ExpectedGains);
  assert(user1PotionAccount.amount.toNumber() === potion1ExpectedGains);

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
  {
    program,
    mintAuth,
    mintMap,
    explorerMint,
    gearMint,
    potionMint,
    stateAccount,
  }
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
    providedGearKept,
    wonCombat,
    wonCombatGear,
    foundTreasure,
    providedPotion,
    potionUsed,
  } = enteredExplorer;
  await program.rpc.claimHunt(enteredExplorer.explorerEscrowBump, {
    accounts: {
      user: fakeUser.user.publicKey,
      userAssociatedExplorerAccount: fakeUser.explorerAccount,
      userAssociatedProvidedGearAccount: fakeUser.gearAccount,
      userAssociatedPotionAccount: fakeUser.potionAccount,
      userAssociatedCombatRewardAccount: fakeUser.gearAccount,
      // todo, defaulting to gear when mint is 0. we need to figure out the best 'default/unset' account to pass.
      // Example: Calling claimhunt when hunt has not processed means it is impossible to pass a assTreasureAccount that matches treasureMint
      // because treasureMintID in state is going to be 0. That's fine actually. let the error happen and catch above.
      userAssociatedTreasureAccount:
        treasureMintId === 0 || treasureMintId === SHORTSWORD_MINT_ID
          ? fakeUser.gearAccount
          : fakeUser.potionAccount,
      explorerEscrowAccount: enteredExplorer.explorerEscrowAccount,
      mintAuthPda: mintAuth,
      explorerMint: explorerMint.publicKey,
      providedGearMint: mintMap[providedGearMintId].publicKey,
      providedPotionMint: mintMap?.[providedPotionMintId]
        ? mintMap[providedPotionMintId].publicKey
        : mintMap[POTION_OF_STRENGTH_MINT_ID].publicKey,
      combatRewardMint: mintMap?.[combatRewardMintId]
        ? mintMap[combatRewardMintId].publicKey
        : mintMap[SHORTSWORD_MINT_ID].publicKey,
      // defaulting to gear1 if no mint id set. could default to a bogus mint instead and let it fail with "a token mint constraint was violated."
      treasureMint: mintMap?.[treasureMintId]
        ? mintMap[treasureMintId].publicKey
        : mintMap[SHORTSWORD_MINT_ID].publicKey,
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
