use bolt_lang::*;

// REGISTER THE SYSTEMS
pub mod powerup_spawn;
pub mod shadow_record;
pub mod match_cleanup;

declare_id!("HE8f4rE5s1oW4tS2vE1rS8iOn1D");

#[program]
pub mod movement {
    use super::*;

    pub fn initialize_game(ctx: Context<InitializeGame>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        game.status = GameStatus::Lobby;
        game.size_x = 16;
        game.size_y = 8;
        // Initialize default player stats
        for player in game.players.iter_mut() {
            player.health = 100;
            player.attack_power = 10;
        }
        Ok(())
    }
}

// ---------------------------------------------------------
// 1. GLOBAL COMPONENTS (Persistent)
// ---------------------------------------------------------

#[component]
pub struct ChampionShadow {
    pub authority: Pubkey,
    pub moves: [u8; 256],      
    pub total_moves: u32,
    pub win_count: u32,
    pub timestamp: i64,
}

// ---------------------------------------------------------
// 2. MATCH COMPONENTS (Ephemeral)
// ---------------------------------------------------------

#[component]
pub struct Game {
    pub status: GameStatus,
    pub size_x: u8,
    pub size_y: u8,
    pub players: [GamePlayer; 2],
    pub cells: [GameCell; 128], 
    pub tick_next_slot: u64,    
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum GameStatus {
    Generate,
    Lobby,
    Playing,
    Finished,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Default)]
pub struct GamePlayer {
    pub ready: bool,
    pub authority: Pubkey,
    pub health: u8,
    pub attack_power: u8,
    pub last_action_slot: u64, 
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub struct GameCell {
    pub kind: GameCellKind,
    pub owner: GameCellOwner,
    pub strength: u8,
    pub occupant: u8, // 0: None, 1: Health, 2: Attack
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum GameCellKind { Field, City, Capital, Mountain, Forest }

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum GameCellOwner { Player(u8), Nobody }

// ---------------------------------------------------------
// 3. INITIALIZATION & CONTEXTS
// ---------------------------------------------------------

#[derive(Accounts)]
pub struct InitializeGame<'info> {
    #[account(init, payer = payer, space = Game::size())]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum GameError {
    #[msg("The game status is not currently set to Playing.")]
    StatusIsNotPlaying,
    #[msg("Action too fast! Neural link cooling down.")]
    ActionTooFast,
}
