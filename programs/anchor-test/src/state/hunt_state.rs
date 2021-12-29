use anchor_lang::prelude::*;

#[account]
pub struct HuntState {
    pub authority: Pubkey,
    pub hunt_state_vec: Vec<EnteredExplorer>, // 5000];
    pub hunt_state_account_bump: u8,
}
// recalc
// 32 + 32 +32 +32 +32 + 64 +6 = 230 (166 without grail_reward)
#[account]
pub struct EnteredExplorer {
    pub explorer_escrow_account: Pubkey,
    pub provided_gear_escrow_account: Pubkey,
    pub provided_potion_escrow_account: Option<Pubkey>,

    pub explorer_escrow_bump: u8,
    pub provided_gear_escrow_bump: u8,
    pub provided_potion_escrow_bump: Option<u8>,

    pub provided_potion: bool,
    pub has_hunted: bool,
    pub lost_provided_gear: bool,
    pub won_combat_gear: bool,
    pub found_treasure: bool,
    pub used_potion: bool,

    pub combat_reward_escrow_account: Option<Pubkey>,
    pub combat_reward_escrow_bump: Option<u8>,

    pub treasure_type_mint: Option<Pubkey>, // a Mint
    // is it possible to refactor such that grail_reward is not required for every entry?
    // 8 bytes is a lot per entry, but also this tells us exactly how much the user has won
    // no matter when they claim their UST.
    pub grail_reward_in_ust: Option<u64>,
    // hunt_id: u32, probably unnecessary considering it adds 4 bytes to every row.
}

// {
//     explorerEscrow: Pubkey, 
//     providedGearEscrow: Pubkey, 
//     providedPotionEscrow: Pubkey, 
//     hasHunted: bool, 
//     lostProvidedGear: bool,
//     wonCombat: false,
//     wonCombatGear: bool, 
//     foundTreasure: bool, 
//     usedPotion: bool,

//     combatWonGearEscrow: Pubkey, 
//     treasureFoundType: Mint // the mint of the MasterEdition the user can mint a print of.
//     grailRewardInUST: u64

//     // Nice to have 
//     huntId: u32 // set after hunt is executed, could be useful for history if find 
//                   a way to log all of this data.
// }