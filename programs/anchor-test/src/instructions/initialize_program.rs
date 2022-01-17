use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};
use anchor_spl::associated_token::AssociatedToken;
use crate::state::{HuntState, EnteredExplorer, VrfState, PerCombatRandomization, HistoryState, HistoryRow, MAX_HISTORY_ROWS};

#[derive(Accounts)]
#[instruction(
    program_ust_account_bump: u8, 
    mint_auth_account_bump: u8,
)]
pub struct InitializeProgram<'info> {
    #[account(mut, constraint = owner.key().to_string().as_str().eq(crate::OWNER_KEY))]
    pub owner: Signer<'info>,

    #[account(zero)]
    pub state_account: AccountLoader<'info, HuntState>,
    #[account(zero)]
    pub vrf_account: AccountLoader<'info, VrfState>,
    #[account(zero)]
    pub history_account: AccountLoader<'info, HistoryState>,

    #[account(
        init_if_needed, 
        payer = owner, 
        token::mint = ust_mint,
        token::authority = program_ust_account,
        seeds = [b"fund"],
        bump = program_ust_account_bump, 
    )]
    pub program_ust_account: Account<'info, TokenAccount>,
    pub ust_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<InitializeProgram>, 
    program_ust_account_bump: u8,
    mint_auth_account_bump: u8,
) -> ProgramResult {
    let state_account = &mut ctx.accounts.state_account.load_init()?;
    let vrf_account = &mut ctx.accounts.vrf_account.load_init()?;
    let history_account = &mut ctx.accounts.history_account.load_init()?;

    if state_account.is_initialized == crate::TRUE {
        return Err(crate::ErrorCode::AlreadyInitialized.into());
    }
    if vrf_account.is_initialized == (crate::TRUE) {
        return Err(crate::ErrorCode::AlreadyInitialized.into());
    }

    state_account.is_initialized = crate::TRUE;
    state_account.mint_auth_account_bump = mint_auth_account_bump;
    state_account.program_ust_account_bump = program_ust_account_bump;

    state_account.owner = ctx.accounts.owner.key();
    state_account.hunt_state_arr = [
            EnteredExplorer {
                is_empty: crate::TRUE,
                explorer_escrow_account: ctx.accounts.owner.key(),
                explorer_id: 0,
                provided_gear_mint_id: 0,
                provided_potion_mint_id: 0,
                explorer_escrow_bump: 0,
                has_hunted: crate::FALSE,
                provided_potion: crate::FALSE,
                provided_gear_kept: crate::FALSE,
                won_combat: crate::FALSE,
                won_combat_gear: crate::FALSE,
                combat_reward_mint_id: 0,
                found_treasure: crate::FALSE,
                used_potion: crate::FALSE,
                treasure_mint_id: 0,
                unused_value: 0,
        
            }; 5000];

    vrf_account.is_initialized = crate::TRUE;
    vrf_account.is_usable = crate::FALSE;
    vrf_account.vrf_arr = [ PerCombatRandomization {winner_seed: 0, winner_gets_combat_reward_seed: 0, treasure_found_seed: 0, resilience_seed: 0,  swiftness_seed: 0} ; 2500];

    history_account.total_hunts = 0;
    history_account.total_explorers = 0;
    history_account.total_gear_burned = 0;
    history_account.total_per = [0; 17];
    history_account.write_ind = 0;
    history_account.history_arr =  [HistoryRow { hunt_id: 0, winner: 0, loser: 0, loser_gear: 0, winner_gear: 0, transfer: crate::FALSE, treasure_id: 0}; MAX_HISTORY_ROWS];

    Ok(())
}
