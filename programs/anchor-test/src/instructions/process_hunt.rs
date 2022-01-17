use anchor_lang::prelude::*;
use std::cell::RefMut;
use std::convert::TryFrom;
use anchor_spl::token::TokenAccount;
use crate::state::{HuntState, EnteredExplorer, VrfState, PerCombatRandomization, HistoryState, HistoryRow, increment_write_ind, increment_hunt_id};

fn get_treasure_mint_id_from_seed(val: u32) -> Result<u8, ProgramError> {
    return match val {
        // Nothing
        0..=3_749_999 => Ok(0),

        // Potions (250_000)
        3_750_000..=3_824_999 => Ok(crate::POT_OF_SWIFTNESS_ID), // 75,000, 30%
        3_825_000..=3_887_499 => Ok(crate::POT_OF_STRENGTH_ID), // 62,500, 25%
        3_887_500..=3_974_999 => Ok(crate::POT_OF_MENDING_ID), //  87,500, 35%
        3_975_000..=3_999_999 => Ok(crate::POT_OF_RESILIENCE_ID), //  25,000, 10%

        // Gear (1_000_000)
        // 250_000 ea (500_000)
        4_000_000..=4_249_999 => Ok(crate::SHORTSWORD_ID), // gear
        4_250_000..=4_499_999 => Ok(crate::LEATHER_ARMOR_ID), // gear
       
        // 125_000 ea (250_000)
        4_500_000..=4_624_999 => Ok(crate::DAGGER_ID), // gear
        4_625_000..=4_749_999 => Ok(crate::SHORTBOW_ID), // gear
        
        // 62_500 EA (125_000)
        4_750_000..=4_812_499 => Ok(crate::LONGSWORD_ID), // gear
        4_812_500..=4_874_999 => Ok(crate::CHAINMAIL_ARMOR_ID), // gear
       
        // 62_500
        4_875_000..=4_937_499 => Ok(crate::CROSSBOW_ID), // gear
        
        // 31_250
        4_937_500..=4_968_749 => Ok(crate::PLATE_ARMOR_ID), // gear
        
        // 21_250
        4_968_750..=4_989_999 => Ok(crate::TREASURE_SCROLL_ID), // gear
       
        // 5_000 EA
        4_990_000..=4_994_999 => Ok(crate::CUTTHROATS_DAGGER_ID), // gear
        4_995_000..=4_999_998 => Ok(crate::EXCALIBUR_ID), // gear

        // The Holy Grail (1 in 5,000,000)
        4_999_999 => Ok(crate::GRAIL_ID), // grail

        _ => Err(crate::ErrorCode::ImpossibleTreasureValue.into())

    }
}

fn get_scroll_treasure_mint_id_from_seed(val: u32) -> Result<u8, ProgramError> {
    return match val {
        // 0-54.25 (54.25): Uncommon 2,712,500
        // 54.25-79.25 (25): Rare
        // 79.25-91.75 (12.5): Very rare
        // 91.75-98 (6.25): Legendary
        // 98-99.9999996 (~2): Artifact
        // 99.9999996-100 (.0000004): Grail

        // 0-54.25 (54.25): Uncommon 2,712,500
        0..=1_356_249 => Ok(crate::DAGGER_ID),
        1_356_250..=2_712_499 => Ok(crate::SHORTBOW_ID),

        // 54.25-79.25 (25): Rare
        2_712_500..=3_337_499 => Ok(crate::LONGSWORD_ID), // gear
        3_337_500..=3_962_499 => Ok(crate::CHAINMAIL_ARMOR_ID), // gear
        
        // 79.25-91.75 (12.5): Very rare
        3_962_500..=4_587_499 => Ok(crate::CROSSBOW_ID), // gear
        
        // 91.75-98 (6.25): Legendary
        4_587_500..=4_899_999 => Ok(crate::PLATE_ARMOR_ID), // gear
        
        // 98-99.9999996 (~2): Artifact
        4_900_000..=4_949_999 => Ok(crate::CUTTHROATS_DAGGER_ID), // gear
        4_950_000..=4_999_997 => Ok(crate::EXCALIBUR_ID), // gear

        // The Holy Grail (2 in 5,000,000)
        4_999_998..=4_999_999 => Ok(crate::GRAIL_ID), // grail

        _ => Err(crate::ErrorCode::ImpossibleTreasureValue.into())

    }
}


