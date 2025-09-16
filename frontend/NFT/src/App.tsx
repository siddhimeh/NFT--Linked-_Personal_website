import React, { useState, useEffect } from 'react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { Wallet, Globe, Coins, PlusCircle, ExternalLink, AlertCircle, Plug, LogOut } from 'lucide-react';

const NFTWebsiteApp = () => {
  // Aptos client configuration
  const aptosConfig = new AptosConfig({ network: Network.DEVNET });
  const aptos = new Aptos(aptosConfig);

  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [mintForm, setMintForm] = useState({
    tokenId: '',
    websiteUrl: '',
    accessFee: ''
  });
  const [accessForm, setAccessForm] = useState({
    ownerAddress: '',
    payment: ''
  });

  // Your contract details - UPDATE THIS WITH YOUR DEPLOYED CONTRACT ADDRESS
  const MODULE_ADDRESS = '0x194a2a0db5d05ab7042a7e992049dc2df7b5e340cd1d18df90f557f410bad373'; // Replace with your deployed contract address
  const MODULE_NAME = 'NFTWebsite2';

  // Check if Petra wallet is installed
  const isPetraInstalled = () => {
    return typeof window !== 'undefined' && 'aptos' in window;
  };

  // Connect to Petra wallet
  const connectWallet = async () => {
    if (!isPetraInstalled()) {
      setError('Petra wallet is not installed. Please install it from Chrome Web Store.');
      return;
    }

    try {
      setLoading(true);
      const response = await window.aptos.connect();
      
      if (response) {
        setAccount({
          address: response.address,
          publicKey: response.publicKey
        });
        setIsConnected(true);
        setSuccess('Wallet connected successfully!');
        await updateBalance(response.address);
      }
    } catch (err) {
      if (err.code === 4001) {
        setError('Connection rejected by user');
      } else {
        setError(`Failed to connect wallet: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      await window.aptos.disconnect();
      setIsConnected(false);
      setAccount(null);
      setBalance(0);
      setSuccess('Wallet disconnected successfully!');
    } catch (err) {
      setError(`Failed to disconnect wallet: ${err.message}`);
    }
  };

  // Check wallet connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (isPetraInstalled()) {
        try {
          const isConnectedResult = await window.aptos.isConnected();
          if (isConnectedResult) {
            const account = await window.aptos.account();
            setAccount({
              address: account.address,
              publicKey: account.publicKey
            });
            setIsConnected(true);
            await updateBalance(account.address);
          }
        } catch (err) {
          console.error('Failed to check wallet connection:', err);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (isPetraInstalled()) {
      const handleAccountChange = (newAccount) => {
        if (newAccount) {
          setAccount({
            address: newAccount.address,
            publicKey: newAccount.publicKey
          });
          updateBalance(newAccount.address);
        } else {
          setAccount(null);
          setIsConnected(false);
          setBalance(0);
        }
      };

      window.aptos.onAccountChange(handleAccountChange);
    }
  }, []);

  // Update balance
  const updateBalance = async (address) => {
    if (!address) return;
    
    try {
      const resources = await aptos.getAccountResources({
        accountAddress: address,
      });
      
      const aptosCoinResource = resources.find(
        (r) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
      );
      
      if (aptosCoinResource) {
        const balanceValue = parseInt(aptosCoinResource.data.coin.value) / 100000000;
        setBalance(balanceValue);
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  // Mint website NFT
  const mintWebsiteNFT = async () => {
    if (!isConnected || !account) {
      setError('Please connect your wallet first');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        type: 'entry_function_payload',
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::mint_website_nft`,
        arguments: [
          parseInt(mintForm.tokenId),
          mintForm.websiteUrl,
          parseInt(mintForm.accessFee) * 100000000, // Convert to octas
        ],
        type_arguments: [],
      };

      const response = await window.aptos.signAndSubmitTransaction(payload);
      
      // Wait for transaction
      await aptos.waitForTransaction({
        transactionHash: response.hash,
      });

      setSuccess('Website NFT minted successfully!');
      setMintForm({ tokenId: '', websiteUrl: '', accessFee: '' });
      await updateBalance(account.address);
      
    } catch (err) {
      if (err.code === 4001) {
        setError('Transaction rejected by user');
      } else {
        setError(`Failed to mint NFT: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Access premium content
  const accessPremiumContent = async () => {
    if (!isConnected || !account) {
      setError('Please connect your wallet first');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        type: 'entry_function_payload',
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::access_premium_content`,
        arguments: [
          accessForm.ownerAddress,
          parseInt(accessForm.payment) * 100000000, // Convert to octas
        ],
        type_arguments: [],
      };

      const response = await window.aptos.signAndSubmitTransaction(payload);
      
      // Wait for transaction
      await aptos.waitForTransaction({
        transactionHash: response.hash,
      });

      setSuccess('Premium content access granted!');
      setAccessForm({ ownerAddress: '', payment: '' });
      await updateBalance(account.address);
      
    } catch (err) {
      if (err.code === 4001) {
        setError('Transaction rejected by user');
      } else {
        setError(`Failed to access premium content: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            NFT Website Platform
          </h1>
          <p className="text-xl text-gray-300">
            Mint NFTs linked to personal websites and monetize premium content
          </p>
        </div>

        {/* Wallet Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Wallet className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-semibold">Petra Wallet</h2>
            </div>
            {isConnected && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Coins className="w-5 h-5" />
                  <span className="font-semibold">{balance.toFixed(4)} APT</span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded-lg text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Disconnect</span>
                </button>
              </div>
            )}
          </div>

          {!isPetraInstalled() ? (
            <div className="text-center">
              <p className="text-yellow-400 mb-4">Petra wallet is not installed</p>
              <a
                href="https://chrome.google.com/webstore/detail/petra-aptos-wallet/ejjladinnckdgjemekebdpeokbikhfci"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
              >
                <ExternalLink className="w-5 h-5" />
                Install Petra Wallet
              </a>
            </div>
          ) : !isConnected ? (
            <button
              onClick={connectWallet}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Plug className="w-5 h-5" />
              {loading ? 'Connecting...' : 'Connect Petra Wallet'}
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-300">Connected Address:</p>
              <p className="text-xs font-mono bg-black/30 p-2 rounded break-all">
                {account.address}
              </p>
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Connected to Petra Wallet
              </div>
            </div>
          )}
        </div>

        {isConnected && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mint Website NFT */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <PlusCircle className="w-6 h-6 text-green-400" />
                <h2 className="text-xl font-semibold">Mint Website NFT</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Token ID</label>
                  <input
                    type="number"
                    value={mintForm.tokenId}
                    onChange={(e) => setMintForm({ ...mintForm, tokenId: e.target.value })}
                    className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 transition-colors"
                    placeholder="Enter unique token ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Website URL</label>
                  <input
                    type="url"
                    value={mintForm.websiteUrl}
                    onChange={(e) => setMintForm({ ...mintForm, websiteUrl: e.target.value })}
                    className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 transition-colors"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Access Fee (APT)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={mintForm.accessFee}
                    onChange={(e) => setMintForm({ ...mintForm, accessFee: e.target.value })}
                    className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 transition-colors"
                    placeholder="Enter access fee"
                  />
                </div>

                <button
                  onClick={mintWebsiteNFT}
                  disabled={loading || !mintForm.tokenId || !mintForm.websiteUrl || !mintForm.accessFee}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                >
                  {loading ? 'Minting...' : 'Mint Website NFT'}
                </button>
              </div>
            </div>

            {/* Access Premium Content */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-semibold">Access Premium Content</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Website Owner Address</label>
                  <input
                    type="text"
                    value={accessForm.ownerAddress}
                    onChange={(e) => setAccessForm({ ...accessForm, ownerAddress: e.target.value })}
                    className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="0x..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Payment (APT)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={accessForm.payment}
                    onChange={(e) => setAccessForm({ ...accessForm, payment: e.target.value })}
                    className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="Enter payment amount"
                  />
                </div>

                <button
                  onClick={accessPremiumContent}
                  disabled={loading || !accessForm.ownerAddress || !accessForm.payment}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                >
                  {loading ? 'Processing...' : 'Access Premium Content'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mt-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-6 bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
            <ExternalLink className="w-5 h-5 text-green-400" />
            <p className="text-green-200">{success}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">How to Use with Petra Wallet</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <span className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
              <p>Install Petra Wallet extension from the Chrome Web Store if you haven't already.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
              <p>Connect your Petra wallet by clicking the "Connect Petra Wallet" button.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
              <p>Mint a Website NFT by providing a unique token ID, your website URL, and an access fee for premium content.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
              <p>To access someone's premium content, enter their wallet address and pay the required fee.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">⚠</span>
              <p>Remember to update the MODULE_ADDRESS in the code with your deployed contract address before using.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTWebsiteApp;