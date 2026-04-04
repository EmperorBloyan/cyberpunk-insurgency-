use bolt_lang::*;

// Use this valid Solana Public Key for your Game Component
declare_id!("EHZHVN8JjFdVJ7Ps3e6fX9kzQQDo7u8VT3mL5X4p9n7e");

#[component]
#[derive(Copy)]
pub struct Game {
    pub status: GameStatus,
    pub size_x: u8,
    pub size_y: u8,
    pub tick_next_slot: u64,
    pub players: [Player; 2],      // Support for 2 players
    pub cells: [GameCell; 128],    // 16x8 grid
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum GameStatus {
    Lobby,
    Playing,
    Finished,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default, PartialEq)]
pub struct Player {
    pub authority: Pubkey,
    pub health: u8,
    pub attack_power: u8,
    pub last_action_slot: u64,
    pub ready: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default, PartialEq)]
pub struct GameCell {
    pub kind: GameCellKind,
    pub owner: GameCellOwner,
    pub strength: u8,
    pub occupant: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum GameCellKind {
    Field,
    Forest,
    Mountain,
    City,
    Capital,
}

impl Default for GameCellKind {
    fn default() -> Self {
        GameCellKind::Field
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum GameCellOwner {
    Nobody,
    Player(u8),
}

impl Default for GameCellOwner {
    fn default() -> Self {
        GameCellOwner::Nobody
    }
}

// Helper methods for the systems to use
impl Game {
    pub fn get_cell(&self, x: u8, y: u8) -> Result<&GameCell> {
        let index = (y as usize) * (self.size_x as usize) + (x as usize);
        if index < self.cells.len() {
            Ok(&self.cells[index])
        } else {
            Err(GameError::InvalidStep.into()) 
        }
    }
}

#[error_code]
pub enum GameError {
    #[msg("The game status does not allow this action.")]
    StatusIsNotLobby,
    #[msg("The game is currently playing.")]
    StatusIsNotPlaying,
    #[msg("Action sent too quickly.")]
    ActionTooFast,
    #[msg("Invalid grid movement.")]
    InvalidStep,
}
