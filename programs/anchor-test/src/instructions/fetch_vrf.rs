use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_pack::IsInitialized;
use crate::state::{HuntState, EnteredExplorer, VrfState, PerCombatRandomization};
use anchor_lang::solana_program::hash::*;
use std::convert::TryInto;

#[derive(Accounts)]
pub struct FetchVrf<'info> {

    #[account(mut)]
    pub state_account: AccountLoader<'info, HuntState>,
    #[account(mut)]
    pub vrf_account: AccountLoader<'info, VrfState>,

    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn handler(
    ctx: Context<FetchVrf>, 
) -> ProgramResult {
    let state_account = &mut ctx.accounts.state_account.load_mut()?;
    let vrf_account = &mut ctx.accounts.vrf_account.load_mut()?;

    if !state_account.is_initialized {
        return Err(crate::ErrorCode::AlreadyInitialized.into());
    }
    if !vrf_account.is_initialized {
        return Err(crate::ErrorCode::AlreadyInitialized.into());
    }
    if vrf_account.is_usable {
        return Err(crate::ErrorCode::RandomnessAlreadyGenerated.into());
    }
    vrf_account.is_usable = true;

    let pseudo_random_u64: u64 = u64::try_from_slice(&hash(&(ctx.accounts.clock.unix_timestamp as i128 + ctx.accounts.clock.slot as i128).to_be_bytes()).to_bytes()[0..8]).unwrap();

    for (ind, entry) in vrf_account.vrf_arr.iter_mut().enumerate() {
        // TODO we max out compute if we generate results for more than 1000.
        // Leaving this for now because in dev, under 1000 is fine, and this will change when we really implement a VRF anyway.
        if ind == 1000 {
            break;
        }
        let random_seed: u32 = u32::try_from_slice(&hash(&(pseudo_random_u64 + ind as u64).to_be_bytes()).to_bytes()[0..4]).unwrap();

        // .checked_add( u64::try_from_slice(&combatant.explorer_escrow_account.key().to_bytes()[0..8]).unwrap())
        // .unwrap();
        *entry = PerCombatRandomization {
            winner_seed: (random_seed % 100) as u8,
            winner_gets_combat_reward_seed: (random_seed % 2) as u8,
            treasure_found_seed: (random_seed % 5_000_000) as u32,
        };
    }

    // vrf_account.vrf_arr = [ PerCombatRandomization {winner_seed: 0, winner_gets_combat_reward_seed: 0, treasure_found_seed: 0} ; 2500];

    Ok(())
}
