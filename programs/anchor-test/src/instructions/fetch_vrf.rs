use anchor_lang::prelude::*;
use crate::state::{HuntState, VrfState, PerCombatRandomization};
use anchor_lang::solana_program::hash::*;

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

    if state_account.is_initialized == crate::FALSE {
        return Err(crate::ErrorCode::ProgramNotInitialized.into());
    }
    if vrf_account.is_initialized == (crate::FALSE) {
        return Err(crate::ErrorCode::ProgramNotInitialized.into());
    }
    if vrf_account.is_usable == (crate::TRUE) {
        return Err(crate::ErrorCode::RandomnessAlreadyGenerated.into());
    }
    vrf_account.is_usable = crate::TRUE;

    let pseudo_random_u64: u64 = u64::try_from_slice(&hash(&(ctx.accounts.clock.unix_timestamp as i128 + ctx.accounts.clock.slot as i128).to_be_bytes()).to_bytes()[0..8]).unwrap();

    for (ind, entry) in vrf_account.vrf_arr.iter_mut().enumerate() {
        // TODO we max out compute if we generate results for more than 1000.
        // Leaving this for now because in dev, under 1000 is fine, and this will change when we really implement a VRF anyway.
        if ind == 750 {
            break;
        }
        let random_seed: u32 = u32::try_from_slice(&hash(&(pseudo_random_u64 + ind as u64).to_be_bytes()).to_bytes()[0..4]).unwrap();

        // .checked_add( u64::try_from_slice(&combatant.explorer_escrow_account.key().to_bytes()[0..8]).unwrap())
        // .unwrap();
        // msg!("ind: {}, 1: {}, 2: {}, 3: {}, 4: {}", ind, random_seed, random_seed % 100, random_seed % 2, random_seed % 5_000_000);
        *entry = PerCombatRandomization {
            treasure_found_seed: (random_seed % 5_000_000) as u32,
            winner_seed: (random_seed % 100) as u8,
            winner_gets_combat_reward_seed: (random_seed % 2) as u8,
            // super poorly randomed number, but don't have the compute space to fake a second full hash.
            // once we implement bytemuch+mod on a VRF, this can have it's own unique derivation.
            resilience_seed: ((pseudo_random_u64 + (ind as u64)) % 100) as u8,
            swiftness_seed: ((pseudo_random_u64 + (ind as u64)) % 2) as u8, // (pseudo_random_u64 + (ind as u64) % 2) as u8,
        };
    }


    Ok(())
}