#[derive(Accounts)]
pub struct ProcessHunt<'info> {
    
    #[account(mut)]
    pub state_account: AccountLoader<'info, HuntState>,
    #[account(mut)]
    pub vrf_account: AccountLoader<'info, VrfState>,
    #[account(mut)]
    pub history_account: AccountLoader<'info, HistoryState>,
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
    pub clock: Sysvar<'info, Clock>,

}

#[test]
fn test_range() {
    let mut val: u32 = 0;
    while val < 5_000_000 {
        // eprintln!("{}", val);
        get_treasure_mint_id_from_seed(val).unwrap();
        val+=1;
    }    
    let result = get_treasure_mint_id_from_seed(5_000_000);
    assert!(result.is_err());

    let result = get_treasure_mint_id_from_seed(5_000_001);
    assert!(result.is_err());

}

#[test]
fn test_scroll_range() {
    let mut val: u32 = 0;
    while val < 5_000_000 {
        // eprintln!("{}", val);
        get_scroll_treasure_mint_id_from_seed(val).unwrap();
        val+=1;
    }    
    let result = get_treasure_mint_id_from_seed(5_000_000);
    assert!(result.is_err());

    let result = get_treasure_mint_id_from_seed(5_000_001);
    assert!(result.is_err());

}
// #[test]
// fn test_calcs() {
//     // Set 1
//     let x = &mut EnteredExplorer {
//         is_empty: false,
//         explorer_escrow_account: Pubkey::new_from_array([0u8; 32]),
//         provided_gear_mint_id: 1,
//         provided_potion_mint_id: 0,
//         explorer_escrow_bump: 123,
//         has_hunted: false,
//         provided_potion: false,
//         provided_gear_kept: false,
//         won_combat: false,
//         won_combat_gear: false,
//         combat_reward_mint_id: 0,
//         found_treasure: false,
//         used_potion: false,
//         treasure_mint_id: 0,
//     };
//     let y = &mut EnteredExplorer {
//         is_empty: false,
//         explorer_escrow_account:  Pubkey::new_from_array([0u8; 32]),
//         provided_gear_mint_id: 4,
//         provided_potion_mint_id: 0,
//         explorer_escrow_bump: 123,
//         has_hunted: false,
//         provided_potion: false,
//         provided_gear_kept: false,
//         won_combat: false,
//         won_combat_gear: false,
//         combat_reward_mint_id: 0,
//         found_treasure: false,
//         used_potion: false,
//         treasure_mint_id: 0,
//     };
//     let ep_diff: i8 = calc_ep(x) - calc_ep(y);
//     assert!(calc_ep(x) == 2);
//     assert!(calc_ep(y) == 3);
//     let win_threshold: u8 = 50_i8.checked_add(ep_diff * 5).unwrap() as u8;
//     assert!(win_threshold == 45);

//     // Set 2
//     let x = &mut EnteredExplorer {
//         is_empty: false,
//         explorer_escrow_account:  Pubkey::new_from_array([0u8; 32]),
//         provided_gear_mint_id: crate::CROSSBOW_ID,
//         provided_potion_mint_id: crate::POT_OF_STRENGTH_ID,
//         explorer_escrow_bump: 123,
//         has_hunted: false,
//         provided_potion: true,
//         provided_gear_kept: false,
//         won_combat: false,
//         won_combat_gear: false,
//         combat_reward_mint_id: 0,
//         found_treasure: false,
//         used_potion: false,
//         treasure_mint_id: 0,
//     };
//     let y = &mut EnteredExplorer {
//         is_empty: false,
//         explorer_escrow_account:  Pubkey::new_from_array([0u8; 32]),
//         provided_gear_mint_id: crate::SHORTSWORD_ID,
//         provided_potion_mint_id: 0,
//         explorer_escrow_bump: 123,
//         has_hunted: false,
//         provided_potion: false,
//         provided_gear_kept: false,
//         won_combat: false,
//         won_combat_gear: false,
//         combat_reward_mint_id: 0,
//         found_treasure: false,
//         used_potion: false,
//         treasure_mint_id: 0,
//     };
//     let ep_diff = calc_ep(x) - calc_ep(y);
//     assert!(calc_ep(x) == 7);
//     assert!(calc_ep(y) == 2);
//     let win_threshold = 50_i8.checked_add(ep_diff * 5).unwrap() as u8;
//     assert!(win_threshold == 75);

