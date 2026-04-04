# Blitz Brawler: Shadow Arena

**Real-Time Onchain Arena with Autonomous "Ghost" Replays**  
Built for the MagicBlock Hackathon using BOLT ECS + Ephemeral Rollups + Cranks + VRF.

## 🎮 The Wow Factor
You fight the **exact recorded moves** of the previous winner (Ghost). The blockchain remembers and replays human skill autonomously via Cranks. Always someone to fight — even if you're alone in the lobby.

## 🚀 Quick Start (5-10 minutes)

### 1. Clone & Setup Backend (BOLT Program)
```bash
git clone https://github.com/YOURUSERNAME/blitz-brawler-shadow-arena.git
cd blitz-brawler-shadow-arena

# Install tools
cargo install bolt-cli
rustup update nightly
npm install -g @coral-xyz/anchor

# Create the BOLT project (or use the folders already in this repo)
bolt init programs-ecscd ../frontend
npm install
npm run devblitz-brawler-shadow-arena/
├── programs-ecs/               # BOLT Rust backend
│   ├── components/             # Position, Health, InputHistory, Ghost, Arena
│   ├── systems/                # player_input, ghost_replay, ring_shrink, etc.
│   ├── Anchor.toml
│   └── Cargo.toml
├── frontend/                   # React + Phaser web app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── arena/page.tsx  # Main game
│   │   │   └── leaderboard/page.tsx
│   │   ├── components/
│   │   │   ├── GameCanvas.tsx
│   │   │   └── WalletConnect.tsx
│   │   └── lib/solana.ts       # Delegation + ER connection
├── README.md                   # ← You are here
└── .env.example