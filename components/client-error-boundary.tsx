
'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface Props {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

export class ClientErrorBoundary extends React.Component<Props, ErrorBoundaryState> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Client Error Boundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback

      if (Fallback && this.state.error) {
        return (
          <Fallback 
            error={this.state.error} 
            reset={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
          />
        )
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-black/20 backdrop-blur-lg rounded-2xl p-8 border border-orange-500/30">
            <div className="text-center">
              <div className="text-6xl mb-4">🍄</div>
              <h2 className="text-2xl font-bold text-orange-200 mb-4">
                Network Disruption Detected
              </h2>
              <p className="text-orange-300 mb-6">
                The mycelial network experienced an unexpected interruption. Our spores are working to restore connection.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105"
              >
                Reconnect to Network
              </button>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-orange-400 hover:text-orange-300">
                    Technical Details
                  </summary>
                  <pre className="mt-2 text-xs text-orange-200 bg-black/40 p-4 rounded overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
