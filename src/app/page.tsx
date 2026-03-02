"use client";

import { useState } from "react";
import { Send, Terminal, Loader2, Copy, Check } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleTest = async () => {
    if (!url) {
      setError("Please enter a target URL");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      let customHeaders = {};
      if (headers.trim()) {
        try {
          customHeaders = JSON.parse(headers);
        } catch (e) {
          setError("Invalid JSON format for headers");
          setLoading(false);
          return;
        }
      }

      const response = await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          headers: customHeaders,
        }),
      });

      const data = await response.text();
      if (!response.ok) {
        setError(data || `Error: ${response.status}`);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [copiedLink, setCopiedLink] = useState(false);

  const getProxyLink = () => {
    if (!url) return "";
    const baseUrl = window.location.origin;
    return `${baseUrl}/api/proxy?url=${encodeURIComponent(url)}`;
  };

  const copyProxyLink = () => {
    navigator.clipboard.writeText(getProxyLink());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 lg:p-12 text-slate-900">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-blue-200 shadow-lg">
            <Send className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Clash Proxy Service</h1>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Target Subscription URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/clash.yaml"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Custom Headers (JSON) - <span className="text-slate-400 italic font-normal">Optional for testing</span>
            </label>
            <textarea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              placeholder='{"User-Agent": "Clash/1.0", "Custom-Header": "Value"}'
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm h-24"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleTest}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Terminal className="w-5 h-5" />}
              {loading ? "Requesting..." : "Test Proxy Request"}
            </button>
            {url && (
              <button
                onClick={copyProxyLink}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors border border-slate-200"
                title="Copy Proxy GET Link"
              >
                {copiedLink ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                <span className="hidden sm:inline">{copiedLink ? "Link Copied!" : "Copy Proxy Link"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Result Section */}
        {result && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Response Content</h2>
              <button
                onClick={copyToClipboard}
                className="text-slate-500 hover:text-blue-600 flex items-center gap-1.5 text-sm transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy result"}
              </button>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto border border-slate-800 shadow-lg">
              <pre className="text-emerald-400 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {result}
              </pre>
            </div>
          </div>
        )}

        {/* Info */}
        {!result && !loading && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm">Input a subscription URL above to see the proxied content here.</p>
          </div>
        )}
      </div>
    </main>
  );
}
