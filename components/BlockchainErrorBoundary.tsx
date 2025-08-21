
'use client'

import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: string | null
}

export class BlockchainErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: error.message }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Blockchain Error]:', error)
    console.error('[Error Info]:', errorInfo)
    
    // Log blockchain-specific errors
    if (error.message.includes('user rejected') || error.message.includes('User denied')) {
      console.log('[User Action]: Transaction cancelled by user')
    } else if (error.message.includes('insufficient funds')) {
      console.error('[Blockchain]: Insufficient funds for transaction')
    } else if (error.message.includes('gas')) {
      console.error('[Blockchain]: Gas estimation or execution error')
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="w-full max-w-md mx-auto mt-8">
          <CardHeader>
            <CardTitle className="text-red-600">Blockchain Error</CardTitle>
            <CardDescription>
              Something went wrong with the blockchain interaction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              {this.state.error?.message.includes('user rejected') ? 
                'Transaction was cancelled by user' :
                this.state.error?.message.includes('insufficient funds') ?
                'Insufficient funds for transaction' :
                this.state.error?.message.includes('gas') ?
                'Gas estimation error - please try again' :
                'An unexpected error occurred'
              }
            </div>
            <div className="flex space-x-2">
              <Button onClick={this.handleRetry} variant="outline" size="sm">
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="secondary" 
                size="sm"
              >
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

export default BlockchainErrorBoundary
