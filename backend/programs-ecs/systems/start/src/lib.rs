use bolt_lang::*;
use game::Game;
use game::GameStatus;
use game::GameError;

declare_id!("Cu8JkUA9a5msGWNChAuhBJ9PTE6FdevwHNgPyxbABkUL");

#[system]
pub mod start {
    pub fn execute(ctx: Context<Components>) -> Result<Components> {
        let game = &mut ctx.accounts.game;

        // 1. Correct Status Check: Must be in Lobby to start
        if game.status != GameStatus::Lobby {
            return Err(GameError::StatusIsNotLobby.into());
        }

        // 2. Player Readiness Check
        for player in game.players.iter() {
            if player.authority != Pubkey::default() && !player.ready {
                // If a player has joined but isn't marked as ready
                return Err(GameError::ActionTooFast.into()); 
            }
        }

        // 3. Initialize the Heartbeat
        game.tick_next_slot = Clock::get()?.slot;

        // 4. Update Status to Live
        game.status = GameStatus::Playing;

        // BOLT systems must return the updated components
        Ok(ctx.accounts)
    }

    #[system_input]
    pub struct Components {
        pub game: Game,
    }
}
