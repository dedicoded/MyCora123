export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Welcome to MyCora</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            The comprehensive blockchain platform for security tokens, compliance management, and decentralized finance
            solutions.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Get Started
            </button>
            <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-3">Security Tokens</h3>
            <p className="text-gray-600">
              Issue and manage compliant security tokens with built-in regulatory features.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">⚖️</div>
            <h3 className="text-xl font-semibold mb-3">Compliance</h3>
            <p className="text-gray-600">Automated compliance checks and regulatory reporting for global markets.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">🏦</div>
            <h3 className="text-xl font-semibold mb-3">DeFi Integration</h3>
            <p className="text-gray-600">
              Connect to decentralized finance protocols with institutional-grade security.
            </p>
          </div>
        </div>

        {/* Development Tools Section - Only in Development */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-white rounded-xl shadow-sm p-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🛠️ Development Tools</h2>
            <p className="text-gray-600 mb-6">
              Access development utilities and tools for building and testing MyCora features.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <a
                href="/dev-tools"
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="font-semibold text-gray-900">Dev Tools Dashboard</div>
                <div className="text-sm text-gray-600">Comprehensive development utilities</div>
              </a>
              <a
                href="/dev"
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="font-semibold text-gray-900">Dev Console</div>
                <div className="text-sm text-gray-600">Advanced debugging tools</div>
              </a>
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="font-semibold text-gray-700">Quick Actions</div>
                <div className="text-sm text-gray-600">Development shortcuts</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Navigation */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/networks" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="font-semibold text-gray-900">Networks</div>
            <div className="text-sm text-gray-600">Blockchain networks</div>
          </a>
          <a href="/investors" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="font-semibold text-gray-900">Investors</div>
            <div className="text-sm text-gray-600">Investor management</div>
          </a>
          <a href="/admin" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="font-semibold text-gray-900">Admin</div>
            <div className="text-sm text-gray-600">Administrative tools</div>
          </a>
          <a href="/onboarding" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="font-semibold text-gray-900">Onboarding</div>
            <div className="text-sm text-gray-600">Get started guide</div>
          </a>
        </div>
      </div>
    </div>
  )
}
