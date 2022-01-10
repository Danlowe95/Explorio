use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount};
use crate::state::{HuntState, EnteredExplorer, VrfState, PerCombatRandomization};

fn get_treasure_mint_id_from_val(val: u32) -> Result<u8, ProgramError> {
    return match val {
        0..=3_749_999 => Ok(0),
        3_750_000..=3_999_999 => Ok(crate::POT_OF_STRENGTH_ID), // potion
        4_000_000..=4_999_999 => Ok(crate::SHORTSWORD_ID), // gear
        5_000_000 => Ok(crate::GRAIL_ID), // grail
        _ => Err(crate::ErrorCode::ImpossibleTreasureValue.into())

    }
}


#[derive(Accounts)]
pub struct ProcessHunt<'info> {
    
    // pub user: Signer<'info>,
    
    #[account(mut)]
    pub state_account: AccountLoader<'info, HuntState>,
    #[account(mut)]
    pub vrf_account: AccountLoader<'info, VrfState>,
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

// fn process_combat(computed_result: &mut PerCombatRandomization, explorer_one: &mut EnteredExplorer, explorer_two: &mut EnteredExplorer) {

// }


#[test]
fn test_calcs() {
    // Set 1
    let x = &mut EnteredExplorer {
        is_empty: false,
        explorer_escrow_account: Pubkey::new_from_array([0u8; 32]),
        provided_gear_mint_id: 1,
        provided_potion_mint_id: 0,
        explorer_escrow_bump: 123,
        has_hunted: false,
        provided_potion: false,
        provided_gear_kept: false,
        won_combat: false,
        won_combat_gear: false,
        combat_reward_mint_id: 0,
        found_treasure: false,
        used_potion: false,
        treasure_mint_id: 0,
    };
    let y = &mut EnteredExplorer {
        is_empty: false,
        explorer_escrow_account:  Pubkey::new_from_array([0u8; 32]),
        provided_gear_mint_id: 4,
        provided_potion_mint_id: 0,
        explorer_escrow_bump: 123,
        has_hunted: false,
        provided_potion: false,
        provided_gear_kept: false,
        won_combat: false,
        won_combat_gear: false,
        combat_reward_mint_id: 0,
        found_treasure: false,
        used_potion: false,
        treasure_mint_id: 0,
    };
    let ep_diff: i8 = calc_ep(x) - calc_ep(y);
    assert!(calc_ep(x) == 2);
    assert!(calc_ep(y) == 3);
    let win_threshold: u8 = 50_i8.checked_add(ep_diff * 5).unwrap() as u8;
    assert!(win_threshold == 45);

    // Set 2
    let x = &mut EnteredExplorer {
        is_empty: false,
        explorer_escrow_account:  Pubkey::new_from_array([0u8; 32]),
        provided_gear_mint_id: crate::CROSSBOW_ID,
        provided_potion_mint_id: crate::POT_OF_STRENGTH_ID,
        explorer_escrow_bump: 123,
        has_hunted: false,
        provided_potion: true,
        provided_gear_kept: false,
        won_combat: false,
        won_combat_gear: false,
        combat_reward_mint_id: 0,
        found_treasure: false,
        used_potion: false,
        treasure_mint_id: 0,
    };
    let y = &mut EnteredExplorer {
        is_empty: false,
        explorer_escrow_account:  Pubkey::new_from_array([0u8; 32]),
        provided_gear_mint_id: crate::SHORTSWORD_ID,
        provided_potion_mint_id: 0,
        explorer_escrow_bump: 123,
        has_hunted: false,
        provided_potion: false,
        provided_gear_kept: false,
        won_combat: false,
        won_combat_gear: false,
        combat_reward_mint_id: 0,
        found_treasure: false,
        used_potion: false,
        treasure_mint_id: 0,
    };
    let ep_diff = calc_ep(x) - calc_ep(y);
    assert!(calc_ep(x) == 7);
    assert!(calc_ep(y) == 2);
    let win_threshold = 50_i8.checked_add(ep_diff * 5).unwrap() as u8;
    assert!(win_threshold == 75);

    // Set 3
    let x = &mut EnteredExplorer {
        is_empty: false,
        explorer_escrow_account:  Pubkey::new_from_array([0u8; 32]),
        provided_gear_mint_id: crate::EXCALIBUR_ID,
        provided_potion_mint_id: crate::POT_OF_STRENGTH_ID,
        explorer_escrow_bump: 123,
        has_hunted: false,
        provided_potion: true,
        provided_gear_kept: false,
        won_combat: false,
        won_combat_gear: false,
        combat_reward_mint_id: 0,
        found_treasure: false,
        used_potion: false,
        treasure_mint_id: 0,
    };
    let y = &mut EnteredExplorer {
        is_empty: false,
        explorer_escrow_account:  Pubkey::new_from_array([0u8; 32]),
        provided_gear_mint_id: crate::SHORTSWORD_ID,
        provided_potion_mint_id: 0,
        explorer_escrow_bump: 123,
        has_hunted: false,
        provided_potion: false,
        provided_gear_kept: false,
        won_combat: false,
        won_combat_gear: false,
        combat_reward_mint_id: 0,
        found_treasure: false,
        used_potion: false,
        treasure_mint_id: 0,
    };
    let ep_diff = calc_ep(x) - calc_ep(y);
    assert!(calc_ep(x) == 9);
    assert!(calc_ep(y) == 2);
    let win_threshold = 50_i8.checked_add(ep_diff * 5).unwrap() as u8;
    assert!(win_threshold == 85);


    // Set 3

    let x = &mut EnteredExplorer {
        is_empty: false,
        explorer_escrow_account:  Pubkey::new_from_array([0u8; 32]),
        provided_gear_mint_id: crate::SHORTSWORD_ID,
        provided_potion_mint_id: 0,
        explorer_escrow_bump: 123,
        has_hunted: false,
        provided_potion: false,
        provided_gear_kept: false,
        won_combat: false,
        won_combat_gear: false,
        combat_reward_mint_id: 0,
        found_treasure: false,
        used_potion: false,
        treasure_mint_id: 0,
    };
    let y = &mut EnteredExplorer {
        is_empty: false,
        explorer_escrow_account:  Pubkey::new_from_array([0u8; 32]),
        provided_gear_mint_id: crate::EXCALIBUR_ID,
        provided_potion_mint_id: crate::POT_OF_STRENGTH_ID,
        explorer_escrow_bump: 123,
        has_hunted: false,
        provided_potion: true,
        provided_gear_kept: false,
        won_combat: false,
        won_combat_gear: false,
        combat_reward_mint_id: 0,
        found_treasure: false,
        used_potion: false,
        treasure_mint_id: 0,
    };
    let ep_diff = calc_ep(x) - calc_ep(y);
    assert!(calc_ep(x) == 2);
    assert!(calc_ep(y) == 9);
    let win_threshold = 50_i8.checked_add(ep_diff * 5).unwrap() as u8;
    assert!(win_threshold == 15);

}


