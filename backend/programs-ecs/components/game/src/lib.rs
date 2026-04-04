use bolt_lang::*;

// Valid Solana Public Key for the Game Component
declare_id!("EHZHVN8JjFdVJ7Ps3e6fX9kzQQDo7u8VT3mL5X4p9n7e");

// ---------------------------------------------------------
// 1. GLOBAL COMPONENTS (The "Ghost" / Persistent Feature)
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
// 2. MATCH COMPONENTS (The Game State)
// ---------------------------------------------------------

#[component]
#[derive(Copy)]
pub struct Game {
    pub status: GameStatus,
    pub size_x: u8,
    pub size_y: u8,
    pub tick_next_slot: u64,
    pub players: [Player; 2],
    pub cells: [GameCell; 128],
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum GameStatus { Lobby, Playing, Finished }

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
pub enum GameCellKind { Field, Forest, Mountain, City, Capital }

impl Default for GameCellKind { fn default() -> Self { GameCellKind::Field } }

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum GameCellOwner { Nobody, Player(u8) }

impl Default for GameCellOwner { fn default() -> Self { GameCellOwner::Nobody } }

// ---------------------------------------------------------
// 3. COMPREHENSIVE ERROR DICTIONARY
// ---------------------------------------------------------

#[error_code]
pub enum GameError {
    #[msg("The game is not in the Lobby state.")]
    StatusIsNotLobby,
    #[msg("The game has not started yet.")]
    StatusIsNotPlaying,
    #[msg("You have already joined this game.")]
    PlayerAlreadyJoined,
    #[msg("You are not authorized to control this player.")]
    PlayerIsNotPayer,
    #[msg("Neural link cooling down. Action sent too fast.")]
    ActionTooFast,
    #[msg("You do not own the source cell.")]
    CellIsNotOwnedByPlayer,
    #[msg("Target cell is a mountain and cannot be crossed.")]
    CellIsNotWalkable,
    #[msg("Not enough strength in the source cell to move.")]
    CellStrengthIsInsufficient,
    #[msg("Cells must be directly adjacent.")]
    CellsAreNotAdjacent,
    #[msg("Invalid grid coordinates provided.")]
    InvalidStep,
}
