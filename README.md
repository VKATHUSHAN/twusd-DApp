# TWUSD Stablecoin dApp

A decentralized application (dApp) for the TWUSD stablecoin on Ethereum Mainnet. This application allows users to mint TWUSD tokens by depositing ETH and redeem their TWUSD tokens back to ETH.

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3 with glassmorphism dark theme
- **Web3 Integration**: 
  - Wagmi v2 for React hooks
  - Viem for BigInt/ETH conversions
  - Reown AppKit for wallet connection
- **Icons**: lucide-react

## Features

- **Wallet Connection**: Connect your Ethereum wallet using Reown AppKit
- **Mint TWUSD**: Deposit ETH to mint TWUSD stablecoin tokens
- **Redeem TWUSD**: Redeem your TWUSD tokens back to ETH
- **Real-time Balances**: View your ETH and TWUSD balances
- **Total Supply**: Monitor the total supply of TWUSD tokens
- **Mobile-First Design**: Responsive layout optimized for all devices
- **Glassmorphism UI**: Modern dark theme with glassmorphism effects

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Reown (formerly WalletConnect) Project ID

## Setup

1. Clone the repository:
```bash
git clone https://github.com/VKATHUSHAN/twusd-DApp.git
cd twusd-DApp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file and add your Reown Project ID:
```bash
cp .env.example .env
```

Edit `.env` and add your project ID from https://cloud.reown.com:
```
VITE_REOWN_PROJECT_ID=your_project_id_here
```

4. Update the contract address in `src/config/contract.ts`:
```typescript
export const TWUSD_CONTRACT_ADDRESS = "0xYourContractAddress" as const;
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

## Contract Interface

The dApp interacts with a TWUSD smart contract with the following primary functions:

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

## License

MIT License - see LICENSE file for details