fn calc_ep(explorer: &mut EnteredExplorer) -> i8 {
    // from explorer - todo
    let explorer_ep: i8 = 1;
    // from gear
    let gear_ep: i8 = crate::MINTS.iter().find(|x| x.id == explorer.provided_gear_mint_id).unwrap().ep;
    // from potion
    let potion_ep: i8 = crate::MINTS.iter().find(|x| x.id == explorer.provided_potion_mint_id).unwrap().ep;
    // burn if potion provided EP (potion of strength)
    if potion_ep > 0 {
        explorer.used_potion = true;
    }
    return explorer_ep + gear_ep + potion_ep;
}

// Process the hunt data for an explorer which will not have an enemy to fight.
fn process_non_combat(explorer: &mut EnteredExplorer, computed_result: &PerCombatRandomization) -> ProgramResult {
    explorer.has_hunted = true;
    explorer.provided_gear_kept = true;
    let treasure_mint_id: u8 = get_treasure_mint_id_from_val(computed_result.treasure_found_seed)?;
    if treasure_mint_id != 0 {
        explorer.found_treasure = true;
        explorer.treasure_mint_id = treasure_mint_id;
    }
    Ok(())
}

fn process_combat(explorer_one: &mut EnteredExplorer, explorer_two: &mut EnteredExplorer, computed_result: &PerCombatRandomization) -> ProgramResult {
    // Compute the difference between both explorer's EPs
    let ep_diff: i8 = calc_ep(explorer_one).checked_sub(calc_ep(explorer_two)).unwrap();
    let win_threshold: u8 = 50_i8.checked_add(ep_diff.checked_mul(5).unwrap()).unwrap() as u8;
    // Use Potion of strength
    // Determine winner
    let explorer_one_wins: bool = computed_result.winner_seed < win_threshold; 
    // Use Potion of resilience

    // Get the treasure mint for the winner (0 means no treasure)
    let treasure_mint_id: u8 = get_treasure_mint_id_from_val(computed_result.treasure_found_seed)?;
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
    winner.has_hunted = true;
    winner.won_combat = true;
    // keep gear,
    winner.provided_gear_kept = true;
    winner.won_combat_gear = !loser_gear_burned;
    // set reward gear if given,
    if !loser_gear_burned {
        winner.combat_reward_mint_id = loser.provided_gear_mint_id;
    } else if loser.provided_potion_mint_id == crate::POT_OF_MENDING_ID {
        // If gear is to be burned and loser has potion of mending, let them keep it.
        loser.used_potion = true;
        loser.provided_gear_kept = true;
    }
    // Set treasure found if found.
    if treasure_mint_id != 0 {
        winner.found_treasure = true;
        winner.treasure_mint_id = treasure_mint_id;
    }
    // Loser: mark hunt over
    loser.has_hunted = true;
    Ok(())
}

