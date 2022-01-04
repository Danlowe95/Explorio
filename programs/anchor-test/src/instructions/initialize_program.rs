use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};
use anchor_spl::associated_token::{AssociatedToken};
use crate::state::{HuntState};

#[derive(Accounts)]
#[instruction(
    program_ust_account_bump: u8, 
    mint_auth_account_bump: u8,
)]
pub struct InitializeProgram<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        zero
    )]
    pub state_account: AccountLoader<'info, HuntState>,

    #[account(
        init_if_needed, 
        payer = owner, 
        token::mint = ust_mint,
        token::authority = program_ust_account,
        seeds = [b"fund"],
        bump = program_ust_account_bump, 
    )]
    pub program_ust_account: Account<'info, TokenAccount>,


    pub ust_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
    // Eventually
    // #[account(
    //     init, 
    //     payer = authority, 
    //     seeds = ["history_account"],
    //     bump = state_account_bump, 
    //     space = 1048576 // 1Mb
    // )]
    // pub history_account: Account<'info, HuntHistory>,

pub fn handler(
    ctx: Context<InitializeProgram>, 
    program_ust_account_bump: u8,
    mint_auth_account_bump: u8,
) -> ProgramResult {
    msg!("{}", ctx.accounts.state_account.to_account_info().data_len());
    let state_account = &mut ctx.accounts.state_account.load_init()?;
    msg!("test");
    if state_account.is_initialized {
        return Err(crate::ErrorCode::AlreadyInitialized.into());
    }
    msg!("test2");
    state_account.is_initialized = true;
    state_account.mint_auth_account_bump = mint_auth_account_bump;
    state_account.program_ust_account_bump = program_ust_account_bump;

    state_account.owner = ctx.accounts.owner.key();
    state_account.hunt_state_arr = [None; 5000]; // Vec::with_capacity(94);
    Ok(())
}
