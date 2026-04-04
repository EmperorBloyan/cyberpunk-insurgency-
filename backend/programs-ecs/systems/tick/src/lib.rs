use bolt_lang::*;
use game::Game;
use game::GameStatus;
use game::GameCellOwner;
use game::GameCellKind;

declare_id!("8tKAapRKPrNkxXwcArbSAnBHieYnX6M2WoTxukbCQtTa");

const TICKS_PER_SECOND: u64 = 20;

#[system]
pub mod tick {
    use super::*;

    pub fn execute(ctx: Context<Components>) -> Result<()> {
        let game = &mut ctx.accounts.game;

        // Can only trigger commands when the game is playing
        if game.status != GameStatus::Playing {
            return Ok(()); 
        }

        let mut processed_ticks = 0;
        let current_slot = Clock::get()?.slot;

        // Loop while the blockchain time is ahead of our game time
        while current_slot >= game.tick_next_slot {
            game.tick_next_slot = game.tick_next_slot.saturating_add(1);

            // Logic happens on 1-second intervals (multiples of TICKS_PER_SECOND)
            if game.tick_next_slot % TICKS_PER_SECOND != 0 {
                continue;
            }

            // Grid strength increment logic
            for i in 0..128 {
                let cell = &mut game.cells[i];
                if cell.owner != GameCellOwner::Nobody {
                    
                    // Capital: +1 strength every 5 seconds
                    if game.tick_next_slot % (TICKS_PER_SECOND * 5) == 0 
                        && cell.kind == GameCellKind::Capital {
                        cell.strength = cell.strength.saturating_add(1);
                    }
                    
                    // City: +1 strength every 10 seconds
                    if game.tick_next_slot % (TICKS_PER_SECOND * 10) == 0 
                        && cell.kind == GameCellKind::City {
                        cell.strength = cell.strength.saturating_add(1);
                    }
                    
                    // Field: +1 strength every 60 seconds
                    if game.tick_next_slot % (TICKS_PER_SECOND * 60) == 0 
                        && cell.kind == GameCellKind::Field {
                        cell.strength = cell.strength.saturating_add(1);
                    }
                }
            }

            // CU Safety: Prevent transaction timeout by limiting to 5 ticks per run
            processed_ticks += 1;
            if processed_ticks >= 5 {
                break;
            }
        }

        Ok(())
    }

    #[system_input]
    pub struct Components {
        pub game: Game,
    }
}