use bolt_lang::*;
use crate::*;

// Ensure this matches the ID in your bolt.toml for the generate system
declare_id!("C5iL81s4Fu6SnkQEfixFZpKPRQ32fqVizpotoLVTxA2n");

#[system]
pub struct Generate {
    pub fn execute(ctx: Context<Components>) -> Result<()> {
        let game = &mut ctx.accounts.game;

        // 1. Set initial match metadata
        game.status = GameStatus::Lobby;
        game.size_x = 16;
        game.size_y = 8;

        // 2. Initialize the 128-cell grid (16x8 layout)
        for i in 0..128 {
            game.cells[i] = GameCell {
                kind: GameCellKind::Field,
                owner: GameCellOwner::Nobody,
                strength: 0,
                occupant: 0,
            };
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Components<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
}
