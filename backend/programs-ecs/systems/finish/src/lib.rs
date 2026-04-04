use bolt_lang::*;
use game::Game;
use game::GameStatus;
use game::GameError;
use game::GameCellOwner;

declare_id!("HBdGPJycpHjjJ149T3RQGtQWjSC39MVpcKYF6JJvaF6e");

#[system]
pub mod finish {
    pub fn execute(ctx: Context<Components>, player_index: u8) -> Result<Components> {
        let game = &mut ctx.accounts.game;

        // 1. Status Check: Only a live game can be finished
        if game.status != GameStatus::Playing {
            return Err(GameError::StatusIsNotPlaying.into());
        }

        // 2. Win Condition Logic
        // We verify two things:
        // a) Does the current player own at least one cell?
        // b) Does any OTHER player own any cells?
        let mut player_owns_cells = false;
        let mut rival_owns_cells = false;

        for i in 0..128 {
            let cell = &game.cells[i];
            match cell.owner {
                GameCellOwner::Player(owner_idx) => {
                    if owner_idx == player_index {
                        player_owns_cells = true;
                    } else {
                        rival_owns_cells = true;
                    }
                },
                GameCellOwner::Nobody => {}
            }
            // Optimization: If we've found both a cell for the player and a rival, 
            // the game is definitely NOT over.
            if player_owns_cells && rival_owns_cells {
                break;
            }
        }

        // 3. Mark Finish: Only end the game if the player exists and rivals are gone
        if player_owns_cells && !rival_owns_cells {
            game.status = GameStatus::Finished;
        }

        // Return the updated component state
        Ok(ctx.accounts)
    }

    #[system_input]
    pub struct Components {
        pub game: Game,
    }
}
