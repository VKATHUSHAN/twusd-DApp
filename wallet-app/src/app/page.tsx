"use client";

import { useState, useEffect } from 'react';
import { USDOXWallet } from '@/wallet-architecture';

export default function Home() {
  const [wallet, setWallet] = useState<USDOXWallet | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [usdoBalance, setUsdoBalance] = useState('');
  const [twusdBalance, setTwusdBalance] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [newWalletData, setNewWalletData] = useState<{ address: string; privateKey: string; mnemonic: string } | null>(null);

  useEffect(() => {
    const newWallet = new USDOXWallet();
    newWallet.initializeReadOnly();
    setWallet(newWallet);
  }, []);

  const handleConnectMetaMask = async () => {
    if (wallet) {
      try {
        const address = await wallet.connectMetaMask();
        setWalletAddress(address);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect MetaMask:', error);
      }
    }
  };

  const handleCreateNewWallet = () => {
    if (wallet) {
      const walletData = wallet.createNewWallet();
      setNewWalletData(walletData);
    }
  };

  const handleGetBalances = async () => {
    if (wallet && walletAddress) {
      try {
        const usdo = await wallet.getUSDOBalance(walletAddress);
        setUsdoBalance(usdo);
        const twusd = await wallet.getTWUSDBalance(walletAddress);
        setTwusdBalance(twusd);
      } catch (error) {
        console.error('Failed to get balances:', error);
      }
    }
  };

  const handleSendTokens = async () => {
    if (wallet && recipient && amount) {
      try {
        // You can choose which token to send here, for now it's TWUSD
        const txHash = await wallet.sendTWUSD(recipient, amount);
        alert(`Transaction successful: ${txHash}`);
      } catch (error) {
        console.error('Failed to send tokens:', error);
        alert(`Failed to send tokens: ${error}`);
      }
    }
  };
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">USDOX Wallet</h1>

      <div className="w-full max-w-2xl">
        {!isConnected ? (
          <button onClick={handleConnectMetaMask} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 w-full">
            Connect to MetaMask
          </button>
        ) : (
          <div className="mb-4">
            <p>Connected: {walletAddress}</p>
          </div>
        )}

        <button onClick={handleCreateNewWallet} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4 w-full">
          Create New Wallet
        </button>

        {newWalletData && (
          <div className="bg-gray-100 p-4 rounded mb-4">
            <h2 className="text-xl font-bold">New Wallet Created (SAVE THIS INFORMATION SECURELY)</h2>
            <p>Address: {newWalletData.address}</p>
            <p>Private Key: {newWalletData.privateKey}</p>
            <p>Mnemonic: {newWalletData.mnemonic}</p>
          </div>
        )}

        {isConnected && (
          <div className="bg-gray-100 p-4 rounded mb-4">
            <h2 className="text-xl font-bold">Wallet Details</h2>
            <button onClick={handleGetBalances} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-2">
              Get Balances
            </button>
            <p>USDO Balance: {usdoBalance}</p>
            <p>TWUSD Balance: {twusdBalance}</p>
          </div>
        )}

        {isConnected && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-xl font-bold">Send Tokens</h2>
            <div className="flex flex-col">
              <input
                type="text"
                placeholder="Recipient Address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="border p-2 mb-2"
              />
              <input
                type="text"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border p-2 mb-2"
              />
              <button onClick={handleSendTokens} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                Send TWUSD
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}