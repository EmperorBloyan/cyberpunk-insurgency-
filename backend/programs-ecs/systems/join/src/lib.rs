use bolt_lang::*;
use crate::*;

declare_id!("3zMXokc8DYYAairrtAKZKPJZKHmWKRdj6G8bm8ZZVi9g");

#[system]
pub struct Join {
    pub fn execute(ctx: Context<Components>, player_index: u8, join: bool) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let payer = ctx.accounts.authority.key();

        // 1. Status Check: Can only modify players while in the Lobby
        if game.status != GameStatus::Lobby {
            return Err(GameError::StatusIsNotPlaying.into()); 
        }

        let player = &mut game.players[player_index as usize];

        // 2. Join Logic
        if join {
            if player.ready {
                return Err(GameError::ActionTooFast.into()); // Player already joined
            }
            player.authority = payer;
            player.ready = true;
            player.health = 100;
            player.attack_power = 10;
        } 
        // 3. Leave Logic
        else {
            if player.authority != payer {
                return Err(GameError::ActionTooFast.into()); // Not your slot
            }
            player.authority = Pubkey::default();
            player.ready = false;
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Components<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    pub authority: Signer<'info>,
}
