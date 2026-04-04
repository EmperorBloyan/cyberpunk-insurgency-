use bolt_lang::*;
use game::Game;
use game::GameStatus;
use game::GameError;
use game::Player;

declare_id!("3zMXokc8DYYAairrtAKZKPJZKHmWKRdj6G8bm8ZZVi9g");

#[system]
pub mod join {
    pub fn execute(ctx: Context<Components>, player_index: u8, join: bool) -> Result<Components> {
        let game = &mut ctx.accounts.game;
        let payer = ctx.accounts.authority.key();

        // 1. Status Check: Must be in Lobby to change players
        if game.status != GameStatus::Lobby {
            return Err(GameError::StatusIsNotLobby.into()); 
        }

        // Safety check for array bounds
        if player_index >= 2 {
            return Err(GameError::InvalidStep.into());
        }

        let player = &mut game.players[player_index as usize];

        // 2. Join Logic
        if join {
            // Check if slot is already taken by someone else
            if player.authority != Pubkey::default() && player.authority != payer {
                return Err(GameError::PlayerAlreadyJoined.into());
            }
            
            player.authority = payer;
            player.ready = true;
            player.health = 100;
            player.attack_power = 10;
            player.last_action_slot = Clock::get()?.slot;
        } 
        // 3. Leave Logic
        else {
            if player.authority != payer {
                return Err(GameError::PlayerIsNotPayer.into());
            }
            player.authority = Pubkey::default();
            player.ready = false;
        }

        Ok(ctx.accounts)
    }

    #[system_input]
    pub struct Components {
        pub game: Game,
        pub authority: Signer,
    }
}
