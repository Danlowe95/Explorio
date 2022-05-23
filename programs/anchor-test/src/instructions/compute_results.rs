use anchor_lang::prelude::*;
use crate::state::{HuntState, VrfState, PerCombatRandomization, SwitchboardVrfAccount};
use anchor_lang::solana_program::hash::*;

#[derive(Accounts)]
pub struct ComputeResults<'info> {

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
    ctx: Context<ComputeResults>, 
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
        return Err(crate::ErrorCode::VrfRequestNotYetUsed.into());
    }
    if vrf_account.entries_shuffled == crate::FALSE {
        return Err(crate::ErrorCode::StateArrNotShuffled.into());
    }
    vrf_account.is_usable = crate::TRUE;
    // technically still true, but this can be toggled off now that is_usable is set.
    vrf_account.entries_shuffled = crate::FALSE;

    let vrf_rand: u64 = ctx.accounts.switchboard_vrf_account.random_number;

    for (ind, entry) in vrf_account.vrf_arr.iter_mut().enumerate() {
        // TODO we max out compute if we generate results for more than 1000.
        // Leaving this for now because in dev, under 1000 is fine, and this will change when we really implement a VRF anyway.
        if ind == 750 {
            break;
        }
        let random_seed: u32 = u32::try_from_slice(&hash(&(vrf_rand + ind as u64).to_be_bytes()).to_bytes()[0..4]).unwrap();

        *entry = PerCombatRandomization {
            treasure_found_seed: (random_seed % 5_000_000) as u32,
            winner_seed: (random_seed % 100) as u8,
            winner_gets_combat_reward_seed: (random_seed % 2) as u8,
            // super poorly randomed number, but don't have the compute space to fake a second full hash.
            // once we implement bytemuch+mod on a VRF, this can have it's own unique derivation.
            resilience_seed: ((vrf_rand + (ind as u64)) % 100) as u8,
            swiftness_seed: ((vrf_rand + (ind as u64)) % 2) as u8, // (vrf_rand + (ind as u64) % 2) as u8,
        };
    }


    Ok(())
}
