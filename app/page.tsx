"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ComposedChart,
  Scatter,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart,
  Bar,
  Legend,
  Radar,
  RadarChart,
} from "recharts";

// --- MOCK DATA FOR VISUALISATIONS (can be replaced with real on-chain data later) ---
const priceSeries = [
  { t: "12:00", v: 0.91 },
  { t: "12:30", v: 0.94 },
  { t: "13:00", v: 0.89 },
  { t: "13:30", v: 0.93 },
  { t: "14:00", v: 0.95 },
  { t: "14:30", v: 0.97 },
  { t: "15:00", v: 0.98 },
];

const ignitionSeries = [
  { t: "Mon", v: 72 },
  { t: "Tue", v: 76 },
  { t: "Wed", v: 81 },
  { t: "Thu", v: 84 },
  { t: "Fri", v: 87 },
];

const synapticFlowSeries = [
  { n: "Core", v: 95 },
  { n: "Matrix", v: 75 },
  { n: "Fork", v: 88 },
  { n: "Staking", v: 92 },
  { n: "Archive", v: 60 },
  { n: "Gateway", v: 78 },
];

const cognitiveLoadSeries = [
  { s: "CPU", v: 78, f: 100 },
  { s: "RAM", v: 64, f: 100 },
  { s: "Bandwidth", v: 78, f: 100 },
  { s: "Disk I/O", v: 45, f: 100 },
  { s: "GPU", v: 91, f: 100 },
];

const networkThroughputSeries = [
  { t: "00", rx: 40, tx: 24 },
  { t: "04", rx: 30, tx: 13 },
  { t: "08", rx: 20, tx: 58 },
  { t: "12", rx: 27, tx: 39 },
  { t: "16", rx: 18, tx: 48 },
  { t: "20", rx: 23, tx: 38 },
];

const tokenDistributionData = [
  { name: "Treasury", value: 400 },
  { name: "Staking", value: 300 },
  { name: "Public", value: 300 },
  { name: "Team", value: 100 },
];

const ForkRadial = [
  { name: "Active", value: 72, fill: "#38bdf8" },
  { name: "Upcoming", value: 45, fill: "#a855f7" },
  { name: "Completed", value: 91, fill: "#22c55e" },
];

const stakingYieldSeries = [
  { m: "M1", v: 11.2 },
  { m: "M2", v: 12.4 },
  { m: "M3", v: 13.8 },
  { m: "M4", v: 15.9 },
  { m: "M5", v: 18.4 },
];

type LogEntry = { ts: string; msg: string; accent?: boolean };

const INITIAL_LOGS: LogEntry[] = [
  { ts: "21:08:01", msg: "BOOTSTRAP › Core interface loaded." },
  { ts: "21:08:03", msg: "SYNAPSE › Flow stabilised at 97.2%." },
  { ts: "21:08:04", msg: "FORK › 3 IDO pipelines in active crucible." },
  { ts: "21:08:05", msg: "MATRIX › Cognitive layer on standby (wallet not bound)." },
  {
    ts: "21:08:07",
    msg: "HEATMAP › Telemetry stream attached. Rendering neural activity.",
    accent: true,
  },
  { ts: "21:08:09", msg: "HEATMAP › Spike detected in Cortex region (14.3σ)." },
  { ts: "21:08:11", msg: "ORBIT-01 › Liquidity lock checksum verified." },
  { ts: "21:08:14", msg: "ORBIT-02 › Whitelist snapshot cached (2,184 wallets)." },
  { ts: "21:08:17", msg: "MATRIX › User session heartbeat OK." },
  { ts: "21:08:21", msg: "TELEMETRY › Cold storage sync deferred (low priority)." },
  { ts: "21:08:25", msg: "ALERT › No anomalies across nodes · rolling 5 min window." },
];

const DYNAMIC_LOG_MESSAGES: Array<Omit<LogEntry, "ts">> = [
  { msg: "PING › External RPC latency within threshold." },
  { msg: "ANALYTICS › Background indexer flushed cache (24 shards)." },
  { msg: "SECURITY › No abnormal patterns in last 256 calls.", accent: true },
  { msg: "SCHEDULER › Next IDO snapshot scheduled in 300 seconds." },
  { msg: "ARCHIVE › Historical heatmaps compressed without data loss." },
  { msg: "GOVERNANCE › New proposal draft detected in staging queue." },
];

