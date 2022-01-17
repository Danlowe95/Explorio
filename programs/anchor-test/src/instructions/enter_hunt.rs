use anchor_lang::prelude::*;

use crate::state::{HuntState, EnteredExplorer};
use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::explorers::{EXPLORERS};


#[derive(Accounts)]
#[instruction(
    explorer_token_bump: u8, 
    explorer_id: u16,
    provided_potion: bool,
    provided_gear_id: u8,
    provided_potion_id: u8,
)]
pub struct EnterHunt<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    // the associated accounts which holds the user's NFTs for sending here.
    #[account(
        mut,
        associated_token::mint = explorer_mint,
        associated_token::authority = user,
        constraint = anchor_spl::associated_token::get_associated_token_address(&user.key(), &explorer_mint.key()) == user_explorer_account.key()
    )]
    pub user_explorer_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        associated_token::mint = provided_gear_mint,
        associated_token::authority = user,
    )]
    pub user_provided_gear_associated_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        associated_token::mint = provided_potion_mint,
        associated_token::authority = user,
    )]
    pub user_potion_associated_account: Box<Account<'info, TokenAccount>>,

    // Start - The escrow account to create that will hold user's Explorer.
    #[account( 
        init, 
        payer = user, 
        seeds = [b"explorer", explorer_mint.key().as_ref(), user.key().as_ref(), ],
        bump = explorer_token_bump, 
        token::mint = explorer_mint, 
        token::authority = explorer_escrow_account
    )]
    pub explorer_escrow_account: Box<Account<'info, TokenAccount>>,
    // #[account(mut, constraint = provided_gear_pda.mint == provided_gear_mint.key())]
    // pub provided_gear_pda: Box<Account<'info, TokenAccount>>,
    // #[account(constraint = {
    //     Pubkey::from_str(crate::GEAR_1_MINT).unwrap() == provided_gear_mint.key()
    // })]
    #[account(mut)]
    pub provided_gear_mint: Box<Account<'info, Mint>>,
    // #[account(mut, constraint = provided_potion_pda.mint == provided_potion_mint)]
    #[account(mut)]
    pub provided_potion_mint: Box<Account<'info, Mint>>,
    // Start - The 3 mints for deposits
    pub explorer_mint: Box<Account<'info, Mint>>,

    // pub provided_potion_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub state_account: AccountLoader<'info, HuntState>,
    #[account(
        seeds=[b"mint_auth"],
        bump = state_account.load()?.mint_auth_account_bump
    )]
    pub mint_auth: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
    // pub slot_hashes: Sysvar<'info, SlotHashes>,
}


    // Enter a hunt by depositing an explorer+gear NFT
    pub fn handler(
        ctx: Context<EnterHunt>,
        explorer_token_bump: u8,
        explorer_id: u16,
        provided_potion: bool,
        provided_gear_id: u8,
        provided_potion_id: u8,
    ) -> ProgramResult {
        let mut state_account = ctx.accounts.state_account.load_mut()?;

        // TODO when we get real explorer mints, enable this
        // let explorer: &ExplorerInfo = &EXPLORERS[0];
        let explorer = EXPLORERS.iter().find(|x| x.id == explorer_id).unwrap();
        // if &explorer_mint.key().to_string() != explorer.mint {
        //     return Err(crate::ErrorCode::BadMintProvided.into());
        // }

        // Verify provided gear/potion accounts are valid mints for their roles
        let mut gear_triple: Option<&crate::MintInfo> = None;
        // Gear is required.
        for entry in crate::MINTS.iter() {            
            if entry.id == provided_gear_id && 
            entry.mint_type == crate::GEAR_TYPE && 
            entry.mint == &ctx.accounts.provided_gear_mint.key().to_string() {
                gear_triple = Some(entry);
                break;
            }
        }
        
        match gear_triple {
            None => return Err(crate::ErrorCode::BadMintProvided.into()),
            _ => ()
        }

        // Potion is optional.
        let mut potion_triple: Option<&crate::MintInfo> = None;
        if provided_potion_id == 0 {
            if provided_potion {
                return Err(crate::ErrorCode::BadMintProvided.into());
            }
            potion_triple = Some(&crate::MINTS[0]);
        } else {
            for entry in crate::MINTS.iter() {
                if entry.id == provided_potion_id &&
                 entry.mint_type == crate::POTION_TYPE && 
                 entry.mint == &ctx.accounts.provided_potion_mint.key().to_string() {
                    potion_triple = Some(entry);
                    break;
                }
            }
        }
        match potion_triple {
            None => return Err(crate::ErrorCode::BadMintProvided.into()),
            _ => ()
        }

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
        )?;

        // Burn the user's gear token.
        anchor_spl::token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Burn {
                    mint: ctx.accounts.provided_gear_mint.to_account_info(),
                    to: ctx.accounts.user_provided_gear_associated_account.to_account_info(),
                    // The user had to sign from the client
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            1,
        )?;

        if provided_potion {
            // Burn the user's potion token, if provided.
            anchor_spl::token::burn(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    anchor_spl::token::Burn {
                        mint: ctx.accounts.provided_potion_mint.to_account_info(),
                        to: ctx.accounts.user_potion_associated_account.to_account_info(),
                        // The user had to sign from the client
                        authority: ctx.accounts.user.to_account_info(),
                    },
                ),
                1,
            )?;
        }


        if state_account.hunt_state_arr.iter().all(|x| x.is_empty == crate::FALSE) {
            return Err(crate::ErrorCode::StateArrFull.into());
        }

        /* 
         * Insertion: What would be best, vs what we actually do
         * 
         * TL;DR: We need Chainlink VRF, anything else is subpar.
         * 
         * Problem: If users know where in the array their explorer will be inserted, they can theoretically game it so 
         * they can fight an opponent of their choosing. This gives advantage to a user who monitors the state_account and 
         * only sends the enter_hunt instruction when they see a favorable slot (i.e. one next to a weak opponent).
         * 
         * By adding randomness to _where_ a user's explorer is inserted, and not allowing the user to modify until the hunt
         * takes place, we can make sure opponent matchups are fair.
         * 
         * If I could fetch a random number between 0-4999:
         * I could fetch an open index, fetch a random index, move whatever is at the random index to the open index, and 
         * insert the new explorer at the random index.
         * 
         * This would create a system in which the user can't know where in the array they will get inserted - and 
         * prevent users from being able to "Game" the system to be matched against a specific opponent (e.g. a weak opponent)
         * 
         * However, I have no access to true randomization. If I can leverage Chainlink oracles, I could potentially query for 
         * a random int 0-4999 and use that as the random index.
         * 
         * Since I don't have that ability, I am using 'clock' to derive an int in the range of 0-4999, labeling this the swap_index.
         * The swap_index is then used as described above (move whatever is in swap_index to open_index, insert explorer at swap_index).
         * 
         * This does not really work well and is still gameable, but it at least adds some randomization to the array order.
         * 
         * This may be game-able, but should theoretically be harder since every insertion causes 
         * another section of the array to be moved, it should make it hard for any user to pre-determine their combatant with
         * any level of certainty.
         * 
         * This could theoretically be improved upon by rearranging even _more_ of the array on every enter_hunt.
         * e.g. if we re-arrange 100 slots every time in a psuedo-random way, it could create too many variables to control.
         * 
         * */

        let open_index = state_account.hunt_state_arr.iter().position(|x| x.is_empty == crate::TRUE).unwrap();

        state_account.hunt_state_arr[open_index] = EnteredExplorer {
            is_empty: crate::FALSE,
            explorer_escrow_account: ctx.accounts.explorer_escrow_account.key(),
            explorer_id: explorer_id, // todo id from explorer struct, not passed in
            provided_gear_mint_id: gear_triple.unwrap().id,
            provided_potion_mint_id: potion_triple.unwrap().id,
            explorer_escrow_bump: explorer_token_bump,
            has_hunted: crate::FALSE,
            provided_potion: if provided_potion { crate::TRUE } else { crate::FALSE },
            provided_gear_kept: crate::FALSE,
            won_combat: crate::FALSE,
            won_combat_gear: crate::FALSE,
            combat_reward_mint_id: 0,
          
            found_treasure: crate::FALSE,
            used_potion: crate::FALSE,
            treasure_mint_id: 0,
            unused_value: 0,

            // fake_field: crate::FALSE
        };

        Ok(())
    }
