use anchor_lang::prelude::*;

use crate::state::{HuntState, EnteredExplorer};
use anchor_spl::token::{Mint, Token, TokenAccount};



#[derive(Accounts)]
#[instruction(
    explorer_token_bump: u8, 
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
    // #[account(mut)]
    // pub user_potion_associated_account: Box<Account<'info, TokenAccount>>,

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
    // pub provided_potion_pda: Box<Account<'info, TokenAccount>>,
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
}


    // Enter a hunt by depositing an explorer+gear NFT
    pub fn handler(
        ctx: Context<EnterHunt>,
        explorer_token_bump: u8,
    ) -> ProgramResult {
        let mut state_account = ctx.accounts.state_account.load_mut()?;

        // Verify provided gear/potion accounts are valid mints for their roles
        msg!("{}", state_account.mint_auth_account_bump);

        let mut gear_triple: Option<&crate::MintInfo> = Some(&crate::GEAR_MINTS[0]); // TODO TEMP
        // for entry in crate::GEAR_MINTS.iter() {
        //     if &entry.mint == &ctx.accounts.provided_gear_mint.key().to_string().as_str() {
        //         gear_triple = Some(entry);
        //         break;
        //     }
        // }
        
        match gear_triple {
            None => return Err(crate::ErrorCode::BadMintProvided.into()),
            _ => ()
        }
        // let badPotionMint = true;
        // for &mint in crate::POTION_MINTS {
        //     if mint[0] == &ctx.accounts.provided_potion_mint.key().to_string().as_str() {
        //         badPotionMint = false;
        //         break;
        //     }
        // }
        // if badPotionMint {
        //     return Err(crate::ErrorCode::BadMintProvided.into());
        // }

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

        msg!("{}", state_account.mint_auth_account_bump);
        // Transfer the user's gear token to the escrow account.
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
        // anchor_spl::token::burn(
        //     CpiContext::new_with_signer(
        //         ctx.accounts.token_program.to_account_info(),
        //         anchor_spl::token::Burn {
        //             mint: ctx.accounts.provided_gear_mint.to_account_info(),
        //             to: ctx.accounts.user_provided_gear_associated_account.to_account_info(),
        //             // The user had to sign from the client
        //             authority: ctx.accounts.user.to_account_info(),
        //         },
        //         &[&[
        //             b"mint_auth",
        //             &[state_account.mint_auth_account_bump],
        //         ]],
        //     ),
        //     1,
        // )?;

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
        // )?;

        if state_account.hunt_state_arr.iter().all(|x| !x.is_empty) {
            return Err(crate::ErrorCode::StateArrFull.into());
        }
        let open_index = state_account.hunt_state_arr.iter().position(|x| x.is_empty).unwrap();
        // Set all necessary data in the hunt state 
        state_account.hunt_state_arr[open_index] = EnteredExplorer {
            is_empty: false,
            explorer_escrow_account: ctx.accounts.explorer_escrow_account.key(),
            provided_gear_mint_id: gear_triple.unwrap().id,
            provided_potion_mint_id: 0,
            explorer_escrow_bump: explorer_token_bump,
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

        // msg!("{}", state_account.hunt_state_arr[open_index].provided_gear_mint_id);
        Ok(())
    }
