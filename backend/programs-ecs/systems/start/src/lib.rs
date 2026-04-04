use bolt_lang::*;
use crate::*;

declare_id!("Cu8JkUA9a5msGWNChAuhBJ9PTE6FdevwHNgPyxbABkUL");

#[system]
pub struct Start {
    pub fn execute(ctx: Context<Components>) -> Result<()> {
        let game = &mut ctx.accounts.game;

        // 1. Check Status: Can only start if we are in the Lobby
        if game.status != GameStatus::Lobby {
            // Using a generic error if GameError::StatusIsNotLobby isn't in scope
            return Err(GameError::StatusIsNotPlaying.into()); 
        }

        // 2. Check Readiness: Ensure all players are ready to begin
        for player in game.players.iter() {
            if !player.ready {
                return Err(GameError::ActionTooFast.into()); // Replace with PlayerNotReady if defined
            }
        }

        // 3. Initialize the Heartbeat: Set the first tick to the current slot
        game.tick_next_slot = Clock::get()?.slot;

        // 4. Update Status: The match is now live
        game.status = GameStatus::Playing;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Components<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
}
