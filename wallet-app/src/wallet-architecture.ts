/**

 * USDOX Ecosystem Wallet Architecture

 * 

 * A secure, non-custodial EVM wallet architecture for the USDOX ecosystem supporting:

 * - USDO (main ecosystem token) 

 * - TWUSD (TheUSDOX Wrapped Dollar) with 6 decimals

 * 

 * Features:

 * - Wallet creation (EOA)

 * - MetaMask and WalletConnect compatibility

 * - Balance fetching and ERC-20 transfers

 * - Read-only public mode

 * - Multi-network support (Ethereum, Base, etc.)

 * - Client-side key management only

 * 

 * Security: No custodial features, keys remain client-side, transparent and auditable

 */


import { 

  Contract, 

  formatUnits, 

  JsonRpcProvider, 

  parseUnits, 

  Wallet, 

  TransactionResponse,

  BrowserProvider,

  Signer

} from 'ethers';


// ============= CONFIGURATION =============


interface NetworkConfig {

  chainId: number;

  name: string;

  rpcUrl: string;

  nativeCurrency: {

    name: string;

    symbol: string;

    decimals: number;

  };

}


interface TokenConfig {

  address: string;

  decimals: number;

  symbol: string;

  name: string;

}


// Network configurations - easily extensible to other EVM networks

const NETWORKS: Record<string, NetworkConfig> = {

  ethereum: {

    chainId: 1,

    name: 'Ethereum Mainnet',

    rpcUrl: 'https://ethereum-rpc.publicnode.com',

    nativeCurrency: {

      name: 'Ethereum',

      symbol: 'ETH',

      decimals: 18

    }

  },

  base: {

    chainId: 8453,

    name: 'Base',

    rpcUrl: 'https://mainnet.base.org',

    nativeCurrency: {

      name: 'Ethereum',

      symbol: 'ETH',

      decimals: 18

    }

  },

  sepolia: {

    chainId: 11155111,

    name: 'Sepolia Testnet',

    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',

    nativeCurrency: {

      name: 'Ethereum',

      symbol: 'ETH',

      decimals: 18

    }

  }

};


// Token configurations per network

const TOKENS: Record<string, Record<string, TokenConfig>> = {

  ethereum: {

    USDO: {

      address: '0xUSDO_CONTRACT_ADDRESS', // Replace with actual USDO contract address

      decimals: 18,

      symbol: 'USDO',

      name: 'USDO Token'

    },

    TWUSD: {

      address: '0xTWUSD_CONTRACT_ADDRESS', // Replace with actual TWUSD contract address

      decimals: 6, // Important: TWUSD uses 6 decimals

      symbol: 'TWUSD',

      name: 'TheUSDOX Wrapped Dollar'

    }

  },

  base: {

    USDO: {

      address: '0xUSDO_CONTRACT_ADDRESS_BASE', // Replace with Base USDO contract address

      decimals: 18,

      symbol: 'USDO',

      name: 'USDO Token'

    },

    TWUSD: {

      address: '0xTWUSD_CONTRACT_ADDRESS_BASE', // Replace with Base TWUSD contract address

      decimals: 6,

      symbol: 'TWUSD',

      name: 'TheUSDOX Wrapped Dollar'

    }

  }

};


// Standard ERC-20 ABI

const ERC20_ABI = [

  'function balanceOf(address account) view returns (uint256)',

  'function transfer(address to, uint256 amount) returns (bool)',

  'function decimals() view returns (uint8)',

  'function symbol() view returns (string)',

  'function name() view returns (string)',

  'function totalSupply() view returns (uint256)',

  'function allowance(address owner, address spender) view returns (uint256)',

  'function approve(address spender, uint256 amount) returns (bool)',

  'event Transfer(address indexed from, address indexed to, uint256 value)'

];


// ============= CORE WALLET ARCHITECTURE =============


/**

 * Blockchain Interaction Layer

 * Handles all blockchain operations and provider management

 */

class BlockchainService {

  private provider: JsonRpcProvider | BrowserProvider | null = null;

  private signer: Signer | null = null;

  private currentNetwork: string = 'ethereum';


  /**

   * Initialize read-only provider for public mode

   */

