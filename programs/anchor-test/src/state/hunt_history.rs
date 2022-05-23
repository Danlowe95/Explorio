use anchor_lang::prelude::*;
use std::cell::RefMut;
use std::convert::TryFrom;

pub const MAX_HISTORY_ROWS: usize = 20000;
#[test]
fn hmm() {
  eprintln!("ello then {}", std::mem::size_of::<HistoryState>());
  eprintln!("ello then {}", std::mem::size_of::<HistoryRow>());
  eprintln!("ello 3then {}", std::mem::align_of::<HistoryState>());
  eprintln!("ello4 then {}", std::mem::align_of::<HistoryRow>());
}

pub fn increment_write_ind(history_account: &mut RefMut<HistoryState>) {
    history_account.write_ind += 1;
    // When we inevitably run out of history space in this array, reset to 0 and start overwriting the oldest data.
    if history_account.write_ind == u32::try_from(MAX_HISTORY_ROWS).unwrap() {
        history_account.write_ind = 0;
    }
}

pub fn increment_hunt_id(history_account: &mut RefMut<HistoryState>) {
    history_account.this_hunt_id += 1;
    // Wrap back to zero
    if history_account.this_hunt_id == u32::MAX {
        history_account.this_hunt_id = 0;
    }
}

#[account(zero_copy)]
pub struct HistoryState {
    pub total_hunts: u64,
    pub total_explorers: u64,
    pub total_gear_burned: u64,
    pub total_per: [u64; 17],
    pub write_ind: u32,
    pub this_hunt_id: u32,
    pub history_arr: [HistoryRow; 20000]
}
// e1id e2id gear1id gear2id transfer treasureId
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Copy)]
pub struct HistoryRow {
    pub hunt_id: u32,
    pub winner: u16,
    pub loser: u16,
    pub winner_gear: u8,
    pub loser_gear: u8,
    pub transfer: u8,
    pub treasure_id: u8,
}