//     // Set 3
//     let x = &mut EnteredExplorer {
//         is_empty: false,
//         explorer_escrow_account:  Pubkey::new_from_array([0u8; 32]),
//         provided_gear_mint_id: crate::EXCALIBUR_ID,
//         provided_potion_mint_id: crate::POT_OF_STRENGTH_ID,
//         explorer_escrow_bump: 123,
//         has_hunted: false,
//         provided_potion: true,
//         provided_gear_kept: false,
//         won_combat: false,
//         won_combat_gear: false,
//         combat_reward_mint_id: 0,
//         found_treasure: false,
//         used_potion: false,
//         treasure_mint_id: 0,
//     };
//     let y = &mut EnteredExplorer {
//         is_empty: false,
//         explorer_escrow_account:  Pubkey::new_from_array([0u8; 32]),
//         provided_gear_mint_id: crate::SHORTSWORD_ID,
//         provided_potion_mint_id: 0,
//         explorer_escrow_bump: 123,
//         has_hunted: false,
//         provided_potion: false,
//         provided_gear_kept: false,
//         won_combat: false,
//         won_combat_gear: false,
//         combat_reward_mint_id: 0,
//         found_treasure: false,
//         used_potion: false,
//         treasure_mint_id: 0,
//     };
//     let ep_diff = calc_ep(x) - calc_ep(y);
//     assert!(calc_ep(x) == 9);
//     assert!(calc_ep(y) == 2);
//     let win_threshold = 50_i8.checked_add(ep_diff * 5).unwrap() as u8;
//     assert!(win_threshold == 85);


//     // Set 3

//     let x = &mut EnteredExplorer {
//         is_empty: false,
//         explorer_escrow_account:  Pubkey::new_from_array([0u8; 32]),
//         provided_gear_mint_id: crate::SHORTSWORD_ID,
//         provided_potion_mint_id: 0,
//         explorer_escrow_bump: 123,
//         has_hunted: false,
//         provided_potion: false,
//         provided_gear_kept: false,
//         won_combat: false,
//         won_combat_gear: false,
//         combat_reward_mint_id: 0,
//         found_treasure: false,
//         used_potion: false,
//         treasure_mint_id: 0,
//     };
//     let y = &mut EnteredExplorer {
//         is_empty: false,
//         explorer_escrow_account:  Pubkey::new_from_array([0u8; 32]),
//         provided_gear_mint_id: crate::EXCALIBUR_ID,
//         provided_potion_mint_id: crate::POT_OF_STRENGTH_ID,
//         explorer_escrow_bump: 123,
//         has_hunted: false,
//         provided_potion: true,
//         provided_gear_kept: false,
//         won_combat: false,
//         won_combat_gear: false,
//         combat_reward_mint_id: 0,
//         found_treasure: false,
//         used_potion: false,
//         treasure_mint_id: 0,
//     };
//     let ep_diff = calc_ep(x) - calc_ep(y);
//     assert!(calc_ep(x) == 2);
//     assert!(calc_ep(y) == 9);
//     let win_threshold = 50_i8.checked_add(ep_diff * 5).unwrap() as u8;
//     assert!(win_threshold == 15);

// }

fn calc_ep(explorer: &mut EnteredExplorer) -> i8 {
    // from explorer - todo
    let explorer_ep: i8 =  1; // EXPLORERS.find(|x| x.id == explorer.explorer_id).unwrap().ep as i8;
    // from gear
    let gear_ep: i8 = crate::MINTS.iter().find(|x| x.id == explorer.provided_gear_mint_id).unwrap().ep;
    // from potion
    let potion_ep: i8 = if explorer.provided_potion == crate::TRUE {
        crate::MINTS.iter().find(|x| x.id == explorer.provided_potion_mint_id).unwrap().ep
    } else {
        0
    };
    
    // burn if potion provided EP (potion of strength)
    if potion_ep > 0 {
        explorer.used_potion = crate::TRUE;
    }
    return explorer_ep + gear_ep + potion_ep;
}

