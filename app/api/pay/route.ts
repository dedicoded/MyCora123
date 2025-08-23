
import { NextRequest, NextResponse } from "next/server";
import { checkAndAwardNFT } from "@/lib/nft-rewards";

export async function POST(request: NextRequest) {
  try {
    const { amount, userId, merchantId } = await request.json();

    if (!amount || !userId || !merchantId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const user = await getUser(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const merchant = await getMerchant(merchantId);
    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

    if (user.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Deduct from user (no fees for user)
    await deductFromWallet(userId, amount);

    // Calculate merchant fee (2.5%)
    const fee = amount * 0.025;
    const netAmount = amount - fee;
    
    // Add to merchant balance (net of fee)
    await addToMerchantBalance(merchantId, netAmount);

    // Record revenue for MyCora
    await recordRevenue('transaction_fee', fee);

    // Log transaction
    await logTransaction({
      userId,
      merchantId,
      amount,
      fee,
      netAmount,
      timestamp: new Date()
    });

    // Check if user qualifies for NFT rewards
    await checkAndAwardNFT(userId);

    return NextResponse.json({ 
      success: true, 
      transactionId: generateTransactionId(),
      userPaid: amount, // User sees full amount
      merchantReceived: netAmount,
      // Don't expose fee to user
    });

  } catch (error) {
    console.error("Payment processing error:", error);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}

// Mock functions - replace with actual database operations
async function getUser(userId: string) {
  return { id: userId, balance: 1000 }; // Mock user with $1000 balance
}

async function getMerchant(merchantId: string) {
  return { id: merchantId, name: "Green Leaf Dispensary" };
}

async function deductFromWallet(userId: string, amount: number) {
  console.log(`Deducting $${amount} from user ${userId}`);
}

async function addToMerchantBalance(merchantId: string, amount: number) {
  console.log(`Adding $${amount} to merchant ${merchantId}`);
}

async function recordRevenue(type: string, amount: number) {
  console.log(`Recording ${type}: $${amount}`);
}

async function logTransaction(transaction: any) {
  console.log('Transaction logged:', transaction);
}

function generateTransactionId(): string {
  return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
