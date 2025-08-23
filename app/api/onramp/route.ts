
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { amountUsd, userId } = await request.json();

    if (!amountUsd || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (amountUsd <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Verify user exists
    const user = await getUser(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1:1 conversion: $20 USD = 20 PuffCash
    const puffCashAmount = amountUsd;

    // Add to user's wallet (no fees)
    await addToWallet(userId, puffCashAmount);

    // Log the onramp event for analytics
    await logEvent('onramp', { 
      userId, 
      amountUsd, 
      puffCashAmount,
      timestamp: new Date()
    });

    return NextResponse.json({ 
      success: true, 
      puffCash: puffCashAmount,
      usdAmount: amountUsd,
      rate: 1.0, // Always 1:1
      transactionId: generateTransactionId()
    });

  } catch (error) {
    console.error("Onramp error:", error);
    return NextResponse.json({ error: "Onramp failed" }, { status: 500 });
  }
}

async function getUser(userId: string) {
  // Mock user lookup
  return { id: userId, balance: 0 };
}

async function addToWallet(userId: string, amount: number) {
  console.log(`Adding ${amount} PuffCash to user ${userId} wallet`);
  // This would update the user's balance in your database
}

async function logEvent(eventType: string, data: any) {
  console.log(`Event: ${eventType}`, data);
  // This would log to your analytics system
}

function generateTransactionId(): string {
  return `onramp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
