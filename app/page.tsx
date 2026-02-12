import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded flex items-center justify-center text-xs font-bold text-white">₿</div>
            <span className="font-bold text-lg">x402 PayGate</span>
          </div>
          <Link href="/demo" className="px-6 py-2.5 bg-white text-black text-sm font-bold hover:bg-gray-100 transition rounded">
            Quick Demo
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-32">
          {/* Left Column */}
          <div className="space-y-8">
            <h1 className="text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
              HTTP 402 Payment Enforcement for APIs
            </h1>

            <div className="space-y-6 text-gray-300 text-base leading-relaxed">
              <p>
                <span className="font-semibold text-white">x402 PayGate</span> is a hosted, non-custodial payment gateway that enforces HTTP 402 (Payment Required) for APIs built on Stacks.
              </p>
              
              <p>
                Developers integrate a single endpoint. PayGate handles payment enforcement, hosted checkout, wallet-triggered payments, on-chain verification, replay protection, and automatic request forwarding.
              </p>

              <div className="space-y-3">
                <p className="font-semibold text-white">PayGate manages:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-3">
                    <span className="text-teal-400 font-bold">✓</span>
                    <span>HTTP 402 payment enforcement</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-teal-400 font-bold">✓</span>
                    <span>Hosted checkout UI with Stacks wallet integration</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-teal-400 font-bold">✓</span>
                    <span>On-chain transaction verification</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-teal-400 font-bold">✓</span>
                    <span>Replay attack protection</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-teal-400 font-bold">✓</span>
                    <span>Reverse proxy forwarding to your API</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <p className="text-sm">
                  <span className="text-teal-400 font-semibold">Key Principle:</span> Payments flow directly from consumer wallet → developer wallet on-chain. PayGate never holds funds.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link 
                href="/demo"
                className="px-8 py-3 bg-white text-black font-semibold rounded text-center hover:bg-gray-100 transition"
              >
                Try Quick Demo
              </Link>
              <a 
                href="#how-it-works"
                className="px-8 py-3 border border-gray-600 text-white font-semibold rounded text-center hover:bg-gray-900 transition"
              >
                How it Works ↓
              </a>
            </div>
          </div>

          {/* Right Column - Architecture Flow */}
          <div className="relative space-y-6">
            {/* Flow Diagram */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-4">
              <div className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Request Flow</div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-xs font-bold text-teal-400">1</div>
                  <div>
                    <div className="text-sm font-semibold">Consumer calls API</div>
                    <div className="text-xs text-gray-500">POST /api/endpoint</div>
                  </div>
                </div>

                <div className="h-6 flex justify-center">
                  <div className="w-0.5 bg-gradient-to-b from-gray-700 to-transparent"></div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-xs font-bold text-teal-400">2</div>
                  <div>
                    <div className="text-sm font-semibold">PayGate responds with 402</div>
                    <div className="text-xs text-gray-500">Returns checkout URL</div>
                  </div>
                </div>

                <div className="h-6 flex justify-center">
                  <div className="w-0.5 bg-gradient-to-b from-gray-700 to-transparent"></div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-xs font-bold text-teal-400">3</div>
                  <div>
                    <div className="text-sm font-semibold">Consumer pays via wallet</div>
                    <div className="text-xs text-gray-500">Signs Stacks transaction</div>
                  </div>
                </div>

                <div className="h-6 flex justify-center">
                  <div className="w-0.5 bg-gradient-to-b from-gray-700 to-transparent"></div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-xs font-bold text-teal-400">4</div>
                  <div>
                    <div className="text-sm font-semibold">PayGate verifies on-chain</div>
                    <div className="text-xs text-gray-500">Confirms transaction</div>
                  </div>
                </div>

                <div className="h-6 flex justify-center">
                  <div className="w-0.5 bg-gradient-to-b from-gray-700 to-transparent"></div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-bold text-green-400">✓</div>
                  <div>
                    <div className="text-sm font-semibold">PayGate proxies to API</div>
                    <div className="text-xs text-gray-500">Returns final response</div>
                  </div>
                </div>
              </div>
            </div>

            {/* API Request Example */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Integration</div>
              <div className="bg-gray-950 rounded p-3 font-mono text-xs text-gray-300 overflow-x-auto">
                <div className="text-green-400">POST /api/paygate</div>
                <div className="text-gray-500">
                  <div className="mt-2 text-yellow-400">{"{"}</div>
                  <div className="pl-4">"target": "https://api.example.com/data",</div>
                  <div className="pl-4">"price": "0.1",</div>
                  <div className="pl-4">"asset": "STX",</div>
                  <div className="pl-4">"recipient": "SP2..."</div>
                  <div className="text-yellow-400">{"}"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="border-t border-gray-800 pt-32 mb-32">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-400 mb-16 max-w-2xl">PayGate transforms payment from a manual, fragmented process into a native HTTP primitive.</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-gray-800 hover:border-teal-500/50 transition space-y-3">
              <div className="w-10 h-10 bg-teal-500/20 rounded flex items-center justify-center text-sm font-bold text-teal-400">1</div>
              <h3 className="font-bold text-lg">One Endpoint</h3>
              <p className="text-sm text-gray-400">Add a single POST endpoint to your API. PayGate handles the rest: enforcement, checkout, verification, and proxy forwarding.</p>
            </div>

            <div className="p-6 rounded-lg border border-gray-800 hover:border-teal-500/50 transition space-y-3">
              <div className="w-10 h-10 bg-teal-500/20 rounded flex items-center justify-center text-sm font-bold text-teal-400">2</div>
              <h3 className="font-bold text-lg">HTTP 402 Enforcement</h3>
              <p className="text-sm text-gray-400">When payment is required, PayGate returns HTTP 402 with a checkout URL. Consumers pay directly from their wallet—no custody, no friction.</p>
            </div>

            <div className="p-6 rounded-lg border border-gray-800 hover:border-teal-500/50 transition space-y-3">
              <div className="w-10 h-10 bg-teal-500/20 rounded flex items-center justify-center text-sm font-bold text-teal-400">3</div>
              <h3 className="font-bold text-lg">Verified & Forwarded</h3>
              <p className="text-sm text-gray-400">PayGate verifies the transaction on Stacks, prevents replays, and automatically forwards your request to the target API with proof of payment.</p>
            </div>
          </div>
        </div>

        {/* Why PayGate Section */}
        <div className="border-t border-gray-800 pt-32">
          <h2 className="text-4xl font-bold mb-4">Why PayGate?</h2>
          <p className="text-gray-400 mb-16 max-w-2xl">Traditional payment options don't work for APIs. PayGate makes payment a first-class HTTP concept.</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-teal-400">✓</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Non-Custodial</h3>
                  <p className="text-gray-400 text-sm">Payments flow directly from consumer to developer wallet on-chain. PayGate never touches funds.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-teal-400">✓</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Instant Verification</h3>
                  <p className="text-gray-400 text-sm">Stacks transactions are verified on-chain. No manual confirmation needed, no centralized service.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-teal-400">✓</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Replay Protected</h3>
                  <p className="text-gray-400 text-sm">Built-in replay attack protection. Every payment is unique and can only be used once.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-teal-400">✓</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Developer Friendly</h3>
                  <p className="text-gray-400 text-sm">One API endpoint. No smart contracts to write. No custody wallets to manage. Start collecting payments in minutes.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-teal-400">✓</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Stacks Native</h3>
                  <p className="text-gray-400 text-sm">Built on Stacks L2 for Bitcoin. Payments settle on Bitcoin with Stacks security and speed.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-teal-400">✓</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Transparent Pricing</h3>
                  <p className="text-gray-400 text-sm">No hidden fees. You set the price. You keep the payment. PayGate is open source infrastructure.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
