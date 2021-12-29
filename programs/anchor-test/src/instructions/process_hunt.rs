use anchor_lang::prelude::*;


#[derive(Accounts)]
pub struct ProcessHunt<'info> {
    // confirm owner is the program's upgrade authority
    // #[account(constraint = owner.key == *owner.key)]
    // pub owner: Account<'info>,
    pub user: Signer<'info>,
    // the associated account which will receive the user's explorer
    // #[account(mut)]
    // pub user_explorer_account: Account<'info>,

    // #[account(
    //     mut,
    //     seeds = [user.key().as_ref()],
    //     bump = escrowed_explorer_token_bump, 
    // )]
    // pub explorer_escrow_account: Account<'info>,

    // #[account(mut, constraint = *user.key == locked_explorer_data.user)]
    // pub locked_explorer_data: Account<'info, LockedExplorerData>,
    // needs the user (Signer) confirmed to be protocol owner, possibly rent/sysprogram, 
    // and possibly all accounts being modified by the protocol itself (all explorer accounts - this would be impossible?)
    
}


// Run the hunt - only owner can run it for now
pub fn processHunt(ctx: Context<ProcessHunt>) -> ProgramResult {
    // Get NFT data from all supplied accounts.

    // let locked_explorer_data = &mut ctx.accounts.locked_explorer_data;
    // locked_explorer_data.is_locked = false;

    // fake hunt processing by unlocking

    // release to users
    Ok(())

}