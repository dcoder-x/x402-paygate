"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function CompletePage() {
  useEffect(() => {
    // Optional: Auto-close after 3 seconds if opened in popup
    const timer = setTimeout(() => {
      if (window.opener) {
        window.close();
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-500">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Payment Verified!</h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            Your transaction has been confirmed on-chain. Your request is now unlocked and ready to execute.
          </p>
        </div>

        {/* Transaction Details */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left">
          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                <span className="font-bold">Confirmed</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Next Step</div>
              <p className="text-sm text-gray-300">Retry your API request with the provided request ID to receive your response.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button 
            onClick={() => window.close()}
            className="flex-1 bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all"
          >
            Close Window
          </button>
          <Link 
            href="/"
            className="flex-1 border border-gray-600 font-bold py-3 px-6 rounded-lg hover:bg-white/5 transition-all text-center"
          >
            Return Home
          </Link>
        </div>

        {/* Helpful text */}
        <p className="text-xs text-gray-500 pt-4">
          This window will close automatically in a few seconds.
        </p>
      </div>
    </div>
  );
}
