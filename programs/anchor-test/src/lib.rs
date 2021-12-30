use anchor_lang::prelude::*;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("ctqhWwv4TABZqzX3WJsJhiQDY6xNpVYW7KHtJL3ZRKC");

#[program]
mod anchor_test {
    use super::*;

    pub fn initialize_program(
        ctx: Context<InitializeProgram>,
        state_account_bump: u8,
        program_ust_account_bump: u8
    ) -> ProgramResult {
        instructions::initialize_program::handler(ctx, state_account_bump, program_ust_account_bump)
    }

    pub fn claim_hunt(
        ctx: Context<ClaimHunt>, 
        explorer_token_bump: u8, 
        gear_token_bump: u8, 
        potion_token_bump: u8,
        combat_won_gear_token_bump: u8,
        // state_account_bump: u8
    ) -> ProgramResult {
        instructions::claim_hunt::handler(
            ctx,
            explorer_token_bump, 
            gear_token_bump, 
            potion_token_bump,
            combat_won_gear_token_bump,
            // state_account_bump
        )
    }

    pub fn enter_hunt(
        ctx: Context<EnterHunt>,
        explorer_token_bump: u8,
        gear_token_bump: u8,
        potion_token_bump: u8,
        // state_account_bump: u8
    ) -> ProgramResult {
        instructions::enter_hunt::handler(
            ctx,
            explorer_token_bump,
            gear_token_bump,
            potion_token_bump,
            // state_account_bump
        )
    }
    
    pub fn process_hunt(ctx: Context<ProcessHunt>) -> ProgramResult {
        instructions::process_hunt::handler(ctx)
    }

}
