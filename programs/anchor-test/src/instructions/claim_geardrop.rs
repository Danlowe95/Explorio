use anchor_lang::prelude::*;

use crate::state::{HuntState, GeardropState, IdAndNumber};
use anchor_spl::token::{Mint, Token, TokenAccount};
use anchor_spl::associated_token::{AssociatedToken};
use crate::explorers::EXPLORERS;


#[derive(Accounts)]
#[instruction(
    explorer_id: u16,
)]
pub struct ClaimGeardrop<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        associated_token::mint = explorer_mint,
        associated_token::authority = user,
        constraint = anchor_spl::associated_token::get_associated_token_address(&user.key(), &explorer_mint.key()) == user_explorer_account.key()
    )]
    pub user_explorer_account: Box<Account<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = shortsword_mint,
        associated_token::authority = user,
    )]
    pub user_shortsword_associated_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub shortsword_mint: Box<Account<'info, Mint>>,
    pub explorer_mint: Box<Account<'info, Mint>>,

    #[account(
        seeds=[b"mint_auth"],
        bump = state_account.load()?.mint_auth_account_bump
    )]
    pub mint_auth: AccountInfo<'info>,

    #[account(mut)]
    pub state_account: AccountLoader<'info, HuntState>,
    #[account(mut)]
    pub geardrop_state: AccountLoader<'info, GeardropState>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,

    pub rent: Sysvar<'info, Rent>,
}


    // Claim a geardrop, if available, for the explorer owned by the claiming user.
    pub fn handler(
        ctx: Context<ClaimGeardrop>,
        explorer_id: u16,
    ) -> ProgramResult {
        let mut geardrop_state = ctx.accounts.geardrop_state.load_mut()?;
        let shortsword_triple = crate::MINTS.iter().find(|x| x.id == crate::SHORTSWORD_ID).unwrap();
        // Confirm that the passed in shortsword mint is legit.
        if shortsword_triple.mint != &ctx.accounts.shortsword_mint.key().to_string() {
            return Err(crate::ErrorCode::BadMintProvided.into());
        }

        let explorer = EXPLORERS.iter().find(|x| x.id == explorer_id).unwrap();
        // Confirm that the explorer_mint supplied is the mint for the provided explorer_id.
        if ctx.accounts.explorer_mint.key().to_string().as_str() != explorer.mint {
            return Err(crate::ErrorCode::BadMintProvided.into());
        }
        // Confirm that the user's associated explorer account contains the explorer NFT.
        // NFT with supply 1 so assumed never greater than 1.
        if ctx.accounts.user_explorer_account.amount != 1 {
            return Err(crate::ErrorCode::ExplorerNotOwned.into());
        }

        // Confirm the user has an available geardrop
        let entry: &mut IdAndNumber = geardrop_state.geardrop_arr.iter_mut().find(|x| x.explorer_id == explorer.id).unwrap();
        if entry.num_available == 0 {
            return Err(crate::ErrorCode::NoGearAvailable.into());
        }
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
            entry.num_available.into(),
        )?;
        entry.num_available = 0;


        Ok(())
    }
