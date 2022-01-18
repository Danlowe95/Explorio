use anchor_lang::prelude::*;
use crate::state::{HuntState, VrfState, SwitchboardVrfAccount};

#[derive(Accounts)]
pub struct ShuffleEntries<'info> {

    #[account(mut)]
    pub state_account: AccountLoader<'info, HuntState>,
    #[account(mut)]
    pub vrf_account: AccountLoader<'info, VrfState>,

    #[account(
        seeds = [b"vrf_num"],
        bump = state_account.load()?.switchboard_account_bump
    )]
    pub switchboard_vrf_account: Account<'info, SwitchboardVrfAccount>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<ShuffleEntries>, 
) -> ProgramResult {
    let mut state_account = &mut ctx.accounts.state_account.load_mut()?;
    let vrf_account = &mut ctx.accounts.vrf_account.load_mut()?;

    if state_account.is_initialized == crate::FALSE {
        return Err(crate::ErrorCode::ProgramNotInitialized.into());
    }
    if vrf_account.is_initialized == crate::FALSE {
        return Err(crate::ErrorCode::ProgramNotInitialized.into());
    }
    if vrf_account.is_usable == crate::TRUE {
        return Err(crate::ErrorCode::RandomnessAlreadyGenerated.into());
    }
    if vrf_account.request_waiting == crate::FALSE {
        return Err(crate::ErrorCode::RandomnessNotYetRequested.into());
    }
    if vrf_account.entries_shuffled == crate::TRUE {
        return Err(crate::ErrorCode::EntriesAlreadyShuffled.into());
    }
    
    vrf_account.request_waiting = crate::FALSE;
    vrf_account.entries_shuffled = crate::TRUE;

    let vrf_rand: u64 = ctx.accounts.switchboard_vrf_account.random_number;

    // Get an iter of all entered explorers.
    let mut all_entered = state_account.hunt_state_arr.iter_mut().filter(|x| x.is_empty == crate::FALSE && x.has_hunted == crate::FALSE);
    // let total = state_account.hunt_state_arr.iter_mut().filter(|x| x.is_empty == crate::FALSE && x.has_hunted == crate::FALSE).count();
    // Shuffle the entries utilizing the random number.
    // TODO
    while let Some(entry) = all_entered.next() {
    }


    Ok(())
}
