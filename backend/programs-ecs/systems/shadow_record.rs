use bolt_lang::*;
use crate::components::{Game, GameStatus, ChampionShadow};

#[system]
pub mod shadow_record {
    pub fn execute(ctx: Context<Components>) -> Result<()> {
        let game = &ctx.components.game;
        
        // 1. Only record if the game just finished
        if game.status != GameStatus::Finished {
            return Ok(());
        }

        // 2. Identify the winner (Player 0 is Human, Player 1 is Ghost)
        // Logic: If Human health > 0 and Ghost health == 0, Human is the new Champ
        let winner_index = if game.players[0].strength > 0 { 0 } else { 1 };
        
        // 3. Update the Global Champion if a Human won
        if winner_index == 0 {
            let mut champ = ctx.components.champion_shadow.get_mut()?;
            let human = &game.players[0];

            champ.authority = human.authority;
            // In a real build, you'd copy the move history buffer here
            champ.win_count += 1;
            
            bolt_log!("🏆 NEW CHAMPION RECORDED: {:?}", human.authority);
        }

        Ok(())
    }
}