const SIMULATED_COMMANDS = [
  { msg: "EXEC › anomaly_scan --deep" },
  { msg: "EXEC › sync_heatmap --region=Cortex" },
  { msg: "QUERY › get_ido_status --orbit=ORBIT-01" },
  { msg: "AUTH › validate_session --user=0x12a9…89ab" },
];

const createTimestamp = (): string => {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

const TABS = ["core", "Fork", "staking", "matrix"] as const;
type TabId = (typeof TABS)[number];

const TAB_LABELS: Record<TabId, string> = {
  core: "Core Interface",
  Fork: "The Fork",
  staking: "Synapse Staking",
  matrix: "Cognitive Matrix",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("core");

  return (
    <div className="min-h-screen text-zinc-100">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-8 sm:py-10 lg:py-12">
        {/* === HEADER / TOP BAR === */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/10 bg-black/50 shadow-[0_0_32px_rgba(34,211,238,0.15)] backdrop-blur-md">
              <Image
                src="/logo.png"
                alt="Brain Fork"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
                Brain Fork
              </span>
              <span className="text-sm font-semibold text-zinc-100">
                Neural IDO Launch Terminal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <div className="hidden items-center gap-2 rounded-full border border-zinc-700/70 bg-black/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-zinc-400 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
              <span className="animate-softPulse">Core Status: Online</span>
            </div>

          </div>
        </header>

        {/* === TAB NAV === */}
        <nav className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 rounded-full border border-zinc-800/80 bg-black/50 p-1 text-xs shadow-xl backdrop-blur">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={[
                    "pill-tab",
                    isActive && "pill-tab--active",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="flex items-center gap-1.5">
                    {tab === "core" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.9)]" />
                    )}
                    {tab === "Fork" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.9)]" />
                    )}
                    {tab === "staking" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
                    )}
                    {tab === "matrix" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_10px_rgba(244,114,182,0.9)]" />
                    )}
                    <span>{TAB_LABELS[tab]}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 text-[11px] text-zinc-400">
            <div className="inline-flex items-center gap-1 rounded-full border border-zinc-700/60 bg-black/60 px-2.5 py-1 animate-softPulse">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              <span>Synaptic Flow: Stable</span>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-zinc-700/60 bg-black/60 px-2.5 py-1 animate-softPulse">
              <span>$Fork</span>
              <span className="text-heatmap font-semibold">0.98</span>
              <span className="text-emerald-400/90">+3.2%</span>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-zinc-700/60 bg-black/60 px-2.5 py-1">
              <span className="h-1 w-6 bg-synaptic rounded-full opacity-70" />
              <span>Core Node v1.1</span>
            </div>
          </div>
        </nav>

        {/* === TAB PANELS === */}
        <section className="mt-5 mb-6 flex-1 space-y-3">
          <AnimatePresence mode="wait">
            {activeTab === "core" && (
              <motion.div
                key="core"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <CoreInterfacePanel />
              </motion.div>
            )}
            {activeTab === "Fork" && (
              <motion.div
                key="Fork"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <ForkPanel />
              </motion.div>
            )}
            {activeTab === "staking" && (
              <motion.div
                key="staking"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
              <SynapseStakingPanel />
              </motion.div>
            )}
            {activeTab === "matrix" && (
              <motion.div
                key="matrix"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <CognitiveMatrixPanel accessTier="Contributor" />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

// === Core Interface ===
function CoreInterfacePanel() {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [priceData, setPriceData] = useState(priceSeries);
  const [ignitionData, setIgnitionData] = useState(ignitionSeries);
  const [flowData, setFlowData] = useState(synapticFlowSeries);
  const [loadData, setLoadData] = useState(cognitiveLoadSeries);
  const [throughputData, setThroughputData] = useState(networkThroughputSeries);
  const [distData, setDistData] = useState(tokenDistributionData);
  const [command, setCommand] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const [hint, setHint] = useState<string>("Type help to see available commands.");

  // State for dynamic metrics
  const [metrics, setMetrics] = useState({
    forkPrice: 0.98,
    ignitionPower: 87.4,
    latency: 42,
    uptime: 99.97,
  });

  useEffect(() => {
    let messageIndex = 0;
    let commandIndex = 0;

    // --- Dynamic data simulation for charts ---
    const dataInterval = setInterval(() => {
      // Price chart: scrolling effect
      setPriceData((prev) => {
        const lastValue = prev[prev.length - 1].v;
        const newValue = Math.max(0.8, Math.min(1.2, lastValue + (Math.random() - 0.5) * 0.03));
        return [...prev.slice(1), { t: createTimestamp().slice(3), v: newValue }];
      });

      // Ignition chart: subtle random fluctuations
      setIgnitionData((prev) =>
        prev.map((item) => ({
          ...item,
          v: Math.max(70, Math.min(95, item.v + (Math.random() - 0.5) * 1.5)),
        })),
      );

      // Bar chart: more significant random fluctuations
      setFlowData((prev) =>
        prev.map((item) => ({
          ...item,
          v: Math.max(40, Math.min(100, item.v + (Math.random() - 0.5) * 8)),
        })),
      );

      // Radar chart: slowly shifting load
      setLoadData((prev) =>
        prev.map((item) => ({
          ...item,
          v: Math.max(30, Math.min(100, item.v + (Math.random() - 0.45) * 5)),
        })),
      );

      // Throughput chart
      setThroughputData((prev) => 
        prev.map((item) => ({
          ...item,
          rx: Math.abs(item.rx + (Math.random() - 0.5) * 10),
          tx: Math.abs(item.tx + (Math.random() - 0.5) * 10),
        })),
      );
    }, 2500);

    const id = window.setInterval(() => {
      setLogs((prev) => {
        const source =
          DYNAMIC_LOG_MESSAGES[
            messageIndex % DYNAMIC_LOG_MESSAGES.length
          ];
        messageIndex += 1;

        const entry: LogEntry = {
          ts: createTimestamp(),
          msg: source.msg,
          accent: source.accent,
        };

        const merged = [...prev, entry];
        // keep last 25 lines to avoid infinite growth
        return merged.length > 25 ? merged.slice(merged.length - 25) : merged;
      });
    }, 4500);

    const commandId = setInterval(() => {
      setLogs((prev) => {
        const source = SIMULATED_COMMANDS[commandIndex % SIMULATED_COMMANDS.length];
        commandIndex += 1;

        const entry: LogEntry = { ts: createTimestamp(), msg: source.msg, accent: true };
        const response: LogEntry = { ts: createTimestamp(), msg: "RESPONSE › OK_200: Operation successful." };

        const merged = [...prev, entry, response];
        return merged.length > 25 ? merged.slice(merged.length - 25) : merged;
      });
    }, 8000);

    const metricsInterval = setInterval(() => {
      setMetrics((prev) => ({
        forkPrice: Math.max(0.9, prev.forkPrice + (Math.random() - 0.45) * 0.01),
        ignitionPower: Math.min(100, Math.max(80, prev.ignitionPower + (Math.random() - 0.4) * 0.2)),
        latency: Math.max(30, Math.min(60, prev.latency + (Math.random() > 0.5 ? 1 : -1))),
        uptime: Math.min(99.99, Math.max(99.90, prev.uptime + (Math.random() - 0.45) * 0.005)),
      }));
    }, 1500);

    return () => {
      window.clearInterval(dataInterval);
      window.clearInterval(id);
      window.clearInterval(commandId);
      window.clearInterval(metricsInterval);
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom of log
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
    // Play sound for new log entry
    audioRef.current?.play().catch(() => {}); // Catch errors if autoplay is blocked
  }, [logs]);

  const handleCommand = () => {
    const raw = command.trim();
    if (!raw) return;
    const value = raw.toLowerCase();

    // echo command into log
    const ts = createTimestamp();
    setLogs((prev) => {
      const withCommand = [
        ...prev,
        { ts, msg: `CLIENT › ${raw}`, accent: true },
      ];
      return withCommand.length > 25
        ? withCommand.slice(withCommand.length - 25)
        : withCommand;
    });

    if (value === "help") {
      setHint("commands: rules · launch <name> · clear");
    } else if (value === "rules") {
      setHint("Rule set: no low-effort memecoins. Only neural-driven IDO pipelines.");
    } else if (value.startsWith("launch")) {
      const name = raw.slice("launch".length).trim() || "Unnamed project";
      setHint(`Bootstrapping "${name}" in simulated mode…`);
    } else if (value === "clear") {
      setHint("Console cleared. Awaiting next instruction.");
    } else {
      setHint("Unknown command. Type help for available commands.");
    }

    setCommand("");
  };

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {/* Левая колонка — статус + лог */}
      <div className="space-y-3">
        <section className="panel panel--accent">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              System Status
            </h2>
            <span className="text-[11px] text-zinc-500">Core Node · v1.1</span>
          </header>

          <div className="grid grid-cols-3 gap-y-4 gap-x-6 pt-2 text-xs">
            {/* Row 1: Status Pills */}
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Core Status</div>
              <div className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 text-[11px] text-cyan-300">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span className="font-semibold">Online</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Synaptic Flow</div>
              <div className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 px-2 py-1 text-[11px] text-fuchsia-300">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span className="font-semibold">Stable</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Fork State</div>
              <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-1 text-[11px] text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span className="font-semibold">Heating</span>
              </div>
            </div>

            {/* Row 2: Live Metrics */}
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Core latency</div>
              <div className="text-zinc-200 font-medium flex items-center">
                <AnimatedCounter value={metrics.latency} /> ms
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Node uptime</div>
              <div className="text-zinc-200 font-medium flex items-center">
                <AnimatedCounter value={metrics.uptime} precision={2} />%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Heatmap streams</div>
              <div className="text-zinc-200 font-medium flex items-center">
                4 active
              </div>
            </div>
          </div>
        </section>

        <section className="panel panel--subtle">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Console Log
            </h2>
            <span className="text-[11px] text-zinc-500">
              Live feed · read-only
            </span>
          </header>
          <div ref={logContainerRef} className="log-container max-h-72 space-y-1 overflow-y-auto rounded-xl border border-zinc-800/70 bg-black/80 p-3 text-[11px] font-normal leading-relaxed">
            {logs.map((log, idx) => (
              <ConsoleLine
                key={`${log.ts}-${idx}`}
                ts={log.ts}
                msg={log.msg}
                accent={log.accent}
              />
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-zinc-800/80 bg-black/90 px-2.5 py-2 text-[11px] shadow-[0_0_25px_rgba(59,130,246,0.35)]">
            <div className="mb-1 flex items-center justify-between text-[10px] text-zinc-500">
              <span>brain-fork://core</span>
              <span className="text-zinc-400">{hint}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">›</span>
              <input
                className="flex-1 bg-transparent text-[11px] text-zinc-200 outline-none placeholder:text-zinc-600"
                placeholder="help   |   rules   |   launch <project-name>"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCommand();
                  }
                }}
              />
              <span className="terminal-input-caret" aria-hidden="true" />
            </div>
          </div>
          <audio ref={audioRef} preload="auto">
            {/* Add a sound file to /public/sounds/blip.mp3 */}
            <source src="/sounds/blip.mp3" type="audio/mpeg" />
          </audio>
        </section>
      </div>

      {/* Правая колонка — ключевые метрики */}
      <section className="panel panel--subtle space-y-3">
        <header className="mb-1 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Core Metrics
          </h2>
          <span className="text-[11px] text-zinc-500">
            Snapshot · 15.11.2025
          </span>
        </header>

        {/* Верхний ряд — цифры */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Fork Price
            </div>
            <div className="flex items-end gap-2">
              <span className="text-heatmap text-lg font-semibold flex items-baseline">
                $<AnimatedCounter value={metrics.forkPrice} precision={2} />
              </span>
              <span className="text-[11px] text-emerald-400">+3.2%</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Ignition Power
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-sky-300 flex items-baseline">
                <AnimatedCounter value={metrics.ignitionPower} precision={1} />%
              </span>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-900">
                <motion.div className="bg-synaptic h-full" style={{ width: `${metrics.ignitionPower}%` }} />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Active IDO Pipelines
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-indigo-300">3</span>
              <span className="text-[11px] text-zinc-500">
                7 upcoming · 12 completed
              </span>
            </div>
          </div>
        </div>

        {/* Нижний ряд — графики */}
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-zinc-800/70 bg-black/70 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                $Fork · Micro Trend
              </span>
              <span className="text-[10px] text-zinc-600">Live</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ForkArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#18181b" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="t" tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 10 }} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #27272a",
                      borderRadius: 12,
                      fontSize: 11,
                    }}
                    labelStyle={{ color: "#a1a1aa" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#38bdf8"
                    strokeWidth={1.6}
                    dot={false}
                    fill="url(#ForkArea)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800/70 bg-black/70 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Ignition Power · Week
              </span>
              <span className="text-[10px] text-zinc-600">Live</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ignitionData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="#18181b" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="t" tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 10 }} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #27272a",
                      borderRadius: 12,
                      fontSize: 11,
                    }}
                    labelStyle={{ color: "#a1a1aa" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="#a855f7"
                    strokeWidth={1.6}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Дополнительный ряд графиков */}
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-zinc-800/70 bg-black/70 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Synaptic Flow
              </span>
              <span className="text-[10px] text-zinc-600">Live</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flowData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke="#18181b" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="n" tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 10 }} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #27272a",
                      borderRadius: 12,
                      fontSize: 11,
                    }}
                    cursor={{ fill: "rgba(168, 85, 247, 0.1)" }}
                    labelStyle={{ color: "#a1a1aa" }}
                  />
                  <Bar dataKey="v" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800/70 bg-black/70 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Cognitive Load
              </span>
              <span className="text-[10px] text-zinc-600">Real-time</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={loadData}>
                  <Radar name="Load" dataKey="v" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// === The Fork ===
