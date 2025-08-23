
interface User {
  id: string;
  transactions: Transaction[];
  nfts: string[];
  points: number;
}

interface Transaction {
  amount: number;
  timestamp: Date;
}

export async function checkAndAwardNFT(userId: string): Promise<void> {
  try {
    const user = await getUserWithTransactions(userId);
    const transactionCount = user.transactions.length;
    const totalSpent = user.transactions.reduce((sum, t) => sum + t.amount, 0);

    // Green Pass: First purchase
    if (transactionCount >= 1 && !user.nfts.includes('GreenPass')) {
      await mintNFT(userId, 'GreenPass');
      await awardPoints(userId, 500);
      console.log(`🎉 User ${userId} earned Green Pass NFT!`);
    }

    // Gold Pass: 5+ transactions or $100+ spent
    if (
      (transactionCount >= 5 || totalSpent >= 100) &&
      !user.nfts.includes('GoldPass')
    ) {
      await mintNFT(userId, 'GoldPass');
      await awardPoints(userId, 2000);
      console.log(`🏆 User ${userId} earned Gold Pass NFT!`);
    }

    // Platinum Pass: 15+ transactions or $300+ spent
    if (
      (transactionCount >= 15 || totalSpent >= 300) &&
      !user.nfts.includes('PlatinumPass')
    ) {
      await mintNFT(userId, 'PlatinumPass');
      await awardPoints(userId, 5000);
      console.log(`💎 User ${userId} earned Platinum Pass NFT!`);
    }
  } catch (error) {
    console.error('Error checking NFT rewards:', error);
  }
}

async function getUserWithTransactions(userId: string): Promise<User> {
  // This would integrate with your actual database
  // For now, returning mock data structure
  return {
    id: userId,
    transactions: [],
    nfts: [],
    points: 0
  };
}

async function mintNFT(userId: string, nftType: string): Promise<void> {
  // Integration with your NFT minting contract
  console.log(`Minting ${nftType} NFT for user ${userId}`);
  
  // This would call your smart contract's mint function
  // const contract = new ethers.Contract(NFT_ADDRESS, abi, signer);
  // await contract.mint(userId, nftType);
}

async function awardPoints(userId: string, points: number): Promise<void> {
  // Award loyalty points to user
  console.log(`Awarding ${points} points to user ${userId}`);
}

export function getUserTier(user: User): 'Green' | 'Gold' | 'Platinum' {
  const { transactions } = user;
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  if (totalSpent >= 300 || transactions.length >= 15) return 'Platinum';
  if (totalSpent >= 100 || transactions.length >= 5) return 'Gold';
  return 'Green';
}
