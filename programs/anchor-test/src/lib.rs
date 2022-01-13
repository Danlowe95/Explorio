use anchor_lang::prelude::*;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("3cdx2BHuSCyyvLJt2ZhdcoPpSrMqzZHb2UPQD6f8tTUK");

// Declare Explorio protocol owner publicKey for reference during initialization.
const OWNER_KEY: &str = r"EA7Cpq8hfUxpHAQaQ1xy3hKaqEUSwQxXQijpZY6ZmJrU";

struct MintInfo{
    id: u8,
    mint_type: u8,
    mint: &'static str,
    ep: i8,
}

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
    MintInfo{ id: SHORTSWORD_ID, mint_type: GEAR_TYPE, ep: 1, mint: "GHNQkERXvYSf1MTPhDFDivzhRBvAXa7MeWmAMvAB92ZZ"}, // gear_1: shortsword
    MintInfo{ id: LEATHER_ARMOR_ID, mint_type: GEAR_TYPE, ep: 1, mint: "iZmAWU9uf3ceeuSuVVJAcYzUBaHQBtZwzrRz6mvHhu5"}, // gear_2: leather_armor
    MintInfo{ id: DAGGER_ID, mint_type: GEAR_TYPE, ep: 2, mint: "HaALAS478TpnM5fLAy1iu6MC94p5FiU7JfTBAxuXAMcB"}, // gear_3: Dagger
    MintInfo{ id: SHORTBOW_ID, mint_type: GEAR_TYPE, ep: 2, mint: "FjEUGbKzymyTi6V7EYWMJGdWKWtGCwMPNQtBHAeqGHZ5"}, // gear_4: Shortbow
    MintInfo{ id: LONGSWORD_ID, mint_type: GEAR_TYPE, ep: 3, mint: "Er7ZnrQLFCchRvDe3RbXUbc8tKJ8mVqGAEAVUtzgn5vo"}, // gear_5: Longsword
    MintInfo{ id: CHAINMAIL_ARMOR_ID, mint_type: GEAR_TYPE, ep: 3, mint: "D2c7yzJfajbWpkNhdnaMeCdgXBKAzJ3gUJiBp3Xi7h9y"}, // gear_6: Chainmail_armor
    MintInfo{ id: CROSSBOW_ID, mint_type: GEAR_TYPE, ep: 4, mint: "5XYniahaM4f9Zit37xAWjmvbjLmXDRd5tzZ4nyfQyq2n"}, // gear_7: Crossbow
    MintInfo{ id: PLATE_ARMOR_ID, mint_type: GEAR_TYPE, ep: 5, mint: "DsbWDse87dQ7tev1aonN21o9CWj3fepJ2ERkUbH4AD8p"}, // gear_8: Plate_armor
    MintInfo{ id: CUTTHROATS_DAGGER_ID, mint_type: GEAR_TYPE, ep: 6, mint: "8LK8mcYtLpFuFNVqnAZeE7eitYQfFtrF6HTzLyqEqKVk"}, // gear_9: Cutthroats_dagger
    MintInfo{ id: EXCALIBUR_ID, mint_type: GEAR_TYPE, ep: 6, mint: "DeJhvjDS5qKT5sHoiwG4GzHfm2Uzc71ZvyKidG6nKe3x"}, // gear_10: Excalibur
    MintInfo{ id: TREASURE_SCROLL_ID, mint_type: GEAR_TYPE, ep: 0, mint: "CgmVpaGhvRpqWQUgNgE5zTgis28gxo54kmocKW44oJTM"}, // Gear_11: Treasure scroll
    MintInfo{ id: POT_OF_SWIFTNESS_ID, mint_type: POTION_TYPE, ep: 0, mint: "BhUQk8s7va4STP9MHQgDn8k7MEBMtxHBZrj9vX5BkBHf"}, // potion_1: swiftness
    MintInfo{ id: POT_OF_STRENGTH_ID, mint_type: POTION_TYPE, ep: 2, mint: "G5mSBuTBisW68Z8XvP25emcHCDpkRX6k9tqwxg25FQMM"}, // potion_2: strength
    MintInfo{ id: POT_OF_MENDING_ID, mint_type: POTION_TYPE, ep: 0, mint: "9E4DGvgyChjFaG8PUoznD3de7oGjP49PpM2bVpCkhDuw"}, // potion_3: mending
    MintInfo{ id: POT_OF_RESILIENCE_ID, mint_type: POTION_TYPE, ep: 0, mint: "9p1oP6StMbrroWiaTfwBXFfEndko6Azgz5688sYqQtmv"}, // potion_4: resilience
    MintInfo{ id: GRAIL_ID, mint_type: GRAIL_TYPE, ep: 0, mint: "6CUSkdzTqP75Gucc8DA9Vim8orp3KmeR3pfwqUGE56Qj"}, // grail
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
        provided_gear_id: u8,
        provided_potion_id: u8,
    ) -> ProgramResult {
        instructions::enter_hunt::handler(
            ctx,
            explorer_token_bump,
            provided_potion,
            provided_gear_id,
            provided_potion_id,
        )
    }
    
    pub fn process_hunt(ctx: Context<ProcessHunt>) -> ProgramResult {
        instructions::process_hunt::handler(ctx)
    }

}