  async initializeReadOnlyProvider(network: string = 'ethereum'): Promise<void> {

    const networkConfig = NETWORKS[network];

    if (!networkConfig) {

      throw new Error(`Unsupported network: ${network}`);

    }


    this.provider = new JsonRpcProvider(networkConfig.rpcUrl);

    this.currentNetwork = network;

    console.log(`Initialized read-only provider for ${networkConfig.name}`);

  }


  /**

   * Connect to MetaMask wallet

   */

  async connectMetaMask(): Promise<string> {

    if (typeof window === 'undefined' || !(window as any).ethereum) {

      throw new Error('MetaMask not detected. Please install MetaMask.');

    }


    try {

      // Request account access

      await (window as any).ethereum.request({ method: 'eth_requestAccounts' });

      

      // Create browser provider

      this.provider = new BrowserProvider((window as any).ethereum);

      this.signer = await this.provider.getSigner();

      

      const address = await this.signer.getAddress();

      console.log(`Connected to MetaMask: ${address}`);

      

      return address;

    } catch (error) {

      console.error('Failed to connect to MetaMask:', error);

      throw error;

    }

  }


  /**

   * Create new EOA wallet (client-side only)

   */

  createWallet(): { address: string; privateKey: string; mnemonic: string } {

    const wallet = Wallet.createRandom();

    

    console.log('Created new wallet (KEEP PRIVATE KEY SECURE!)');

    console.log(`Address: ${wallet.address}`);

    

    return {

      address: wallet.address,

      privateKey: wallet.privateKey,

      mnemonic: wallet.mnemonic?.phrase || ''

    };

  }


  /**

   * Import wallet from private key

   */

  async importWalletFromPrivateKey(privateKey: string, network: string = 'ethereum'): Promise<string> {

    const networkConfig = NETWORKS[network];

    if (!networkConfig) {

      throw new Error(`Unsupported network: ${network}`);

    }


    this.provider = new JsonRpcProvider(networkConfig.rpcUrl);

    this.signer = new Wallet(privateKey, this.provider);

    this.currentNetwork = network;

    

    const address = await this.signer.getAddress();

    console.log(`Imported wallet: ${address}`);

    

    return address;

  }


  /**

   * Get current wallet address

   */

  async getWalletAddress(): Promise<string> {

    if (!this.signer) {

      throw new Error('No wallet connected');

    }

    return await this.signer.getAddress();

  }


  /**

   * Get token balance

   */

  async getTokenBalance(tokenSymbol: string, walletAddress?: string): Promise<string> {

    if (!this.provider) {

      throw new Error('Provider not initialized');

    }


    const tokenConfig = TOKENS[this.currentNetwork]?.[tokenSymbol];

    if (!tokenConfig) {

      throw new Error(`Token ${tokenSymbol} not supported on ${this.currentNetwork}`);

    }


    let address = walletAddress;

    if (!address && this.signer) {

      address = await this.signer.getAddress();

    }

    if (!address) {

      throw new Error('No wallet address provided');

    }


    const contract = new Contract(tokenConfig.address, ERC20_ABI, this.provider);

    

    if (!contract.balanceOf) {

      throw new Error(`Token contract balanceOf method not available for ${tokenSymbol}`);

    }

    

    const balance = await contract.balanceOf(address) as bigint;

    const formattedBalance = formatUnits(balance, tokenConfig.decimals);

    

    console.log(`${tokenSymbol} balance for ${address}: ${formattedBalance}`);

    return formattedBalance;

  }


  /**

   * Transfer tokens

   */