// Run the hunt 
pub fn handler(ctx: Context<ProcessHunt>) -> ProgramResult {
    let mut state_account = ctx.accounts.state_account.load_mut()?;
    let mut vrf_account = ctx.accounts.vrf_account.load_mut()?;
    // VRF account should be fresh data.
    if vrf_account.is_usable == false{
        return Err(crate::ErrorCode::RandomnessNotGenerated.into());
    }
    // Mark the vrf_account data as having been used.
    vrf_account.is_usable = false;

    // Request randomness
    // TODO

    // Do a shuffle of the array slots using randomness. OR implement array shuffle as separate instruction
    // TODO

    // Grab an iter of all of the actual explorers entered (minus empty slots)
    let mut all_entered = state_account.hunt_state_arr.iter_mut().filter(|x| !x.is_empty);
    // Grab an iter of all of the computed 'results'
    let mut vrf_entries = vrf_account.vrf_arr.iter();
    
    // Walk through every entry, pair with next in iter, determine combat outcomes and treasures found for each pair until none are left.
    while let Some(explorer_one) = all_entered.next() {
        // No explorer_one should be empty, sanity check.
        if explorer_one.is_empty {
            return Err(crate::ErrorCode::IncorrectIndexFed.into());
        }
        // Use Potion of swiftness (chance to skip combat and search treasure)
        // if explorer_one.provided_potion && explorer_one.provided_potion_mint_id == crate::POT_OF_SWIFTNESS {
        //      explorer_one.used_potion = true;
        //      process_non_combat(explorer_one);
        // }
        // TODO

        // The potential entry of the explorer this one will fight.
        let opt_explorer_two = all_entered.next();
        // The computed results for this pairing.
        let computed_result = vrf_entries.next().unwrap();

        // No combatant - odd number of explorers: just treasure hunting for this one.
        if opt_explorer_two.is_none() {
            process_non_combat(explorer_one, computed_result)?;
        } else {
            let explorer_two= opt_explorer_two.unwrap();
            // Another sanity check
            if explorer_two.is_empty {
                return Err(crate::ErrorCode::IncorrectIndexFed.into());
            }
            process_combat(explorer_one, explorer_two, computed_result)?;

        }
    }

    // TODO timestamp in state so this only runs once per 3 hours
    // TODO implement history

    Ok(())

}