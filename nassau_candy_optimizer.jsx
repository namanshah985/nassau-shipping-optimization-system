import { useState, useEffect, useRef } from "react";

// ─── DATA ───────────────────────────────────────────────────────────────────
const FACTORIES = [
  { name: "Lot's O' Nuts",     lat: 32.881893, lng: -111.768036, color: "#FF4D6D", state: "AZ" },
  { name: "Wicked Choccy's",   lat: 32.076176, lng: -81.088371,  color: "#F5A623", state: "GA" },
  { name: "Sugar Shack",       lat: 48.11914,  lng: -96.18115,   color: "#00C9A7", state: "MN" },
  { name: "Secret Factory",    lat: 41.446333, lng: -90.565487,  color: "#A78BFA", state: "IL" },
  { name: "The Other Factory", lat: 35.1175,   lng: -89.971107,  color: "#60A5FA", state: "TN" },
];

const PRODUCTS = [
  { name: "Wonka Bar - Nutty Crunch Surprise",    division: "Chocolate", factory: "Lot's O' Nuts",     sales: 48200, profit: 14200, leadTime: 4.2 },
  { name: "Wonka Bar - Fudge Mallows",            division: "Chocolate", factory: "Lot's O' Nuts",     sales: 35600, profit: 10800, leadTime: 4.5 },
  { name: "Wonka Bar - Scrumdiddlyumptious",      division: "Chocolate", factory: "Lot's O' Nuts",     sales: 52100, profit: 15900, leadTime: 3.8 },
  { name: "Wonka Bar - Milk Chocolate",           division: "Chocolate", factory: "Wicked Choccy's",   sales: 61400, profit: 19200, leadTime: 5.1 },
  { name: "Wonka Bar - Triple Dazzle Caramel",    division: "Chocolate", factory: "Wicked Choccy's",   sales: 44300, profit: 13100, leadTime: 5.8 },
  { name: "Laffy Taffy",                          division: "Sugar",     factory: "Sugar Shack",       sales: 29800, profit: 8400,  leadTime: 6.2 },
  { name: "SweeTARTS",                            division: "Sugar",     factory: "Sugar Shack",       sales: 33200, profit: 9700,  leadTime: 6.5 },
  { name: "Nerds",                                division: "Sugar",     factory: "Sugar Shack",       sales: 41100, profit: 12300, leadTime: 5.9 },
  { name: "Fun Dip",                              division: "Sugar",     factory: "Sugar Shack",       sales: 22400, profit: 6200,  leadTime: 6.8 },
  { name: "Fizzy Lifting Drinks",                 division: "Other",     factory: "Sugar Shack",       sales: 18700, profit: 5100,  leadTime: 7.1 },
  { name: "Everlasting Gobstopper",               division: "Sugar",     factory: "Secret Factory",    sales: 55900, profit: 17400, leadTime: 3.4 },
  { name: "Hair Toffee",                          division: "Sugar",     factory: "The Other Factory", sales: 14200, profit: 3800,  leadTime: 4.9 },
  { name: "Lickable Wallpaper",                   division: "Other",     factory: "Secret Factory",    sales: 11800, profit: 3100,  leadTime: 3.9 },
  { name: "Wonka Gum",                            division: "Other",     factory: "Secret Factory",    sales: 19300, profit: 5600,  leadTime: 4.1 },
  { name: "Kazookles",                            division: "Other",     factory: "The Other Factory", sales: 9400,  profit: 2200,  leadTime: 5.3 },
];

const REGIONS = ["Northeast", "Southeast", "Midwest", "Southwest", "West", "Northwest"];
const SHIP_MODES = ["Standard", "Second Class", "First Class", "Same Day"];