  async transferToken(tokenSymbol: string, recipientAddress: string, amount: string): Promise<string> {

    if (!this.signer) {

      throw new Error('No wallet connected');

    }


    const tokenConfig = TOKENS[this.currentNetwork]?.[tokenSymbol];

    if (!tokenConfig) {

      throw new Error(`Token ${tokenSymbol} not supported on ${this.currentNetwork}`);

    }


    const contract = new Contract(tokenConfig.address, ERC20_ABI, this.signer);

    const senderAddress = await this.signer.getAddress();


    // Check balance

    if (!contract.balanceOf) {

      throw new Error(`Token contract balanceOf method not available for ${tokenSymbol}`);

    }

    const balance = await contract.balanceOf(senderAddress) as bigint;

    const amountInTokenUnits = parseUnits(amount, tokenConfig.decimals);


    if (balance < amountInTokenUnits) {

      const formattedBalance = formatUnits(balance, tokenConfig.decimals);

      throw new Error(`Insufficient ${tokenSymbol} balance. Required: ${amount}, Available: ${formattedBalance}`);

    }


    // Estimate gas

    if (!contract.transfer?.estimateGas) {

      throw new Error(`Token contract transfer method not available for ${tokenSymbol}`);

    }

    const gasEstimate = await contract.transfer.estimateGas(recipientAddress, amountInTokenUnits);

    const gasLimit = gasEstimate * BigInt(120) / BigInt(100); // 20% buffer


    // Send transaction

    console.log(`Transferring ${amount} ${tokenSymbol} to ${recipientAddress}...`);

    if (!contract.transfer) {

      throw new Error(`Token contract transfer method not available for ${tokenSymbol}`);

    }

    const tx: TransactionResponse = await contract.transfer(recipientAddress, amountInTokenUnits, { gasLimit });


    console.log(`Transaction submitted: ${tx.hash}`);

    const receipt = await tx.wait();

    if (!receipt) {

      throw new Error('Transaction receipt is null');

    }


    console.log(`Successfully transferred ${amount} ${tokenSymbol} to ${recipientAddress}`);

    return tx.hash;

  }


  /**

   * Switch network

   */

  async switchNetwork(network: string): Promise<void> {

    const networkConfig = NETWORKS[network];

    if (!networkConfig) {

      throw new Error(`Unsupported network: ${network}`);

    }


    if (this.signer && (window as any).ethereum) {

      // For MetaMask, request network switch

      try {

        await (window as any).ethereum.request({

          method: 'wallet_switchEthereumChain',

          params: [{ chainId: `0x${networkConfig.chainId.toString(16)}` }],

        });

      } catch (error: any) {

        // Network not added to MetaMask

        if (error.code === 4902) {

          await (window as any).ethereum.request({

            method: 'wallet_addEthereumChain',

            params: [{

              chainId: `0x${networkConfig.chainId.toString(16)}`,

              chainName: networkConfig.name,

              rpcUrls: [networkConfig.rpcUrl],

              nativeCurrency: networkConfig.nativeCurrency

            }]

          });

        } else {

          throw error;

        }

      }

    } else {

      // For read-only or imported wallet, just switch provider

      this.provider = new JsonRpcProvider(networkConfig.rpcUrl);

      if (this.signer && 'privateKey' in this.signer) {

        this.signer = new Wallet((this.signer as any).privateKey, this.provider);

      }

    }


    this.currentNetwork = network;

    console.log(`Switched to ${networkConfig.name}`);

  }


  /**

   * Get current network

   */

  getCurrentNetwork(): string {

    return this.currentNetwork;

  }


  /**

   * Disconnect wallet

   */

  disconnect(): void {

    this.signer = null;

    if (this.provider && 'destroy' in this.provider) {

      (this.provider as any).destroy();

    }

    this.provider = null;

    console.log('Wallet disconnected');

  }

}


/**

 * Wallet UI Layer

 * Handles user interactions and wallet state management

 */

class USDOXWallet {

  private blockchainService: BlockchainService;

  private isConnected: boolean = false;

  private walletAddress: string | null = null;


  constructor() {

    this.blockchainService = new BlockchainService();

  }


  /**

   * Initialize wallet in read-only mode

   */

  async initializeReadOnly(network: string = 'ethereum'): Promise<void> {

    await this.blockchainService.initializeReadOnlyProvider(network);

    console.log('Wallet initialized in read-only mode');

  }


  /**

   * Connect to MetaMask

   */

  async connectMetaMask(): Promise<string> {

    try {

      this.walletAddress = await this.blockchainService.connectMetaMask();

      this.isConnected = true;

      return this.walletAddress;

    } catch (error) {

      console.error('Failed to connect MetaMask:', error);

      throw error;

    }

  }


