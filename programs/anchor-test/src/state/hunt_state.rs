use anchor_lang::prelude::*;

#[account(zero_copy)]
pub struct GeardropState {
  pub geardrop_arr: [IdAndNumber; 5000],
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Copy)]
pub struct IdAndNumber {
  pub explorer_id: u16,
  // Only really needs a u8, but no padding for zero_copy
  pub num_available: u16
}

pub fn get_initial_geardrop_state () -> [IdAndNumber; 5000] {
  let mut initial_array = [IdAndNumber {explorer_id: 0, num_available: 0}; 5000];
  let mut ind = 0;
  while ind != 5000 {
    initial_array[ind] = IdAndNumber {explorer_id: (ind as u16+1u16 ), num_available: 0};
    ind += 1;
  }
  return initial_array;
}

// SWITCHBOARD ACCOUNT
#[account]
pub struct SwitchboardVrfAccount {
  pub random_number: u64
}

// VRF
#[account(zero_copy)]
pub struct VrfState {
    pub vrf_arr: [PerCombatRandomization; 2500],
    pub is_initialized: u8, //u16 fixes
    pub is_usable: u8,//u16 fixes
    pub request_waiting: u8,
    pub entries_shuffled: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Copy)]
#[repr(C)]
pub struct PerCombatRandomization {
  pub treasure_found_seed: u32,

  pub winner_seed: u8,
  pub winner_gets_combat_reward_seed: u8,
  pub resilience_seed: u8,
  pub swiftness_seed: u8,
  // zero_copy requires proper alignment with no padding. Must be a multiple of the largest object
  // in this case, u32 is 4 bytes, so total size is 8 bytes by adding these.


}
// HUNT
#[account(zero_copy)]
pub struct HuntState {
    pub hunt_state_arr: [EnteredExplorer; 5000], 
    pub owner: Pubkey,
    pub is_initialized: u8,
    pub program_ust_account_bump: u8,
    pub mint_auth_account_bump: u8,
    pub switchboard_account_bump: u8,
    pub geardrop_account_bump: u8,
    pub useless_val: u8,
}
#[test]
fn hmm() {
  eprintln!("vrf: {} end", std::mem::size_of::<GeardropState>());
  eprintln!("hunt: {} end", std::mem::align_of::<GeardropState>());
  // eprintln!("erxr: {} end", std::mem::size_of::<HistoryState>());
}
#[test]
fn alignment() {
    eprintln!("{:?}", std::mem::align_of::<HuntState>());
}

// #[account]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Copy)]
pub struct EnteredExplorer {
    // zero_copy won't work with option
    // bools aren't allowed by POD either, so those are u8s.

    pub explorer_id: u16,

    pub explorer_escrow_account: Pubkey,
    pub is_empty: u8,
    pub provided_gear_mint_id: u8,
    pub provided_potion_mint_id: u8,
    pub explorer_escrow_bump: u8,

    pub provided_potion: u8,
    pub has_hunted: u8,
    pub provided_gear_kept: u8,
    pub won_combat: u8,

    pub won_combat_gear: u8,
    pub found_treasure: u8,
    pub used_potion: u8,
    pub combat_reward_mint_id: u8,
    
    pub treasure_mint_id: u8, // TODO special logic baked in for grail
    // unused val is placed explicitly so this struct has 0 padding (zero_copy requirement).
    pub unused_value: u8,

}