use anchor_lang::prelude::*;

use crate::state::{HuntState, EnteredExplorer};
use anchor_spl::token::{Mint, Token, TokenAccount};
use anchor_spl::associated_token::{AssociatedToken};



#[derive(Accounts)]
pub struct AirdropStarter<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = shortsword_mint,
        associated_token::authority = user,
    )]
    pub user_shortsword_associated_account: Box<Account<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = strength_potion_mint,
        associated_token::authority = user,
    )]
    pub user_strength_potion_associated_account: Box<Account<'info, TokenAccount>>,

    // #[account(mut, constraint = provided_gear_pda.mint == shortsword_mint.key())]
    // pub provided_gear_pda: Box<Account<'info, TokenAccount>>,
    // #[account(constraint = {
    //     Pubkey::from_str(crate::GEAR_1_MINT).unwrap() == shortsword_mint.key()
    // })]
    #[account(mut)]
    pub shortsword_mint: Box<Account<'info, Mint>>,
    // #[account(mut, constraint = provided_potion_pda.mint == strength_potion_mint)]
    #[account(mut)]
    pub strength_potion_mint: Box<Account<'info, Mint>>,

    // #[account(mut)]
    // pub state_account: AccountLoader<'info, HuntState>,
    #[account(
        seeds=[b"mint_auth"],
        bump = state_account.load()?.mint_auth_account_bump
    )]
    pub mint_auth: AccountInfo<'info>,
    #[account(mut)]
    pub state_account: AccountLoader<'info, HuntState>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,

    pub rent: Sysvar<'info, Rent>,
}


    // Enter a hunt by depositing an explorer+gear NFT
    pub fn handler(
        ctx: Context<AirdropStarter>,
    ) -> ProgramResult {
        // mint the user's gear token.
        anchor_spl::token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::MintTo {
                    mint: ctx.accounts.shortsword_mint.to_account_info(),
                    to: ctx.accounts.user_shortsword_associated_account.to_account_info(),
                    authority: ctx
                        .accounts
                        .mint_auth
                        .to_account_info(),
                },
                &[&[
                    crate::MINT_AUTH.seed,
                    &[ctx.accounts.state_account.load()?.mint_auth_account_bump],
                ]],
            ),
            1,
        )?;
        // mint the user's potion token.
        anchor_spl::token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::MintTo {
                    mint: ctx.accounts.strength_potion_mint.to_account_info(),
                    to: ctx.accounts.user_strength_potion_associated_account.to_account_info(),
                    authority: ctx
                        .accounts
                        .mint_auth
                        .to_account_info(),
                },
                &[&[
                    crate::MINT_AUTH.seed,
                    &[ctx.accounts.state_account.load()?.mint_auth_account_bump],
                ]],
            ),
            1,
        )?;
        Ok(())
    }
