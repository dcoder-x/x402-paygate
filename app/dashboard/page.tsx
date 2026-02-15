"use client";

import { useState } from "react";
import Link from "next/link";

export default function Dashboard() {
    const [formData, setFormData] = useState({
        name: "",
        originalUrl: "",
        pricePerRequest: "1",
        stacksAddress: "",
        network: "testnet"
    });
    const [result, setResult] = useState<{ wrapperUrl: string; apiId: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        try {
            const res = await fetch("/api/paygate/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || "Registration failed");
            
            setResult({
                wrapperUrl: data.wrapperUrl,
                apiId: data.api.id
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
            <nav className="max-w-4xl mx-auto flex justify-between items-center mb-12">
                <Link href="/" className="font-bold text-xl flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded flex items-center justify-center text-xs font-bold text-white">₿</div>
                    x402 PayGate
                </Link>
            </nav>

            <main className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Register your API</h1>
                <p className="text-gray-400 mb-8">Start monetizing your API with HTTP 402 enforcement.</p>

                {result ? (
                    <div className="bg-gray-900 border border-green-500/30 rounded-lg p-8 animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center gap-3 mb-4 text-green-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <h2 className="text-xl font-bold">API Registered Successfully!</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Your Wrapper URL</label>
                                <div className="flex gap-2">
                                    <input 
                                        readOnly 
                                        value={result.wrapperUrl} 
                                        className="w-full bg-gray-950 border border-gray-700 rounded px-4 py-3 font-mono text-sm text-teal-400 focus:outline-none"
                                    />
                                    <button 
                                        onClick={() => navigator.clipboard.writeText(result.wrapperUrl)}
                                        className="bg-gray-800 hover:bg-gray-700 px-4 rounded text-sm font-semibold transition"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-950/50 p-4 rounded border border-gray-800 text-sm text-gray-400">
                                <p className="mb-2"><strong className="text-white">Next Steps:</strong></p>
                                <ol className="list-decimal list-inside space-y-1">
                                    <li>Replace your frontend calls to use this Wrapper URL.</li>
                                    <li>If a user hasn't paid, they will receive a 402 error.</li>
                                    <li>Handle the 402 error to prompt payment.</li>
                                </ol>
                            </div>
                            
                            <button 
                                onClick={() => setResult(null)}
                                className="text-sm text-gray-500 hover:text-white underline mt-2"
                            >
                                Register another API
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900/50 border border-gray-800 p-8 rounded-xl">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded text-sm mb-4">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2">API Name</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. My AI Generator"
                                className="w-full bg-gray-950 border border-gray-700 rounded px-4 py-3 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Original API URL</label>
                            <input
                                required
                                type="url"
                                placeholder="https://api.myapp.com"
                                className="w-full bg-gray-950 border border-gray-700 rounded px-4 py-3 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition"
                                value={formData.originalUrl}
                                onChange={e => setFormData({...formData, originalUrl: e.target.value})}
                            />
                            <p className="text-xs text-gray-500 mt-1">Where should we forward valid requests?</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Price per Request (STX)</label>
                                <input
                                    required
                                    type="number"
                                    step="0.000001"
                                    min="0"
                                    className="w-full bg-gray-950 border border-gray-700 rounded px-4 py-3 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition"
                                    value={formData.pricePerRequest}
                                    onChange={e => setFormData({...formData, pricePerRequest: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Network</label>
                                <select
                                    className="w-full bg-gray-950 border border-gray-700 rounded px-4 py-3 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition"
                                    value={formData.network}
                                    onChange={e => setFormData({...formData, network: e.target.value})}
                                >
                                    <option value="testnet">Stacks Testnet</option>
                                    <option value="mainnet">Stacks Mainnet</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Receiving Stacks Wallet Address</label>
                            <input
                                required
                                type="text"
                                placeholder="SP2..."
                                className="w-full bg-gray-950 border border-gray-700 rounded px-4 py-3 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition"
                                value={formData.stacksAddress}
                                onChange={e => setFormData({...formData, stacksAddress: e.target.value})}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-teal-500 hover:bg-teal-400 text-black font-bold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Registering..." : "Create PayGate Wrapper"}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
}
