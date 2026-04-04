use bolt_lang::*;
use crate::*;

declare_id!("HBdGPJycpHjjJ149T3RQGtQWjSC39MVpcKYF6JJvaF6e");

#[system]
pub struct Finish {
    pub fn execute(ctx: Context<Components>, player_index: u8) -> Result<()> {
        let game = &mut ctx.accounts.game;

        // 1. Status Check: Can only finish if the game is currently live
        if game.status != GameStatus::Playing {
            return Err(GameError::StatusIsNotPlaying.into());
        }

        // 2. Win Condition Logic: 
        // We assume the player wins if no other player owns any cells on the 16x8 grid.
        let mut anyone_else_exists = false;

        for i in 0..128 {
            let cell = &game.cells[i];
            match cell.owner {
                GameCellOwner::Player(owner_idx) => {
                    if owner_idx != player_index {
                        anyone_else_exists = true;
                        break; // Stop early to save Compute Units (CU)
                    }
                },
                GameCellOwner::Nobody => {}
            }
        }

        // 3. Mark Finish: If no other owners were found, the match ends
        if !anyone_else_exists {
            game.status = GameStatus::Finished;
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Components<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
}
