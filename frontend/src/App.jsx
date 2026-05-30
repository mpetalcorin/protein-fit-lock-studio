import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Upload,
  Lock,
  KeyRound,
  FlaskConical,
  Atom,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  PlayCircle,
  Layers,
  Sparkles,
  FileText,
  BarChart3,
  Orbit,
  Waves,
  ShieldCheck,
  Gauge,
  Microscope,
  Network,
  Target,
  Download,
  Table2,
  Eye,
  Dna,
  Brain,
  Workflow,
  Beaker,
  SlidersHorizontal,
  FileDown,
  Rows3,
  Wand2,
  ClipboardList,
  Newspaper
} from "lucide-react";
import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import "./style.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function scoreColor(score) {
  if (score >= 0.68) return "excellent";
  if (score >= 0.60) return "good";
  if (score >= 0.50) return "moderate";
  return "weak";
}

function formatNumber(value) {
  if (value === null || value === undefined) return "NA";
  if (typeof value === "number") return Number(value).toFixed(3).replace(/\.000$/, "");
  return value;
}

function MetricCard({ icon, label, value, hint }) {
  return (
    <motion.div
      className="metric-card"
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6, scale: 1.02 }}
    >
      <div className="metric-icon">{icon}</div>
      <div>
        <p className="metric-label">{label}</p>
        <h3>{value}</h3>
        {hint && <p className="metric-hint">{hint}</p>}
      </div>
    </motion.div>
  );
}

function FloatingParticles() {
  const particles = Array.from({ length: 42 }, (_, i) => i);

  return (
    <div className="particle-field">
      {particles.map((i) => (
        <motion.span
          key={i}
          className="particle"
          style={{
            left: `${(i * 37) % 100}%`,
            top: `${(i * 61) % 100}%`
          }}
          animate={{
            y: [0, -18, 0],
            x: [0, i % 2 === 0 ? 12 : -12, 0],
            opacity: [0.2, 0.85, 0.2],
            scale: [0.8, 1.4, 0.8]
          }}
          transition={{
            duration: 3 + (i % 6),
            repeat: Infinity,
            delay: i * 0.08
          }}
        />
      ))}
    </div>
  );
}

