"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TrustIndicator } from "@/components/ui/trust-indicator"
import { ComplianceBadge } from "@/components/ui/compliance-badge"

interface SecurityVerificationProps {
  sessionId: string
  requiresMFA: boolean
  requiresBiometric: boolean
  onVerificationComplete: (verified: boolean) => void
}

export function SecurityVerification({
  sessionId,
  requiresMFA,
  requiresBiometric,
  onVerificationComplete,
}: SecurityVerificationProps) {
  const [mfaCode, setMfaCode] = useState("")
  const [mfaVerified, setMfaVerified] = useState(false)
  const [biometricVerified, setBiometricVerified] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleMFAVerification = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/security/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          code: mfaCode,
          method: "totp",
        }),
      })

      const data = await response.json()
      if (data.success) {
        setMfaVerified(true)
        checkCompletion(true, biometricVerified)
      }
    } catch (error) {
      console.error("MFA verification failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricVerification = async () => {
    setLoading(true)
    try {
      // Mock biometric capture
      const biometricData = {
        faceImage: "mock_face_image_data",
        livenessVideo: "mock_liveness_video_data",
      }

      const response = await fetch("/api/security/biometric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          biometricData,
        }),
      })

      const data = await response.json()
      if (data.success && data.verified) {
        setBiometricVerified(true)
        checkCompletion(mfaVerified, true)
      }
    } catch (error) {
      console.error("Biometric verification failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkCompletion = (mfa: boolean, biometric: boolean) => {
    const mfaComplete = !requiresMFA || mfa
    const biometricComplete = !requiresBiometric || biometric

    if (mfaComplete && biometricComplete) {
      onVerificationComplete(true)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-mycora-sage/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-mycora-earth">Security Verification</CardTitle>
            <TrustIndicator level="secure" />
          </div>
          <CardDescription>Complete the required security checks to proceed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {requiresMFA && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-mycora-earth">Multi-Factor Authentication</h3>
                <ComplianceBadge status={mfaVerified ? "verified" : "pending"} />
              </div>
              {!mfaVerified ? (
                <div className="space-y-3">
                  <Input
                    placeholder="Enter 6-digit code"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    maxLength={6}
                  />
                  <Button onClick={handleMFAVerification} disabled={loading || mfaCode.length !== 6}>
                    {loading ? "Verifying..." : "Verify MFA"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Badge variant="default">MFA Verified</Badge>
                  <span className="text-sm text-mycora-sage">Multi-factor authentication complete</span>
                </div>
              )}
            </div>
          )}

          {requiresBiometric && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-mycora-earth">Biometric Verification</h3>
                <ComplianceBadge status={biometricVerified ? "verified" : "pending"} />
              </div>
              {!biometricVerified ? (
                <div className="space-y-3">
                  <p className="text-sm text-mycora-sage">
                    Face verification and liveness detection required for enhanced security
                  </p>
                  <Button onClick={handleBiometricVerification} disabled={loading}>
                    {loading ? "Capturing..." : "Start Biometric Scan"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Badge variant="default">Biometric Verified</Badge>
                  <span className="text-sm text-mycora-sage">Face verification complete</span>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-mycora-sage/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-mycora-sage">Security Level</span>
              <Badge variant={mfaVerified && biometricVerified ? "default" : "outline"}>
                {mfaVerified && biometricVerified ? "Maximum Security" : "Verification Required"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
