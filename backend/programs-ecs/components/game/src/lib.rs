use bolt_lang::*;

// REGISTER THE SYSTEMS
pub mod powerup_spawn;
pub mod shadow_record;

declare_id!("C5iL81s4Fu6SnkQEfixFZpKPRQ32fqVizpotoLVTxA2n");

// ---------------------------------------------------------
// 1. GLOBAL COMPONENTS (Persistent across matches)
// ---------------------------------------------------------

#[component(delegate)]
pub struct ChampionShadow {
    pub authority: Pubkey,
    pub moves: [u8; 256], // Move history (0:Up, 1:Down, 2:Left, 3:Right)
    pub total_moves: u32,
    pub win_count: u32,
    pub timestamp: i64,
}

// ---------------------------------------------------------
// 2. MATCH COMPONENTS (Deleted when game ends)
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
    pub health: u8,        // Added Health for Brawler mechanics
    pub attack_power: u8,  // Added for Power-Up scaling
    pub last_action_slot: u64,
}

#[component_deserialize]
#[derive(PartialEq)]
pub struct GameCell {
    pub kind: GameCellKind,
    pub owner: GameCellOwner,
    pub strength: u8,
    pub occupant: Option<u8>, // 0: HealthPack, 1: AttackBoost
}

#[component_deserialize]
#[derive(PartialEq)]
pub enum GameCellKind {
    Field,
    City,
    Capital,
    Mountain,
    Forest,
}

#[component_deserialize]
#[derive(PartialEq)]
pub enum GameCellOwner {
    Player(u8),
    Nobody,
}

// ---------------------------------------------------------
// 3. INITIALIZATION & UTILITIES
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

impl Game {
    pub fn compute_index(&self, x: u8, y: u8) -> Result<usize> {
        if x >= self.size_x || y >= self.size_y {
            return Err(GameError::CellIsOutOfBounds.into());
        }
        Ok(usize::from(y) * usize::from(self.size_x) + usize::from(x))
    }
}

#[error_code]
pub enum GameError {
    #[msg("The game status is not currently set to Playing.")]
    StatusIsNotPlaying,
    #[msg("The cell's position is out of bounds")]
    CellIsOutOfBounds,
    #[msg("The cell cannot be interacted with")]
    CellIsNotWalkable,
}
