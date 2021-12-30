use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};
use anchor_spl::associated_token::{AssociatedToken};
use crate::state::{HuntState};

#[derive(Accounts)]
#[instruction(state_account_bump: u8, program_ust_account_bump: u8)]
pub struct InitializeProgram<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init_if_needed, 
        payer = authority, 
        space = 1165000 + 1 + 32,
        seeds = [b"state"],
        bump = state_account_bump, 
    )]
    pub state_account: Account<'info, HuntState>,

    #[account(
        init_if_needed, 
        payer = authority, 
        associated_token::mint = ust_mint,
        associated_token::authority = program_ust_account,
        seeds = [b"fund"],
        bump = program_ust_account_bump, 
    )]
    pub program_ust_account: Account<'info, TokenAccount>,

    // Eventually
    // #[account(
    //     init, 
    //     payer = authority, 
    //     seeds = ["history_account"],
    //     bump = state_account_bump, 
    //     space = 1048576 // 1Mb
    // )]
    // pub history_account: Account<'info, HuntHistory>,

    // Eventually, this will likely take in pre-created Gear/Potion/Grail MasterEditions to place under program's control.

    pub ust_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,

}

pub fn handler(ctx: Context<InitializeProgram>, state_account_bump: u8, program_ust_account_bump: u8) -> ProgramResult {
    let state_account = &mut ctx.accounts.state_account;
    state_account.hunt_state_account_bump = state_account_bump;
    state_account.program_ust_account_bump = program_ust_account_bump;
    state_account.authority = ctx.accounts.authority.key();
    state_account.hunt_state_vec = Vec::with_capacity(1165000);
    Ok(())
}