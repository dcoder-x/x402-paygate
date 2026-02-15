import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-teal-500/30">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded flex items-center justify-center text-xs font-bold text-white">₿</div>
            <span className="font-bold text-xl tracking-tight">x402 PayGate</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-gray-400 hover:text-teal-400 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-400 hover:text-teal-400 transition-colors">How it works</a>
            <Link href="/dashboard" className="text-sm font-medium text-white hover:text-teal-300 transition-colors">Sign In</Link>
            <Link href="/dashboard" className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-bold py-2 px-4 rounded-full transition-all shadow-lg shadow-teal-500/20">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-teal-500/20 rounded-full blur-[120px] -z-10 mix-blend-screen"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] -z-10 mix-blend-screen"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-teal-300 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            Live on Stacks Testnet
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both">
            Monetize Any API with <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-500">HTTP 402 & Stacks</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100 fill-mode-both">
            Turn your API into a revenue stream instantly. PayGate enforces logic-less payments, handles on-chain verification, and proxies requests securely.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200 fill-mode-both">
            <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl shadow-white/5">
              Register API
            </Link>
            <Link href="/demo" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm flex items-center justify-center gap-2 group">
              <span>Try Live Demo</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-gray-900/50 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Infrastructure</h2>
                <p className="text-gray-400">Everything you need to monetize your data.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="p-8 rounded-3xl bg-gray-950 border border-gray-800 hover:border-teal-500/30 transition-colors group">
                    <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                        <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3">Instant Monetization</h3>
                    <p className="text-gray-400 leading-relaxed">No SDKs needed. Just wrap your existing API endpoint with PayGate and start accepting STX.</p>
                </div>

                {/* Feature 2 */}
                <div className="p-8 rounded-3xl bg-gray-950 border border-gray-800 hover:border-purple-500/30 transition-colors group">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                        <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3">On-Chain Verification</h3>
                    <p className="text-gray-400 leading-relaxed">Stateless proof-of-payment. PayGate verifies transaction headers directly against the Stacks blockchain.</p>
                </div>

                {/* Feature 3 */}
                <div className="p-8 rounded-3xl bg-gray-950 border border-gray-800 hover:border-blue-500/30 transition-colors group">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                       <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3">Dual Mode</h3>
                    <p className="text-gray-400 leading-relaxed">Use our hosted Wrapper URLs or integrate directly with the Proxy API for dynamic payment logic.</p>
                </div>
            </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-black overflow-hidden relative">
         <div className="absolute top-1/2 left-0 w-full h-[500px] bg-gradient-to-r from-teal-500/5 to-purple-500/5 -translate-y-1/2 -skew-y-3 pointer-events-none"></div>

         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-8">Seamless Integration</h2>
                    
                    <div className="space-y-8">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-bold text-white shrink-0">1</div>
                            <div>
                                <h4 className="font-bold text-lg text-white mb-2">Client Requests Resource</h4>
                                <p className="text-gray-400 text-sm">Your app requests the PayGate URL. PayGate returns <code>402 Payment Required</code> with price and recipient.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                             <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-bold text-white shrink-0">2</div>
                            <div>
                                <h4 className="font-bold text-lg text-white mb-2">User Pays via Wallet</h4>
                                <p className="text-gray-400 text-sm">User signs a Stacks transaction. No custodial middleman. Funds go directly to you.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                             <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-bold text-white shrink-0">3</div>
                            <div>
                                <h4 className="font-bold text-lg text-white mb-2">Retry with Proof</h4>
                                <p className="text-gray-400 text-sm">Client retries the request with <code>x-402-tx-id</code> header. PayGate verifies & proxies the data.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 font-mono text-sm relative shadow-2xl">
                    <div className="absolute top-4 right-4 flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                    </div>
                    <div className="text-gray-500 mb-4"># Client Implementation Example</div>
                    
                    <div className="text-purple-400">const<span className="text-white"> response = </span><span className="text-yellow-300">await</span><span className="text-white"> fetch(</span><span className="text-green-300">"/w/api_123/data"</span><span className="text-white">);</span></div>
                    <br/>
                    <div className="text-gray-400">// 1. Handle 402 Payment Required</div>
                    <div className="text-purple-400">if<span className="text-white"> (response.status === </span><span className="text-orange-400">402</span><span className="text-white">) {"{"}</span></div>
                    <div className="pl-4 text-white">
                        <span className="text-purple-400">const</span> {"{ price, recipient }"} = <span className="text-yellow-300">await</span> response.json();
                    </div>
                    <br/>
                    <div className="pl-4 text-gray-400">// 2. Trigger Wallet Payment</div>
                    <div className="pl-4 text-white">
                        <span className="text-purple-400">const</span> txId = <span className="text-yellow-300">await</span> wallet.sendSTX(recipient, price);
                    </div>
                    <br/>
                    <div className="pl-4 text-gray-400">// 3. Retry with Proof</div>
                    <div className="pl-4 text-white">
                        <span className="text-yellow-300">return</span> fetch(<span className="text-green-300">"/w/api_123/data"</span>, {"{"}
                    </div>
                    <div className="pl-8 text-white">headers: {"{"} <span className="text-green-300">"x-402-tx-id"</span>: txId {"}"}</div>
                    <div className="pl-4 text-white">{"}"});</div>
                    <div className="text-white">{"}"}</div>
                </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-12 text-center text-gray-500 text-sm">
        <p>© 2026 x402 PayGate. Built for the Stacks Ecosystem.</p>
      </footer>
    </div>
  );
}
