use anchor_lang::prelude::*;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("69v7eiACV758WzGopNQN8s5WRG5TcTSF4nexNP8F5p7d");

struct MintInfo<'a> {
    id: u8,
    mint: &'a str,
    bump: u8
}
const GEAR_MINTS: [MintInfo; 1] = [
    MintInfo{ id: 1, mint: "kithbUj3JCAJYFU7A1vcMAhDdvQ8EheWSCkRwkhLj2s", bump: 123}
];
const POTION_MINTS: [MintInfo; 1] = [
    MintInfo{ id: 1, mint: "4NkMX1SSsMRKnBwVakuAqv5rVipjhuqT3a17m7wPvPLE", bump: 123}
];

struct MintAuth<'a> {
    seed: &'a [u8], 
    bump: u8 
}
const MINT_AUTH: MintAuth = MintAuth{seed: b"mint_auth", bump: 123};

#[error]
pub enum ErrorCode {
    #[msg("Bad mint provided.")]
    BadMintProvided,
    #[msg("Claim is not possible yet as the Explorer has not hunted.")]
    HasNotHunted,
}

#[program]
mod anchor_test {
    use super::*;

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

    pub fn claim_hunt(
        ctx: Context<ClaimHunt>, 
        // explorer_token_bump: u8, 
        // gear_token_bump: u8, 
        // potion_token_bump: u8,
        // combat_won_gear_token_bump: u8,
        // state_account_bump: u8
    ) -> ProgramResult {
        instructions::claim_hunt::handler(
            ctx,
            // explorer_token_bump, 
            // gear_token_bump, 
            // potion_token_bump,
            // combat_won_gear_token_bump,
            // state_account_bump
        )
    }

    pub fn enter_hunt(
        ctx: Context<EnterHunt>,
        explorer_token_bump: u8,
        // gear_token_bump: u8,
        // potion_token_bump: u8,
        // state_account_bump: u8
    ) -> ProgramResult {
        instructions::enter_hunt::handler(
            ctx,
            explorer_token_bump,
            // gear_token_bump,
            // potion_token_bump,
            // state_account_bump
        )
    }
    
    pub fn process_hunt(ctx: Context<ProcessHunt>) -> ProgramResult {
        instructions::process_hunt::handler(ctx)
    }

}
