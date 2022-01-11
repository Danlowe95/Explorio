use anchor_lang::prelude::*;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("3cdx2BHuSCyyvLJt2ZhdcoPpSrMqzZHb2UPQD6f8tTUK");

// Declare Explorio protocol owner publicKey for reference during initialization.
const OWNER_KEY: &str = r"EA7Cpq8hfUxpHAQaQ1xy3hKaqEUSwQxXQijpZY6ZmJrU";

struct MintInfo{
    id: u8,
    mint_type: &'static str,
    mint: &'static str,
    ep: i8,
}
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

const POT_OF_SWIFTNESS_ID: u8 = 11;
const POT_OF_STRENGTH_ID: u8 = 12;
const POT_OF_MENDING_ID: u8 = 13;
const POT_OF_RESILIENCE_ID: u8 = 14;

const GRAIL_ID: u8 = 15;
const MINTS: [MintInfo; 16] = [
    MintInfo{ id: 0, mint_type: "NONE", ep: 0, mint: "NONE"}, // none
    MintInfo{ id: SHORTSWORD_ID, mint_type: "GEAR", ep: 1, mint: "BmkWJA4kFVKFZs95v1WKFHWU1ja35WQDyHm487VPPvTH"}, // gear_1: shortsword
    MintInfo{ id: LEATHER_ARMOR_ID, mint_type: "GEAR", ep: 1, mint: "8cB5SuMvLCFwNQor8P2L4aWRMtNyqguraPYMWeo27QR9"}, // gear_2: leather_armor
    MintInfo{ id: DAGGER_ID, mint_type: "GEAR", ep: 2, mint: "GnQPHsM1p4hFdeETaULmsPUg5T3vaQmUHHjqJSHrSMQN"}, // gear_3: Dagger
    MintInfo{ id: SHORTBOW_ID, mint_type: "GEAR", ep: 2, mint: "5xksBR9CJ1WDaqSvnEkqH9repcSY4gBhPHSdvdySFPse"}, // gear_4: Shortbow
    MintInfo{ id: LONGSWORD_ID, mint_type: "GEAR", ep: 3, mint: "5T5DkM4HAaA8FHCECRFZy2My55um2DqCkqSP9jS7rMYB"}, // gear_5: Longsword
    MintInfo{ id: CHAINMAIL_ARMOR_ID, mint_type: "GEAR", ep: 3, mint: "HnbGZVKK3UfeRfZViqUfAVj1z6Nt5bfXzAXz2sH51C4H"}, // gear_6: Chainmail_armor
    MintInfo{ id: CROSSBOW_ID, mint_type: "GEAR", ep: 4, mint: "6LScX5ueqXj2AKpGrz4TFN66CcbVUFPcMkCHFnVLx88t"}, // gear_7: Crossbow
    MintInfo{ id: PLATE_ARMOR_ID, mint_type: "GEAR", ep: 5, mint: "AsWk2nkyH5rUXXcFTrNsiWLFz27jnV1oraTZjAadexNt"}, // gear_8: Plate_armor
    MintInfo{ id: CUTTHROATS_DAGGER_ID, mint_type: "GEAR", ep: 6, mint: "9zCobAXS5hpJuAB1HYH2jUBvoxj8HhykJXFJeoq16CpD"}, // gear_9: Cutthroats_dagger
    MintInfo{ id: EXCALIBUR_ID, mint_type: "GEAR", ep: 6, mint: "5aW4JyhDBGXvPHg5GzrdcbcbbUNVbhtPscdWQHFi3A2F"}, // gear_10: Excalibur
    MintInfo{ id: POT_OF_SWIFTNESS_ID, mint_type: "POTION", ep: 0, mint: "64EXMYpKYmnbCGxxTdhVPqMu5ygHVLuKuRfSqTSa93h6"}, // potion_1: swiftness
    MintInfo{ id: POT_OF_STRENGTH_ID, mint_type: "POTION", ep: 2, mint: "AXS8hGMFNvFLbAwUZEZdDXVq87PLU6sWm1y3T4vAxpBv"}, // potion_2: strength
    MintInfo{ id: POT_OF_MENDING_ID, mint_type: "POTION", ep: 0, mint: "FXMaqanFh69h29anpwaqwDAVjm7M5bQSN7ZNpvFDrZxC"}, // potion_3: mending
    MintInfo{ id: POT_OF_RESILIENCE_ID, mint_type: "POTION", ep: 0, mint: "DMTaDS4F7ydSdX2jXGKSMEGmRhWMSuUmjU7UQUeB8HXS"}, // potion_4: resilience
    MintInfo{ id: GRAIL_ID, mint_type: "GRAIL", ep: 0, mint: "7BnEpMkqbLcGSafPJGNBRweT6XZwLBFsLoTWzzjxthrC"}, // grail
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

    RandomnessAlreadyGenerated
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
    pub fn initialize_program(
        ctx: Context<InitializeProgram>,
        state_account_bump: u8,
        program_ust_account_bump: u8,
    ) -> ProgramResult {
        instructions::initialize_program::handler(
            ctx, 
            state_account_bump, 
            program_ust_account_bump,
        )
    }   
    pub fn fetch_vrf(
        ctx: Context<FetchVrf>,
    ) -> ProgramResult {
        instructions::fetch_vrf::handler(ctx)
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
        provided_potion: bool,
    ) -> ProgramResult {
        instructions::enter_hunt::handler(
            ctx,
            explorer_token_bump,
            provided_potion,
        )
    }
    
    pub fn process_hunt(ctx: Context<ProcessHunt>) -> ProgramResult {
        instructions::process_hunt::handler(ctx)
    }

}
