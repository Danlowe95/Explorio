use anchor_lang::prelude::*;

use crate::state::{HuntState, EnteredExplorer};
use anchor_spl::token::{Mint, Token, TokenAccount};


#[derive(Accounts)]
#[instruction(
    explorer_token_bump: u8, 
    gear_token_bump: u8, 
    potion_token_bump: u8,
    state_account_bump: u8
)]
pub struct EnterHunt<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    // the associated accounts which holds the user's NFTs for sending here.
    #[account(mut)]
    pub user_explorer_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_provided_gear_account: Account<'info, TokenAccount>,
    pub user_potion_account: Account<'info, TokenAccount>,

    // Start - All escrow accounts that will hold user's NFTs.
    #[account( 
        init, 
        payer = user, 
        seeds = [explorer_mint.key().as_ref(), b"explorer"],
        bump = explorer_token_bump, 
        token::mint = explorer_mint, 
        token::authority = explorer_escrow_account
    )]
    pub explorer_escrow_account: Account<'info, TokenAccount>,
    #[account( 
        init, 
        payer = user, 
        seeds = [provided_gear_mint.key().as_ref(), b"gear"],
        bump = gear_token_bump, 
        token::mint = provided_gear_mint, 
        token::authority = provided_gear_escrow_account
    )]
    pub provided_gear_escrow_account: Account<'info, TokenAccount>,
    #[account( 
        init, 
        payer = user, 
        seeds = [potion_mint.key().as_ref(), b"potion"],
        bump = potion_token_bump, 
        token::mint = potion_mint, 
        token::authority = potion_escrow_account
    )]
    pub potion_escrow_account: Account<'info, TokenAccount>,

    // Start - All mints for potential claimables
    pub explorer_mint: Account<'info, Mint>,
    pub provided_gear_mint: Account<'info, Mint>,
    pub potion_mint: Account<'info, Mint>,

    #[account(mut)]
    pub state_account: Account<'info, HuntState>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}


    // Enter a hunt by depositing an explorer NFT
    pub fn enterHunt(
        ctx: Context<EnterHunt>,
        explorer_token_bump: u8,
        gear_token_bump: u8,
        potion_token_bump: u8,
        state_account_bump: u8
    ) -> ProgramResult {
        let user_account = &mut ctx.accounts.user;

        // Transfer the user's explorer token to the escrow account.
        anchor_spl::token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.user_explorer_account.to_account_info(),
                    to: ctx.accounts.explorer_escrow_account.to_account_info(),
                    // The user had to sign from the client
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            1,
        );

        // Transfer the user's gear token to the escrow account.
        anchor_spl::token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.user_provided_gear_account.to_account_info(),
                    to: ctx.accounts.provided_gear_escrow_account.to_account_info(),
                    // The user had to sign from the client
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            1,
        );

        // // Transfer the user's potion token to the escrow account.
        // anchor_spl::token::transfer(
        //     CpiContext::new(
        //         ctx.accounts.token_program.to_account_info(),
        //         anchor_spl::token::Transfer {
        //             from: ctx.accounts.user_provided_potion_account.to_account_info(),
        //             to: ctx.accounts.provided_potion_escrow_account.to_account_info(),
        //             // The user had to sign from the client
        //             authority: ctx.accounts.user.to_account_info(),
        //         },
        //     ),
        //     1,
        // );

        let state_account = &mut ctx.accounts.state_account;

        // let entered_explorer_struct = 
        state_account.hunt_state_vec.push(EnteredExplorer {
            explorer_escrow_account: ctx.accounts.explorer_escrow_account.key(),
            provided_gear_escrow_account: ctx.accounts.provided_gear_escrow_account.key(),
            provided_potion_escrow_account: None, // ctx.accounts.provided_potion_escrow_account.key(),
            explorer_escrow_bump: explorer_token_bump,
            provided_gear_escrow_bump: gear_token_bump,
            provided_potion_escrow_bump: None, // potion_token_bump,
            has_hunted: false,
            provided_potion: false,
            lost_provided_gear: false,
            won_combat_gear: false,
            combat_reward_escrow_account: None,
            combat_reward_escrow_bump: None,
            found_treasure: false,
            used_potion: false,
            treasure_type_mint: None,
            grail_reward_in_ust: None,
        });

        Ok(())
    }
