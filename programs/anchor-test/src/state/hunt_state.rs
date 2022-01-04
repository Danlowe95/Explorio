use anchor_lang::prelude::*;

#[account(zero_copy)]
pub struct HuntState {
    pub owner: Pubkey,
    pub is_initialized: bool,
    pub hunt_state_arr: [Option<EnteredExplorer>; 5000], // Option<55> so 59 * 5000 = 295000 or 56 * 5000 = 280035 (rust checker says 280035)

    pub program_ust_account_bump: u8,
    pub mint_auth_account_bump: u8,
}

// #[derive(Clone)]
// struct ExplorerArray([EnteredExplorer; 8192]);

// impl AnchorSerialize for ExplorerArray {
//     fn serialize<W: std::io::Write>(&self, writer: &mut W) -> std::io::Result<()> {
//         writer.write_all(&self.0)
//     }
// }
// impl AnchorDeserialize for ExplorerArray {
//     fn deserialize(_: &mut &[u8]) -> Result<Self, std::io::Error> {
//         Ok(Self([EnteredExplorer { explorer_escrow_account: val, 
//             provided_gear_mint_id: val, 
//             provided_potion_mint_id: val,
//             explorer_escrow_bump: val, 
//             provided_potion: val, 
//             has_hunted: val, 
//             provided_gear_burned: val, 
//             provided_gear_kept: val, 
//             won_combat_gear: val, 
//             found_treasure: val, 
//             used_potion: val, 
//             combat_reward_mint_id: val, 
//             treasure_mint_id: val, 
//             grail_reward_in_ust: val
//          }; 5000]))
//     }
// }

#[test]
fn hmm() {
  eprintln!("{}", std::mem::size_of::<EnteredExplorer>());
}
// 32 + 1 + 2 + 1 + (1 * 7) + 2 + 2 + 8 = 47 + 8 = 55
// #[account]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Copy)]
pub struct EnteredExplorer {
    pub explorer_escrow_account: Pubkey,
    pub provided_gear_mint_id: u8,
    pub provided_potion_mint_id: Option<u8>,

    pub explorer_escrow_bump: u8,
    // pub provided_gear_escrow_bump: u8,
    // pub provided_potion_escrow_bump: Option<u8>,

    pub provided_potion: bool,
    pub has_hunted: bool,
    pub provided_gear_burned: bool,
    pub provided_gear_kept: bool,
    pub won_combat_gear: bool,
    pub found_treasure: bool,
    pub used_potion: bool,

    pub combat_reward_mint_id: Option<u8>,
    // pub combat_reward_escrow_bump: Option<u8>,

    pub treasure_mint_id: Option<u8>, // special logic baked in for grail

    // is it possible to refactor such that grail_reward is not required for every entry?
    // 8 bytes is a lot per entry, but also this tells us exactly how much the user has won
    // no matter when they claim their UST.
    pub grail_reward_in_ust: u64,
    // hunt_id: u32, probably unnecessary considering it adds 4 bytes to every row.
}