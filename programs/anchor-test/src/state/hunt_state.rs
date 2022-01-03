use anchor_lang::prelude::*;

#[account]
pub struct HuntState {
    pub owner: Pubkey,
    pub hunt_state_vec: Vec<EnteredExplorer>, // 5000];

    // pub gears: Array<Pubkey; 1>;
    // pub potions: Array<Pubkey; 1>;

    pub hunt_state_account_bump: u8,
    pub program_ust_account_bump: u8,
    pub mint_auth_bump: u8,
}
// recalc
// 32 + 32 + 32 + 32 + 32 + (1 * 3) + (1 * 7) + 64 = 234 (fewer without grail_reward)

// 32 + 1 + 1 +1 + (1 * 7) + 1 + 1 + 64 = 44 + 64 = 108
// #[account]
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
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
    pub grail_reward_in_ust: Option<u64>,
    // hunt_id: u32, probably unnecessary considering it adds 4 bytes to every row.
}