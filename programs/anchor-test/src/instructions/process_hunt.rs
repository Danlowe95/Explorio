use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount};
use crate::state::{HuntState};

#[derive(Accounts)]
pub struct ProcessHunt<'info> {
    
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub state_account: AccountLoader<'info, HuntState>,
    // for reading total ust if grail is found
    // TODO will need to store in state UST value outstanding while waiting for user to claim
    pub program_ust_account: Account<'info, TokenAccount>,

    // Eventually
    // #[account(
    //     mut
    // )]
    // pub history_account: Account<'info, HuntHistory>,

    // pub ust_mint: Account<'info, Mint>,

    // pub token_program: Program<'info, Token>,
    // pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    // pub rent: Sysvar<'info, Rent>,

}


// Run the hunt - only owner can run it for now
pub fn handler(ctx: Context<ProcessHunt>) -> ProgramResult {
    // Walk the state vec and do some basic stub processing
    let state_account = &mut ctx.accounts.state_account.load_mut()?;
    let hunt_state_arr_ptr = std::ptr::addr_of!(state_account.hunt_state_arr);
    let mut hunt_state_arr = unsafe { hunt_state_arr_ptr.read_unaligned() };

    // position returns the index
    // TODO improve this search to be secure
    for entry in &mut hunt_state_arr.iter_mut() {
        // Access the value inside the Option
        for mut_entry in entry.as_mut() {
            mut_entry.has_hunted = true;
            mut_entry.provided_gear_kept = true;
            mut_entry.won_combat_gear = false;
            mut_entry.found_treasure = false;
        }
    }
    // potentially store timestamp in state so this only runs once per 3 hours

    Ok(())

}