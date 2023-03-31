use anchor_lang::prelude::*;
pub mod instructions;
pub mod explorers;
pub mod state;

use instructions::*;
// use explorers::*;

declare_id!("3cdx2BHuSCyyvLJt2ZhdcoPpSrMqzZHb2UPQD6f8tTUK");

// Declare Explorio protocol owner publicKey for reference during initialization.
const OWNER_KEY: &str = r"EA7Cpq8hfUxpHAQaQ1xy3hKaqEUSwQxXQijpZY6ZmJrU";

struct MintInfo {
    id: u8,
    mint_type: u8,
    mint: &'static str,
    ep: i8,
}

// bools can't be used in zero_copy, use this to keep code sane.
const TRUE: u8 = 1;
const FALSE: u8 = 0;

// MINT_TYPES
const NONE_TYPE: u8 = 100;
const GEAR_TYPE: u8 = 101;
const POTION_TYPE: u8 = 102;
const GRAIL_TYPE: u8 = 103;

// TYPE IDS
const SHORTSWORD_ID: u8 = 1;
const LEATHER_ARMOR_ID: u8 = 2;
const DAGGER_ID: u8 = 3;
const SHORTBOW_ID: u8 = 4;
const LONGSWORD_ID: u8 = 5;
const CHAINMAIL_ARMOR_ID: u8 = 6;
const CROSSBOW_ID: u8 = 7;
const PLATE_ARMOR_ID: u8 = 8;
const CUTTHROATS_DAGGER_ID: u8 = 9;
const EXCALIBUR_ID: u8 = 10;
const TREASURE_SCROLL_ID: u8 = 11;

const POT_OF_SWIFTNESS_ID: u8 = 12;
const POT_OF_STRENGTH_ID: u8 = 13;
const POT_OF_MENDING_ID: u8 = 14;
const POT_OF_RESILIENCE_ID: u8 = 15;

const GRAIL_ID: u8 = 16;

const MINTS: [MintInfo; 17] = [
    MintInfo{ id: 0, mint_type: NONE_TYPE, ep: 0, mint: "NONE"}, // none
    MintInfo{ id: SHORTSWORD_ID, mint_type: GEAR_TYPE, ep: 1, mint: "HtMSpvxx2GVGUfwu3ER9Tki6JNioCWYeF6dzVf5hZa8B"}, // gear_1: shortsword
    MintInfo{ id: LEATHER_ARMOR_ID, mint_type: GEAR_TYPE, ep: 1, mint: "BZ2rSq1dcWq5ffn9swqz9hDE5W6d5K7Qc3tMiZ7PJpcC"}, // gear_2: leather_armor
    MintInfo{ id: DAGGER_ID, mint_type: GEAR_TYPE, ep: 2, mint: "G369guKYT61JJPWq2G3Pkp5yCpoAfZ1PmzEeJBWPThDW"}, // gear_3: Dagger
    MintInfo{ id: SHORTBOW_ID, mint_type: GEAR_TYPE, ep: 2, mint: "EN3ZubuEr1GKoLx1JhwenC21L6fGHiXkj5N24TbZWUTe"}, // gear_4: Shortbow
    MintInfo{ id: LONGSWORD_ID, mint_type: GEAR_TYPE, ep: 3, mint: "9gXKDygCWmBfkuGPaczoizABWNqMLWgp5aLkc1z1FbE1"}, // gear_5: Longsword
    MintInfo{ id: CHAINMAIL_ARMOR_ID, mint_type: GEAR_TYPE, ep: 3, mint: "8sCDvuRoAS9aDmc6fVR9ZhCvk6LKbdpd2m3aa9y9eNGv"}, // gear_6: Chainmail_armor
    MintInfo{ id: CROSSBOW_ID, mint_type: GEAR_TYPE, ep: 4, mint: "Dbpwcu2eeJrFmm5D2WuE3BYP9HvbxgRcbDrZVGG9RnMh"}, // gear_7: Crossbow
    MintInfo{ id: PLATE_ARMOR_ID, mint_type: GEAR_TYPE, ep: 5, mint: "G99sqpaedL4SkKaTHjt6MYRCa88c5vCmQjNqKJmZjG1s"}, // gear_8: Plate_armor
    MintInfo{ id: CUTTHROATS_DAGGER_ID, mint_type: GEAR_TYPE, ep: 6, mint: "4SFhr6TMYyAjFp7ATgCcn99s6NhVCJMLTwqBrUU88XEV"}, // gear_9: Cutthroats_dagger
    MintInfo{ id: EXCALIBUR_ID, mint_type: GEAR_TYPE, ep: 6, mint: "6eQ8fFydkqiAvV2yivzH8GsGSvZzyCrHj1DuC934GksX"}, // gear_10: Excalibur
    MintInfo{ id: TREASURE_SCROLL_ID, mint_type: GEAR_TYPE, ep: 0, mint: "8HKjCHHqKb7uvXH8EaiLpnGPu5EKYbXABhxaYXboTbwx"}, // Gear_11: Treasure scroll
    MintInfo{ id: POT_OF_SWIFTNESS_ID, mint_type: POTION_TYPE, ep: 0, mint: "94Be6xQ8ocE7uoGg1YkmKqN8Mu2yqDnrhzWCR7Q92PVY"}, // potion_1: swiftness
    MintInfo{ id: POT_OF_STRENGTH_ID, mint_type: POTION_TYPE, ep: 2, mint: "6vzpPsyXdsuuowg2wepn1WyCf5sFBWnz6YZ9ZHbrdFMs"}, // potion_2: strength
    MintInfo{ id: POT_OF_MENDING_ID, mint_type: POTION_TYPE, ep: 0, mint: "2X4sD6WeRQPhoi8WnhB1qiF74UxNQrwhyrKmYzMz9w15"}, // potion_3: mending
    MintInfo{ id: POT_OF_RESILIENCE_ID, mint_type: POTION_TYPE, ep: 0, mint: "2ssNaWPDfVuo3xKJntTU4pcmCPBs5Ar3vH3AtY6wcFL5"}, // potion_4: resilience
    MintInfo{ id: GRAIL_ID, mint_type: GRAIL_TYPE, ep: 0, mint: "GaXrwHSowx2U9cz7NiRdGkjfnuoiPV5XU5oo8QcEmuep"}, // grail   
];
struct MintAuth {
    seed: &'static [u8], 
}
const MINT_AUTH: MintAuth = MintAuth{seed: b"mint_auth"};

