interface CybridConfig {
  apiKey: string
  environment: "sandbox" | "production"
  baseUrl: string
}

interface CybridAccount {
  guid: string
  name: string
  type: "individual" | "business"
  state: "storing" | "verified" | "rejected"
}

interface CybridQuote {
  guid: string
  product_type: "trading" | "funding"
  asset: string
  side: "buy" | "sell"
  receive_amount: string
  deliver_amount: string
  fee: string
}

export class CybridService {
  private config: CybridConfig
  private baseHeaders: Record<string, string>

  constructor() {
    this.config = {
      apiKey: process.env.CYBRID_API_KEY || "",
      environment: (process.env.CYBRID_ENVIRONMENT as "sandbox" | "production") || "sandbox",
      baseUrl:
        process.env.CYBRID_ENVIRONMENT === "production"
          ? "https://bank.production.cybrid.app"
          : "https://bank.sandbox.cybrid.app",
    }

    this.baseHeaders = {
      Authorization: `Bearer ${this.config.apiKey}`,
      "Content-Type": "application/json",
    }
  }

  /**
   * Create a customer account in Cybrid
   */
  async createCustomer(
    email: string,
    name: string,
    type: "individual" | "business" = "individual",
  ): Promise<CybridAccount> {
    const response = await fetch(`${this.config.baseUrl}/api/customers`, {
      method: "POST",
      headers: this.baseHeaders,
      body: JSON.stringify({
        type,
        name,
        email,
        state: "storing",
      }),
    })

    if (!response.ok) {
      throw new Error(`Cybrid customer creation failed: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Create a quote for fiat to MCC conversion
   */
  async createFiatToMCCQuote(customerGuid: string, fiatAmount: number, fiatAsset = "USD"): Promise<CybridQuote> {
    const response = await fetch(`${this.config.baseUrl}/api/quotes`, {
      method: "POST",
      headers: this.baseHeaders,
      body: JSON.stringify({
        product_type: "funding",
        customer_guid: customerGuid,
        asset: "MCC", // Our custom asset
        side: "buy",
        deliver_amount: (fiatAmount * 100).toString(), // Convert to cents
        deliver_asset: fiatAsset,
      }),
    })

    if (!response.ok) {
      throw new Error(`Cybrid quote creation failed: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Execute a fiat deposit and mint MCC tokens
   */
  async executeFiatDeposit(
    customerGuid: string,
    quoteGuid: string,
    walletAddress: string,
  ): Promise<{ transactionId: string; mccAmount: string }> {
    // Create the trade in Cybrid
    const tradeResponse = await fetch(`${this.config.baseUrl}/api/trades`, {
      method: "POST",
      headers: this.baseHeaders,
      body: JSON.stringify({
        quote_guid: quoteGuid,
        customer_guid: customerGuid,
      }),
    })

    if (!tradeResponse.ok) {
      throw new Error(`Cybrid trade execution failed: ${tradeResponse.statusText}`)
    }

    const trade = await tradeResponse.json()

    // The MCC amount to mint (in wei)
    const mccAmount = trade.receive_amount // This should be in the smallest unit

    return {
      transactionId: trade.guid,
      mccAmount,
    }
  }

  /**
   * Create a quote for MCC to fiat conversion (off-ramp)
   */
  async createMCCToFiatQuote(customerGuid: string, mccAmount: string, fiatAsset = "USD"): Promise<CybridQuote> {
    const response = await fetch(`${this.config.baseUrl}/api/quotes`, {
      method: "POST",
      headers: this.baseHeaders,
      body: JSON.stringify({
        product_type: "funding",
        customer_guid: customerGuid,
        asset: "MCC",
        side: "sell",
        deliver_amount: mccAmount,
        receive_asset: fiatAsset,
      }),
    })

    if (!response.ok) {
      throw new Error(`Cybrid quote creation failed: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Execute fiat withdrawal (burn MCC tokens)
   */
  async executeFiatWithdrawal(
    customerGuid: string,
    quoteGuid: string,
    walletAddress: string,
  ): Promise<{ transactionId: string; fiatAmount: string }> {
    const tradeResponse = await fetch(`${this.config.baseUrl}/api/trades`, {
      method: "POST",
      headers: this.baseHeaders,
      body: JSON.stringify({
        quote_guid: quoteGuid,
        customer_guid: customerGuid,
      }),
    })

    if (!tradeResponse.ok) {
      throw new Error(`Cybrid withdrawal failed: ${tradeResponse.statusText}`)
    }

    const trade = await tradeResponse.json()

    return {
      transactionId: trade.guid,
      fiatAmount: trade.receive_amount,
    }
  }

  /**
   * Get customer verification status
   */
  async getCustomerStatus(customerGuid: string): Promise<CybridAccount> {
    const response = await fetch(`${this.config.baseUrl}/api/customers/${customerGuid}`, {
      method: "GET",
      headers: this.baseHeaders,
    })

    if (!response.ok) {
      throw new Error(`Failed to get customer status: ${response.statusText}`)
    }

    return response.json()
  }
}
