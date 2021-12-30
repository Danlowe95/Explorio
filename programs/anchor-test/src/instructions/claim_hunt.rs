use anchor_lang::prelude::*;

use crate::state::{HuntState};
use anchor_spl::token::{Mint, Token, TokenAccount};
use anchor_spl::associated_token::{AssociatedToken};

#[error]
pub enum ErrorCode {
    #[msg("Claim is not possible yet as the Explorer has not hunted.")]
    HasNotHunted,
}


// todo bump wasn't intended to be passed in - pulled from huntState
// that requires deserialization and lookup on frontend
// would need to pass in bumps for ALL escrow accounts unless better way found.
#[derive(Accounts)]
#[instruction(
    explorer_token_bump: u8, 
    gear_token_bump: u8, 
    potion_token_bump: u8,
    combat_reward_gear_token_bump: u8,
    // state_account_bump: u8,
)]
pub struct ClaimHunt<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    // Start - the associated accounts of the user for all potential claimables.
    // TODO may need init_if_needed and payer on all of these.
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = explorer_mint,
        associated_token::authority = user
    )]
    pub user_associated_explorer_account: Box<Account<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = provided_gear_mint,
        associated_token::authority = user
    )]
    pub user_associated_provided_gear_account: Box<Account<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = combat_reward_gear_mint,
        associated_token::authority = user
    )]
    pub user_associated_combat_reward_account: Box<Account<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = potion_mint,
        associated_token::authority = user
    )]
    pub user_associated_potion_account: Box<Account<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = treasure_mint,
        associated_token::authority = user
    )]
    pub user_associated_treasure_account: Box<Account<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = ust_mint,
        associated_token::authority = user
    )]
    pub user_associated_ust_account: Box<Account<'info, TokenAccount>>,

    // Start - All escrow accounts that are currently holding claimables to transfer.
    #[account( 
        mut,
        seeds = [explorer_mint.key().as_ref(), b"explorer"],
        bump = explorer_token_bump, 
    )]
    pub explorer_escrow_account: Box<Account<'info, TokenAccount>>,
    #[account( 
        mut,
        seeds = [provided_gear_mint.key().as_ref(), b"gear"],
        bump = gear_token_bump, 
    )]
    pub provided_gear_escrow_account: Box<Account<'info, TokenAccount>>,
    #[account( 
        mut,
        seeds = [potion_mint.key().as_ref(), b"potion"],
        bump = potion_token_bump, 
    )]
    pub potion_escrow_account: Box<Account<'info, TokenAccount>>,
    #[account( 
        mut,
        seeds = [combat_reward_gear_mint.key().as_ref(), b"gear"],
        bump = combat_reward_gear_token_bump, 
    )]
    pub combat_reward_escrow_account: Box<Account<'info, TokenAccount>>,

    // Start - All mints for potential claimables
    pub explorer_mint: Box<Account<'info, Mint>>,
    pub provided_gear_mint: Box<Account<'info, Mint>>,
    pub potion_mint: Box<Account<'info, Mint>>,
    // To be grabbed by the frontend from state and passed through
    pub combat_reward_gear_mint: Box<Account<'info, Mint>>,
    pub treasure_mint: Box<Account<'info, Mint>>,
    pub ust_mint: Box<Account<'info, Mint>>,


    #[account(mut)]
    pub state_account: Box<Account<'info, HuntState>>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,

}
    // Allow user to reclaim explorer NFT
    pub fn handler(
        ctx: Context<ClaimHunt>,     
        explorer_token_bump: u8, 
        gear_token_bump: u8, 
        potion_token_bump: u8,
        combat_reward_gear_token_bump: u8,
        // state_account_bump: u8
    ) -> ProgramResult {
        let state_account = &mut ctx.accounts.state_account;
        let state_vec = &mut state_account.hunt_state_vec;
        let explorer_escrow_account = &mut ctx.accounts.explorer_escrow_account;
        // position returns the index
        // TODO improve this search to be secure
        let relevant_vec_entry_index = state_vec.iter().position(|x| x.explorer_escrow_account == explorer_escrow_account.key()).unwrap();
        let entered_explorer_data = &state_vec[relevant_vec_entry_index];
        
        if entered_explorer_data.has_hunted == false {
            return Err(ErrorCode::HasNotHunted.into());
        }
        // Transfer the user's explorer token back to their assoc. account.
        anchor_spl::token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx
                        .accounts
                        .explorer_escrow_account
                        .to_account_info(),
                    to: ctx
                        .accounts
                        .user_associated_explorer_account
                        .to_account_info(),
                    authority: ctx
                        .accounts
                        .explorer_escrow_account
                        .to_account_info(),
                },
                &[&[
                    ctx.accounts.explorer_mint.key().as_ref(),
                    b"explorer",
                    &[explorer_token_bump],
                ]],
            ),
            1,
        )?;
        // Close the escrow account
        anchor_spl::token::close_account(CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::CloseAccount {
                account: ctx
                    .accounts
                    .explorer_escrow_account
                    .to_account_info(),
                destination: ctx.accounts.user.to_account_info(),
                authority: ctx
                    .accounts
                    .explorer_escrow_account
                    .to_account_info(),
            },
            &[&[
                ctx.accounts.explorer_mint.key().as_ref(),
                b"explorer",
                &[explorer_token_bump],
            ]],
        ))?;
        if entered_explorer_data.provided_potion {
            if entered_explorer_data.used_potion {
                // Burn and close escrow
            } else {
                // Transfer the user's potion back to their assoc. account.
                anchor_spl::token::transfer(
                    CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        anchor_spl::token::Transfer {
                            from: ctx
                                .accounts
                                .potion_escrow_account
                                .to_account_info(),
                            to: ctx
                                .accounts
                                .user_associated_potion_account
                                .to_account_info(),
                            authority: ctx
                                .accounts
                                .potion_escrow_account
                                .to_account_info(),
                        },
                        &[&[
                            ctx.accounts.potion_mint.key().as_ref(),
                            b"potion",
                            &[potion_token_bump],
                        ]],
                    ),
                    1,
                )?;
                // Close the escrow account
                anchor_spl::token::close_account(CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    anchor_spl::token::CloseAccount {
                        account: ctx
                            .accounts
                            .potion_escrow_account
                            .to_account_info(),
                        destination: ctx.accounts.user.to_account_info(),
                        authority: ctx
                            .accounts
                            .potion_escrow_account
                            .to_account_info(),
                    },
                    &[&[
                        ctx.accounts.potion_mint.key().as_ref(),
                        b"potion",
                        &[potion_token_bump],
                    ]],
                ))?;
            }
        }
        if entered_explorer_data.provided_gear_burned {
            // Burn provided gear.

            // TODO if provided_gear is a common, add to state for redistribution.
            // Otherwise, destroy and reclaim rent.

        } else if entered_explorer_data.provided_gear_kept {
            // Transfer the user's original gear back to their associated account
            anchor_spl::token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    anchor_spl::token::Transfer {
                        from: ctx
                            .accounts
                            .provided_gear_escrow_account
                            .to_account_info(),
                        to: ctx
                            .accounts
                            .user_associated_provided_gear_account
                            .to_account_info(),
                        authority: ctx
                            .accounts
                            .provided_gear_escrow_account
                            .to_account_info(),
                    },
                    &[&[
                        ctx.accounts.provided_gear_mint.key().as_ref(),
                        b"gear",
                        &[gear_token_bump],
                    ]],
                ),
                1,
            )?;
            // Close the escrow account
            anchor_spl::token::close_account(CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::CloseAccount {
                    account: ctx
                        .accounts
                        .provided_gear_escrow_account
                        .to_account_info(),
                    destination: ctx.accounts.user.to_account_info(),
                    authority: ctx
                        .accounts
                        .provided_gear_escrow_account
                        .to_account_info(),
                },
                &[&[
                    ctx.accounts.provided_gear_mint.key().as_ref(),
                    b"gear",
                    &[gear_token_bump],
                ]],
            ))?;
        }
        if entered_explorer_data.won_combat_gear {
            // Transfer the user's won gear to their new associated account
            anchor_spl::token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    anchor_spl::token::Transfer {
                        from: ctx
                            .accounts
                            .combat_reward_escrow_account
                            .to_account_info(),
                        to: ctx
                            .accounts
                            .user_associated_combat_reward_account
                            .to_account_info(),
                        authority: ctx
                            .accounts
                            .combat_reward_escrow_account
                            .to_account_info(),
                    },
                    &[&[
                        ctx.accounts.combat_reward_gear_mint.key().as_ref(),
                        b"gear",
                        &[combat_reward_gear_token_bump],
                    ]],
                ),
                1,
            )?;
            // Close the escrow account
            anchor_spl::token::close_account(CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::CloseAccount {
                    account: ctx
                        .accounts
                        .combat_reward_escrow_account
                        .to_account_info(),
                    // TODO should this be sent to the claiming user or to the program
                    destination: ctx.accounts.user.to_account_info(),
                    authority: ctx
                        .accounts
                        .combat_reward_escrow_account
                        .to_account_info(),
                },
                &[&[
                    ctx.accounts.combat_reward_gear_mint.key().as_ref(),
                    b"gear",
                    &[combat_reward_gear_token_bump],
                ]],
            ))?;
        }
        if entered_explorer_data.found_treasure {
            // Mint treasure of type entered_explorer_data.treasure_type_mint
            

            // Do special logic if grail using entered_explorer_data.grail_reward_in_ust
        }
        // Finally, update state account to remove the row.
        state_vec.remove(relevant_vec_entry_index);

        // todo make sure we close every single escrow account.
        
        Ok(())
    }
