// Production configuration validator
export const validateProductionConfig = () => {
  const requiredEnvVars = ["NEXT_PUBLIC_ALCHEMY_RPC_URL", "NEXT_PUBLIC_ETH_RPC_URL"]

  const missing = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missing.length > 0) {
    console.warn("[MyCora] Missing production environment variables:", missing)
    return false
  }

  const isProduction = process.env.NODE_ENV === "production"
  const hasStorageToken = !!process.env.WEB3_STORAGE_TOKEN

  console.log("[MyCora] Production config status:", {
    environment: process.env.NODE_ENV,
    rpcConfigured: !!process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL,
    storageConfigured: hasStorageToken,
    ready: isProduction && missing.length === 0,
  })

  return true
}

export const verifyThemeAssets = () => {
  const requiredAssets = ["/placeholder.svg", "/placeholder-logo.svg"]

  // In production, verify these assets are accessible
  if (typeof window !== "undefined") {
    requiredAssets.forEach((asset) => {
      const img = new Image()
      img.onerror = () => console.warn(`[MyCora] Missing theme asset: ${asset}`)
      img.src = asset
    })
  }
}
