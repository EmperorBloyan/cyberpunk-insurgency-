use bolt_lang::*;
use game::Game;
use game::GameStatus;
use game::Player;
use game::GameCell;
use game::GameCellKind;
use game::GameCellOwner;

declare_id!("C5iL81s4Fu6SnkQEfixFZpKPRQ32fqVizpotoLVTxA2n");

#[system]
pub mod generate {
    pub fn execute(ctx: Context<Components>) -> Result<Components> {
        let game = &mut ctx.accounts.game;

        // 1. Set initial match metadata
        game.status = GameStatus::Lobby;
        game.size_x = 16;
        game.size_y = 8;
        game.tick_next_slot = 0;

        // 2. Initialize Players (The "Missing Setup" Fix)
        // We set up empty slots for 2 players with default health and stats
        for i in 0..2 {
            game.players[i] = Player {
                authority: Pubkey::default(),
                health: 100,
                attack_power: 10,
                last_action_slot: 0,
                ready: false,
            };
        }

        // 3. Initialize the 128-cell grid (16x8 layout)
        for i in 0..128 {
            game.cells[i] = GameCell {
                kind: GameCellKind::Field,
                owner: GameCellOwner::Nobody,
                strength: 0,
                occupant: 0,
            };
        }

        // 4. Set Starting Positions (Optional but recommended)
        // Player 0 starts at the top-left (index 0)
        game.cells[0].owner = GameCellOwner::Player(0);
        game.cells[0].strength = 10;
        game.cells[0].kind = GameCellKind::Capital;

        // Player 1 starts at the bottom-right (index 127)
        game.cells[127].owner = GameCellOwner::Player(1);
        game.cells[127].strength = 10;
        game.cells[127].kind = GameCellKind::Capital;

        Ok(ctx.accounts)
    }

    #[system_input]
    pub struct Components {
        pub game: Game,
    }
}
