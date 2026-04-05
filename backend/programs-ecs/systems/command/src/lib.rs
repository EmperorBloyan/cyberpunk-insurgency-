use bolt_lang::*;
use game::Game;
use game::GameStatus;
use game::GameError;
use game::GameCellOwner;
use game::GameCellKind;

declare_id!("YGKbhp7S1cCvvheyQ8rcuECKUR1SVpKpHjnqCqdP1cm");

#[system]
pub mod command {
    pub fn execute(
        ctx: Context<Components>, 
        player_index: u8,
        source_idx: u8,
        target_idx: u8,
        strength_percent: u8
    ) -> Result<Components> {
        let game = &mut ctx.accounts.game;

        // 1. Status Check
        if game.status != GameStatus::Playing {
            return Err(GameError::StatusIsNotPlaying.into());
        }

        // 2. Authority Check
        let payer = ctx.accounts.authority.key();
        let player = &mut game.players[player_index as usize];
        if player.authority != payer {
            return Err(GameError::PlayerIsNotPayer.into());
        }

        // 3. Dynamic Adjacency Logic (Using game.size_x instead of hardcoded 16)
        let width = game.size_x as u8;
        let src_x = source_idx % width;
        let src_y = source_idx / width;
        let tgt_x = target_idx % width;
        let tgt_y = target_idx / width;

        let dist = (src_x as i32 - tgt_x as i32).abs() + (src_y as i32 - tgt_y as i32).abs();
        if dist != 1 {
            return Err(GameError::CellsAreNotAdjacent.into());
        }

        // 4. Combat & Movement Logic
        let source_cell = game.cells[source_idx as usize];
        let mut target_cell = game.cells[target_idx as usize];

        if source_cell.owner != GameCellOwner::Player(player_index) {
            return Err(GameError::CellIsNotOwnedByPlayer.into());
        }
        if target_cell.kind == GameCellKind::Mountain || source_cell.strength <= 1 {
            return Err(GameError::CellIsNotWalkable.into());
        }

        // Calculate strength to move
        let moved_strength = ((source_cell.strength as u32 - 1) * strength_percent as u32 / 100) as u8;

        // 5. Apply Results to Grid
        if target_cell.owner == GameCellOwner::Player(player_index) {
            // Reinforce friendly cell
            game.cells[target_idx as usize].strength = target_cell.strength.saturating_add(moved_strength);
        } else {
            // Attack enemy/neutral cell
            let damage = match target_cell.kind {
                GameCellKind::Forest => moved_strength / 2, // Forest defense bonus
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
        }
        
        // Remove strength from source
        game.cells[source_idx as usize].strength -= moved_strength;

        // Update player cooldown
        player.last_action_slot = Clock::get()?.slot;

Ok(ctx.accounts)  // ✅ Correct indentation
    }

    #[system_input]
    pub struct Components {
        pub game: Game,
        pub authority: Signer,  // ✅ ADD THIS LINE
    }
}