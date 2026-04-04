use bolt_lang::*;
use crate::components::{GridCell, PowerUp, Position};

#[system]
pub mod powerup_spawn {
    pub fn execute(ctx: Context<Components>, tick: u64) -> Result<()> {
        // 1. CHOOSE FREQUENCY
        // Spawn a power-up every 20 ticks (approx every 20 seconds)
        if tick % 20 != 0 {
            return Ok(());
        }

        // 2. VRF INTEGRATION (Verifiable Randomness)
        // Bolt provides a 'rng' helper that uses the onchain VRF seed.
        // This ensures players can't predict where the loot drops.
        let random_x = ctx.rng().gen_range(0..10); // Assuming 10x10 grid
        let random_y = ctx.rng().gen_range(0..10);
        let loot_type = ctx.rng().gen_range(0..2); // 0 = Health, 1 = Attack Boost

        // 3. SELECTION LOGIC
        // We find the component at the random coordinates
        let mut cell = ctx.components.grid_cell.get_mut(random_x, random_y)?;
        
        // If the cell is empty, drop the loot
        if cell.occupant.is_none() {
            cell.occupant = Some(match loot_type {
                0 => PowerUpType::HealthPack,
                _ => PowerUpType::AttackBoost,
            });
            
            bolt_log!("🎁 Loot dropped at [{}, {}]!", random_x, random_y);
        }

        Ok(())
    }
}

#[derive(BoltComponent)]
pub struct PowerUp {
    pub power_up_type: PowerUpType,
    pub value: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum PowerUpType {
    HealthPack,
    AttackBoost,
}
