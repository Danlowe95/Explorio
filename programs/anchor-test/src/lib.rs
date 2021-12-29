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
        state_account_bump: u8
    ) -> ProgramResult {
        instructions::initialize_program::initializeProgram(ctx, state_account_bump)
    }

    pub fn claim_hunt(
        ctx: Context<ClaimHunt>, 
        explorer_token_bump: u8, 
        gear_token_bump: u8, 
        potion_token_bump: u8,
        combat_won_gear_token_bump: u8,
        state_account_bump: u8
    ) -> ProgramResult {
        instructions::claim_hunt::claimHunt(
            ctx,
            explorer_token_bump, 
            gear_token_bump, 
            potion_token_bump,
            combat_won_gear_token_bump,
            state_account_bump
        )
    }

    pub fn enter_hunt(
        ctx: Context<EnterHunt>,
        explorer_token_bump: u8,
        gear_token_bump: u8,
        potion_token_bump: u8,
        state_account_bump: u8
    ) -> ProgramResult {
        instructions::enter_hunt::enterHunt(
            ctx,
            explorer_token_bump,
            gear_token_bump,
            potion_token_bump,
            state_account_bump
        )
    }
    
    pub fn process_hunt(ctx: Context<ProcessHunt>) -> ProgramResult {
        instructions::process_hunt::processHunt(ctx)
    }

    pub fn basic_test(ctx: Context<BasicTest>) -> ProgramResult {
        Ok(())
    }
}

#[account]
pub struct LockedExplorerData {
    // We store the offer maker's key so that they can cancel the offer (we need
    // to know who should sign).
    pub user: Pubkey,

    // The NFT stored (if needed)
    pub explorer_mint: Pubkey,

    // When the maker makes their offer, we store their offered tokens in an
    // escrow account that lives at a program-derived address, with seeds given
    // by the `Offer` account's address. Storing the corresponding bump here
    // means the client doesn't have to keep passing it.
    pub escrowed_explorer_token_bump: u8,
    // whether the program will allow the user to reclaim
    pub is_locked: bool,
}


// #[account]
// pub struct ExplorioState {
//     pub entered_explorers: 
// }
// // An account that goes inside a transaction instruction
// #[account]
// pub struct ExplorerAccount {
//     pub count: u64,
// }

#[derive(Accounts)]
pub struct BasicTest {
}