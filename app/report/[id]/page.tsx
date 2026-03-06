"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  ArrowLeft,
  Zap,
  Search,
  Accessibility,
  Shield,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
} from "lucide-react";
import type { AuditReport } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<AuditReport | null>(null);
  const [showRawMetrics, setShowRawMetrics] = useState(false);

  useEffect(() => {
    const reportData = sessionStorage.getItem(`audit-${params.id}`);
    if (reportData) {
      const parsed = JSON.parse(reportData);
      setReport(parsed.report);
    }
  }, [params.id]);

  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 mb-4 font-medium">
            Loading report...
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 80) return "text-blue-600 dark:text-blue-400";
    if (score >= 70) return "text-amber-600 dark:text-amber-400";
    if (score >= 60) return "text-orange-600 dark:text-orange-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getGradientColor = (score: number) => {
    if (score >= 90) return "from-emerald-500 to-teal-500";
    if (score >= 80) return "from-blue-500 to-cyan-500";
    if (score >= 70) return "from-amber-500 to-yellow-500";
    if (score >= 60) return "from-orange-500 to-red-500";
    return "from-rose-500 to-pink-500";
  };

  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/50";
      case "B":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50";
      case "C":
        return "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/50";
      case "D":
        return "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50";
      case "F":
        return "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/50";
      default:
        return "bg-slate-500 text-white";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const sections = [
    { key: "performance", title: "Performance", icon: Zap, color: "#6366f1" },
    { key: "seo", title: "SEO", icon: Search, color: "#a855f7" },
    {
      key: "accessibility",
      title: "Accessibility",
      icon: Accessibility,
      color: "#3b82f6",
    },
    { key: "security", title: "Security", icon: Shield, color: "#10b981" },
    {
      key: "bestPractices",
      title: "Best Practices",
      icon: CheckCircle2,
      color: "#14b8a6",
    },
  ] as const;

  const COLORS = ['#6366f1', '#a855f7', '#3b82f6', '#10b981', '#14b8a6'];

  const chartData = sections.map((section) => ({
    name: section.title,
    value: report.categories[section.key].score,
    fill: section.color,
  }));

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4 font-sans">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push("/")}
            className="group flex items-center gap-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            New Audit
          </button>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Audit Report
              </h1>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <ExternalLink className="w-4 h-4" />
                <a
                  href={report.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors break-all"
                >
                  {report.url}
                </a>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-500">
                <Clock className="w-4 h-4" />
                {formatDate(report.createdAt)}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 mb-8 overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Overall Health Score
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Comprehensive analysis of your website
                </p>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className={cn(
                  "text-7xl font-black bg-gradient-to-r bg-clip-text text-transparent",
                  getGradientColor(report.overallScore),
                )}
              >
                {report.overallScore}
              </motion.div>
            </div>
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
              {report.summary}
            </p>
          </div>
        </motion.div>

        {report.quickWins && report.quickWins.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 mb-8 text-white overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-8 h-8" />
                <h2 className="text-3xl font-bold">Quick Wins</h2>
              </div>
              <p className="text-indigo-100 mb-6 text-lg">
                Start with these high-impact improvements to boost your score
                quickly:
              </p>
              <div className="grid gap-4">
                {report.quickWins.map((win, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/20 transition-all"
                  >
                    <span className="flex-shrink-0 w-8 h-8 bg-white text-indigo-600 rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                      {idx + 1}
                    </span>
                    <span className="text-white font-medium text-lg">
                      {win}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-slate-200 dark:border-slate-800"
          >
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              Score Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-slate-200 dark:border-slate-800"
          >
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              Category Scores
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#6366f1"
                  radius={[8, 8, 0, 0]}
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {sections.map((section, index) => {
            const data = report.categories[section.key];
            const Icon = section.icon;
            return (
              <motion.div
                key={section.key}
                variants={itemVariant}
                whileHover={{ scale: 1.05, y: -5 }}
                className={cn(
                  "relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-800 overflow-hidden group cursor-pointer",
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity",
                    getGradientColor(data.score),
                  )}
                ></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <Icon
                      className="w-8 h-8"
                      style={{ color: section.color }}
                    />
                    <span
                      className={cn(
                        "px-4 py-2 rounded-full text-lg font-bold",
                        getGradeBadgeColor(data.grade),
                      )}
                    >
                      {data.grade}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {section.title}
                  </h3>
                  <div
                    className={cn(
                      "text-5xl font-black mb-2",
                      getScoreColor(data.score),
                    )}
                  >
                    {data.score}
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${data.score}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                      className={cn(
                        "h-full bg-gradient-to-r",
                        getGradientColor(data.score),
                      )}
                    ></motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          {sections.map((section, index) => {
            const data = report.categories[section.key];
            const Icon = section.icon;
            return (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center gap-4 mb-6 flex-wrap">
                  <div
                    className={cn(
                      "p-3 rounded-2xl bg-gradient-to-br shadow-lg",
                      getGradientColor(data.score),
                    )}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {section.title}
                  </h2>
                  <span
                    className={cn(
                      "px-5 py-2 rounded-full text-xl font-bold ml-auto",
                      getGradeBadgeColor(data.grade),
                    )}
                  >
                    {data.grade}
                  </span>
                  <span
                    className={cn(
                      "text-3xl font-black",
                      getScoreColor(data.score),
                    )}
                  >
                    {data.score}/100
                  </span>
                </div>

                {data.issues.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        Issues Found
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {data.issues.map((issue, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 + idx * 0.05 }}
                          className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-200 dark:border-rose-800"
                        >
                          <span className="flex-shrink-0 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            !
                          </span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {issue}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.recommendations.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        Recommendations
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {data.recommendations.map((rec, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9 + index * 0.1 + idx * 0.05 }}
                          className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-200 dark:border-indigo-800"
                        >
                          <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            →
                          </span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {rec}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-slate-200 dark:border-slate-800"
        >
          <button
            onClick={() => setShowRawMetrics(!showRawMetrics)}
            className="flex items-center justify-between w-full text-left group"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Raw Metrics & Data
            </h2>
            {showRawMetrics ? (
              <ChevronUp className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 transition-colors" />
            ) : (
              <ChevronDown className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 transition-colors" />
            )}
          </button>

          {showRawMetrics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 space-y-4"
            >
              <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-600" />
                  PageSpeed Data
                </h3>
                <pre className="text-xs text-slate-700 dark:text-slate-300 overflow-x-auto p-4 bg-white dark:bg-slate-900 rounded-lg">
                  {JSON.stringify(report.rawMetrics.pageSpeed, null, 2)}
                </pre>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-lg flex items-center gap-2">
                  <Search className="w-5 h-5 text-purple-600" />
                  HTML Data
                </h3>
                <pre className="text-xs text-slate-700 dark:text-slate-300 overflow-x-auto p-4 bg-white dark:bg-slate-900 rounded-lg">
                  {JSON.stringify(report.rawMetrics.html, null, 2)}
                </pre>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Security Data
                </h3>
                <pre className="text-xs text-slate-700 dark:text-slate-300 overflow-x-auto p-4 bg-white dark:bg-slate-900 rounded-lg">
                  {JSON.stringify(report.rawMetrics.security, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