#[error]
pub enum ErrorCode {
    #[msg("Bad mint provided.")]
    BadMintProvided,
    #[msg("Claim is not possible yet as the Explorer has not hunted.")]
    HasNotHunted,
    #[msg("The program has already been initialized.")]
    AlreadyInitialized,
    #[msg("The program has not been initialized.")]
    ProgramNotInitialized,
    #[msg("State array is too full to add.")]
    StateArrFull,
    #[msg("Bad bump provided.")]
    BadBumpProvided,
    #[msg("An incorrect array index was fed through processing.")]
    IncorrectIndexFed,
    #[msg("An impossible value was fed through getTreasureType.")]
    ImpossibleTreasureValue,
    #[msg("Randomness has not been generated ahead of processing.")]
    RandomnessNotGenerated,
    #[msg("Randomness has already been generated.")]
    RandomnessAlreadyGenerated,
    #[msg("Randomness has already been requested.")]
    RandomnessAlreadyRequested,
    #[msg("Randomness has not yet been requested.")]
    RandomnessNotYetRequested,
    #[msg("Randomness has been generated and not fully used.")]
    RandomnessInUse,
    #[msg("Array shuffle has already taken place.")]
    EntriesAlreadyShuffled,
    #[msg("The user does not currently own an explorer of the provided mint.")]
    ExplorerNotOwned,
    #[msg("This explorer has no gear available to claim.")]
    NoGearAvailable,
    #[msg("The state array is full.")]
    StateArrCapped,
    #[msg("The state array has not yet been shuffled.")]
    StateArrNotShuffled,
    #[msg("A random number was requested but hasn't been utilized.")]
    VrfRequestNotYetUsed,


}

#[program]
mod anchor_test {
    use super::*;

    pub fn airdrop_starter(
        ctx: Context<AirdropStarter>
    ) -> ProgramResult {
        instructions::airdrop_starter::handler(
            ctx
        )
    }
    pub fn claim_geardrop(
        ctx: Context<ClaimGeardrop>,
        explorer_id: u16,
    ) -> ProgramResult {
        instructions::claim_geardrop::handler(
            ctx,
            explorer_id
        )
    }

    pub fn initialize_program(
        ctx: Context<InitializeProgram>,
        program_ust_account_bump: u8,
        mint_auth_account_bump: u8,
        vrf_num_bump: u8,
    ) -> ProgramResult {
        instructions::initialize_program::handler(
            ctx, 
            program_ust_account_bump, 
            mint_auth_account_bump,
            vrf_num_bump,
        )
    }   
    pub fn compute_results(
        ctx: Context<ComputeResults>,
    ) -> ProgramResult {
        instructions::compute_results::handler(ctx)
    }

    pub fn request_vrf(
        ctx: Context<RequestVrf>,
    ) -> ProgramResult {
        instructions::request_vrf::handler(ctx)
    }    
    
    pub fn shuffle_entries(
        ctx: Context<ShuffleEntries>,
    ) -> ProgramResult {
        instructions::shuffle_entries::handler(ctx)
    }

    pub fn claim_hunt(
        ctx: Context<ClaimHunt>, 
        explorer_escrow_bump: u8, 
    ) -> ProgramResult {
        instructions::claim_hunt::handler(
            ctx,
            explorer_escrow_bump, 
        )
    }

    pub fn enter_hunt(
        ctx: Context<EnterHunt>,
        explorer_token_bump: u8,
        explorer_id: u16,
        provided_potion: bool,
        provided_gear_id: u8,
        provided_potion_id: u8,
    ) -> ProgramResult {
        instructions::enter_hunt::handler(
            ctx,
            explorer_token_bump,
            explorer_id,
            provided_potion,
            provided_gear_id,
            provided_potion_id,
        )
    }
    
    pub fn process_hunt(ctx: Context<ProcessHunt>) -> ProgramResult {
        instructions::process_hunt::handler(ctx)
    }

}
