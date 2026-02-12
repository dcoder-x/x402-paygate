"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { showSTXTransfer } from "@stacks/connect";
import { STACKS_TESTNET } from "@stacks/network";
import Link from "next/link";

interface RequestDetails {
  requestId: string;
  price: string;
  asset: string;
  recipient: string;
  target: string;
  status: string;
  createdAt: number;
  successUrl?: string;
  cancelUrl?: string;
}

export default function CheckoutPage() {
  const { requestId } = useParams();
  const router = useRouter();
  const [details, setDetails] = useState<RequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"IDLE" | "CONNECTING" | "VERIFYING" | "SUCCESS" | "FAILED">("IDLE");
  const [error, setError] = useState("");

  useEffect(() => {
    if (requestId) {
      fetch(`/api/checkout/${requestId}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
            setLoading(false);
          } else {
            setDetails(data);
            setLoading(false);
            // If already paid, show success
            if (data.status === "PAID" || data.status === "COMPLETED") {
                setStatus("SUCCESS");
            }
          }
        })
        .catch(err => {
          setError("Failed to load request");
          setLoading(false);
        });
    }
  }, [requestId]);

  const handleWalletPay = () => {
    if (!details) return;
    setStatus("CONNECTING");
    setError("");

    try {
      const amountMicroStx = Math.floor(parseFloat(details.price) * 1_000_000).toString();

      showSTXTransfer({
        recipient: details.recipient,
        amount: amountMicroStx,
        memo: details.requestId.substring(0, 34),
        network: STACKS_TESTNET,
        appDetails: {
          name: "x402 PayGate",
          icon: window.location.origin + "/favicon.ico",
        },
        onFinish: async (data) => {
          console.log("[v0] Transaction initiated:", data.txId);
          
          // Notify backend
          setStatus("VERIFYING");
          try {
              await fetch("/api/checkout/attach-tx", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ requestId, txId: data.txId })
              });
              
              // Start polling DB
              monitorPaymentStatus();
          } catch (e) {
              console.error("Failed to attach tx", e);
              setError("Failed to track transaction. Please contact support.");
              setStatus("FAILED");
          }
        },
        onCancel: () => {
          setStatus("IDLE");
          if (details.cancelUrl) {
            window.location.href = details.cancelUrl;
          } else {
            setError("Payment cancelled. Please try again.");
          }
        },
      });
    } catch (err: any) {
      setStatus("IDLE");
      console.error("[v0] Wallet error:", err);
      setError("Wallet connection failed. Please ensure you have Hiro or Leather installed.");
    }
  };

  const monitorPaymentStatus = async () => {
     // We will use a separate polling effect or just a simple recursive timeout here
     // simpler to use a recursive function than useEffect for this imperative flow
     
     const checkStatus = async () => {
         try {
             const res = await fetch(`/api/checkout/${requestId}`);
             const data = await res.json();
             
             if (data.status === "PAID" || data.status === "COMPLETED") {
                 setStatus("SUCCESS");
                 setTimeout(() => {
                    if (data.successUrl) {
                        window.location.href = data.successUrl;
                    } else {
                        router.push("/complete");
                    }
                 }, 2000);
                 return;
             }
             
             if (data.status === "FAILED") {
                 setStatus("FAILED");
                 setError("Payment failed verification. Please check blockchain.");
                 return;
             }
             
             // Keep polling if PENDING or VERIFYING (UI state)
             setTimeout(checkStatus, 3000);
             
         } catch (e) {
             console.error("Polling error", e);
             setTimeout(checkStatus, 5000);
         }
     };
     
     checkStatus();
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );

  if (error || !details)
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-400">{error || "Invalid Request"}</div>
          <Link href="/" className="text-teal-400 hover:text-teal-300">
            Return Home
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded flex items-center justify-center text-xs font-bold text-white">₿</div>
            <span className="font-bold text-lg">x402 PayGate</span>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-8">
            {/* Header */}
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Payment Required</h1>
              <p className="text-gray-400">Complete the payment to access this resource</p>
            </div>

            {/* Price Display */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center space-y-2">
              <div className="text-sm text-gray-400 uppercase tracking-wide font-semibold">Amount Due</div>
              <div className="text-5xl font-bold">
                {parseFloat(details.price).toFixed(2)}
                <span className="text-2xl text-gray-400 ml-2">{details.asset}</span>
              </div>
              <div className="text-xs text-gray-500 pt-2">Request ID: {details.requestId.substring(0, 12)}...</div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Payment Details */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Recipient</span>
                <span className="font-mono text-teal-400 text-xs">{details.recipient.substring(0, 16)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Network</span>
                <span className="text-gray-300">Stacks Testnet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className="text-gray-300">{details.status}</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleWalletPay}
              disabled={status !== "IDLE" && status !== "FAILED"}
              className={`w-full font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2
                ${status === "SUCCESS" ? "bg-green-500 text-white" : ""}
                ${status === "FAILED" || status === "IDLE" ? "bg-teal-500 hover:bg-teal-600 text-white" : ""}
                ${status === "CONNECTING" || status === "VERIFYING" ? "bg-teal-500/50 text-white cursor-not-allowed" : ""}
              `}
            >
              {status === "CONNECTING" && (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting Wallet...
                </>
              )}
              {status === "VERIFYING" && (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying Transaction...
                </>
              )}
              {status === "SUCCESS" && "Payment Successful!"}
              {(status === "IDLE" || status === "FAILED") && "Connect Wallet & Pay"}
            </button>

            {/* Help Text */}
            <p className="text-xs text-gray-500 text-center">
              Click the button above to connect your Stacks wallet (Hiro or Leather) and complete the payment.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
