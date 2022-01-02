use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};
use anchor_spl::associated_token::{AssociatedToken};
use crate::state::{HuntState};

#[derive(Accounts)]
#[instruction(
    state_account_bump: u8, 
    program_ust_account_bump: u8, 
)]
pub struct InitializeProgram<'info> {
    // TODO Make it so only I can call this
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init_if_needed, 
        payer = owner, 
        space = 1165000 + 1 + 32,
        seeds = [b"state"],
        bump = state_account_bump, 
    )]
    pub state_account: Account<'info, HuntState>,

    #[account(
        init_if_needed, 
        payer = owner, 
        token::mint = ust_mint,
        token::authority = program_ust_account,
        seeds = [b"fund"],
        bump = program_ust_account_bump, 
    )]
    pub program_ust_account: Account<'info, TokenAccount>,

    // #[account(
    //     seeds = [b"gear_1_ma"],
    //     bump = gear_1_mint_authority_bump, 
    // )]
    // pub gear_1_mint_authority_pda: Account<'info>,

    // #[account(
    //     seeds = [b"potion_1_ma"],
    //     bump = potion_1_account_bump, 
    // )]
    // pub potion_1_mint_authority_pda: Account<'info>,

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

    // TODO when we expand past this example, there will be too many gear/potions to
    // keep all of these in one initialize transaction. Will likely want to break initialize into
    // a few calls, one for main data, one for gear, one for potions etc.
    //
    // These mints are only here because we need them above to initialize their accounts.
    // In all other code, the mints will be checked/referenced through GEAR_MINTS/POTION_MINTS.
    // pub gear_1_mint: Account<'info, Mint>,
    // pub potion_1_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,

}

pub fn handler(
    ctx: Context<InitializeProgram>, 
    state_account_bump: u8, 
    program_ust_account_bump: u8,
) -> ProgramResult {
    let state_account = &mut ctx.accounts.state_account;
    // state_account.gears = [ctx.accounts.gear_1_mint.key()];
    // state_account.potions = [ctx.accounts.potion_1_mint.key()];

    state_account.hunt_state_account_bump = state_account_bump;
    state_account.program_ust_account_bump = program_ust_account_bump;

    state_account.owner = ctx.accounts.owner.key();
    state_account.hunt_state_vec = Vec::with_capacity(1165000);
    Ok(())
}