use anchor_lang::prelude::*;


// 15,009
#[account(zero_copy)]
pub struct VrfState {
    pub is_initialized: bool,
    pub is_usable: bool,
    pub vrf_arr: [PerCombatRandomization; 2500], 

}

#[account(zero_copy)]
pub struct HuntState {
    pub owner: Pubkey,
    pub is_initialized: bool,
    pub hunt_state_arr: [EnteredExplorer; 5000], 

    pub program_ust_account_bump: u8,
    pub mint_auth_account_bump: u8,
}
#[test]
fn hmm() {
  eprintln!("{}", std::mem::size_of::<VrfState>());
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Copy)]
pub struct PerCombatRandomization {
  pub winner_seed: u8,
  pub winner_gets_combat_reward_seed: u8,
  pub treasure_found_seed: u32,
}

// #[account]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Copy)]
pub struct EnteredExplorer {
    // TEMP shit implementation because anchor won't work with option
    // technically bools aren't allowed by POD either, but they do work currently.
    pub is_empty: bool,
    pub explorer_escrow_account: Pubkey,
    pub provided_gear_mint_id: u8,
    pub provided_potion_mint_id: u8,

    pub explorer_escrow_bump: u8,
    pub provided_potion: bool,
    pub has_hunted: bool,
    pub provided_gear_kept: bool,
    pub won_combat: bool,
    pub won_combat_gear: bool,
    pub found_treasure: bool,
    pub used_potion: bool,

    pub combat_reward_mint_id: u8,
    pub treasure_mint_id: u8, // TODO special logic baked in for grail

    // // is it possible to refactor such that grail_reward is not required for every entry?
    // // 8 bytes is a lot per entry, but also this tells us exactly how much the user has won
    // // no matter when they claim their UST.
    // pub grail_reward_in_ust: u64,
    // hunt_id: u32, probably unnecessary considering it adds 4 bytes to every row.
}