function ForkPanel() {
  return (
    <div className="space-y-4">
      <section className="panel panel--accent">
        <header className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              The Crucible · IDO Selector
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Projects orbit the core — pick an orbit to inspect its current forging stage.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <span className="rounded-full border border-zinc-700/70 bg-black/60 px-2.5 py-1">
              Active
            </span>
            <span className="rounded-full border border-zinc-700/50 bg-black/40 px-2.5 py-1 text-zinc-400">
              Upcoming
            </span>
            <span className="rounded-full border border-zinc-800/80 bg-black/40 px-2.5 py-1 text-zinc-500">
              Completed
            </span>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <ForkCard
            label="ORBIT-01"
            name="Neural Liquidity Hub"
            phase="Phase II · Ignition"
            progress={72}
          />
          <ForkCard
            label="ORBIT-02"
            name="Cortex Derivatives"
            phase="Phase I · Calibration"
            progress={34}
          />
          <ForkCard
            label="ORBIT-03"
            name="Signal Mesh Protocol"
            phase="Phase III · OverFork"
            progress={91}
          />
        </div>
      </section>

      {/* Орбиты / распределение статусов IDO */}
      <section className="panel panel--subtle">
        <header className="mb-2 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Orbital Overview
            </h3>
            <p className="mt-1 text-[11px] text-zinc-500">
              Visual overview of active, queued and completed IDO pipelines around the core.
            </p>
          </div>
          <span className="text-[11px] text-zinc-500">Fork load · 72%</span>
        </header>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="40%"
                outerRadius="90%"
                barSize={18}
                data={ForkRadial}
                startAngle={210}
                endAngle={-30}
              >
                <RadialBar background cornerRadius={12} dataKey="value" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #27272a",
                    borderRadius: 12,
                    fontSize: 11,
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-[11px] text-zinc-400">
            <p>
              <span className="inline-flex h-2 w-2 rounded-full bg-sky-400 mr-2" />
              Active — pipelines currently open based on your access tier.
            </p>
            <p>
              <span className="inline-flex h-2 w-2 rounded-full bg-fuchsia-400 mr-2" />
              Upcoming — pipelines pre-loaded into the core, waiting for ignition.
            </p>
            <p>
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 mr-2" />
              Completed — successfully forged IDOs, available in the archive.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// === Synapse Staking ===
function SynapseStakingPanel() {
  return (
    <div className="space-y-4">
      <section className="panel panel--accent">
        <header className="mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Synapse Staking
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Lock $Fork to strengthen neural links and unlock exclusive access
            to high-priority IDO pipelines.
          </p>
        </header>

        <div className="space-y-4">
            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Staked $Fork</span>
                  <span className="text-sky-300 font-semibold">1 250.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Synaptic Yield (APY)</span>
                  <span className="text-emerald-400 font-semibold">18.4%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-900">
                  <div className="bg-synaptic h-full w-[64%]" />
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Energy flows are routed into the central core. Access to
                  advanced IDO orbits scales with your stake.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-zinc-700/80 bg-black/70 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-zinc-400">Access Tier</span>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                      Contributor
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Priority allocations and higher participation limits in new
                    forging rounds.
                  </p>
                </div>
              </div>
            </div>

            {/* График роста доходности */}
            <div className="rounded-xl border border-zinc-700/80 bg-black/75 p-3 text-xs">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                  Synaptic Yield · Evolution
                </span>
                <span className="text-[10px] text-zinc-600">Last 5 epochs</span>
              </div>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stakingYieldSeries}
                    margin={{ top: 4, right: 4, left: -12, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="yieldArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#18181b" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 10 }} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#020617",
                        border: "1px solid #27272a",
                        borderRadius: 12,
                        fontSize: 11,
                      }}
                      labelStyle={{ color: "#a1a1aa" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="#22c55e"
                      strokeWidth={1.5}
                      fill="url(#yieldArea)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
      </section>
    </div>
  );
}

// === Cognitive Matrix ===
function CognitiveMatrixPanel({ accessTier }: { accessTier: string }) {
  return (
    <div className="space-y-4">
      <section className="panel panel--accent">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Cognitive Matrix
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Personalised user layer linked to your session identity.
            </p>
          </div>
          <span className="rounded-full bg-fuchsia-500/15 px-3 py-1 text-[11px] font-semibold text-fuchsia-300">
            {accessTier}
          </span>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1 text-xs">
            <div className="text-zinc-400">Wallet Address</div>
            <div className="truncate text-[11px] text-zinc-200">
              0x12a9…89ab · bound
            </div>
          </div>
          <div className="space-y-1 text-xs">
            <div className="text-zinc-400">$Fork Balance</div>
            <div className="text-sm font-semibold text-sky-300">
              2 430.17
            </div>
          </div>
          <div className="space-y-1 text-xs">
            <div className="text-zinc-400">Synaptic Score</div>
            <div className="text-sm font-semibold text-heatmap">7.84</div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-zinc-800/80 bg-black/75 p-3 text-[11px]">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-zinc-400">Transaction History</span>
            <span className="text-zinc-500">Last 5 events</span>
          </div>
          <div className="mt-1 space-y-1.5 font-normal leading-relaxed">
            <ConsoleLine ts="20:54:11" msg="STAKING › +250 FORK locked for 90d." />
            <ConsoleLine ts="19:32:47" msg="IDO › Joined ORBIT-01: Neural Liquidity Hub." />
            <ConsoleLine ts="18:09:03" msg="MATRIX › Access tier upgraded to Contributor." />
            <ConsoleLine ts="17:44:22" msg="STAKING › Reward claim executed (42.7 FORK)." />
          </div>
        </div>
      </section>
    </div>
  );
}



function ConsoleLine({
  ts,
  msg,
  accent,
}: {
  ts: string;
  msg: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex gap-2 ${
        accent ? "text-sky-300" : "text-zinc-400"
      }`}
    >
      <span className="text-[10px] text-zinc-500">{ts}</span>
      <span>{msg}</span>
    </div>
  );
}

function ForkCard({
  label,
  name,
  phase,
  progress,
}: {
  label: string;
  name: string;
  phase: string;
  progress: number;
}) {
  return (
    <article className="group rounded-2xl border border-zinc-800/80 bg-black/70 p-3 text-xs shadow-lg transition hover:border-sky-400/80 hover:shadow-[0_0_25px_rgba(56,189,248,0.4)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          {label}
        </span>
        <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-400">
          {phase}
        </span>
      </div>
      <div className="mb-2 text-[13px] font-semibold text-zinc-100">
        {name}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-900">
        <div
          className="bg-synaptic h-full transition-all group-hover:w-[105%]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-500">
        <span>Fork Progress</span>
        <span className="text-sky-300 font-semibold">{progress}%</span>
      </div>
    </article>
  );
}

// A component to animate number changes
function AnimatedCounter({ value, precision = 0 }: { value: number, precision?: number }) {
  // Using framer-motion's motion component to animate the number change
  // This is a simplified approach. For a true count-up, a useSpring hook or useAnimate would be better.
  // However, this provides a nice, subtle motion effect on change.
  return (
    <motion.span
      key={value.toFixed(precision)}
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -8, opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="inline-block"
    >
      {value.toFixed(precision)}
    </motion.span>
  );
}