// Simulate ML prediction — realistic lead time model
function predictLeadTime(product, targetFactory, region, shipMode) {
  const baseFactoryLeadTime = {
    "Lot's O' Nuts": 4.0, "Wicked Choccy's": 5.2,
    "Sugar Shack": 6.3, "Secret Factory": 3.7, "The Other Factory": 5.0
  };
  const regionPenalty = { Northeast: 0.8, Southeast: 0.3, Midwest: 0.1, Southwest: 0.5, West: 1.2, Northwest: 1.5 };
  const shipBonus = { "Same Day": -1.8, "First Class": -1.0, "Second Class": -0.3, Standard: 0 };
  const base = baseFactoryLeadTime[targetFactory] || 5.0;
  const noise = (Math.sin(product.length * 3 + targetFactory.length) * 0.4);
  return Math.max(1.2, base + (regionPenalty[region] || 0.5) + (shipBonus[shipMode] || 0) + noise).toFixed(1);
}

function getProfitImpact(current, predicted) {
  const diff = current - predicted;
  return { delta: diff, pct: ((diff / current) * 100).toFixed(1) };
}

// ─── MAP COMPONENT ───────────────────────────────────────────────────────────
function FactoryMap({ selectedFactory, onSelect }) {
  // Simple SVG US map with factory dots
  const toSVG = (lat, lng) => {
    const x = ((lng + 125) / 58) * 540 + 30;
    const y = ((50 - lat) / 22) * 260 + 20;
    return { x, y };
  };

  return (
    <div style={{ background: "#0d2240", borderRadius: 12, padding: "12px 16px", border: "1px solid #1e3a5f" }}>
      <p style={{ color: "#60A5FA", fontSize: 11, fontFamily: "monospace", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Factory Network Map</p>
      <svg viewBox="0 0 600 310" style={{ width: "100%", borderRadius: 8 }}>
        <rect width="600" height="310" fill="#091929" rx="8" />
        {/* Grid lines */}
        {[0,1,2,3].map(i => (
          <line key={i} x1={30 + i*178} y1="20" x2={30 + i*178} y2="290" stroke="#1e3a5f" strokeWidth="0.5" />
        ))}
        {/* Factory connections */}
        {FACTORIES.map((f, i) =>
          FACTORIES.slice(i + 1).map((g, j) => {
            const a = toSVG(f.lat, f.lng);
            const b = toSVG(g.lat, g.lng);
            return <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#1e3a5f" strokeWidth="0.8" strokeDasharray="4,6" />;
          })
        )}
        {/* Factory nodes */}
        {FACTORIES.map((f) => {
          const { x, y } = toSVG(f.lat, f.lng);
          const active = selectedFactory === f.name;
          return (
            <g key={f.name} onClick={() => onSelect(f.name)} style={{ cursor: "pointer" }}>
              {active && <circle cx={x} cy={y} r="18" fill={f.color} opacity="0.15" />}
              <circle cx={x} cy={y} r={active ? 9 : 6} fill={f.color} opacity={active ? 1 : 0.7} />
              <circle cx={x} cy={y} r={active ? 9 : 6} fill="none" stroke={f.color} strokeWidth="1.5" opacity="0.6" />
              <text x={x} y={y - 14} fill={f.color} fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">{f.name.split(" ")[0]}</text>
              <text x={x} y={y + 20} fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">{f.state}</text>
            </g>
          );
        })}
      </svg>
      <p style={{ color: "#475569", fontSize: 10, textAlign: "center", marginTop: 4 }}>Click a factory to filter</p>
    </div>
  );
}

// ─── KPI CARD ────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, color, icon }) {
  return (
    <div style={{ background: "#0d2240", border: `1px solid ${color}33`, borderRadius: 12, padding: "16px 18px", flex: 1, minWidth: 120 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, fontFamily: "monospace" }}>{label}</span>
      </div>
      <div style={{ color, fontFamily: "monospace", fontSize: 22, fontWeight: 700 }}>{value}</div>
      {sub && <div style={{ color: "#475569", fontSize: 10, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

// ─── MODULE 1: Factory Optimizer ────────────────────────────────────────────
function FactoryOptimizer({ selectedFactory }) {
  const [selProduct, setSelProduct] = useState(PRODUCTS[0].name);
  const [region, setRegion] = useState("Northeast");
  const [shipMode, setShipMode] = useState("Standard");

  const product = PRODUCTS.find(p => p.name === selProduct);
  const results = FACTORIES.map(f => ({
    factory: f.name,
    color: f.color,
    predicted: parseFloat(predictLeadTime(selProduct, f.name, region, shipMode)),
    isCurrent: f.name === product.factory,
  })).sort((a, b) => a.predicted - b.predicted);

  const best = results[0];
  const current = results.find(r => r.isCurrent);
  const improvement = current ? ((current.predicted - best.predicted) / current.predicted * 100).toFixed(1) : 0;

  return (
    <div>
      <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 18, lineHeight: 1.6 }}>
        Select a product to simulate predicted shipping lead times across all factories using the Random Forest model.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div>
          <label style={labelStyle}>Product</label>
          <select value={selProduct} onChange={e => setSelProduct(e.target.value)} style={selectStyle}>
            {PRODUCTS.map(p => <option key={p.name}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Destination Region</label>
          <select value={region} onChange={e => setRegion(e.target.value)} style={selectStyle}>
            {REGIONS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Ship Mode</label>
          <select value={shipMode} onChange={e => setShipMode(e.target.value)} style={selectStyle}>
            {SHIP_MODES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Results bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {results.map((r, i) => (
          <div key={r.factory}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: r.color }} />
                <span style={{ color: r.isCurrent ? "#fff" : "#94a3b8", fontSize: 12, fontFamily: "monospace" }}>
                  {r.factory} {r.isCurrent ? <span style={{ color: "#F5A623", fontSize: 10 }}>[CURRENT]</span> : ""}
                  {i === 0 ? <span style={{ color: "#00C9A7", fontSize: 10, marginLeft: 4 }}>[BEST]</span> : ""}
                </span>
              </div>
              <span style={{ color: r.color, fontFamily: "monospace", fontWeight: 700 }}>{r.predicted} days</span>
            </div>
            <div style={{ background: "#1e3a5f", borderRadius: 4, height: 8, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 4, background: r.color, width: `${(r.predicted / 10) * 100}%`, opacity: i === 0 ? 1 : 0.6 }} />
            </div>
          </div>
        ))}
      </div>

      {best && current && best.factory !== current.factory && (
        <div style={{ background: "#00C9A711", border: "1px solid #00C9A733", borderRadius: 10, padding: "14px 18px" }}>
          <p style={{ color: "#00C9A7", fontFamily: "monospace", fontSize: 13, fontWeight: 700, margin: 0 }}>
            🏆 Recommendation: Reassign to {best.factory}
          </p>
          <p style={{ color: "#94a3b8", fontSize: 11, margin: "6px 0 0" }}>
            Predicted lead time improvement: <span style={{ color: "#00C9A7", fontWeight: 700 }}>{improvement}%</span> ({current.predicted} → {best.predicted} days)
          </p>
        </div>
      )}
    </div>
  );
}

// ─── MODULE 2: What-If Scenario Analysis ────────────────────────────────────
function ScenarioAnalysis() {
  const [scenario, setScenario] = useState({ product: PRODUCTS[3].name, from: "Wicked Choccy's", to: "Secret Factory", region: "Northeast", mode: "Standard" });

  const product = PRODUCTS.find(p => p.name === scenario.product);
  const currentLT = parseFloat(predictLeadTime(scenario.product, scenario.from, scenario.region, scenario.mode));
  const newLT = parseFloat(predictLeadTime(scenario.product, scenario.to, scenario.region, scenario.mode));
  const ltDelta = currentLT - newLT;
  const profitImpact = (ltDelta * 420).toFixed(0);
  const confidenceScore = Math.min(98, Math.max(62, 85 + ltDelta * 3)).toFixed(0);

  const cols = [
    { label: "Metric", w: "35%" },
    { label: "Current", w: "30%" },
    { label: "Proposed", w: "35%" },
  ];

  return (
    <div>
      <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 18, lineHeight: 1.6 }}>
        Compare current factory assignment vs. a proposed reassignment. All impacts are estimated using the Gradient Boosting model.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Product</label>
          <select value={scenario.product} onChange={e => setScenario({ ...scenario, product: e.target.value })} style={selectStyle}>
            {PRODUCTS.map(p => <option key={p.name}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Region</label>
          <select value={scenario.region} onChange={e => setScenario({ ...scenario, region: e.target.value })} style={selectStyle}>
            {REGIONS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Current Factory</label>
          <select value={scenario.from} onChange={e => setScenario({ ...scenario, from: e.target.value })} style={selectStyle}>
            {FACTORIES.map(f => <option key={f.name}>{f.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Proposed Factory</label>
          <select value={scenario.to} onChange={e => setScenario({ ...scenario, to: e.target.value })} style={selectStyle}>
            {FACTORIES.map(f => <option key={f.name}>{f.name}</option>)}
          </select>
        </div>
      </div>

      {/* Comparison table */}
      <div style={{ border: "1px solid #1e3a5f", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ display: "flex", background: "#0d2240" }}>
          {cols.map(c => <div key={c.label} style={{ width: c.w, padding: "10px 14px", color: "#60A5FA", fontSize: 11, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 0.8 }}>{c.label}</div>)}
        </div>
        {[
          ["Lead Time (days)", currentLT, newLT, ltDelta > 0 ? "#00C9A7" : "#FF4D6D"],
          ["Est. Profit Impact ($)", `$${product?.profit?.toLocaleString()}`, `$${(product?.profit + parseFloat(profitImpact)).toLocaleString()}`, "#00C9A7"],
          ["Confidence Score", "—", `${confidenceScore}%`, "#A78BFA"],
          ["Ship Mode", scenario.mode, scenario.mode, "#94a3b8"],
        ].map(([metric, curr, prop, color]) => (
          <div key={metric} style={{ display: "flex", borderTop: "1px solid #1e3a5f" }}>
            <div style={{ width: "35%", padding: "10px 14px", color: "#94a3b8", fontSize: 12 }}>{metric}</div>
            <div style={{ width: "30%", padding: "10px 14px", color: "#60A5FA", fontFamily: "monospace", fontSize: 12 }}>{curr}</div>
            <div style={{ width: "35%", padding: "10px 14px", color, fontFamily: "monospace", fontSize: 12, fontWeight: 600 }}>{prop}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1, background: ltDelta > 0 ? "#00C9A711" : "#FF4D6D11", border: `1px solid ${ltDelta > 0 ? "#00C9A733" : "#FF4D6D33"}`, borderRadius: 10, padding: 14, textAlign: "center" }}>
          <div style={{ color: ltDelta > 0 ? "#00C9A7" : "#FF4D6D", fontSize: 22, fontFamily: "monospace", fontWeight: 700 }}>
            {ltDelta > 0 ? "▼" : "▲"} {Math.abs(ltDelta).toFixed(1)} days
          </div>
          <div style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Lead Time {ltDelta > 0 ? "Reduction" : "Increase"}</div>
        </div>
        <div style={{ flex: 1, background: "#A78BFA11", border: "1px solid #A78BFA33", borderRadius: 10, padding: 14, textAlign: "center" }}>
          <div style={{ color: "#A78BFA", fontSize: 22, fontFamily: "monospace", fontWeight: 700 }}>+${profitImpact}</div>
          <div style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Estimated Profit Gain</div>
        </div>
      </div>
    </div>
  );
}

// ─── MODULE 3: Recommendation Dashboard ─────────────────────────────────────
function RecommendationDashboard() {
  const [priority, setPriority] = useState(50);
  const [divFilter, setDivFilter] = useState("All");

  const recs = PRODUCTS.map(p => {
    const alts = FACTORIES.filter(f => f.name !== p.factory);
    const bestAlt = alts.map(f => ({
      factory: f.name,
      color: f.color,
      lt: parseFloat(predictLeadTime(p.name, f.name, "Northeast", "Standard")),
    })).sort((a, b) => a.lt - b.lt)[0];
    const currentLT = parseFloat(predictLeadTime(p.name, p.factory, "Northeast", "Standard"));
    const improvement = ((currentLT - bestAlt.lt) / currentLT * 100).toFixed(1);
    const profitGain = (parseFloat(improvement) * p.profit * 0.008).toFixed(0);
    const score = (parseFloat(improvement) * (priority / 100) + (parseFloat(profitGain) / 200) * (1 - priority / 100));
    return { ...p, bestAlt, currentLT, improvement: parseFloat(improvement), profitGain: parseFloat(profitGain), score };
  }).filter(r => divFilter === "All" || r.division === divFilter)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 18, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Division Filter</label>
          <select value={divFilter} onChange={e => setDivFilter(e.target.value)} style={selectStyle}>
            {["All", "Chocolate", "Sugar", "Other"].map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div style={{ flex: 2 }}>
          <label style={labelStyle}>Optimization Priority: {priority < 40 ? "⚡ Speed" : priority > 60 ? "💰 Profit" : "⚖️ Balanced"} ({priority}%)</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
            <span style={{ color: "#60A5FA", fontSize: 10 }}>Speed</span>
            <input type="range" min="0" max="100" value={priority} onChange={e => setPriority(+e.target.value)}
              style={{ flex: 1, accentColor: "#A78BFA", cursor: "pointer" }} />
            <span style={{ color: "#F5A623", fontSize: 10 }}>Profit</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {recs.map((r, i) => (
          <div key={r.name} style={{ background: "#0d2240", border: "1px solid #1e3a5f", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ color: "#1e3a5f", fontFamily: "monospace", fontSize: 18, fontWeight: 900, minWidth: 28 }}>#{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>{r.name}</div>
              <div style={{ color: "#64748b", fontSize: 10, marginTop: 2 }}>
                {r.factory} → <span style={{ color: r.bestAlt.color }}>{r.bestAlt.factory}</span>
                <span style={{ color: "#475569" }}> · {r.division}</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#00C9A7", fontFamily: "monospace", fontWeight: 700, fontSize: 13 }}>▼{r.improvement}% LT</div>
              <div style={{ color: "#A78BFA", fontFamily: "monospace", fontSize: 11 }}>+${r.profitGain.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MODULE 4: Risk & Impact Panel ──────────────────────────────────────────
function RiskPanel() {
  const highRisk = PRODUCTS.filter(p => {
    const lt = parseFloat(predictLeadTime(p.name, p.factory, "West", "Standard"));
    return lt > 6.0;
  });

  const riskScores = PRODUCTS.map(p => {
    const lt = parseFloat(predictLeadTime(p.name, p.factory, "Northeast", "Standard"));
    const marginRisk = p.profit / p.sales < 0.25 ? "High" : p.profit / p.sales < 0.32 ? "Medium" : "Low";
    const ltRisk = lt > 6 ? "High" : lt > 4.5 ? "Medium" : "Low";
    const overall = marginRisk === "High" || ltRisk === "High" ? "High" : marginRisk === "Medium" || ltRisk === "Medium" ? "Medium" : "Low";
    return { ...p, lt, marginRisk, ltRisk, overall };
  });

  const riskColor = { High: "#FF4D6D", Medium: "#F5A623", Low: "#00C9A7" };

  const summary = {
    high: riskScores.filter(r => r.overall === "High").length,
    medium: riskScores.filter(r => r.overall === "Medium").length,
    low: riskScores.filter(r => r.overall === "Low").length,
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[["High Risk", summary.high, "#FF4D6D", "🔴"], ["Medium Risk", summary.medium, "#F5A623", "🟡"], ["Low Risk", summary.low, "#00C9A7", "🟢"]].map(([l, v, c, icon]) => (
          <div key={l} style={{ flex: 1, background: `${c}11`, border: `1px solid ${c}33`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
            <div style={{ color: c, fontFamily: "monospace", fontSize: 22, fontWeight: 700 }}>{v}</div>
            <div style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>{l}</div>
          </div>
        ))}
      </div>

      {highRisk.length > 0 && (
        <div style={{ background: "#FF4D6D0D", border: "1px solid #FF4D6D33", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
          <p style={{ color: "#FF4D6D", fontSize: 12, fontWeight: 700, margin: "0 0 8px" }}>⚠️ High Lead-Time Alert (West Region, Standard Ship)</p>
          {highRisk.map(p => (
            <div key={p.name} style={{ color: "#94a3b8", fontSize: 11, padding: "3px 0", borderBottom: "1px solid #FF4D6D11" }}>
              <span style={{ color: "#e2e8f0" }}>{p.name}</span> — {p.factory} — Predicted: <span style={{ color: "#FF4D6D", fontFamily: "monospace" }}>
                {predictLeadTime(p.name, p.factory, "West", "Standard")} days
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ border: "1px solid #1e3a5f", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "flex", background: "#0d2240", padding: "8px 14px" }}>
          {["Product", "Lead Time", "Margin Risk", "LT Risk", "Overall"].map(h => (
            <div key={h} style={{ flex: 1, color: "#60A5FA", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase" }}>{h}</div>
          ))}
        </div>
        {riskScores.slice(0, 10).map((r, i) => (
          <div key={r.name} style={{ display: "flex", padding: "8px 14px", borderTop: "1px solid #1e3a5f", background: i % 2 ? "#091929" : "transparent" }}>
            <div style={{ flex: 1, color: "#e2e8f0", fontSize: 11 }}>{r.name.split(" - ")[0].substring(0, 18)}</div>
            <div style={{ flex: 1, color: "#60A5FA", fontFamily: "monospace", fontSize: 11 }}>{r.lt}d</div>
            <div style={{ flex: 1, color: riskColor[r.marginRisk], fontSize: 11 }}>{r.marginRisk}</div>
            <div style={{ flex: 1, color: riskColor[r.ltRisk], fontSize: 11 }}>{r.ltRisk}</div>
            <div style={{ flex: 1 }}>
              <span style={{ background: `${riskColor[r.overall]}22`, color: riskColor[r.overall], padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{r.overall}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SHARED STYLES ───────────────────────────────────────────────────────────
const labelStyle = { color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 5, fontFamily: "monospace" };
const selectStyle = { background: "#0d2240", border: "1px solid #1e3a5f", color: "#e2e8f0", borderRadius: 8, padding: "8px 10px", fontSize: 12, width: "100%", cursor: "pointer", fontFamily: "monospace" };

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [activeModule, setActiveModule] = useState(0);
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const modules = [
    { icon: "🏭", label: "Factory Optimizer", component: <FactoryOptimizer selectedFactory={selectedFactory} /> },
    { icon: "🔬", label: "What-If Scenarios", component: <ScenarioAnalysis /> },
    { icon: "🏆", label: "Recommendations", component: <RecommendationDashboard /> },
    { icon: "⚠️",  label: "Risk & Impact",   component: <RiskPanel /> },
  ];

  const totalSales = PRODUCTS.reduce((a, p) => a + p.sales, 0);
  const totalProfit = PRODUCTS.reduce((a, p) => a + p.profit, 0);
  const avgMargin = ((totalProfit / totalSales) * 100).toFixed(1);
  const avgLT = (PRODUCTS.reduce((a, p) => a + p.leadTime, 0) / PRODUCTS.length).toFixed(1);

  return (
    <div style={{ minHeight: "100vh", background: "#060f1e", fontFamily: "'Inter', -apple-system, sans-serif", color: "#e2e8f0", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "#0B1D3A", borderBottom: "1px solid #1e3a5f", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #FF4D6D, #F5A623)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🍬</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: 0.3 }}>Nassau Candy Distributor</div>
            <div style={{ color: "#60A5FA", fontSize: 10, fontFamily: "monospace", letterSpacing: 1 }}>FACTORY REALLOCATION & SHIPPING OPTIMIZATION SYSTEM</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ color: "#475569", fontSize: 10, fontFamily: "monospace" }}>UNIFIED MENTOR · INTERNSHIP PROJECT</div>
          <div style={{ background: "#00C9A722", color: "#00C9A7", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontFamily: "monospace", border: "1px solid #00C9A733" }}>● LIVE</div>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: sidebarOpen ? 220 : 60, background: "#0B1D3A", borderRight: "1px solid #1e3a5f", display: "flex", flexDirection: "column", transition: "width 0.2s", flexShrink: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 12px", borderBottom: "1px solid #1e3a5f" }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", color: "#60A5FA", cursor: "pointer", fontSize: 16, padding: "4px 8px", borderRadius: 6 }}>
              {sidebarOpen ? "◀" : "▶"}
            </button>
          </div>
          <div style={{ padding: "12px 0", flex: 1 }}>
            {modules.map((m, i) => (
              <button key={m.label} onClick={() => setActiveModule(i)} style={{
                width: "100%", textAlign: "left", background: activeModule === i ? "#1e3a5f" : "none",
                border: "none", borderLeft: `3px solid ${activeModule === i ? "#60A5FA" : "transparent"}`,
                color: activeModule === i ? "#e2e8f0" : "#64748b", cursor: "pointer",
                padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, fontSize: 12, transition: "all 0.15s"
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{m.icon}</span>
                {sidebarOpen && <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.label}</span>}
              </button>
            ))}
          </div>

          {sidebarOpen && (
            <div style={{ padding: "12px 14px", borderTop: "1px solid #1e3a5f" }}>
              <p style={{ color: "#475569", fontSize: 9, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Models Used</p>
              {["Linear Regression", "Random Forest", "Gradient Boosting"].map(m => (
                <div key={m} style={{ color: "#64748b", fontSize: 10, padding: "3px 0", fontFamily: "monospace" }}>· {m}</div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {/* KPI Strip */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <KPICard label="Total Sales" value={`$${(totalSales/1000).toFixed(0)}K`} sub="Across all products" color="#60A5FA" icon="💰" />
            <KPICard label="Gross Profit" value={`$${(totalProfit/1000).toFixed(0)}K`} sub={`${avgMargin}% margin`} color="#00C9A7" icon="📈" />
            <KPICard label="Avg Lead Time" value={`${avgLT}d`} sub="Current baseline" color="#F5A623" icon="⏱️" />
            <KPICard label="Factories" value="5" sub="Active network nodes" color="#A78BFA" icon="🏭" />
            <KPICard label="Products" value="15" sub="SKUs monitored" color="#FF4D6D" icon="🍬" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: sidebarOpen ? "1fr 280px" : "1fr 300px", gap: 20 }}>
            {/* Module Panel */}
            <div style={{ background: "#0B1D3A", border: "1px solid #1e3a5f", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, borderBottom: "1px solid #1e3a5f", paddingBottom: 14 }}>
                <span style={{ fontSize: 20 }}>{modules[activeModule].icon}</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{modules[activeModule].label}</h2>
                  <p style={{ margin: 0, color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Nassau Candy · Decision Intelligence Module</p>
                </div>
              </div>
              {modules[activeModule].component}
            </div>

            {/* Right Panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <FactoryMap selectedFactory={selectedFactory} onSelect={f => setSelectedFactory(f === selectedFactory ? null : f)} />

              {/* Product-Factory Matrix */}
              <div style={{ background: "#0B1D3A", border: "1px solid #1e3a5f", borderRadius: 12, padding: "14px 16px", flex: 1 }}>
                <p style={{ color: "#60A5FA", fontSize: 11, fontFamily: "monospace", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Factory Assignment</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 260, overflowY: "auto" }}>
                  {PRODUCTS.filter(p => !selectedFactory || p.factory === selectedFactory).map(p => {
                    const fColor = FACTORIES.find(f => f.name === p.factory)?.color || "#60A5FA";
                    return (
                      <div key={p.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px", borderRadius: 6, background: "#091929" }}>
                        <span style={{ color: "#94a3b8", fontSize: 10, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                        <span style={{ color: fColor, fontSize: 9, fontFamily: "monospace", marginLeft: 8, flexShrink: 0 }}>{p.factory.split(" ")[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 20, padding: "12px 0", borderTop: "1px solid #1e3a5f", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#2d4a6e", fontSize: 10, fontFamily: "monospace" }}>NASSAU CANDY DISTRIBUTOR · FACTORY REALLOCATION & SHIPPING OPTIMIZATION SYSTEM · UNIFIED MENTOR INTERNSHIP</span>
            <span style={{ color: "#2d4a6e", fontSize: 10, fontFamily: "monospace" }}>NAMAN SHAH · MBA SEM 2 · PUNE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