// Process the hunt data for an explorer which will not have an enemy to fight.
fn process_non_combat(explorer: &mut EnteredExplorer, computed_result: &PerCombatRandomization, history_account: &mut RefMut<HistoryState>) -> ProgramResult {
    explorer.has_hunted = crate::TRUE;
    explorer.provided_gear_kept = crate::TRUE;
    let treasure_mint_id: u8 = if explorer.provided_gear_mint_id == crate::TREASURE_SCROLL_ID {
        // Burn the treasure scroll since it will have now found treasure.
        explorer.provided_gear_kept = crate::FALSE;
        get_scroll_treasure_mint_id_from_seed(computed_result.treasure_found_seed)?
    } else {
        get_treasure_mint_id_from_seed(computed_result.treasure_found_seed)?
    };
    if treasure_mint_id != 0 {
        explorer.found_treasure = crate::TRUE;
        explorer.treasure_mint_id = treasure_mint_id;
        history_account.total_per[treasure_mint_id as usize] = history_account.total_per[treasure_mint_id as usize].checked_add(1).unwrap();
    }

    let next_ind: usize = usize::try_from(history_account.write_ind).unwrap();
    history_account.history_arr[next_ind] = HistoryRow {hunt_id: history_account.this_hunt_id, winner: explorer.explorer_id, loser: 0, winner_gear: explorer.provided_gear_mint_id, loser_gear: 0, transfer: crate::FALSE, treasure_id: treasure_mint_id};
    increment_write_ind(history_account);
    history_account.total_explorers = history_account.total_explorers.checked_add(1).unwrap();

    Ok(())
}

fn process_combat(
    explorer_one: &mut EnteredExplorer, 
    explorer_two: &mut EnteredExplorer,
    computed_result: &PerCombatRandomization, 
    history_account: &mut RefMut<HistoryState>
) -> ProgramResult {
    // Compute the difference between both explorer's EPs
    let ep_diff: i8 = calc_ep(explorer_one).checked_sub(calc_ep(explorer_two)).unwrap();
    let win_threshold: u8 = 50_i8.checked_add(ep_diff.checked_mul(5).unwrap()).unwrap() as u8;

    // Determine winner
    let mut explorer_one_wins: bool = computed_result.winner_seed < win_threshold; 

    // Use Potion of resilience
    // NOTE: In the event both users provide a resilience potion, only one will be used.
    // This could be modified to allow both, but it would require an extra computed result for this unique case.
    // For now, only one potion of resilience is used per fight. this essentially means that explorer_two
    // is at disadvantage if both users provide resilience, because explorer_two's will not be used.

    // if explorer one loses but has a resilience potion
    if !explorer_one_wins && explorer_one.provided_potion_mint_id == crate::POT_OF_RESILIENCE_ID {
        explorer_one.used_potion = crate::TRUE;
        explorer_one_wins = computed_result.resilience_seed < win_threshold;
    }
    // if explorer two loses but has a resilience potion
    else if explorer_one_wins && explorer_two.provided_potion_mint_id == crate::POT_OF_RESILIENCE_ID {
        explorer_two.used_potion = crate::TRUE;
        explorer_one_wins = computed_result.resilience_seed < win_threshold;
   
    }

    // Determine if loser's gear is burned.
    // 50% chance that loser's gear is burned - 50% chance the winner can take it.
    let loser_gear_burned = computed_result.winner_gets_combat_reward_seed == 1; // 50/50

    let winner: &mut EnteredExplorer;
    let loser: &mut EnteredExplorer;
    if explorer_one_wins {
        winner = explorer_one;
        loser = explorer_two;
    } else {
        winner = explorer_two;
        loser = explorer_one;
    }
    // Winner: mark bools,
    winner.has_hunted = crate::TRUE;
    winner.won_combat = crate::TRUE;
    // keep gear,
    winner.provided_gear_kept = crate::TRUE;
    winner.won_combat_gear = if !loser_gear_burned { crate::TRUE } else { crate::FALSE };
    // set reward gear if given,
    if !loser_gear_burned {
        winner.combat_reward_mint_id = loser.provided_gear_mint_id;
    } else if loser.provided_potion == crate::TRUE && loser.provided_potion_mint_id == crate::POT_OF_MENDING_ID {
        // If gear is to be burned and loser has potion of mending, let them keep it.
        loser.used_potion = crate::TRUE;
        loser.provided_gear_kept = crate::TRUE;
    } else {
        history_account.total_gear_burned = history_account.total_gear_burned.checked_add(1).unwrap();
    }

    // Get the treasure mint for the winner (0 means no treasure)
    let treasure_mint_id: u8 = if winner.provided_gear_mint_id == crate::TREASURE_SCROLL_ID {
        // Burn the treasure scroll since it will have now found treasure.
        winner.provided_gear_kept = crate::FALSE;
        get_scroll_treasure_mint_id_from_seed(computed_result.treasure_found_seed)?
    } else {
        get_treasure_mint_id_from_seed(computed_result.treasure_found_seed)?
    };
    // Set treasure found if found.
    if treasure_mint_id != 0 {
        winner.found_treasure = crate::TRUE;
        winner.treasure_mint_id = treasure_mint_id;
        history_account.total_per[treasure_mint_id as usize] = history_account.total_per[treasure_mint_id as usize].checked_add(1).unwrap();
    }
    // Loser: mark hunt over
    loser.has_hunted = crate::TRUE;
    let next_ind: usize = usize::try_from(history_account.write_ind).unwrap();
    history_account.history_arr[next_ind] = HistoryRow {hunt_id: history_account.this_hunt_id, winner: winner.explorer_id, loser: loser.explorer_id, winner_gear: winner.provided_gear_mint_id, loser_gear: loser.provided_gear_mint_id, transfer: if !loser_gear_burned { crate::TRUE} else { crate::FALSE}, treasure_id: treasure_mint_id};
    increment_write_ind(history_account);
    history_account.total_explorers = history_account.total_explorers.checked_add(2).unwrap();
    Ok(())
}

