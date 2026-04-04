use bolt_lang::*;
use crate::*;

#[system]
pub struct Generate {
    pub fn execute(ctx: Context<Components>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        game.status = GameStatus::Lobby;
        game.size_x = 16;
        game.size_y = 8;
        // Initialize the grid as fields
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
