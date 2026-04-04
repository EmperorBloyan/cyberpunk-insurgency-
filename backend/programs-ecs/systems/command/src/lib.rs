use bolt_lang::*;
use crate::*;

declare_id!("YGKbhp7S1cCvvheyQ8rcuECKUR1SVpKpHjnqCqdP1cm");

#[system]
pub struct Command {
    pub fn execute(
        ctx: Context<Components>, 
        player_index: u8,
        source_idx: u8,
        target_idx: u8,
        strength_percent: u8
    ) -> Result<()> {
        let game = &mut ctx.accounts.game;

        // 1. Status Check
        if game.status != GameStatus::Playing {
            return Err(GameError::StatusIsNotPlaying.into());
        }

        // 2. Authority Check
        let payer = ctx.accounts.authority.key();
        let player = &mut game.players[player_index as usize];
        if player.authority != payer {
            return Err(GameError::ActionTooFast.into()); // Unauthorized
        }

        // 3. Adjacency Logic (Converting flat index to XY for math)
        let src_x = source_idx % 16;
        let src_y = source_idx / 16;
        let tgt_x = target_idx % 16;
        let tgt_y = target_idx / 16;

        let dist = (src_x as i32 - tgt_x as i32).abs() + (src_y as i32 - tgt_y as i32).abs();
        if dist != 1 {
            return Err(GameError::ActionTooFast.into()); // Not adjacent
        }

        // 4. Combat & Movement Math
        let source_cell = game.cells[source_idx as usize];
        let mut target_cell = game.cells[target_idx as usize];

        if source_cell.owner != GameCellOwner::Player(player_index) {
            return Err(GameError::ActionTooFast.into());
        }
        if target_cell.kind == GameCellKind::Mountain || source_cell.strength <= 1 {
            return Err(GameError::ActionTooFast.into());
        }

        let moved_strength = ((source_cell.strength as u32 - 1) * strength_percent as u32 / 100) as u8;

        // 5. Apply Results
        if target_cell.owner == GameCellOwner::Player(player_index) {
            // Reinforce friendly cell
            game.cells[target_idx as usize].strength = target_cell.strength.saturating_add(moved_strength);
            game.cells[source_idx as usize].strength = source_cell.strength - moved_strength;
        } else {
            // Attack enemy/neutral cell
            let damage = match target_cell.kind {
                GameCellKind::Forest => moved_strength / 2,
                _ => moved_strength,
            };

            if damage > target_cell.strength {
                // Conquest
                game.cells[target_idx as usize].owner = GameCellOwner::Player(player_index);
                game.cells[target_idx as usize].strength = damage - target_cell.strength;
            } else {
                // Defended
                game.cells[target_idx as usize].strength = target_cell.strength - damage;
            }
            game.cells[source_idx as usize].strength = source_cell.strength - moved_strength;
        }

        player.last_action_slot = Clock::get()?.slot;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Components<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    pub authority: Signer<'info>,
}
