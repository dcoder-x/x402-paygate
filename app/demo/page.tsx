"use client";

import { useState } from "react";

export default function DemoPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Default values
  const [target, setTarget] = useState("/api/demo"); // Relative to current host
  const [price, setPrice] = useState("0.1"); // STX
  const [recipient, setRecipient] = useState("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"); // Standard testnet address mock
  const [promptText, setPromptText] = useState("Hello world this is a test prompt for summarization.");
  const [successUrl, setSuccessUrl] = useState("");
  const [cancelUrl, setCancelUrl] = useState("");

  const addLog = (msg: string, type: "info" | "success" | "error" = "info") => {
      const time = new Date().toLocaleTimeString([], { hour12: false });
      setLogs(prev => [...prev, `[${time}] ${type.toUpperCase()}: ${msg}`]);
  };

  const handlePayAndExecute = async () => {
    setLoading(true);
    setLogs([]);
    addLog("Starting PayGate flow...", "info");

    try {
      // 1. Initial Request (No Payment)
      addLog("Sending initial request to PayGate (no payment provided)...", "info");
      const fullTarget = target.startsWith("http") ? target : window.location.origin + target;
      
      const payload = {
        target: fullTarget,
        price,
        asset: "STX",
        recipient,
        body: { prompt: promptText },
        successUrl: successUrl || undefined,
        cancelUrl: cancelUrl || undefined
      };

      addLog("Request body:", "info");
      addLog(JSON.stringify(payload, null, 2), "info");

      // Check if we already have a paid requestId in state (optional, simplified for now)
      let currentRequestId = "";

      const res1 = await fetch("/api/paygate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res1.status === 402) {
        addLog("Response: 402 Payment Required", "info");
        const data = await res1.json();
        
        if (data.payment && data.payment.checkoutUrl) {
          addLog("Hosted Checkout Required.", "info");
          const checkoutUrl = data.payment.checkoutUrl;
          currentRequestId = data.payment.requestId;
          
          addLog(`Request ID: ${currentRequestId}`, "info");
          addLog(`Opening Checkout: ${checkoutUrl}`, "info");
          
          // Open Checkout in new tab
          window.open(checkoutUrl, "_blank");
          
          addLog("Opened checkout in new tab. Complete payment to continue.", "info");
          addLog("Polling for payment confirmation...", "info");
          
          // Poll for payment status with exponential backoff
          let paid = false;
          let pollCount = 0;
          const maxPolls = 60;
          let pollInterval = 2000;

          for (let i = 0; i < maxPolls; i++) {
             await new Promise(r => setTimeout(r, pollInterval)); 
             pollCount++;
             
             try {
               // Try to consume the request
               const resRetry = await fetch("/api/paygate", {
                  method: "POST",
                  headers: { 
                    "Content-Type": "application/json",
                    "X-X402-RequestId": currentRequestId
                  },
                  body: JSON.stringify(payload),
                  signal: AbortSignal.timeout(5000)
               });
               
               if (resRetry.ok) {
                 const successData = await resRetry.json();
                 addLog("✓ Payment verified on-chain!", "success");
                 addLog("✓ Request forwarded to target API", "success");
                 addLog("Target Response:", "success");
                 addLog(JSON.stringify(successData.data || successData, null, 2), "success");
                 paid = true;
                 break;
               } else if (resRetry.status === 402) {
                   // Still waiting, continue polling
                   if (pollCount % 5 === 0) {
                     addLog(`Still waiting for payment... (${pollCount}s elapsed)`, "info");
                   }
               } else {
                   // Other error
                   const errText = await resRetry.text();
                   addLog(`Error: ${resRetry.status} - ${errText}`, "error");
                   break;
               }
             } catch (pollErr: any) {
               // Network error, continue polling
               if (pollErr.name === "AbortError") {
                 addLog("Request timeout, retrying...", "info");
               }
             }
             
             // Increase interval over time (max 5 seconds)
             pollInterval = Math.min(5000, pollInterval + 500);
          }
          
          if (!paid) {
            addLog("Polling timed out (5 minutes). Please verify your payment status.", "error");
            addLog("If payment was sent, you can manually retry the request.", "info");
          }

        } else {
          addLog("Error: 402 received but no checkout URL found.", "error");
        }

      } else if (res1.ok) {
        const data = await res1.json();
        addLog("Success (No payment needed?): " + JSON.stringify(data), "success");
      } else {
        addLog("Error: " + res1.status + " " + await res1.text(), "error");
      }

    } catch (e: any) {
      addLog("Client Error: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-purple-500/30">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-600 rounded flex items-center justify-center font-bold text-white">₿</div>
            <span className="font-bold text-lg tracking-tight">x402 PayGate</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-gray-400">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <a href="#" className="text-white font-medium">Demo</a>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Try PayGate Live
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Configure a payment request and watch the complete flow in action. Test wallet checkout, verification, and API proxying.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* Left: Configuration Form */}
          <div className="bg-[#111] rounded-3xl border border-white/10 p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               <span className="w-2 h-6 bg-teal-400 rounded-full"></span> Configuration
            </h2>
            
            <div className="space-y-6">
              
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Target Endpoint</label>
                <div className="relative group">
                    <input 
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl p-4 text-sm focus:border-teal-500/50 outline-none transition-all placeholder:text-gray-700 font-mono" 
                      value={target} 
                      onChange={e => setTarget(e.target.value)} 
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none opacity-50">
                        <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                        <span className="text-xs text-gray-500">Active</span>
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Price (STX)</label>
                  <input 
                    className="w-full bg-black/50 border border-white/10 text-white rounded-xl p-4 text-sm focus:border-purple-500/50 outline-none transition-all font-mono" 
                    value={price} 
                    onChange={e => setPrice(e.target.value)} 
                  />
                </div>
                 <div className="grid gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Recipient</label>
                  <input 
                    className="w-full bg-black/50 border border-white/10 text-white rounded-xl p-4 text-sm focus:border-purple-500/50 outline-none transition-all font-mono text-gray-400 truncate" 
                    value={recipient} 
                    onChange={e => setRecipient(e.target.value)} 
                    title={recipient}
                  />
                </div>


              </div>
              <div className="grid grid-cols-1 gap-4 w-full">
                 <div className="grid gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Success URL (Optional)</label>
                  <input 
                    className="w-full bg-black/50 border border-white/10 text-white rounded-xl p-4 text-sm focus:border-green-500/50 outline-none transition-all font-mono placeholder:text-gray-700" 
                    value={successUrl} 
                    onChange={e => setSuccessUrl(e.target.value)} 
                    placeholder="https://example.com/success"
                  />
                </div>
                 <div className="grid gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Cancel URL (Optional)</label>
                  <input 
                    className="w-full bg-black/50 border border-white/10 text-white rounded-xl p-4 text-sm focus:border-red-500/50 outline-none transition-all font-mono placeholder:text-gray-700" 
                    value={cancelUrl} 
                    onChange={e => setCancelUrl(e.target.value)} 
                    placeholder="https://example.com/cancel"
                  />
                </div>
              </div>
               <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Payload Data</label>
                <textarea 
                  className="w-full bg-black/50 border border-white/10 text-white rounded-xl p-4 text-sm h-32 focus:border-purple-500/50 outline-none transition-all resize-none font-mono leading-relaxed" 
                  value={promptText}
                  onChange={e => setPromptText(e.target.value)}
                />
              </div>

              <button 
                onClick={handlePayAndExecute}
                disabled={loading}
                className="w-full bg-teal-500 text-white font-bold py-4 rounded-xl hover:bg-teal-600 transition-all disabled:opacity-50 shadow-lg active:scale-[0.98]"
              >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </span>
                ) : "Execute Request →"}
              </button>
            </div>
          </div>

          {/* Right: Terminal / Logs */}
          <div className="bg-[#050505] rounded-3xl border border-white/10 overflow-hidden flex flex-col h-full min-h-[500px] shadow-2xl relative group">
             
             {/* Terminal Header */}
             <div className="bg-[#111] px-6 py-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                    </div>
                    <span className="ml-3 text-xs font-mono text-gray-500">paygate-cli — v1.0.0</span>
                </div>
                <div className="text-xs font-mono text-gray-600">bash</div>
             </div>

             {/* Terminal Body */}
             <div className="flex-1 p-6 font-mono text-xs overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {logs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-800 opacity-50">
                        <span className="text-4xl mb-2">⌨️</span>
                        <p>Waiting for command execution...</p>
                    </div>
                )}
                
                {logs.map((log, i) => {
                    let colorClass = "text-gray-300";
                    if (log.includes("SUCCESS:")) colorClass = "text-green-400 font-bold";
                    if (log.includes("ERROR:")) colorClass = "text-red-400 font-bold";
                    if (log.includes("WARN:")) colorClass = "text-yellow-400";
                    
                    return (
                        <div key={i} className={`break-all flex gap-3 ${colorClass} animate-in fade-in slide-in-from-left-2 duration-300`}>
                            <span className="opacity-30 select-none">❯</span>
                            <span>{log}</span>
                        </div>
                    );
                })}
                
                {loading && (
                    <div className="flex gap-3 text-gray-500 animate-pulse">
                        <span className="opacity-30 select-none">❯</span>
                        <span>_</span>
                    </div>
                )}
             </div>

             {/* Gradient glow effect */}
             <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>
          </div>

        </div>

      </div>
    </div>
  );
}