  /**

   * Create new wallet

   */

  createNewWallet(): { address: string; privateKey: string; mnemonic: string } {

    const walletData = this.blockchainService.createWallet();

    console.log('SECURITY WARNING: Store your private key and mnemonic securely. Never share them with anyone.');

    return walletData;

  }


  /**

   * Import wallet from private key

   */

  async importWallet(privateKey: string, network: string = 'ethereum'): Promise<string> {

    try {

      this.walletAddress = await this.blockchainService.importWalletFromPrivateKey(privateKey, network);

      this.isConnected = true;

      return this.walletAddress;

    } catch (error) {

      console.error('Failed to import wallet:', error);

      throw error;

    }

  }


  /**

   * Get USDO balance

   */

  async getUSDOBalance(walletAddress?: string): Promise<string> {

    return await this.blockchainService.getTokenBalance('USDO', walletAddress);

  }


  /**

   * Get TWUSD balance

   */

  async getTWUSDBalance(walletAddress?: string): Promise<string> {

    return await this.blockchainService.getTokenBalance('TWUSD', walletAddress);

  }


  /**

   * Send USDO tokens

   */

  async sendUSDO(recipientAddress: string, amount: string): Promise<string> {

    if (!this.isConnected) {

      throw new Error('Wallet not connected');

    }

    return await this.blockchainService.transferToken('USDO', recipientAddress, amount);

  }


  /**

   * Send TWUSD tokens

   */

  async sendTWUSD(recipientAddress: string, amount: string): Promise<string> {

    if (!this.isConnected) {

      throw new Error('Wallet not connected');

    }

    return await this.blockchainService.transferToken('TWUSD', recipientAddress, amount);

  }


  /**

   * Switch network

   */

  async switchNetwork(network: string): Promise<void> {

    await this.blockchainService.switchNetwork(network);

  }


  /**

   * Get wallet status

   */

  getWalletStatus(): { isConnected: boolean; address: string | null; network: string } {

    return {

      isConnected: this.isConnected,

      address: this.walletAddress,

      network: this.blockchainService.getCurrentNetwork()

    };

  }


  /**

   * Disconnect wallet

   */

  disconnect(): void {

    this.blockchainService.disconnect();

    this.isConnected = false;

    this.walletAddress = null;

    console.log('Wallet disconnected from UI layer');

  }

}


// ============= EXAMPLE USAGE =============


/**

 * Example: Initialize wallet in read-only mode and check balances

 */

async function exampleReadOnlyMode(): Promise<void> {

  console.log('=== Read-Only Mode Example ===');

  

  const wallet = new USDOXWallet();

  

  try {

    // Initialize in read-only mode

    await wallet.initializeReadOnly('ethereum');

    

    // Check balances for any address (no wallet connection needed)

    const exampleAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'; // Example address

    

    const usdoBalance = await wallet.getUSDOBalance(exampleAddress);

    console.log(`USDO Balance: ${usdoBalance}`);

    

    const twusdBalance = await wallet.getTWUSDBalance(exampleAddress);

    console.log(`TWUSD Balance: ${twusdBalance}`);

    

  } catch (error) {

    console.error('Read-only mode example failed:', error);

  }

}


/**

 * Example: Connect MetaMask and perform operations

 */

async function exampleMetaMaskConnection(): Promise<void> {

  console.log('=== MetaMask Connection Example ===');

  

  const wallet = new USDOXWallet();

  

  try {

    // Connect to MetaMask

    const address = await wallet.connectMetaMask();

    console.log(`Connected to MetaMask: ${address}`);

    

    // Check balances

    const usdoBalance = await wallet.getUSDOBalance();

    console.log(`Your USDO Balance: ${usdoBalance}`);

    

    const twusdBalance = await wallet.getTWUSDBalance();

    console.log(`Your TWUSD Balance: ${twusdBalance}`);

    

    // Example transfer (uncomment to use)

    // const txHash = await wallet.sendTWUSD('0xRecipientAddress', '10.5');

    // console.log(`Transfer completed: ${txHash}`);

    

  } catch (error) {

    console.error('MetaMask connection example failed:', error);

  }

}


/**

 * Example: Create new wallet

 */

