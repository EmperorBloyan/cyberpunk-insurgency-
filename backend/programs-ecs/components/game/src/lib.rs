use bolt_lang::*;

// REGISTER THE SYSTEMS
pub mod powerup_spawn;
pub mod shadow_record;
pub mod match_cleanup;

declare_id!("C5iL81s4Fu6SnkQEfixFZpKPRQ32fqVizpotoLVTxA2n");

// ---------------------------------------------------------
// 1. GLOBAL COMPONENTS (Persistent Across Matches)
// ---------------------------------------------------------

#[component(delegate)]
pub struct ChampionShadow {
    pub authority: Pubkey,
    pub moves: [u8; 256],      // Recorded move history
    pub total_moves: u32,
    pub win_count: u32,
    pub timestamp: i64,
}

// ---------------------------------------------------------
// 2. MATCH COMPONENTS (Ephemeral/Temporary)
// ---------------------------------------------------------

#[component(delegate)]
pub struct Game {
    pub status: GameStatus,
    pub size_x: u8,
    pub size_y: u8,
    pub players: [GamePlayer; 2],
    pub cells: [GameCell; 128], 
    pub tick_next_slot: u64,    
}

#[component_deserialize]
#[derive(PartialEq)]
pub enum GameStatus {
    Generate,
    Lobby,
    Playing,
    Finished,
}

#[component_deserialize]
#[derive(PartialEq, Default)]
pub struct GamePlayer {
    pub ready: bool,
    pub authority: Pubkey,
    pub health: u8,
    pub attack_power: u8,
    pub last_action_slot: u64, // Used for Rate Limiting
}

#[component_deserialize]
#[derive(PartialEq)]
pub struct GameCell {
    pub kind: GameCellKind,
    pub owner: GameCellOwner,
    pub strength: u8,
    pub occupant: Option<u8>, // 0: Health, 1: Attack
}

#[component_deserialize]
#[derive(PartialEq)]
pub enum GameCellKind { Field, City, Capital, Mountain, Forest }

#[component_deserialize]
#[derive(PartialEq)]
pub enum GameCellOwner { Player(u8), Nobody }

// ---------------------------------------------------------
// 3. LOGIC & ERROR HANDLING
// ---------------------------------------------------------

impl Game {
    /// Applies rate limiting to player actions
    pub fn validate_move_timing(&mut self, player_index: usize) -> Result<()> {
        let current_slot = Clock::get()?.slot;
        let player = &mut self.players[player_index];

        // 2-slot cooldown (Anti-Spam Shield)
        if current_slot - player.last_action_slot < 2 {
            return Err(GameError::ActionTooFast.into());
        }

        player.last_action_slot = current_slot;
        Ok(())
    }
}

#[error_code]
pub enum GameError {
    #[msg("The game status is not currently set to Playing.")]
    StatusIsNotPlaying,
    #[msg("The cell's position is out of bounds")]
    CellIsOutOfBounds,
    #[msg("Action too fast! Neural link cooling down.")]
    ActionTooFast,
    #[msg("Only the winner or the arena authority can close this match.")]
    UnauthorizedClosing,
}

// ---------------------------------------------------------
// 4. INITIALIZATION DEFAULTS
// ---------------------------------------------------------

impl Default for Game {
    fn default() -> Self {
        Self::new(GameInit {
            status: GameStatus::Generate,
            size_x: 16,
            size_y: 8,
            players: [
                GamePlayer { health: 100, attack_power: 10, ..Default::default() },
                GamePlayer { health: 100, attack_power: 10, ..Default::default() }
            ],
            cells: [GameCell::field(); 128],
            tick_next_slot: 0,
        })
    }
}

impl GameCell {
    pub fn field() -> GameCell {
        GameCell {
            kind: GameCellKind::Field,
            owner: GameCellOwner::Nobody,
            strength: 0,
            occupant: None,
        }
    }
}
