"use client";

import { useState, useEffect } from "react";

export default function DemoPage() {
  const [mode, setMode] = useState<"wrapper" | "proxy">("wrapper");
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [network, setNetwork] = useState<"mainnet" | "testnet">("testnet");
  
  // Wrapper Mode State
  const [wrapperUrl, setWrapperUrl] = useState("");
  
  // Proxy Mode State
  const [target, setTarget] = useState("/api/demo"); 
  const [price, setPrice] = useState("0.1"); 
  const [recipient, setRecipient] = useState("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"); 
  const [promptText, setPromptText] = useState("Hello world this is a test prompt.");

  const loadStacksLib = async () => {
    try {
      const mod = await import("@stacks/connect");
      return {
        connect: mod.connect,
        disconnect: mod.disconnect,
        getLocalStorage: mod.getLocalStorage,
        isConnected: mod.isConnected,
        request: mod.request
      };
    } catch (e) {
      console.error("Failed to load @stacks/connect:", e);
      throw e;
    }
  };

  // Check for existing connection on mount
  useEffect(() => {
    loadStacksLib()
      .then(async ({ getLocalStorage, isConnected }) => {
        if (isConnected()) {
          const storedData = getLocalStorage();
          if (storedData?.addresses?.stx?.[0]) {
            setUserData({
              addresses: storedData.addresses,
              stxAddress: storedData.addresses.stx[0].address
            });
            addLog("Wallet already connected: " + storedData.addresses.stx[0].address, "success");
          }
        }
      })
      .catch(err => {
        console.error("Failed to check connection:", err);
        addLog("System Error: Failed to load wallet library.", "error");
      });
  }, []);

  const handleConnect = async () => {
    try {
      const { connect,getLocalStorage } = await loadStacksLib();

      const data = getLocalStorage();
      
      addLog("Opening wallet connection...", "info");
      
      const response = await connect({
        // Options are optional - using defaults
      });
      
      if (data?.addresses?.stx?.[0]) {
        setUserData({
          addresses: data.addresses,
          stxAddress: data.addresses.stx[0].address
        });
        addLog("Wallet connected: " + data.addresses.stx[0].address, "success");
      }
    } catch (error: any) {
      console.error("Connect error:", error);
      addLog("Failed to connect wallet: " + (error?.message || "Unknown error"), "error");
    }
  };

  const handleDisconnect = async () => {
    try {
      const { disconnect } = await loadStacksLib();
      disconnect();
      setUserData(null);
      addLog("Wallet disconnected", "info");
    } catch (error) {
      console.error("Disconnect error:", error);
      setUserData(null);
    }
  };

  const addLog = (msg: string, type: "info" | "success" | "error" = "info") => {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    setLogs(prev => [...prev, `[${time}] ${type.toUpperCase()}: ${msg}`]);
  };

  const cleanLog = () => setLogs([]);

  const handleWrapperRequest = async () => {
    if (!wrapperUrl) {
      addLog("Error: Please enter a valid Wrapper URL first.", "error");
      return;
    }
    
    setLoading(true);
    cleanLog();
    addLog(`[Wrapper Mode] Requesting: ${wrapperUrl}`, "info");

    try {
      const res = await fetch(wrapperUrl);
      
      if (res.status === 402) {
        await handle402Response(res, wrapperUrl, {}, "GET");
      } else if (res.ok) {
        const data = await res.json();
        addLog("Success: " + JSON.stringify(data), "success");
      } else {
        addLog(`Error: ${res.status} ${res.statusText}`, "error");
      }
    } catch (e: any) {
      addLog("Network Error: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProxyRequest = async () => {
    setLoading(true);
    cleanLog();
    addLog(`[Proxy Mode] Sending request to PayGate...`, "info");

    const payload = {
      target: target.startsWith("http") ? target : window.location.origin + target,
      price,
      asset: "STX",
      recipient,
      body: { prompt: promptText }
    };
    
    addLog("Payload: " + JSON.stringify(payload, null, 2), "info");

    try {
      const res = await fetch("/api/paygate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.status === 402) {
        await handle402Response(res, "/api/paygate", payload, "POST");
      } else if (res.ok) {
        const data = await res.json();
        addLog("Success: " + JSON.stringify(data), "success");
      } else {
        const errorText = await res.text();
        addLog(`Error: ${res.status} ${res.statusText} - ${errorText}`, "error");
      }
    } catch (e: any) {
      addLog("Network Error: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handle402Response = async (
    res: Response, 
    endpoint: string, 
    bodyPayload: any,
    method: "GET" | "POST" = "GET"
  ) => {
    const paymentRequiredHeader = res.headers.get("payment-required");
    if (!paymentRequiredHeader) {
      addLog("Error: Missing payment-required header", "error");
      return;
    }

    try {
      const paymentRequired = JSON.parse(atob(paymentRequiredHeader));
      addLog(`Response: 402 Payment Required`, "info");
      
      if (!paymentRequired.accepts || paymentRequired.accepts.length === 0) {
        addLog("Error: No payment methods available", "error");
        return;
      }

      const requirement = paymentRequired.accepts[0];
      const amountStx = Number(requirement.amount) / 1000000;
      addLog(`Price: ${amountStx} ${requirement.asset}`, "info");
      addLog(`Recipient: ${requirement.payTo}`, "info");
      
      if (!userData) {
        addLog("⚠️ Please Connect Wallet to Pay", "error");
        await handleConnect();
        return;
      }

      // Trigger Wallet Payment
      await handleRealWalletPayment(requirement, endpoint, bodyPayload, method);
    } catch (e: any) {
      addLog("Error parsing payment-required header: " + e.message, "error");
    }
  };

  const handleRealWalletPayment = async (
    requirement: any, 
    endpoint: string, 
    bodyPayload: any,
    method: "GET" | "POST"
  ) => {
    addLog("--- Initiating Wallet Transaction ---", "info");
    
    try {
      const { request } = await loadStacksLib();


      console.log("paymenyt network : ", network)
      // Use the request method for stxTransfer
      const response = await request('stx_transferStx', {
        recipient: requirement.payTo,
        amount: String(requirement.amount), // microSTX as string
        memo: "x402-paygate",
        network: network,
      });

      if (response?.txid) {
        addLog(`Transaction Broadcasted! TxID: ${response.txid}`, "success");
        addLog("Waiting 3s for propagation...", "info");
        await new Promise(r => setTimeout(r, 3000));
        
        // Construct V2 Payload with REAL TxID
        const v2Payload = {
          x402Version: 2,
          accepted: requirement,
          payload: {
            transaction: response.txid
          }
        };
        const encodedSignature = btoa(JSON.stringify(v2Payload));

        addLog("--- Retrying with Payment Proof ---", "info");
        
        // Retry Request
        const headers: Record<string, string> = {
          "payment-signature": encodedSignature
        };

        if (method === "POST") {
          headers["Content-Type"] = "application/json";
        }

        const fetchOptions: RequestInit = {
          method,
          headers
        };

        if (method === "POST" && bodyPayload) {
          fetchOptions.body = JSON.stringify(bodyPayload);
        }

        const retryRes = await fetch(endpoint, fetchOptions);

        if (retryRes.ok) {
          const responseData = await retryRes.json();
          addLog("✓ SUCCESS: Payment Verified via Chain/Mempool", "success");
          addLog("Response: " + JSON.stringify(responseData, null, 2), "success");
        } else {
          try {
            const err = await retryRes.json();
            addLog(`Verification Pending/Failed: ${err.details || err.error}`, "error"); 
            addLog("Note: Tx might need 1+ confirmations depending on API.", "info");
          } catch (e) {
            addLog(`Failed: ${retryRes.status} ${retryRes.statusText}`, "error");
          }
        }
      }
    } catch (error: any) {
      if (error?.message?.includes('User rejected')) {
        addLog("Transaction Cancelled by User", "error");
      } else {
        addLog("Payment Error: " + (error?.message || "Unknown error"), "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-teal-500/30">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-600 rounded flex items-center justify-center font-bold text-white">₿</div>
            <span className="font-bold text-lg tracking-tight">x402 PayGate</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-gray-400">
            {/* Network Selector */}
            <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-1">
              <button
                onClick={() => setNetwork("testnet")}
                className={`px-3 py-1 rounded text-xs font-bold transition ${
                  network === "testnet" ? "bg-teal-500 text-white" : "text-gray-400"
                }`}
              >
                Testnet
              </button>
              <button
                onClick={() => setNetwork("mainnet")}
                className={`px-3 py-1 rounded text-xs font-bold transition ${
                  network === "mainnet" ? "bg-teal-500 text-white" : "text-gray-400"
                }`}
              >
                Mainnet
              </button>
            </div>

            {!userData ? (
              <button 
                onClick={handleConnect} 
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-bold transition-all"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-white truncate max-w-[150px]">
                  {userData.stxAddress}
                </span>
                <button 
                  onClick={handleDisconnect} 
                  className="text-xs text-red-400 hover:text-red-300 ml-2"
                >
                  Disconnect
                </button>
              </div>
            )}
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
            Experience the HTTP 402 flow in two modes:
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="bg-gray-900 p-1 rounded-xl flex gap-1">
            <button 
              onClick={() => setMode("wrapper")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition ${
                mode === "wrapper" ? "bg-white text-black shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              Wrapper Mode
            </button>
            <button 
              onClick={() => setMode("proxy")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition ${
                mode === "proxy" ? "bg-white text-black shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              Proxy Mode
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* Left: Configuration Form */}
          <div className="bg-[#111] rounded-3xl border border-white/10 p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-teal-400 rounded-full"></span> 
              {mode === "wrapper" ? "Wrapper Configuration" : "Proxy Configuration"}
            </h2>
            
            <div className="space-y-6">
              
              {mode === "wrapper" ? (
                <>
                  <div className="grid gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                      Wrapper URL
                    </label>
                    <input 
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl p-4 text-sm focus:border-teal-500/50 outline-none transition-all placeholder:text-gray-700 font-mono" 
                      value={wrapperUrl}
                      onChange={e => setWrapperUrl(e.target.value)}
                      placeholder="http://localhost:3000/w/abcd-1234/todos/1"
                    />
                    <p className="text-xs text-gray-500">Register an API in the Dashboard to get this URL.</p>
                  </div>
                  <button 
                    onClick={handleWrapperRequest}
                    disabled={loading}
                    className="w-full bg-teal-500 text-white font-bold py-4 rounded-xl hover:bg-teal-600 transition-all disabled:opacity-50 shadow-lg active:scale-[0.98]"
                  >
                    {loading ? "Processing..." : "Test Wrapper URL →"}
                  </button>
                </>
              ) : (
                <>
                  <div className="grid gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                      Target Endpoint
                    </label>
                    <input 
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl p-4 text-sm focus:border-teal-500/50 outline-none transition-all placeholder:text-gray-700 font-mono" 
                      value={target} 
                      onChange={e => setTarget(e.target.value)} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                        Price (STX)
                      </label>
                      <input 
                        className="w-full bg-black/50 border border-white/10 text-white rounded-xl p-4 text-sm focus:border-purple-500/50 outline-none transition-all font-mono" 
                        value={price} 
                        onChange={e => setPrice(e.target.value)} 
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                        Recipient
                      </label>
                      <input 
                        className="w-full bg-black/50 border border-white/10 text-white rounded-xl p-4 text-sm focus:border-purple-500/50 outline-none transition-all font-mono text-gray-400 truncate" 
                        value={recipient} 
                        onChange={e => setRecipient(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                      Payload Data
                    </label>
                    <textarea 
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl p-4 text-sm h-32 focus:border-purple-500/50 outline-none transition-all resize-none font-mono leading-relaxed" 
                      value={promptText}
                      onChange={e => setPromptText(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleProxyRequest}
                    disabled={loading}
                    className="w-full bg-teal-500 text-white font-bold py-4 rounded-xl hover:bg-teal-600 transition-all disabled:opacity-50 shadow-lg active:scale-[0.98]"
                  >
                    {loading ? "Processing..." : "Send Proxy Request →"}
                  </button>
                </>
              )}

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
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-gray-600">{network}</span>
                <button
                  onClick={cleanLog}
                  className="text-xs text-gray-600 hover:text-gray-400 transition"
                >
                  Clear
                </button>
              </div>
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
                if (log.includes("Response: 402")) colorClass = "text-yellow-400 font-bold";
                
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
          </div>

        </div>

      </div>
    </div>
  );
}