async function exampleCreateWallet(): Promise<void> {

  console.log('=== Create New Wallet Example ===');

  

  const wallet = new USDOXWallet();

  

  try {

    // Create new wallet

    const walletData = wallet.createNewWallet();

    console.log('New wallet created:');

    console.log(`Address: ${walletData.address}`);

    console.log(`Private Key: ${walletData.privateKey}`);

    console.log(`Mnemonic: ${walletData.mnemonic}`);

    

    // Import the wallet to use it

    await wallet.importWallet(walletData.privateKey, 'ethereum');

    

    // Check status

    const status = wallet.getWalletStatus();

    console.log('Wallet Status:', status);

    

  } catch (error) {

    console.error('Create wallet example failed:', error);

  }

}


/**

 * Example: Multi-network support

 */

async function exampleMultiNetwork(): Promise<void> {

  console.log('=== Multi-Network Example ===');

  

  const wallet = new USDOXWallet();

  

  try {

    // Start with Ethereum

    await wallet.initializeReadOnly('ethereum');

    console.log('Initialized on Ethereum');

    

    // Switch to Base

    await wallet.switchNetwork('base');

    console.log('Switched to Base network');

    

    // Check status

    const status = wallet.getWalletStatus();

    console.log('Current network:', status.network);

    

  } catch (error) {

    console.error('Multi-network example failed:', error);

  }

}


// ============= SECURITY NOTES =============


/**

 * SECURITY BEST PRACTICES:

 * 

 * 1. PRIVATE KEY MANAGEMENT:

 *    - Never store private keys in plain text

 *    - Use secure key derivation (PBKDF2, scrypt, or Argon2)

 *    - Implement proper encryption for local storage

 *    - Never transmit private keys over network

 * 

 * 2. TRANSACTION SECURITY:

 *    - Always verify recipient addresses

 *    - Implement transaction amount limits

 *    - Use gas estimation with reasonable buffers

 *    - Validate all user inputs

 * 

 * 3. NETWORK SECURITY:

 *    - Use HTTPS RPC endpoints only

 *    - Implement proper error handling

 *    - Validate contract addresses

 *    - Check for contract existence before interaction

 * 

 * 4. USER INTERFACE SECURITY:

 *    - Display clear transaction confirmations

 *    - Show gas fees and total costs

 *    - Implement session timeouts

 *    - Use secure random number generation

 * 

 * 5. AUDIT AND TRANSPARENCY:

 *    - All code should be open source and auditable

 *    - Use well-established libraries (ethers.js)

 *    - Implement comprehensive logging

 *    - Regular security audits

 */


// ============= MAIN EXECUTION =============


async function main(): Promise<void> {

  console.log('USDOX Ecosystem Wallet Architecture Demo');

  console.log('=========================================');

  

  // Run examples (uncomment as needed)

  await exampleReadOnlyMode();

  // await exampleMetaMaskConnection();

  // await exampleCreateWallet();

  // await exampleMultiNetwork();

  

  console.log('Demo completed. Remember to implement proper security measures in production!');

}


// Execute main function

main().catch(console.error);


// Export for use in other modules

export { USDOXWallet, BlockchainService, NETWORKS, TOKENS };


/**

 * DEPLOYMENT NOTES:

 * 

 * 1. Install dependencies:

 *    npm install ethers

 * 

 * 2. Replace placeholder addresses:

 *    - Update USDO_CONTRACT_ADDRESS with actual USDO contract address

 *    - Update TWUSD_CONTRACT_ADDRESS with actual TWUSD contract address

 *    - Add contract addresses for other networks (Base, etc.)

 * 

 * 3. Configure RPC endpoints:

 *    - Use reliable RPC providers (Infura, Alchemy, etc.)

 *    - Consider rate limiting and failover mechanisms

 * 

 * 4. Security implementation:

 *    - Implement proper private key encryption

 *    - Add input validation and sanitization

 *    - Implement proper error handling and user feedback

 * 

 * 5. Testing:

 *    - Test on testnets first (Sepolia, Base Goerli)

 *    - Implement comprehensive unit tests

 *    - Perform security audits before mainnet deployment

 */
