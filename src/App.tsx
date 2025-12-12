import { useState } from 'react'
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { Coins, ArrowDownUp, Wallet } from 'lucide-react'
import { TWUSD_ABI, TWUSD_CONTRACT_ADDRESS } from './config/contract'

function App() {
  const [mintAmount, setMintAmount] = useState('')
  const [redeemAmount, setRedeemAmount] = useState('')
  
  const { address, isConnected } = useAccount()
  
  // Get ETH balance
  const { data: ethBalance } = useBalance({
    address: address,
  })
  
  // Get TWUSD balance
  const { data: twusdBalance } = useReadContract({
    address: TWUSD_CONTRACT_ADDRESS,
    abi: TWUSD_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Get total supply
  const { data: totalSupply } = useReadContract({
    address: TWUSD_CONTRACT_ADDRESS,
    abi: TWUSD_ABI,
    functionName: 'totalSupply',
  })

  // Mint contract write
  const { data: mintHash, writeContract: mint, isPending: isMintPending } = useWriteContract()
  
  // Redeem contract write
  const { data: redeemHash, writeContract: redeem, isPending: isRedeemPending } = useWriteContract()

  // Wait for mint transaction
  const { isLoading: isMintConfirming, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({
    hash: mintHash,
  })

  // Wait for redeem transaction
  const { isLoading: isRedeemConfirming, isSuccess: isRedeemSuccess } = useWaitForTransactionReceipt({
    hash: redeemHash,
  })

  const handleMint = () => {
    if (!mintAmount || parseFloat(mintAmount) <= 0) return
    
    const value = parseEther(mintAmount)
    mint({
      address: TWUSD_CONTRACT_ADDRESS,
      abi: TWUSD_ABI,
      functionName: 'mint',
      value: value,
    })
  }

  const handleRedeem = () => {
    if (!redeemAmount || parseFloat(redeemAmount) <= 0) return
    
    const amount = parseEther(redeemAmount)
    redeem({
      address: TWUSD_CONTRACT_ADDRESS,
      abi: TWUSD_ABI,
      functionName: 'redeem',
      args: [amount],
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Coins className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">TWUSD Stablecoin</h1>
                <p className="text-sm text-gray-400">Ethereum Mainnet</p>
              </div>
            </div>
            <appkit-button />
          </div>
        </header>

        {/* Stats Cards */}
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <p className="text-sm text-gray-400 mb-2">ETH Balance</p>
              <p className="text-2xl font-bold text-white">
                {ethBalance ? parseFloat(formatEther(ethBalance.value)).toFixed(4) : '0.0000'} ETH
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <p className="text-sm text-gray-400 mb-2">TWUSD Balance</p>
              <p className="text-2xl font-bold text-white">
                {twusdBalance ? parseFloat(formatEther(twusdBalance as bigint)).toFixed(2) : '0.00'} TWUSD
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <p className="text-sm text-gray-400 mb-2">Total Supply</p>
              <p className="text-2xl font-bold text-white">
                {totalSupply ? parseFloat(formatEther(totalSupply as bigint)).toFixed(2) : '0.00'} TWUSD
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!isConnected ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 md:p-12 border border-white/10 text-center">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">
              Connect your wallet to start minting and redeeming TWUSD
            </p>
            <appkit-button />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mint Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-6">
                <Coins className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Mint TWUSD</h2>
              </div>
              
              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">
                  Amount (ETH)
                </label>
                <input
                  type="number"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.01"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleMint}
                disabled={!mintAmount || parseFloat(mintAmount) <= 0 || isMintPending || isMintConfirming}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                {isMintPending ? 'Confirming...' : isMintConfirming ? 'Minting...' : 'Mint TWUSD'}
              </button>

              {isMintSuccess && (
                <p className="text-sm text-green-400 mt-3">
                  Mint successful! Transaction: {mintHash?.slice(0, 10)}...
                </p>
              )}
            </div>

            {/* Redeem Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-6">
                <ArrowDownUp className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Redeem TWUSD</h2>
              </div>
              
              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">
                  Amount (TWUSD)
                </label>
                <input
                  type="number"
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.01"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={handleRedeem}
                disabled={!redeemAmount || parseFloat(redeemAmount) <= 0 || isRedeemPending || isRedeemConfirming}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                {isRedeemPending ? 'Confirming...' : isRedeemConfirming ? 'Redeeming...' : 'Redeem TWUSD'}
              </button>

              {isRedeemSuccess && (
                <p className="text-sm text-green-400 mt-3">
                  Redeem successful! Transaction: {redeemHash?.slice(0, 10)}...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>TWUSD Stablecoin &copy; 2025 - Built with Wagmi v2 & Viem</p>
        </footer>
      </div>
    </div>
  )
}

export default App