// Run the hunt 
pub fn handler(ctx: Context<ProcessHunt>) -> ProgramResult {
    let mut state_account = ctx.accounts.state_account.load_mut()?;
    let mut vrf_account = ctx.accounts.vrf_account.load_mut()?;
    let history_account = &mut ctx.accounts.history_account.load_mut()?;
    // VRF account should be fresh data.
    if vrf_account.is_usable == (crate::FALSE) {
        return Err(crate::ErrorCode::RandomnessNotGenerated.into());
    }
    // Mark the vrf_account data as having been used.
    vrf_account.is_usable = crate::FALSE;

    // Request randomness
    // TODO

    // Do a shuffle of the array slots using randomness. OR implement array shuffle as separate instruction
    // TODO

    // Grab an iter of all of the actual explorers entered (minus empty slots)
    let mut all_entered = state_account.hunt_state_arr.iter_mut().filter(|x| x.is_empty == crate::FALSE);
    // Grab an iter of all of the computed 'results'
    let mut vrf_entries = vrf_account.vrf_arr.iter();
    
    // Walk through every entry, pair with next in iter, determine combat outcomes and treasures found for each pair until none are left.
    while let Some(explorer_one) = all_entered.next() {
        // No explorer_one should be empty, sanity check.
        if explorer_one.is_empty == crate::TRUE{
            return Err(crate::ErrorCode::IncorrectIndexFed.into());
        }
        let computed_result = vrf_entries.next().unwrap();

        // Use Potion of swiftness (chance to skip combat and search treasure)
        if explorer_one.provided_potion == crate::TRUE && explorer_one.provided_potion_mint_id == crate::POT_OF_SWIFTNESS_ID {
             explorer_one.used_potion = crate::TRUE;
             // swiftness potion has a 50% chance of success.
             if computed_result.swiftness_seed == 1 {
                process_non_combat(explorer_one, computed_result, history_account)?;
                continue;
             }
        }
        // The potential entry of the explorer this one will fight.
        let opt_explorer_two = all_entered.next();
        // The computed results for this pairing.

        // No combatant - odd number of explorers: just treasure hunting for this one.
        if opt_explorer_two.is_none() {
            process_non_combat(explorer_one, computed_result, history_account)?;
        } else {
            let explorer_two= opt_explorer_two.unwrap();
            // Another sanity check
            if explorer_two.is_empty == crate::TRUE{
                return Err(crate::ErrorCode::IncorrectIndexFed.into());
            }
            process_combat(explorer_one, explorer_two, computed_result, history_account)?;

        }
    }

    // TODO timestamp in state so this only runs once per 3 hours
    // TODO implement history
    history_account.total_hunts = history_account.total_hunts.checked_add(1).unwrap();
    increment_hunt_id(history_account);
    Ok(())

}