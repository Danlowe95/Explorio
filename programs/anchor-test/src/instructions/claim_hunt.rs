use anchor_lang::prelude::*;

use crate::state::{HuntState};
use anchor_spl::token::{Mint, Token, TokenAccount};

// todo bump wasn't intended to be passed in - pulled from huntState
// that requires deserialization and lookup on frontend
// would need to pass in bumps for ALL escrow accounts unless better way found.
#[derive(Accounts)]
#[instruction(
    explorer_token_bump: u8, 
    gear_token_bump: u8, 
    potion_token_bump: u8,
    combat_won_gear_token_bump: u8,
    state_account_bump: u8,
)]
pub struct ClaimHunt<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    // Start - the associated accounts of the user for all potentail claimables.
    // TODO may need init_if_needed and payer on all of these.
    #[account(
        mut,
        associated_token::mint = explorer_mint,
        associated_token::authority = user
    )]
    pub user_associated_explorer_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = provided_gear_mint,
        associated_token::authority = user
    )]
    pub user_associated_provided_gear_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = combat_won_gear_mint,
        associated_token::authority = user
    )]
    pub user_associated_combat_won_gear_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = potion_mint,
        associated_token::authority = user
    )]
    pub user_associated_potion_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = treasure_mint,
        associated_token::authority = user
    )]
    pub user_associated_treasure_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = ust_mint,
        associated_token::authority = user
    )]
    pub user_associated_ust_account: Account<'info, TokenAccount>,

    // Start - All escrow accounts that are currently holding claimables to transfer.
    #[account( 
        mut,
        seeds = [explorer_mint.key().as_ref(), b"explorer"],
        bump = explorer_token_bump, 
    )]
    pub explorer_escrow_account: Account<'info, TokenAccount>,
    #[account( 
        mut,
        seeds = [provided_gear_mint.key().as_ref(), b"gear"],
        bump = gear_token_bump, 
    )]
    pub provided_gear_escrow_account: Account<'info, TokenAccount>,
    #[account( 
        mut,
        seeds = [potion_mint.key().as_ref(), b"potion"],
        bump = potion_token_bump, 
    )]
    pub potion_escrow_account: Account<'info, TokenAccount>,
    #[account( 
        mut,
        seeds = [combat_won_gear_mint.key().as_ref(), b"gear"],
        bump = combat_won_gear_token_bump, 
    )]
    pub combat_won_escrow_account: Account<'info, TokenAccount>,

    // Start - All mints for potential claimables
    pub explorer_mint: Account<'info, Mint>,
    pub provided_gear_mint: Account<'info, Mint>,
    pub potion_mint: Account<'info, Mint>,
    // To be grabbed by the frontend from state and passed through
    pub combat_won_gear_mint: Account<'info, Mint>,
    pub treasure_mint: Account<'info, Mint>,
    pub ust_mint: Account<'info, Mint>,


    #[account(mut)]
    pub state_account: Account<'info, HuntState>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,

}
    // Allow user to reclaim explorer NFT
    pub fn claimHunt(
        ctx: Context<ClaimHunt>,     
        explorer_token_bump: u8, 
        gear_token_bump: u8, 
        potion_token_bump: u8,
        combat_won_gear_token_bump: u8,
        state_account_bump: u8
    ) -> ProgramResult {
        let user_account = &mut ctx.accounts.user;
        let user_associated_explorer_account = &mut ctx.accounts.user_associated_explorer_account;

        // Transfer the user's explorer token to the escrow account.
        anchor_spl::token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.explorer_escrow_account.to_account_info(),
                    to: ctx.accounts.user_associated_explorer_account.to_account_info(),
                    // The user had to sign from the client
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            1,
        );
        Ok(())
    }
