use anchor_lang::prelude::*;

use crate::state::{HuntState, EnteredExplorer};
use anchor_spl::token::{Mint, Token, TokenAccount};
use anchor_spl::associated_token::{AssociatedToken};

#[derive(Accounts)]
#[instruction(
     explorer_escrow_bump: u8, 
)]
pub struct ClaimHunt<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    // Start - the associated accounts of the user for all potential claimables.
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
        associated_token::mint = combat_reward_mint,
        associated_token::authority = user
    )]
    pub user_associated_combat_reward_account: Box<Account<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = provided_potion_mint,
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
    // #[account(
    //     init_if_needed,
    //     payer = user,
    //     associated_token::mint = ust_mint,
    //     associated_token::authority = user
    // )]
    // pub user_associated_ust_account: Box<Account<'info, TokenAccount>>,

    #[account( 
        mut,
        seeds = [b"explorer", explorer_mint.key().as_ref(), user.key().as_ref(), ],
        bump = explorer_escrow_bump, 
    )]
    pub explorer_escrow_account: Box<Account<'info, TokenAccount>>,

    #[account(
        seeds=[b"mint_auth"],
        bump = state_account.load()?.mint_auth_account_bump
    )]
    pub mint_auth_pda: AccountInfo<'info>,

    // Start - All mints for potential claimables
    pub explorer_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub provided_gear_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub provided_potion_mint: Box<Account<'info, Mint>>,
    // To be grabbed by the frontend from state and passed through
    #[account(mut)]
    pub combat_reward_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub treasure_mint: Box<Account<'info, Mint>>,
    // pub ust_mint: Box<Account<'info, Mint>>,


    #[account(mut)]
    pub state_account: AccountLoader<'info, HuntState>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,

}
    // Allow user to reclaim explorer NFT
    pub fn handler(
        ctx: Context<ClaimHunt>,
        explorer_escrow_bump: u8,
    ) -> ProgramResult {
        let mut state_account = ctx.accounts.state_account.load_mut()?;
        // TODO this ptr referencing stuff feels really sus.
        // let hunt_state_arr_ptr = std::ptr::addr_of!(state_account.hunt_state_arr);
        // let mut hunt_state_arr = unsafe { hunt_state_arr_ptr.read_unaligned() };

        let explorer_escrow_account = &mut ctx.accounts.explorer_escrow_account;
        // position returns the index
        // TODO improve this search to be secure
        let relevent_arr_index = state_account.hunt_state_arr.iter().position(|x| {
            return !x.is_empty && x.explorer_escrow_account == explorer_escrow_account.key()
        }).unwrap();

        let entered_explorer_data = &state_account.hunt_state_arr[relevent_arr_index];

        if entered_explorer_data.has_hunted == false {
            return Err(crate::ErrorCode::HasNotHunted.into());
        }
        if entered_explorer_data.explorer_escrow_bump != explorer_escrow_bump {
            return Err(crate::ErrorCode::BadBumpProvided.into());
        }

        // let mut provided_gear_triple: Option<&crate::MintInfo> = None;
        let mut provided_gear_triple: Option<&crate::MintInfo> = Some(&crate::GEAR_MINTS[0]); // TODO TEMP

        // Confirm that the provided_gear_mint is a valid gear mint, and that it matches the gear_mint_id in state
        // for entry in crate::GEAR_MINTS.iter() {
        //     if &entry.mint == &ctx.accounts.provided_gear_mint.key().to_string().as_str() &&
        //         &entry.id == &entered_explorer_data.provided_gear_mint_id {
        //         provided_gear_triple = Some(entry);
        //         break;
        //     }
        // }
        // match provided_gear_triple {
        //     None => return Err(crate::ErrorCode::BadMintProvided.into()),
        //     _ => ()
        // }

        let mut provided_potion_triple: Option<&crate::MintInfo> = None;
        // Confirm that the provided_potion_mint is a valid potion mint, and that it matches the provided_potion_mint_id in state
        if entered_explorer_data.provided_potion {
            for entry in crate::POTION_MINTS.iter() {
                if &entry.mint == &ctx.accounts.provided_potion_mint.key().to_string().as_str() &&
                    &entry.id == &entered_explorer_data.provided_potion_mint_id {
                    provided_potion_triple = Some(entry);
                    break;
                }
            }
            match provided_potion_triple {
                None => return Err(crate::ErrorCode::BadMintProvided.into()),
                _ => ()
            }
        }


        // let mut combat_reward_triple: Option<&crate::MintInfo> = None;
        let mut combat_reward_triple: Option<&crate::MintInfo> = Some(&crate::GEAR_MINTS[0]); // TODO TEMP

        // Confirm that the combat_reward_mint is a valid gear mint, and that it matches the state
        // if entered_explorer_data.won_combat_gear {
        //     for entry in crate::GEAR_MINTS.iter() {
        //         if &entry.mint == &ctx.accounts.combat_reward_mint.key().to_string().as_str() &&
        //             &entry.id == &entered_explorer_data.combat_reward_mint_id {
        //             combat_reward_triple = Some(entry);
        //             break;
        //         }
        //     }
        //     match combat_reward_triple {
        //         None => return Err(crate::ErrorCode::BadMintProvided.into()),
        //         _ => ()
        //     }
        // }
        
        let mut treasure_reward_triple: Option<&crate::MintInfo> = None;
        // Confirm that the treasure_mint_id is a valid gear mint, and that it matches the state
        if entered_explorer_data.found_treasure {
            for entry in crate::GEAR_MINTS.iter() {
                if &entry.mint == &ctx.accounts.treasure_mint.key().to_string().as_str() &&
                    &entry.id == &entered_explorer_data.treasure_mint_id {
                    treasure_reward_triple = Some(entry);
                    break;
                }
            }
            match treasure_reward_triple {
                None => return Err(crate::ErrorCode::BadMintProvided.into()),
                _ => ()
            }
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
                    b"explorer",
                    ctx.accounts.explorer_mint.key().as_ref(),
                    ctx.accounts.user.key().as_ref(), 
                    &[entered_explorer_data.explorer_escrow_bump],
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
                b"explorer",
                ctx.accounts.explorer_mint.key().as_ref(),
                ctx.accounts.user.key().as_ref(), 
                &[entered_explorer_data.explorer_escrow_bump],
            ]],
        ))?;
        if entered_explorer_data.provided_potion {
            if entered_explorer_data.used_potion {
                // No outcome
            } else {
                // Mint the user's potion back to their assoc. account.
                anchor_spl::token::mint_to(
                    CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        anchor_spl::token::MintTo {
                            mint: ctx.accounts.provided_potion_mint.to_account_info(),
                            to: ctx
                                .accounts
                                .user_associated_potion_account
                                .to_account_info(),
                            authority: ctx
                                .accounts
                                .mint_auth_pda
                                .to_account_info(),
                        },
                        &[&[
                            crate::MINT_AUTH.seed,
                            &[state_account.mint_auth_account_bump],
                        ]],
                    ),
                    1,
                )?;
            }
        }
        if entered_explorer_data.provided_gear_burned {
            // Burn provided gear.

            // TODO if provided_gear is a common, add to state for redistribution.
            // Otherwise, destroy and reclaim rent.

        } else if entered_explorer_data.provided_gear_kept {
            // Transfer the user's original gear back to their associated account
            anchor_spl::token::mint_to(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    anchor_spl::token::MintTo {
                        mint: ctx
                            .accounts
                            .provided_gear_mint
                            .to_account_info(),
                        to: ctx
                            .accounts
                            .user_associated_provided_gear_account
                            .to_account_info(),
                        authority: ctx
                            .accounts
                            .mint_auth_pda
                            .to_account_info(),
                    },
                    &[&[
                        crate::MINT_AUTH.seed,
                        &[state_account.mint_auth_account_bump],
                    ]],
                ),
                1,
            )?;
        }
        if entered_explorer_data.won_combat_gear {
            // Transfer the user's won gear to their new associated account
            anchor_spl::token::mint_to(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    anchor_spl::token::MintTo {
                        mint: ctx
                            .accounts
                            .combat_reward_mint
                            .to_account_info(),
                        to: ctx
                            .accounts
                            .user_associated_combat_reward_account
                            .to_account_info(),
                        authority: ctx
                            .accounts
                            .mint_auth_pda
                            .to_account_info(),
                    },
                    &[&[
                        crate::MINT_AUTH.seed,
                        &[state_account.mint_auth_account_bump],
                    ]],
                ),
                1,
            )?;
        }
        if entered_explorer_data.found_treasure {
            // TODO If they found grail it has to be unique mint code here
                // Also do special logic if grail using entered_explorer_data.grail_reward_in_ust

            // If any other, transfer from pda
            anchor_spl::token::mint_to(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    anchor_spl::token::MintTo {
                        mint: ctx
                            .accounts
                            .treasure_mint
                            .to_account_info(),
                        to: ctx
                            .accounts
                            .user_associated_treasure_account
                            .to_account_info(),
                        authority: ctx
                            .accounts
                            .mint_auth_pda
                            .to_account_info(),
                    },
                    &[&[
                        crate::MINT_AUTH.seed,
                        &[state_account.mint_auth_account_bump],
                    ]],
                ),
                1,
            )?;

        }
        // Finally, update state account to remove the row.
        // update: well, not really remove, because anchor decoding doesn't work with options.
        // set it to a mostly-null struct with `is_empty: true`. Hopefully this can be improved in the future.
        // https://github.com/project-serum/anchor/issues/1241
        state_account.hunt_state_arr[relevent_arr_index] = EnteredExplorer {
            is_empty: true,
            // this feels sketchy but I can't think of a way it can be abused currently.
            // need to provide _some_ publickey. could make it the program's key. Or a burn key.
            explorer_escrow_account: ctx.accounts.mint_auth_pda.key(),
            provided_gear_mint_id: 0,
            provided_potion_mint_id: 0,
            explorer_escrow_bump: 0,
            has_hunted: false,
            provided_potion: false,
            provided_gear_burned: false,
            provided_gear_kept: false,
            won_combat_gear: false,
            combat_reward_mint_id: 0,
            found_treasure: false,
            used_potion: false,
            treasure_mint_id: 0,
            // grail_reward_in_ust: 0,
    
        };

        // todo confirm we're closing all necessary accounts single escrow account.
        
        Ok(())
    }
