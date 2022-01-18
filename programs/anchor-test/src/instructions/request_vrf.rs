use anchor_lang::prelude::*;
use crate::state::{HuntState, VrfState, SwitchboardVrfAccount};
use anchor_lang::solana_program::hash::*;

#[derive(Accounts)]
pub struct RequestVrf<'info> {

    #[account(mut)]
    pub state_account: AccountLoader<'info, HuntState>,
    #[account(mut)]
    pub vrf_account: AccountLoader<'info, VrfState>,
    #[account(
        mut,
        seeds = [b"vrf_num"],
        bump = state_account.load()?.switchboard_account_bump
    )]
    pub switchboard_vrf_account: Account<'info, SwitchboardVrfAccount>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn handler(
    ctx: Context<RequestVrf>, 
) -> ProgramResult {
    let state_account = &mut ctx.accounts.state_account.load_mut()?;
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
    if vrf_account.request_waiting == crate::TRUE {
        return Err(crate::ErrorCode::RandomnessAlreadyRequested.into());
    }
    if vrf_account.entries_shuffled == crate::TRUE {
        return Err(crate::ErrorCode::RandomnessInUse.into());
    }
    vrf_account.request_waiting = crate::TRUE;

    // Fake the generation of the random number here.
    // In the future this will be removed, and fetch_vrf will get the generated truly random number and store it instead.
    ctx.accounts.switchboard_vrf_account.random_number = u64::try_from_slice(&hash(&(ctx.accounts.clock.unix_timestamp as i128 + ctx.accounts.clock.slot as i128).to_be_bytes()).to_bytes()[0..8]).unwrap();

    Ok(())
}
