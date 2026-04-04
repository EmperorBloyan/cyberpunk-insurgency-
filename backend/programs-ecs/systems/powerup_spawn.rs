use bolt_lang::*;
use crate::components::{Game, GameCell, GameStatus};

#[system]
pub mod powerup_spawn {
    pub fn execute(ctx: Context<Components>, tick: u64) -> Result<()> {
        let mut game = ctx.components.game.get_mut()?;

        // 1. CHOOSE FREQUENCY
        // Spawn loot every 20 ticks (roughly 20 seconds)
        if tick % 20 != 0 || game.status != GameStatus::Playing {
            return Ok(());
        }

        // 2. VRF INTEGRATION
        // ctx.rng() pulls the verified random seed from the Solana slot
        let random_index = ctx.rng().gen_range(0..128) as usize; 
        let loot_type = ctx.rng().gen_range(0..2) as u8; // 0: Health, 1: Attack

        // 3. SPAWN LOGIC
        let cell = &mut game.cells[random_index];

        // Only spawn if the cell is currently empty
        if cell.occupant.is_none() && cell.owner == GameCellOwner::Nobody {
            cell.occupant = Some(loot_type);
            bolt_log!("🎁 VRF Spawned Loot Type {} at Index {}", loot_type, random_index);
        }

        Ok(())
    }
}
