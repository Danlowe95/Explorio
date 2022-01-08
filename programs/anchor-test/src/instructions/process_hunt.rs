use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount};
use crate::state::{HuntState, EnteredExplorer};
use anchor_lang::solana_program::hash::*;

fn get_treasure_mint_id_from_val(val: u64) -> Result<u8, ProgramError> {
    return match val {
        0..=3_749_999 => Ok(0),
        3_750_000..=3_999_999 => Ok(2), // potion
        4_000_000..=4_999_999 => Ok(1), // gear
        5_000_000 => Ok(3), // grail
        _ => Err(crate::ErrorCode::ImpossibleTreasureValue.into())

    }
}


#[derive(Accounts)]
pub struct ProcessHunt<'info> {
    
    // pub user: Signer<'info>,
    
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
    pub clock: Sysvar<'info, Clock>,

}


// Run the hunt - only owner can run it for now
pub fn handler(ctx: Context<ProcessHunt>) -> ProgramResult {
    // Walk the state vec and do some basic stub processing
    let mut state_account = ctx.accounts.state_account.load_mut()?;
    let num_entered: usize = state_account.hunt_state_arr.iter().filter(|&n| !n.is_empty && !n.has_hunted).count();

    
    // Planning:
    // Request randomness
    // Do a shuffle of some number of array slots using randomness

    // After shuffle, pull all_entered iter
    let mut all_entered = state_account.hunt_state_arr.iter_mut().filter(|x| !x.is_empty);
    // let clock = &ctx.accounts.clock;
    // let clock_bytes: [u8; 8] = clock.slot.to_be_bytes();

    // A hash derived from adding together unix_timestamp and clock slot
    // let basic_hash: Hash = hash(&(clock.unix_timestamp as i128 + clock.slot as i128).to_be_bytes());
    // Then, a u64 derived from the first 8 bytes of the hash.
    // let pseudo_random_u64: u64 = u64::try_from_slice(&basic_hash.to_bytes()[0..8]).unwrap(); //  u64::from_str_radix(&basic_hash.to_string(), 16).unwrap();

    // msg!("the hash: {}", basic_hash);
    // msg!("the hash compute: {}", pseudo_random_u64);
    
    // Walk through every entry, pair with next in iter for combat outcome and treasure finding until none are left.
    while let Some(entry) = all_entered.next() {
        if entry.is_empty {
            return Err(crate::ErrorCode::IncorrectIndexFed.into());
        }
        let combatant_entry = all_entered.next();
        if combatant_entry.is_none() {
            // No combatant: just go to treasure
            entry.has_hunted = true;
            entry.provided_gear_kept = true;
            // eventually
            entry.found_treasure = false;
        } else {
            let combatant= combatant_entry.unwrap();
            if combatant.is_empty {
                return Err(crate::ErrorCode::IncorrectIndexFed.into());
            }
            // Fake randomness by adding together the random number with bytes from each escrow account.
            // let strangely_computed_value: u128 = u128::from(pseudo_random_u64)
            //     .checked_add(
            //         u128::from(u64::try_from_slice(&entry.explorer_escrow_account.key().to_bytes()[0..8]).unwrap())
            //     ).unwrap()
            //     .checked_add( u128::from(u64::try_from_slice(&combatant.explorer_escrow_account.key().to_bytes()[0..8]).unwrap()))
            //     .unwrap();
            let strangely_computed_value: u64 = 100_000_000;
            let combat_winner: bool = strangely_computed_value % 2 == 0;
            let treasure_mint_id: u8 = get_treasure_mint_id_from_val(strangely_computed_value % 5_000_000)?;
            // idk if this is mathematically any different than just doing % 2
            let combat_gear_burned = strangely_computed_value % 100 % 2 == 0;
            
            let winner: &mut EnteredExplorer;
            let loser: &mut EnteredExplorer;
            if combat_winner {
                winner = entry;
                loser = combatant;
            } else {
                winner = combatant;
                loser = entry;
            }
            winner.has_hunted = true;
            winner.provided_gear_kept = true;
            winner.won_combat_gear = !combat_gear_burned;
            if !combat_gear_burned {
                winner.combat_reward_mint_id = loser.provided_gear_mint_id;
            }
            
            if treasure_mint_id != 0 {
                winner.found_treasure = true;
                winner.treasure_mint_id = treasure_mint_id;
            }
            loser.has_hunted = true;
            loser.provided_gear_kept = false;

            // Combat done - treasure next, for winner
            winner.found_treasure = false;
        }
    }


    // }
    // potentially store timestamp in state so this only runs once per 3 hours

    Ok(())

}