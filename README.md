# TWUSD Protocol Interface (TheUSDOXWrappedDollarEVM)

## Overview
This is the official decentralized interface (dApp) for TWUSD, an algorithmic, over-collateralized stablecoin on the Ethereum Mainnet. The interface allows users to mint TWUSD against ETH collateral, view real-time Chainlink Oracle feeds, and utilize Gemini AI for risk assessment.

**Contract Address**: `0x7BeB51807E3c8BdB10A2868bD51c2D9E1764925D`

## Features

### Mint & Redeem
Seamless interface to swap ETH for TWUSD using Wagmi v2 hooks.

### Real-Time Oracles
Live price tickers for ETH, USDT, USDC, DAI, and WBTC using Chainlink Data Feeds.

### AI Integration
Powered by Google Gemini API to provide:
- **Risk Analysis**: Automated safety checks before minting (Liquidation risk assessment)
- **Market Pulse**: Generative AI market sentiment reports

### Wallet Connect
Integrated via Reown AppKit (formerly WalletConnect) for broad wallet support.

### Design
"Glass Black" aesthetic with Tailwind CSS, utilizing backdrop-blur, gradients, and Lucide React icons.

## Getting Started

### Prerequisites
- Node.js v18+
- A [Reown Cloud](https://cloud.reown.com/) Project ID (for WalletConnect)
- A [Google Gemini API Key](https://aistudio.google.com/)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/VKATHUSHAN/twusd-DApp.git
cd twusd-DApp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file and add your configuration:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```
VITE_REOWN_PROJECT_ID=your_project_id_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```


## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

Build the application for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript (Vite)
- **Styling**: Tailwind CSS v3 (Mobile-first, Utility-heavy)
- **Web3 State**: Wagmi v2 (`wagmi`, `@wagmi/core`)
- **Wallet Connection**: Reown AppKit (`@reown/appkit`, `@reown/appkit-adapter-wagmi`)
- **Blockchain Utils**: Viem (for parsing/formatting Ether and BigInt)
- **AI Integration**: Google Gemini API (REST Implementation)
- **Icons**: Lucide React

## Chainlink Oracle Reference

The dApp uses the following Ethereum Mainnet Chainlink price feed proxy addresses:

- **ETH / USD**: `0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419`
- **USDT / USD**: `0x3E7d1eA120853503B13C9b7879eA2e153eE2e32D`
- **USDC / USD**: `0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6`
- **DAI / USD**: `0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9`
- **WBTC / USD**: `0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c`

## Contract Interface

The dApp interacts with the TWUSD smart contract deployed at `0x7BeB51807E3c8BdB10A2868bD51c2D9E1764925D` with the following functions:

### Mint Function (Payable)
```solidity
function mint() external payable
```
Mints TWUSD tokens in exchange for ETH sent with the transaction.

### Redeem Function
```solidity
function redeem(uint256 amount) external
```
Redeems TWUSD tokens back to ETH.

### Read Functions
- `balanceOf(address account)`: Returns the TWUSD balance of an account
- `totalSupply()`: Returns the total supply of TWUSD tokens

## Project Structure

```
twusd-DApp/
├── src/
│   ├── config/
│   │   ├── contract.ts      # Contract ABI and address
│   │   └── web3.tsx         # Web3 configuration (Wagmi, Reown)
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles with Tailwind
├── public/                  # Static assets
├── .env.example             # Environment variables template
├── tailwind.config.js       # Tailwind CSS configuration
├── vite.config.ts           # Vite configuration
└── package.json             # Project dependencies
```

## Usage

1. **Connect Wallet**: Click the wallet connection button to connect your Ethereum wallet
2. **View Balances**: See your ETH balance, TWUSD balance, and total TWUSD supply
3. **Mint TWUSD**: 
   - Enter the amount of ETH you want to deposit
   - Click "Mint TWUSD" to convert ETH to TWUSD
4. **Redeem TWUSD**:
   - Enter the amount of TWUSD you want to redeem
   - Click "Redeem TWUSD" to convert TWUSD back to ETH

## Design System ("Glass Black")

The UI follows these design principles:

- **Backgrounds**: Deep dark backgrounds (`bg-[#020617]`) with ambient gradients (`bg-blue-900/20 blur-[120px]`)
- **Glassmorphism**: Components use semi-transparent backgrounds with borders:
  - Standard Card: `bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl`
  - Hover State: `hover:bg-white/10 hover:border-cyan-500/30 transition-all`
- **Typography**: Sans-serif (Inter). Headings are font-black, uppercase, and tracking-tighter
- **Color Palette**:
  - Primary: Cyan (`text-cyan-400`, `bg-cyan-500`)
  - Secondary: Indigo/Blue (`text-indigo-400`)
  - Success: Emerald (`text-emerald-400`)
  - Text: `text-white` (primary), `text-slate-400` (secondary/muted)
- **Animations**: Tailwind `animate-pulse` for loading states and `group-hover` for interactive elements

## Web3 & Contract Logic

- **BigInt Mandate**: All token values use BigInt, never standard JavaScript Number
  - Input: Use `parseEther(amount)` from viem to convert user string input to Wei
  - Output: Use `formatEther(balance)` to display values
- **Wagmi v2 Syntax**:
  - Use `useWriteContract` for transactions
  - Use `useReadContract` for fetching data
- **Error Handling**: All contract interactions wrapped in try/catch blocks with user feedback via UI status messages (Pending → Success/Error)

## License

MIT License - see LICENSE file for details
