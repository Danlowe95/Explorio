use anchor_lang::prelude::*;

use crate::state::{HuntState};

#[derive(Accounts)]
#[instruction(state_account_bump: u8)]
pub struct InitializeProgram<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init, 
        payer = authority, 
        space = 1145000,
        // I think program_id is applied here automatically? created on frontend first (with program_id)
        // to get the proper bump so compute isn't paid to find proper bump each time.
        seeds = [b"state"],
        bump = state_account_bump, 
    )]
    pub state_account: Account<'info, HuntState>,
    pub system_program: Program <'info, System>,
    // Eventually
    // #[account(
    //     init, 
    //     payer = authority, 
    //     seeds = ["history_account"],
    //     bump = state_account_bump, 
    //     space = 1048576 // 1Mb
    // )]
    // pub history_account: Account<'info, HuntHistory>,
}

pub fn initializeProgram(ctx: Context<InitializeProgram>, state_account_bump: u8) -> ProgramResult {
    let state_account = &mut ctx.accounts.state_account;
    state_account.hunt_state_account_bump = state_account_bump;
    state_account.authority = ctx.accounts.authority.key();
    state_account.hunt_state_vec = Vec::with_capacity(1144000);
    Ok(())
}