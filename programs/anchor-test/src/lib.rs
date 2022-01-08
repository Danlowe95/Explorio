use anchor_lang::prelude::*;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("69v7eiACV758WzGopNQN8s5WRG5TcTSF4nexNP8F5p7d");

struct MintInfo{
    id: u8,
    mint_type: &'static str,
    mint: &'static str,
}
const MINTS: [MintInfo; 3] = [
    MintInfo{ id: 1, mint_type: "GEAR", mint: "EWWFTfiHWkSUDkNWvU4u7PuxCLAL2bEki57aLw9iVzzW"},
    MintInfo{ id: 2, mint_type: "POTION", mint: "2sHzUbXC5V6r4sn1RYFsK2Ui1rEckUFHBWLKt6SA3tqr"},
    MintInfo{ id: 3, mint_type: "GRAIL", mint: "TBD"},

];

struct MintAuth {
    seed: &'static [u8], 
}
const MINT_AUTH: MintAuth = MintAuth{seed: b"mint_auth"};


#[error]
pub enum ErrorCode {
    #[msg("Bad mint provided.")]
    BadMintProvided,
    #[msg("Claim is not possible yet as the Explorer has not hunted.")]
    HasNotHunted,
    #[msg("The program has already been initialized.")]
    AlreadyInitialized,
    #[msg("State array is too full to add.")]
    StateArrFull,
    #[msg("Bad bump provided.")]
    BadBumpProvided,
    #[msg("An incorrect array index was fed through processing.")]
    IncorrectIndexFed,
    #[msg("An impossible value was fed through getTreasureType.")]
    ImpossibleTreasureValue,
    #[msg("Randomness has not been generated ahead of processing.")]
    RandomnessNotGenerated,
    #[msg("Randomness has already been generated.")]

    RandomnessAlreadyGenerated
}

#[program]
mod anchor_test {
    use super::*;

    pub fn initialize_program(
        ctx: Context<InitializeProgram>,
        state_account_bump: u8,
        program_ust_account_bump: u8,
    ) -> ProgramResult {
        instructions::initialize_program::handler(
            ctx, 
            state_account_bump, 
            program_ust_account_bump,
        )
    }   
    pub fn fetch_vrf(
        ctx: Context<FetchVrf>,
    ) -> ProgramResult {
        instructions::fetch_vrf::handler(ctx)
    }


    pub fn claim_hunt(
        ctx: Context<ClaimHunt>, 
        explorer_escrow_bump: u8, 
    ) -> ProgramResult {
        instructions::claim_hunt::handler(
            ctx,
            explorer_escrow_bump, 
        )
    }

    pub fn enter_hunt(
        ctx: Context<EnterHunt>,
        explorer_token_bump: u8,
        provided_potion: bool,
    ) -> ProgramResult {
        instructions::enter_hunt::handler(
            ctx,
            explorer_token_bump,
            provided_potion,
        )
    }
    
    pub fn process_hunt(ctx: Context<ProcessHunt>) -> ProgramResult {
        instructions::process_hunt::handler(ctx)
    }

}
