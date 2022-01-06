import * as anchor from "@project-serum/anchor";
import { NodeWallet } from "@project-serum/anchor/dist/cjs/provider";

import * as spl from "@solana/spl-token";
import * as sol from "@solana/web3.js";
import assert = require("assert");
import { AnchorTest } from "../target/types/anchor_test";

interface FakeUser {
    user: anchor.web3.Keypair;
    explorerAccount: anchor.web3.PublicKey;
    explorerEscrowAccount: anchor.web3.PublicKey;
    explorerEscrowAccountBump: number;
    ustAccount: anchor.web3.PublicKey;
    gearAccount: anchor.web3.PublicKey;
    potionAccount: anchor.web3.PublicKey;
}


// const GEAR_MINT = new anchor.BN("2sHzUbXC5V6r4sn1RYFsK2Ui1rEckUFHBWLKt6SA3tqr");
// const POTION_MINT = new anchor.BN(
//   "2sHzUbXC5V6r4sn1RYFsK2Ui1rEckUFHBWLKt6SA3tqr"
// );
// const UST_MINT = new anchor.BN("CymnnQf3L2hCxWVWEETSTQEhPMZbiBNiB7oyoePM2Djm");

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
            // 1 SOL I think
            10000000000
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
    // await anchor.web3.SystemProgram.transfer({
    //   fromPubkey: program.provider.wallet.publicKey,
    //   lamports: 1_000_000_000, // 1 sol
    //   toPubkey: fakeUser.publicKey,
    // });
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
    let programUstAccount: anchor.web3.PublicKey;
    let programUstAccountBump: number;

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
                    225043
                ),
            ],
        });

        // Fetch state after initialization.
        let huntState = await program.account.huntState.fetch(stateAccount);
        assert(huntState.isInitialized === true);
        assert(huntState.owner.equals(provider.wallet.publicKey));

        const huntStateArr: Array<any> = huntState.huntStateArr as Array<any>;
        assert(huntStateArr.every(x => x.isEmpty === true));
    });
    it("EnterHunt: takes proper tokens and succeeds", async () => {
        // Setup to enter fakeUser1 into hunt.
        const fakeUser1 = userArr[0];
        let user1ExplorerAccount = await explorerMint.getAccountInfo(
            fakeUser1.explorerAccount
        );
        let user1GearAccount = await gearMint.getAccountInfo(fakeUser1.gearAccount);
        // basic checks: confirm the accounts are populated as expected.
        assert(user1ExplorerAccount.amount.toNumber() === 1);
        assert(user1GearAccount.amount.toNumber() === 1);

        // Do transaction
        await program.rpc.enterHunt(fakeUser1.explorerEscrowAccountBump, {
            accounts: {
                user: fakeUser1.user.publicKey,
                userExplorerAccount: fakeUser1.explorerAccount,
                userProvidedGearAssociatedAccount: fakeUser1.gearAccount,
                explorerEscrowAccount: fakeUser1.explorerEscrowAccount,
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
        // Refetch data
        user1ExplorerAccount = await explorerMint.getAccountInfo(
            fakeUser1.explorerAccount
        );
        user1GearAccount = await gearMint.getAccountInfo(fakeUser1.gearAccount);

        // Confirm the explorer+gear tokens were taken from the user.
        assert(user1ExplorerAccount.amount.toNumber() === 0);
        assert(user1GearAccount.amount.toNumber() === 0);
        // Confirm the escrow account now owns 1 explorer.
        const user1ExplorerEscrowAccount = await explorerMint.getAccountInfo(
            fakeUser1.explorerEscrowAccount
        );
        assert(user1ExplorerEscrowAccount.amount.toNumber() === 1);

        // Confirm state account now has a single entry with isEmpty: false, with proper data inside.
        let huntState = await program.account.huntState.fetch(stateAccount);
        const huntStateArr: Array<any> = huntState.huntStateArr as Array<any>;

        assert(huntStateArr.filter(x => x.isEmpty).length === 4999);
        assert(huntStateArr.filter(x => !x.isEmpty).length === 1);
        const enteredExplorer = huntStateArr.find(x => x.isEmpty === false);
        console.log(enteredExplorer);
        assert(enteredExplorer.explorerEscrowAccount.equals(fakeUser1.explorerEscrowAccount));
        assert(enteredExplorer.providedGearMintId === 1);
        assert(enteredExplorer.providedPotionMintId === 0);
        assert(enteredExplorer.hasHunted === false);
        assert(enteredExplorer.foundTreasure === false);
        assert(enteredExplorer.explorerEscrowBump === fakeUser1.explorerEscrowAccountBump);
    });
    it("ProcessHunt: modifies state account values properly", async () => {
        await program.rpc.processHunt({
            accounts: {
                stateAccount: stateAccount,
                programUstAccount: programUstAccount,
                systemProgram: anchor.web3.SystemProgram.programId,
            }
        });

        let huntState = await program.account.huntState.fetch(stateAccount);
        const huntStateArr: Array<any> = huntState.huntStateArr as Array<any>;
        // Confirm the individual entries of hunt array are still vaguely as expected
        assert(huntStateArr.filter(x => x.isEmpty).length === 4999);
        assert(huntStateArr.filter(x => !x.isEmpty).length === 1);
        // Confirm we haven't modified any of the empty array slots.
        assert(huntStateArr.filter(x => x.isEmpty && x.hasHunted).length === 0);
        const enteredExplorers = huntStateArr.filter(x => x.isEmpty === false);
        // Confirm all entered explorers have had their hasHunted bools flipped after processing.
        assert(enteredExplorers.filter(x => x.hasHunted === false).length === 0);

    });
    it("ClaimHunt: Allows retrieval of expected stuff", async () => {
        const fakeUser1 = userArr[0];
        // Fetch required data from state account first.

        let user1ExplorerAccount = await explorerMint.getAccountInfo(
            fakeUser1.explorerAccount
        );
        let user1GearAccount = await gearMint.getAccountInfo(fakeUser1.gearAccount);

        // Confirm the explorer+gear accounts still have 0.
        assert(user1ExplorerAccount.amount.toNumber() === 0);
        assert(user1GearAccount.amount.toNumber() === 0);
        let huntState = await program.account.huntState.fetch(stateAccount);
        let huntStateArr: Array<any> = huntState.huntStateArr as Array<any>;
        const enteredExplorer = huntStateArr.find(x => x.explorerEscrowAccount.equals(fakeUser1.explorerEscrowAccount));

        await program.rpc.claimHunt(enteredExplorer.explorerEscrowBump, {
            accounts: {
                user: fakeUser1.user.publicKey,
                userAssociatedExplorerAccount: fakeUser1.explorerAccount,
                userAssociatedProvidedGearAccount: fakeUser1.gearAccount,
                userAssociatedPotionAccount: fakeUser1.potionAccount,
                userAssociatedCombatRewardAccount: fakeUser1.gearAccount,
                userAssociatedTreasureAccount: fakeUser1.gearAccount,
                explorerEscrowAccount: enteredExplorer.explorerEscrowAccount,
                mintAuthPda: mintAuth,
                explorerMint: explorerMint.publicKey,
                providedGearMint: gearMint.publicKey, // todo enteredExplorer.providedGearMintId,
                providedPotionMint: potionMint.publicKey,// todo enteredExplorer.providedPotionMintId,
                combatRewardMint: gearMint.publicKey, // todo enteredExplorer.combatRewardMintId,
                treasureMint: gearMint.publicKey, //todo enteredExplorer.treasureMintId
                stateAccount: stateAccount,
                tokenProgram: spl.TOKEN_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
                // programUstAccount: programUstAccount,
            },
            signers: [fakeUser1.user]
        });
        huntState = await program.account.huntState.fetch(stateAccount);
        huntStateArr = huntState.huntStateArr as Array<any>;
        // Confirm the user's explorer is no longer in the state.
        assert(!huntStateArr.find(x => x.explorerEscrowAccount.equals(fakeUser1.explorerEscrowAccount)));
        user1ExplorerAccount = await explorerMint.getAccountInfo(
            fakeUser1.explorerAccount
        );
        user1GearAccount = await gearMint.getAccountInfo(fakeUser1.gearAccount);

        // Confirm the explorer+gear tokens were taken from the user.
        assert(user1ExplorerAccount.amount.toNumber() === 1);
        assert(user1GearAccount.amount.toNumber() === 1);
    });

    assert.ok(true);
});