function HeroMolecule() {
  return (
    <div className="hero-visual">
      <FloatingParticles />

      <motion.div
        className="orbital-ring ring-one"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="orbital-ring ring-two"
        animate={{ rotate: -360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="orbital-ring ring-three"
        animate={{ rotate: 360 }}
        transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="protein protein-a"
        animate={{
          y: [0, -16, 0],
          x: [0, 16, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </motion.div>

      <motion.div
        className="binding-glow"
        animate={{
          scale: [0.8, 1.18, 0.8],
          opacity: [0.35, 1, 0.35]
        }}
        transition={{ duration: 2.8, repeat: Infinity }}
      />

      <motion.div
        className="energy-bridge"
        animate={{
          opacity: [0.25, 1, 0.25],
          scaleX: [0.75, 1.1, 0.75]
        }}
        transition={{ duration: 2.2, repeat: Infinity }}
      />

      <motion.div
        className="protein protein-b"
        animate={{
          y: [0, 16, 0],
          x: [0, -16, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </motion.div>

      <motion.div
        className="lock-key-label left-label"
        animate={{ opacity: [0.55, 1, 0.55], y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <KeyRound size={16} />
        Chain A
      </motion.div>

      <motion.div
        className="lock-key-label right-label"
        animate={{ opacity: [0.55, 1, 0.55], y: [0, 8, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Lock size={16} />
        Chain B
      </motion.div>
    </div>
  );
}

function ScoreGauge({ score }) {
  const percentage = Math.round((score || 0) * 100);
  const dash = Math.max(0, Math.min(100, percentage));

  return (
    <div className="gauge-wrap">
      <motion.svg viewBox="0 0 220 220" className="gauge-svg">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <circle cx="110" cy="110" r="86" className="gauge-track" />
        <motion.circle
          cx="110"
          cy="110"
          r="86"
          className="gauge-progress"
          strokeDasharray="540"
          initial={{ strokeDashoffset: 540 }}
          animate={{ strokeDashoffset: 540 - (dash / 100) * 540 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </motion.svg>
      <motion.div
        className="gauge-center"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <Gauge size={28} />
        <h2>{formatNumber(score)}</h2>
        <p>SC-like fit</p>
      </motion.div>
    </div>
  );
}

function InterfaceAnimation({ result }) {
  const fitClass = scoreColor(result?.approximate_shape_complementarity || 0);

  return (
    <div className={`interface-stage ${fitClass}`}>
      <FloatingParticles />

      <motion.div
        className="surface surface-left"
        animate={{ x: [0, 18, 0], rotate: [0, 2, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <div className="ridge ridge-1"></div>
        <div className="ridge ridge-2"></div>
        <div className="ridge ridge-3"></div>
      </motion.div>

      <motion.div
        className="contact-pulse"
        animate={{ scale: [0.65, 1.25, 0.65], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <motion.div
        className="surface surface-right"
        animate={{ x: [0, -18, 0], rotate: [0, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <div className="groove groove-1"></div>
        <div className="groove groove-2"></div>
        <div className="groove groove-3"></div>
      </motion.div>

      <div className="interface-caption">
        <Orbit size={18} />
        Animated interface model, ridges, grooves, contact zone, and packing pulse
      </div>
    </div>
  );
}

function NGLViewer({ file, chainA, chainB }) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function initViewer() {
      if (!containerRef.current || !file) return;

      const NGL = await import("ngl");
      if (!mounted) return;

      containerRef.current.innerHTML = "";

      const stage = new NGL.Stage(containerRef.current, {
        backgroundColor: "#020617"
      });

      stageRef.current = stage;

      const objectUrl = URL.createObjectURL(file);

      try {
        const component = await stage.loadFile(objectUrl, {
          ext: file.name.toLowerCase().endsWith(".cif") || file.name.toLowerCase().endsWith(".mmcif") ? "cif" : "pdb"
        });

        component.addRepresentation("cartoon", {
          sele: `:${chainA}`,
          color: "#22d3ee",
          opacity: 0.9
        });

        component.addRepresentation("cartoon", {
          sele: `:${chainB}`,
          color: "#a855f7",
          opacity: 0.9
        });

        component.addRepresentation("ball+stick", {
          sele: `:${chainA} or :${chainB}`,
          color: "element",
          radiusScale: 0.35,
          opacity: 0.45
        });

        component.autoView();

        const handleResize = () => stage.handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
          URL.revokeObjectURL(objectUrl);
          stage.dispose();
        };
      } catch (error) {
        containerRef.current.innerHTML = `<div class="viewer-error">Could not render this structure. Try another PDB/mmCIF file.</div>`;
      }
    }

    const cleanupPromise = initViewer();

    return () => {
      mounted = false;
      if (cleanupPromise && typeof cleanupPromise.then === "function") {
        cleanupPromise.then((cleanup) => {
          if (typeof cleanup === "function") cleanup();
        });
      }
      if (stageRef.current) {
        stageRef.current.dispose();
        stageRef.current = null;
      }
    };
  }, [file, chainA, chainB]);

  if (!file) {
    return (
      <div className="viewer-placeholder">
        <Eye size={34} />
        <h3>3D viewer appears after upload</h3>
        <p>Upload a PDB or mmCIF file, then select two chains for structural visualisation.</p>
      </div>
    );
  }

  return <div ref={containerRef} className="ngl-viewer" />;
}

function DecisionDashboard({ result }) {
  if (!result) return null;

  const score = result.approximate_shape_complementarity || 0;
  const clashes = result.clash_count_below_2_2A || 0;
  const contacts = result.contact_count_5A || 0;

  let decision = "Redesign recommended";
  let decisionClass = "danger";
  let detail = "The interface needs improvement before moving into expensive validation.";

  if (score >= 0.6 && clashes <= 20 && contacts >= 100) {
    decision = "Prioritise for validation";
    decisionClass = "success";
    detail = "The interface has enough structural promise to justify deeper biophysical or computational validation.";
  } else if (score >= 0.5 && contacts >= 50) {
    decision = "Optimise before validation";
    decisionClass = "warning";
    detail = "The interface is not hopeless, but it should be improved using docking, minimisation, or side-chain redesign.";
  }

  return (
    <div className={`decision-dashboard ${decisionClass}`}>
      <div>
        <p>Protein design decision</p>
        <h3>{decision}</h3>
        <span>{detail}</span>
      </div>
      <Brain size={46} />
    </div>
  );
}

function DownloadReportButton({ result }) {
  function downloadReport() {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "protein-fit-lock-report.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button className="secondary-button" onClick={downloadReport}>
      <Download size={16} />
      Download JSON report
    </button>
  );
}

function ResidueTable({ title, residues }) {
  return (
    <div className="residue-table-wrap">
      <h4>{title}</h4>
      <div className="residue-table">
        {(residues || []).map((residue, index) => (
          <motion.div
            key={`${residue}-${index}`}
            className="residue-pill"
            whileHover={{ scale: 1.05, y: -2 }}
          >
            {residue}
          </motion.div>
        ))}
      </div>
    </div>
  );
}


function InteractionConstellation({ result }) {
  const items = [
    { label: "Salt bridges", value: result?.salt_bridge_count || 0, className: "salt" },
    { label: "H-bond-like", value: result?.hbond_like_contact_count || 0, className: "hbond" },
    { label: "Aromatic", value: result?.aromatic_contact_count || 0, className: "aromatic" },
    { label: "Hydrophobic", value: result?.hydrophobic_contact_count || 0, className: "hydrophobic" },
    { label: "Clashes", value: result?.clash_count_below_2_2A || 0, className: "clash" }
  ];

  return (
    <div className="constellation-stage">
      <FloatingParticles />

      <motion.div
        className="constellation-core"
        animate={{ scale: [0.92, 1.08, 0.92], rotate: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        Interface
      </motion.div>

      {items.map((item, index) => {
        const angle = (index / items.length) * Math.PI * 2;
        const x = Math.cos(angle) * 145;
        const y = Math.sin(angle) * 105;

        return (
          <motion.div
            key={item.label}
            className={`constellation-node ${item.className}`}
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`
            }}
            animate={{
              y: [0, -10, 0],
              boxShadow: [
                "0 0 12px rgba(255,255,255,0.10)",
                "0 0 28px rgba(103,232,249,0.35)",
                "0 0 12px rgba(255,255,255,0.10)"
              ]
            }}
            transition={{ duration: 3 + index * 0.3, repeat: Infinity }}
          >
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </motion.div>
        );
      })}

      <motion.div
        className="constellation-orbit"
        animate={{ rotate: 360 }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="constellation-orbit constellation-orbit-two"
        animate={{ rotate: -360 }}
        transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

function RiskFlagPanel({ flags }) {
  return (
    <div className="risk-grid">
      {(flags || []).map((flag, index) => (
        <motion.div
          key={`${flag.title}-${index}`}
          className={`risk-card ${flag.level}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          whileHover={{ y: -4, scale: 1.02 }}
        >
          <div className="risk-orb"></div>
          <h4>{flag.title}</h4>
          <p>{flag.message}</p>
        </motion.div>
      ))}
    </div>
  );
}

function InteractionList({ title, items, type }) {
  return (
    <div className="interaction-list">
      <h4>{title}</h4>
      {(items || []).length === 0 ? (
        <p className="muted small">None detected by the current heuristic analysis.</p>
      ) : (
        <div className="interaction-scroll">
          {(items || []).slice(0, 12).map((item, index) => (
            <motion.div
              className={`interaction-row ${type}`}
              key={index}
              whileHover={{ x: 6 }}
            >
              <span>{index + 1}</span>
              <div>
                <strong>
                  {item.chain_a_residue || item.chain_a_atom}
                  {" ↔ "}
                  {item.chain_b_residue || item.chain_b_atom}
                </strong>
                <p>{item.distance_A} Å{item.vdw_overlap_A ? `, overlap ${item.vdw_overlap_A} Å` : ""}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function HotspotBars({ hotspots }) {
  const data = (hotspots || []).slice(0, 12);

  return (
    <div className="hotspot-panel">
      {data.map((item, index) => {
        const max = Math.max(...data.map((x) => x.contact_count), 1);
        const width = Math.round((item.contact_count / max) * 100);
        return (
          <motion.div className="hotspot-row" key={item.residue} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}>
            <span>{item.residue}</span>
            <div className="hotspot-bar-track">
              <motion.div
                className="hotspot-bar"
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ duration: 0.8, delay: index * 0.04 }}
              />
            </div>
            <strong>{item.contact_count}</strong>
          </motion.div>
        );
      })}
    </div>
  );
}

function MolecularTunnelVisual({ result }) {
  const score = result?.designability_score || 0;
  const fit = scoreColor(score);

  return (
    <div className={`tunnel-visual ${fit}`}>
      <motion.div
        className="tunnel-ring tunnel-ring-one"
        animate={{ rotate: 360, scale: [1, 1.08, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="tunnel-ring tunnel-ring-two"
        animate={{ rotate: -360, scale: [1.08, 1, 1.08] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="tunnel-ring tunnel-ring-three"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="tunnel-key"
        animate={{ x: [-32, 32, -32], rotate: [-4, 4, -4] }}
        transition={{ duration: 4.5, repeat: Infinity }}
      >
        <KeyRound size={44} />
      </motion.div>
      <motion.div
        className="tunnel-lock"
        animate={{ scale: [0.92, 1.08, 0.92] }}
        transition={{ duration: 3.2, repeat: Infinity }}
      >
        <Lock size={54} />
      </motion.div>
      <div className="tunnel-caption">
        Designability score: <strong>{formatNumber(score)}</strong>
      </div>
    </div>
  );
}


function App() {
  const [file, setFile] = useState(null);
  const [chains, setChains] = useState([]);
  const [chainA, setChainA] = useState("");
  const [chainB, setChainB] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [batchResults, setBatchResults] = useState(null);
  const [mutationSuggestions, setMutationSuggestions] = useState(null);
  const [reportMode, setReportMode] = useState("scientific");

  async function detectChains(selectedFile) {
    setBusy(true);
    setMessage("Detecting protein chains...");
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", selectedFile);
      const res = await fetch(`${API}/chains`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not detect chains.");
      setChains(data.chains || []);
      if (data.chains?.length > 0) setChainA(data.chains[0].chain_id);
      if (data.chains?.length > 1) setChainB(data.chains[1].chain_id);
      setMessage("Chains detected. Choose two chains and run the fit analysis.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function runAnalysis() {
    if (!file) {
      setMessage("Please upload a PDB or mmCIF file first.");
      return;
    }
    if (!chainA || !chainB || chainA === chainB) {
      setMessage("Please choose two different chains.");
      return;
    }

    setBusy(true);
    setMessage("Measuring the lock-and-key interface...");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("chain_a", chainA);
      form.append("chain_b", chainB);

      const res = await fetch(`${API}/analyze`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      setResult(data);
      setMessage("Analysis complete.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function loadDemo() {
    setBusy(true);
    setMessage("Loading demo result...");
    try {
      const res = await fetch(`${API}/demo`);
      const data = await res.json();
      setResult(data);
      setMessage("Demo result loaded. Upload a real structure to activate the 3D viewer.");
    } catch (err) {
      setMessage("Could not load demo. Make sure the backend is running.");
    } finally {
      setBusy(false);
    }
  }

  async function runBatchAnalysis() {
    if (!file) {
      setMessage("Please upload a PDB or mmCIF file first.");
      return;
    }

    setBusy(true);
    setMessage("Running batch chain-pair analysis...");
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(`${API}/batch-analyze`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Batch analysis failed.");
      setBatchResults(data);
      setMessage("Batch chain-pair analysis complete.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function runMutationSuggestions() {
    if (!file) {
      setMessage("Please upload a PDB or mmCIF file first.");
      return;
    }
    if (!chainA || !chainB || chainA === chainB) {
      setMessage("Please choose two different chains first.");
      return;
    }

    setBusy(true);
    setMessage("Generating interface redesign suggestions...");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("chain_a", chainA);
      form.append("chain_b", chainB);

      const res = await fetch(`${API}/mutation-suggestions`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Mutation suggestion analysis failed.");
      setMutationSuggestions(data);
      setMessage("Mutation suggestion analysis complete.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  function downloadCSV() {
    if (!result) return;

    const rows = [
      ["Metric", "Value"],
      ["Chain A", result.chain_a],
      ["Chain B", result.chain_b],
      ["Approximate shape complementarity", result.approximate_shape_complementarity],
      ["Designability score", result.designability_score],
      ["5A contacts", result.contact_count_5A],
      ["4A contacts", result.contact_count_4A],
      ["3.6A contacts", result.contact_count_3_6A],
      ["Clashes", result.clash_count_below_2_2A],
      ["Salt bridges", result.salt_bridge_count],
      ["H-bond-like contacts", result.hbond_like_contact_count],
      ["Aromatic contacts", result.aromatic_contact_count],
      ["Hydrophobic contacts", result.hydrophobic_contact_count],
      ["Polar or charged contacts", result.polar_or_charged_contact_count],
      ["Packing efficiency", result.packing_efficiency_4A_over_5A],
      ["Interface density", result.interface_density_contacts_per_residue],
      ["Classification", result.classification]
    ];

    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "protein-fit-lock-summary.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadHTMLReport() {
    if (!result) return;

    const html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Protein Fit Lock Studio Report</title>
<style>
body { font-family: Arial, sans-serif; margin: 40px; color: #111827; line-height: 1.6; }
h1 { color: #0f172a; }
.card { border: 1px solid #d1d5db; border-radius: 16px; padding: 18px; margin: 16px 0; }
.metric { display: grid; grid-template-columns: 280px 1fr; border-bottom: 1px solid #e5e7eb; padding: 8px 0; }
.badge { display: inline-block; padding: 6px 10px; border-radius: 999px; background: #dbeafe; color: #1e3a8a; font-weight: bold; }
.small { color: #4b5563; font-size: 13px; }
</style>
</head>
<body>
<h1>Protein Fit Lock Studio Report</h1>
<p class="badge">${result.classification}</p>
<p>${result.layman_explanation}</p>

<div class="card">
<h2>Core Interface Metrics</h2>
<div class="metric"><strong>Chain A</strong><span>${result.chain_a}</span></div>
<div class="metric"><strong>Chain B</strong><span>${result.chain_b}</span></div>
<div class="metric"><strong>Approximate shape complementarity</strong><span>${result.approximate_shape_complementarity}</span></div>
<div class="metric"><strong>Designability score</strong><span>${result.designability_score}</span></div>
<div class="metric"><strong>5 Å contacts</strong><span>${result.contact_count_5A}</span></div>
<div class="metric"><strong>4 Å contacts</strong><span>${result.contact_count_4A}</span></div>
<div class="metric"><strong>Clashes</strong><span>${result.clash_count_below_2_2A}</span></div>
<div class="metric"><strong>Salt bridges</strong><span>${result.salt_bridge_count}</span></div>
<div class="metric"><strong>H-bond-like contacts</strong><span>${result.hbond_like_contact_count}</span></div>
<div class="metric"><strong>Aromatic contacts</strong><span>${result.aromatic_contact_count}</span></div>
<div class="metric"><strong>Packing efficiency</strong><span>${result.packing_efficiency_4A_over_5A}</span></div>
</div>

<div class="card">
<h2>Suggested Actions</h2>
<ul>
${(result.suggested_actions || []).map((x) => `<li>${x}</li>`).join("")}
</ul>
</div>

<div class="card">
<h2>Risk Flags</h2>
<ul>
${(result.risk_flags || []).map((x) => `<li><strong>${x.title}:</strong> ${x.message}</li>`).join("")}
</ul>
</div>

<div class="card">
<h2>Top Interface Residues</h2>
<p><strong>Chain ${result.chain_a}:</strong> ${(result.top_interface_residues_chain_a || []).join(", ")}</p>
<p><strong>Chain ${result.chain_b}:</strong> ${(result.top_interface_residues_chain_b || []).join(", ")}</p>
</div>

<p class="small">${result.method_note || ""}</p>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "protein-fit-lock-report.html";
    a.click();
    URL.revokeObjectURL(url);
  }

  const chartData = useMemo(() => {
    if (!result) return [];
    const contactScore = Math.min(1, (result.contact_count_5A || 0) / 500);
    const clashScore = Math.max(0, 1 - (result.clash_count_below_2_2A || 0) / 50);
    const hydroScore = Math.min(1, (result.hydrophobic_contact_count || 0) / 120);
    const polarScore = Math.min(1, (result.polar_or_charged_contact_count || 0) / 180);
    return [
      { metric: "Shape", value: result.approximate_shape_complementarity || 0 },
      { metric: "Contacts", value: contactScore },
      { metric: "Low clashes", value: clashScore },
      { metric: "Hydrophobic", value: hydroScore },
      { metric: "Polar", value: polarScore }
    ];
  }, [result]);

  const barData = useMemo(() => {
    if (!result) return [];
    return [
      { name: "5 Å contacts", value: result.contact_count_5A || 0 },
      { name: "4 Å contacts", value: result.contact_count_4A || 0 },
      { name: "Clashes", value: result.clash_count_below_2_2A || 0 },
      { name: "Hydrophobic", value: result.hydrophobic_contact_count || 0 },
      { name: "Polar/charged", value: result.polar_or_charged_contact_count || 0 }
    ];
  }, [result]);

  const timelineData = useMemo(() => {
    if (!result) return [];
    const shape = result.approximate_shape_complementarity || 0;
    const contacts = Math.min(1, (result.contact_count_5A || 0) / 500);
    const close = Math.min(1, (result.contact_count_4A || 0) / 260);
    const clashSafe = Math.max(0, 1 - (result.clash_count_below_2_2A || 0) / 50);
    const chemistry = Math.min(1, ((result.hydrophobic_contact_count || 0) + (result.polar_or_charged_contact_count || 0)) / 300);

    return [
      { step: "Approach", quality: 0.35 },
      { step: "Touch", quality: contacts },
      { step: "Pack", quality: close },
      { step: "Avoid clash", quality: clashSafe },
      { step: "Chemistry", quality: chemistry },
      { step: "Final fit", quality: shape }
    ];
  }, [result]);

  const chemistryPie = useMemo(() => {
    if (!result) return [];
    return [
      { name: "Hydrophobic", value: result.hydrophobic_contact_count || 0 },
      { name: "Polar or charged", value: result.polar_or_charged_contact_count || 0 },
      { name: "Salt bridges", value: result.salt_bridge_count || 0 },
      { name: "H-bond-like", value: result.hbond_like_contact_count || 0 },
      { name: "Aromatic", value: result.aromatic_contact_count || 0 },
      { name: "Other contacts", value: Math.max(0, (result.contact_count_5A || 0) - (result.hydrophobic_contact_count || 0) - (result.polar_or_charged_contact_count || 0)) }
    ];
  }, [result]);

  const advancedScoreData = useMemo(() => {
    if (!result) return [];
    return [
      { metric: "Shape fit", value: result.approximate_shape_complementarity || 0 },
      { metric: "Designability", value: result.designability_score || 0 },
      { metric: "Packing", value: result.packing_efficiency_4A_over_5A || 0 },
      { metric: "Density", value: Math.min(1, (result.interface_density_contacts_per_residue || 0) / 8) },
      { metric: "Clash safety", value: Math.max(0, 1 - (result.clash_count_below_2_2A || 0) / 40) }
    ];
  }, [result]);

  return (
    <main className="app">
      <section className="hero">
        <div className="hero-copy">
          <div className="badge">
            <Atom size={16} />
            Protein Interface Geometry
          </div>
          <h1>Protein Fit Lock Studio</h1>
          <p>
            Upload a protein structure and estimate whether two chains fit together like a key in a lock.
            The app detects interface contacts, clashes, hydrophobic packing, polar contacts, and an approximate
            shape-complementarity score.
          </p>
          <div className="hero-actions">
            <label className="upload-button">
              <Upload size={18} />
              Upload PDB/mmCIF
              <input
                type="file"
                accept=".pdb,.cif,.mmcif"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) {
                    setFile(selected);
                    detectChains(selected);
                  }
                }}
              />
            </label>
            <button onClick={loadDemo} className="secondary-button">
              <PlayCircle size={18} />
              Load Demo
            </button>
            <button onClick={runBatchAnalysis} className="secondary-button">
              <Rows3 size={18} />
              Batch Pairs
            </button>
            <button onClick={runMutationSuggestions} className="secondary-button">
              <Wand2 size={18} />
              Redesign Hints
            </button>
          </div>
          {file && <p className="file-note">Uploaded: {file.name}</p>}
          {message && <p className="status">{busy ? "Working: " : ""}{message}</p>}
        </div>
        <HeroMolecule />
      </section>

      <section className="visual-showcase">
        <motion.div className="showcase-card" whileHover={{ y: -8 }}>
          <Microscope size={28} />
          <h3>Surface packing</h3>
          <p>Visualises whether molecular ridges and grooves are likely to match.</p>
        </motion.div>
        <motion.div className="showcase-card" whileHover={{ y: -8 }}>
          <Network size={28} />
          <h3>Interface network</h3>
          <p>Summarises close atom contacts across the selected chains.</p>
        </motion.div>
        <motion.div className="showcase-card" whileHover={{ y: -8 }}>
          <ShieldCheck size={28} />
          <h3>Clash safety</h3>
          <p>Flags unrealistic atomic collisions that can weaken a designed interface.</p>
        </motion.div>
        <motion.div className="showcase-card" whileHover={{ y: -8 }}>
          <Target size={28} />
          <h3>Design decision</h3>
          <p>Turns structural numbers into clear redesign guidance.</p>
        </motion.div>
      </section>

      <section className="workflow-grid">
        <div className="panel">
          <div className="panel-title">
            <Layers size={20} />
            Select protein chains
          </div>

          {chains.length === 0 ? (
            <p className="muted">
              Upload a structure file to detect available chains. You can also load the demo result.
            </p>
          ) : (
            <>
              <div className="chain-grid">
                {chains.map((chain) => (
                  <motion.div className="chain-card" key={chain.chain_id} whileHover={{ scale: 1.05, rotate: 1 }}>
                    <h4>Chain {chain.chain_id}</h4>
                    <p>{chain.residue_count} residues</p>
                    <p>{chain.atom_count} atoms</p>
                  </motion.div>
                ))}
              </div>

              <div className="selectors">
                <label>
                  Protein chain A
                  <select value={chainA} onChange={(e) => setChainA(e.target.value)}>
                    {chains.map((c) => (
                      <option key={c.chain_id} value={c.chain_id}>{c.chain_id}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Protein chain B
                  <select value={chainB} onChange={(e) => setChainB(e.target.value)}>
                    {chains.map((c) => (
                      <option key={c.chain_id} value={c.chain_id}>{c.chain_id}</option>
                    ))}
                  </select>
                </label>
              </div>

              <button className="run-button" onClick={runAnalysis} disabled={busy}>
                <Sparkles size={18} />
                Measure protein fit
              </button>
            </>
          )}
        </div>

        <div className="panel viewer-panel">
          <div className="panel-title">
            <Eye size={20} />
            Live 3D structure viewer
          </div>
          <NGLViewer file={file} chainA={chainA} chainB={chainB} />
        </div>
      </section>

      {result && (
        <motion.section
          className="results"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={`score-banner ${scoreColor(result.approximate_shape_complementarity)}`}>
            <ScoreGauge score={result.approximate_shape_complementarity} />
            <div>
              <p>Interface decision</p>
              <h3>{result.classification}</h3>
              <p>{result.layman_explanation}</p>
            </div>
            <Lock size={54} />
          </div>

          <section className="decision-row">
            <DecisionDashboard result={result} />
            <div className="report-actions">
              <DownloadReportButton result={result} />
              <button className="secondary-button" onClick={downloadCSV}>
                <FileDown size={16} />
                Download CSV
              </button>
              <button className="secondary-button" onClick={downloadHTMLReport}>
                <Newspaper size={16} />
                HTML report
              </button>
            </div>
          </section>

          <section className="animation-grid">
            <div className="panel">
              <div className="panel-title">
                <Waves size={20} />
                Animated lock-and-key interface
              </div>
              <InterfaceAnimation result={result} />
            </div>

            <div className="panel">
              <div className="panel-title">
                <Orbit size={20} />
                Binding quality timeline
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
                  <XAxis dataKey="step" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 1]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="quality" fillOpacity={0.35} />
                  <Line type="monotone" dataKey="quality" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="animation-grid">
            <div className="panel">
              <div className="panel-title">
                <Network size={20} />
                Animated molecular interaction constellation
              </div>
              <InteractionConstellation result={result} />
            </div>

            <div className="panel">
              <div className="panel-title">
                <KeyRound size={20} />
                Designability tunnel
              </div>
              <MolecularTunnelVisual result={result} />
            </div>
          </section>

          <section className="analysis-grid">
            <div className="panel chart-panel">
              <div className="panel-title">
                <ShieldCheck size={20} />
                Advanced molecular quality radar
              </div>
              <ResponsiveContainer width="100%" height={310}>
                <RadarChart data={advancedScoreData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis domain={[0, 1]} />
                  <Radar dataKey="value" fillOpacity={0.48} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="panel chart-panel">
              <div className="panel-title">
                <Activity size={20} />
                Contact distance histogram
              </div>
              <ResponsiveContainer width="100%" height={310}>
                <BarChart data={result.contact_distance_histogram || []}>
                  <XAxis dataKey="bin" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="panel">
            <div className="panel-title">
              <AlertTriangle size={20} />
              Molecular risk flags and opportunities
            </div>
            <RiskFlagPanel flags={result.risk_flags} />
          </section>

          <section className="analysis-grid">
            <div className="panel">
              <div className="panel-title">
                <Dna size={20} />
                Interaction-level evidence
              </div>
              <div className="triple-list-grid">
                <InteractionList title="Salt bridges" items={result.salt_bridges} type="salt" />
                <InteractionList title="H-bond-like contacts" items={result.hbond_like_contacts} type="hbond" />
                <InteractionList title="Aromatic contacts" items={result.aromatic_contacts} type="aromatic" />
              </div>
            </div>

            <div className="panel">
              <div className="panel-title">
                <Target size={20} />
                Interface hotspot ranking
              </div>
              <HotspotBars hotspots={result.residue_hotspots} />
            </div>
          </section>

          <section className="panel">
            <div className="panel-title">
              <AlertTriangle size={20} />
              Highest steric clash candidates
            </div>
            <InteractionList title="Van der Waals clash-like contacts" items={result.vdw_clashes} type="clash" />
          </section>

          <div className="metrics-grid">
            <MetricCard icon={<Activity size={22} />} label="5 Å interface contacts" value={formatNumber(result.contact_count_5A)} hint="Atoms close enough to suggest interface packing" />
            <MetricCard icon={<FlaskConical size={22} />} label="4 Å close contacts" value={formatNumber(result.contact_count_4A)} hint="Closer contact network" />
            <MetricCard icon={<AlertTriangle size={22} />} label="Steric clashes" value={formatNumber(result.clash_count_below_2_2A)} hint="Very close atoms below 2.2 Å" />
            <MetricCard icon={<Zap size={22} />} label="Hydrophobic contacts" value={formatNumber(result.hydrophobic_contact_count)} hint="Packing between oily amino acids" />
            <MetricCard icon={<CheckCircle2 size={22} />} label="Polar/charged contacts" value={formatNumber(result.polar_or_charged_contact_count)} hint="Potential hydrogen-bond or salt-bridge region" />
            <MetricCard icon={<BarChart3 size={22} />} label="Mean contact distance" value={`${formatNumber(result.mean_contact_distance_A)} Å`} hint="Average atom-atom distance across contacts" />
            <MetricCard icon={<Dna size={22} />} label="Salt bridges" value={formatNumber(result.salt_bridge_count)} hint="Opposite-charge contacts within the interface" />
            <MetricCard icon={<Beaker size={22} />} label="H-bond-like contacts" value={formatNumber(result.hbond_like_contact_count)} hint="N/O/S close contacts in hydrogen-bond range" />
            <MetricCard icon={<Orbit size={22} />} label="Aromatic contacts" value={formatNumber(result.aromatic_contact_count)} hint="Possible aromatic packing or pi interactions" />
            <MetricCard icon={<SlidersHorizontal size={22} />} label="Packing efficiency" value={formatNumber(result.packing_efficiency_4A_over_5A)} hint="Fraction of 5 Å contacts that are also within 4 Å" />
            <MetricCard icon={<Brain size={22} />} label="Designability score" value={formatNumber(result.designability_score)} hint="Combined score for prioritising validation" />
          </div>

          <div className="analysis-grid">
            <div className="panel chart-panel">
              <div className="panel-title">
                <BarChart3 size={20} />
                Interface quality radar
              </div>
              <ResponsiveContainer width="100%" height={310}>
                <RadarChart data={chartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis domain={[0, 1]} />
                  <Radar dataKey="value" fillOpacity={0.45} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="panel chart-panel">
              <div className="panel-title">
                <Activity size={20} />
                Contact breakdown
              </div>
              <ResponsiveContainer width="100%" height={310}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <section className="analysis-grid">
            <div className="panel chart-panel">
              <div className="panel-title">
                <Beaker size={20} />
                Chemistry composition
              </div>
              <ResponsiveContainer width="100%" height={310}>
                <PieChart>
                  <Pie data={chemistryPie} dataKey="value" nameKey="name" outerRadius={105} label>
                    {chemistryPie.map((entry, index) => (
                      <Cell key={entry.name} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="panel">
              <div className="panel-title">
                <Workflow size={20} />
                Recommended next pipeline
              </div>
              <div className="pipeline-list">
                <div><span>1</span> Confirm chain identity and biological assembly</div>
                <div><span>2</span> Minimise structure and remove bad clashes</div>
                <div><span>3</span> Recalculate shape complementarity</div>
                <div><span>4</span> Add electrostatics and hydrogen-bond analysis</div>
                <div><span>5</span> Validate with docking, MD, or binding assays</div>
              </div>
            </div>
          </section>

          <div className="workflow-grid">
            <div className="panel">
              <div className="panel-title">
                <Sparkles size={20} />
                Suggested scientific interpretation
              </div>
              <ul className="action-list">
                {result.suggested_actions?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <p className="method-note">{result.method_note}</p>
            </div>

            <div className="panel">
              <div className="panel-title">
                <Table2 size={20} />
                Clickable interface residue table
              </div>
              <div className="residue-columns">
                <ResidueTable title={`Chain ${result.chain_a}`} residues={result.top_interface_residues_chain_a} />
                <ResidueTable title={`Chain ${result.chain_b}`} residues={result.top_interface_residues_chain_b} />
              </div>
            </div>
          </div>
        </motion.section>
      )}


      {batchResults && (
        <motion.section
          className="panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="panel-title">
            <Rows3 size={20} />
            Batch chain-pair ranking
          </div>
          <p className="muted">
            This ranks every chain-chain pair by designability score, useful for multi-chain complexes.
          </p>
          <div className="batch-table">
            <div className="batch-header">
              <span>Pair</span>
              <span>SC-like</span>
              <span>Designability</span>
              <span>Contacts</span>
              <span>Clashes</span>
              <span>Class</span>
            </div>
            {(batchResults.ranked_pairs || []).map((pair, index) => (
              <motion.div
                className="batch-row"
                key={`${pair.chain_a}-${pair.chain_b}-${index}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.035 }}
              >
                <span>{pair.chain_a} ↔ {pair.chain_b}</span>
                <span>{formatNumber(pair.approximate_shape_complementarity)}</span>
                <span>{formatNumber(pair.designability_score)}</span>
                <span>{pair.contact_count_5A}</span>
                <span>{pair.clash_count_below_2_2A}</span>
                <span>{pair.classification}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {mutationSuggestions && (
        <motion.section
          className="panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="panel-title">
            <Wand2 size={20} />
            Interface redesign suggestion table
          </div>
          <p className="muted">
            These are heuristic suggestions for structural inspection, not automatic mutation decisions.
          </p>
          <div className="mutation-grid">
            {(mutationSuggestions.suggestions || []).map((item, index) => (
              <motion.div
                className={`mutation-card ${item.priority.toLowerCase()}`}
                key={`${item.target_region}-${index}`}
                whileHover={{ y: -5, scale: 1.01 }}
              >
                <div className="mutation-topline">
                  <span>{item.priority}</span>
                  <strong>{item.issue}</strong>
                </div>
                <h4>{item.target_region}</h4>
                <p>{item.suggestion}</p>
                <small>{item.reason}</small>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      <footer>
        <button
          className="secondary-button"
          onClick={() => {
            setResult(null);
            setChains([]);
            setFile(null);
            setMessage("");
            setBatchResults(null);
            setMutationSuggestions(null);
          }}
        >
          <RotateCcw size={16} />
          Reset app
        </button>
        <p>
          Protein Fit Lock Studio, animated educational prototype for protein-protein interface analysis.
        </p>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
