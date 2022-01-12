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
const TREASURE_SCROLL_ID: u8 = 11;

const POT_OF_SWIFTNESS_ID: u8 = 12;
const POT_OF_STRENGTH_ID: u8 = 13;
const POT_OF_MENDING_ID: u8 = 14;
const POT_OF_RESILIENCE_ID: u8 = 15;

const GRAIL_ID: u8 = 16;

const MINTS: [MintInfo; 17] = [
    MintInfo{ id: 0, mint_type: "NONE", ep: 0, mint: "NONE"}, // none
    MintInfo{ id: SHORTSWORD_ID, mint_type: "GEAR", ep: 1, mint: "FYH6HAuzjwbSWuHzgWySBY8Bw4pqpK4gEpmb3Fu5eSDK"}, // gear_1: shortsword
    MintInfo{ id: LEATHER_ARMOR_ID, mint_type: "GEAR", ep: 1, mint: "CwTbR91ypzkChUDKua78EdjHZzCyRMP9cqaVr3Z4zSC8"}, // gear_2: leather_armor
    MintInfo{ id: DAGGER_ID, mint_type: "GEAR", ep: 2, mint: "2BoAF7jYkYHKwcPKJ8ZcvgbywBJugw9cK8bhajbg5k99"}, // gear_3: Dagger
    MintInfo{ id: SHORTBOW_ID, mint_type: "GEAR", ep: 2, mint: "2kRyTPmwQH9XS4ebsxJUr3H6BsWQtYMRsC2T4SyTVywa"}, // gear_4: Shortbow
    MintInfo{ id: LONGSWORD_ID, mint_type: "GEAR", ep: 3, mint: "4uDeUBF9SNriJEvzeXzQ3cGPjbEDqr4UsUSj6vCQSNK7"}, // gear_5: Longsword
    MintInfo{ id: CHAINMAIL_ARMOR_ID, mint_type: "GEAR", ep: 3, mint: "A1aMssmKv9hip6zwFbEUvLEiWw1sMC7chkRkbfwHu7Gv"}, // gear_6: Chainmail_armor
    MintInfo{ id: CROSSBOW_ID, mint_type: "GEAR", ep: 4, mint: "C7DFB5rT93jDj19KDGc5M1xzLJQTiHBLitKAc5Wq1w2C"}, // gear_7: Crossbow
    MintInfo{ id: PLATE_ARMOR_ID, mint_type: "GEAR", ep: 5, mint: "BzWKAkFfdvYhzMjYw9ouYQ3bPaKormWNedC9GVKAG6ze"}, // gear_8: Plate_armor
    MintInfo{ id: CUTTHROATS_DAGGER_ID, mint_type: "GEAR", ep: 6, mint: "EaLQVgPnCsGPoZzUh8PzDBzXdxZnto5mEnUYrdPyHmf9"}, // gear_9: Cutthroats_dagger
    MintInfo{ id: EXCALIBUR_ID, mint_type: "GEAR", ep: 6, mint: "3xs9hLXSDNdzxGCsXbfQ6aw8iVwcaWeCJAyNxkVyp5bt"}, // gear_10: Excalibur
    MintInfo{ id: TREASURE_SCROLL_ID, mint_type: "GEAR", ep: 0, mint: "A1afM23Z6MzuUzs4Nkkq4jLYJvXTHwVv1qq4dtN1Y8d2"}, // Gear_11: Treasure scroll
    MintInfo{ id: POT_OF_SWIFTNESS_ID, mint_type: "POTION", ep: 0, mint: "2p2AY4W5gzVePzBFx9THzDgC2636zBSDhWbZksNHwo5E"}, // potion_1: swiftness
    MintInfo{ id: POT_OF_STRENGTH_ID, mint_type: "POTION", ep: 2, mint: "Bfh3zBuL68pS6mVTCt4PdSProheZaubhDc4d2n77KmKe"}, // potion_2: strength
    MintInfo{ id: POT_OF_MENDING_ID, mint_type: "POTION", ep: 0, mint: "5qY1aHsusLa6qhBrnJEzXLVUcqF3FmkQjx6tP2Dv79yA"}, // potion_3: mending
    MintInfo{ id: POT_OF_RESILIENCE_ID, mint_type: "POTION", ep: 0, mint: "9L6p8GtAmUoWGtE6tARs9gagr5Vq9KfNiBqoMJq699tW"}, // potion_4: resilience
    MintInfo{ id: GRAIL_ID, mint_type: "GRAIL", ep: 0, mint: "HhdJWALZCXumnu5EPzb38vusJHzXhjoPhaTGBtgLZrvF"}, // grail
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
