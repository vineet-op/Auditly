"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Sparkles,
  Zap,
  Search,
  Accessibility,
  Shield,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to audit website");
      }

      sessionStorage.setItem(
        `audit-${data.reportId}`,
        JSON.stringify({
          report: data.report,
          url: url,
        }),
      );

      router.push(`/report/${data.reportId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const features = [
    { icon: Zap, label: "Performance & Speed", color: "text-indigo-600" },
    { icon: Search, label: "SEO Optimization", color: "text-purple-600" },
    { icon: Accessibility, label: "Accessibility", color: "text-blue-600" },
    { icon: Shield, label: "Security Headers", color: "text-green-600" },
    { icon: CheckCircle2, label: "Best Practices", color: "text-teal-600" },
    { icon: TrendingUp, label: "Core Web Vitals", color: "text-pink-600" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 px-4 font-sans">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mt-4 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl w-full  mb-4 font-sans font-semibold tracking-tight">
            Check your website performance with{" "}
            <span className="font-bold bg-gradient-to-r from-indigo-600 via-neutral-300 to-pink-600 bg-clip-text text-transparent  ">
              Auditly
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 font-sans font-medium">
            AI-powered website audits in seconds
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-800"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3"
              >
                Website URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                disabled={loading}
                className="w-full px-5 py-4 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-slate-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg font-medium"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 px-5 py-4 rounded-xl font-medium"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading || !url}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg
                    className="animate-spin h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Analyzing your website...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Start Audit
                </span>
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wide">
              What we analyze:
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl dark:hover:bg-slate-750 transition-colors"
                >
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {feature.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-slate-500 dark:text-slate-400 text-sm"
        >
          Powered by Google PageSpeed Insights & Gemini AI
        </motion.p>
      </motion.main>
    </div>
  );
}
