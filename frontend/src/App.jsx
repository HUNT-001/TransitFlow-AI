import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Activity,
  CloudRain,
  TrendingUp,
  Bell,
  Menu,
  Radar as RadarIcon,
  ListTree
} from 'lucide-react';

// --- MOCK DATA ---
const MOCK_SHIPMENTS = [
  {
    id: "SHP-9942",
    material: "Structural Steel Beams",
    origin: "Chennai Hub",
    dest: "Hyderabad Site Alpha",
    originalEta: "JUL 15 · 08:00",
    predictedDelay: 14.5,
    riskLevel: "CRITICAL",
    weatherImpact: "Heavy Monsoon Rain",
    trafficImpact: "High Congestion (NH16)",
    action: "Reassign Sector B framing crew to foundational work to prevent idle labor.",
    angle: 300,
  },
  {
    id: "SHP-8821",
    material: "Portland Cement (Bulk)",
    origin: "Coimbatore",
    dest: "Bengaluru Site Omega",
    originalEta: "JUL 12 · 10:00",
    predictedDelay: 2.1,
    riskLevel: "LOW",
    weatherImpact: "Clear",
    trafficImpact: "Normal",
    action: "Proceed as planned. Buffer is sufficient.",
    angle: 60,
  },
  {
    id: "SHP-7734",
    material: "Excavator Machinery",
    origin: "Pune",
    dest: "Hyderabad Site Alpha",
    originalEta: "JUL 14 · 14:00",
    predictedDelay: 5.5,
    riskLevel: "MEDIUM",
    weatherImpact: "Moderate Rain",
    trafficImpact: "Accident Delay",
    action: "Notify site manager. Adjust immediate delivery staging area.",
    angle: 165,
  }
];

const RISK_COLOR = {
  CRITICAL: 'var(--coral)',
  MEDIUM: 'var(--amber)',
  LOW: 'var(--sage)'
};

// distance from radar center encodes severity: critical = close in, low = far out
const RISK_RADIUS = { CRITICAL: 34, MEDIUM: 66, LOW: 96 };

export default function App() {
  const [selectedShipment, setSelectedShipment] = useState(MOCK_SHIPMENTS[0]);
  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const ist = new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
        timeZone: 'Asia/Kolkata'
      }).format(now);
      setClock(ist);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="tf-root flex h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        .tf-root {
          --canvas: #0D1526;
          --panel: #141F38;
          --panel-raised: #182545;
          --line: #26314C;
          --amber: #F2A93B;
          --coral: #E5484D;
          --sage: #4FBF9F;
          --text: #EAEDF6;
          --muted: #8592AD;
          background: var(--canvas);
          color: var(--text);
          font-family: 'IBM Plex Sans', sans-serif;
        }
        .tf-display { font-family: 'Space Grotesk', sans-serif; }
        .tf-mono { font-family: 'IBM Plex Mono', monospace; }

        .tf-rail {
          background: linear-gradient(180deg, #0A1120 0%, #0D1526 100%);
          border-right: 1px solid var(--line);
        }
        .tf-rail-item {
          color: var(--muted);
          border-left: 2px solid transparent;
          transition: color .15s ease, border-color .15s ease, background .15s ease;
        }
        .tf-rail-item:hover { color: var(--text); background: rgba(242,169,59,0.06); }
        .tf-rail-item.active {
          color: var(--amber);
          border-left-color: var(--amber);
          background: rgba(242,169,59,0.09);
        }

        .tf-panel {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 4px;
        }

        .tf-kpi {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 4px;
          border-top: 2px solid var(--line);
          position: relative;
          overflow: hidden;
        }
        .tf-kpi::before {
          content: '';
          position: absolute;
          top: -1px; left: 0; right: 0; height: 2px;
          background: var(--accent, var(--amber));
        }

        .tf-eyebrow {
          font-size: 10.5px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted);
          font-weight: 500;
        }

        /* --- RADAR --- */
        .tf-radar-wrap {
          background: radial-gradient(circle at center, #0F1B33 0%, #0A1220 75%);
        }
        .tf-radar-ring {
          fill: none;
          stroke: var(--line);
          stroke-width: 1;
        }
        .tf-radar-crosshair {
          stroke: var(--line);
          stroke-width: 1;
        }
        .tf-radar-sweep {
          transform-origin: 110px 110px;
          animation: sweep 4.5s linear infinite;
        }
        @keyframes sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .tf-blip { cursor: pointer; }
        .tf-blip circle.core { transition: r .15s ease; }
        .tf-blip:hover circle.core { r: 7; }
        .tf-blip circle.pulse {
          animation: blip-pulse 2.2s ease-out infinite;
        }
        @keyframes blip-pulse {
          0% { r: 5; opacity: 0.6; }
          100% { r: 16; opacity: 0; }
        }

        .tf-row {
          border-left: 2px solid transparent;
          transition: background .15s ease, border-color .15s ease;
          cursor: pointer;
        }
        .tf-row:hover { background: rgba(255,255,255,0.02); }
        .tf-row.selected {
          background: rgba(242,169,59,0.07);
          border-left-color: var(--amber);
        }

        .tf-badge {
          font-size: 10px;
          letter-spacing: 0.06em;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 3px;
          font-family: 'IBM Plex Mono', monospace;
        }

        .tf-console-header {
          background: linear-gradient(90deg, #1B2A4D 0%, #182545 100%);
          border-bottom: 1px solid var(--line);
        }

        .tf-execute-btn {
          background: var(--coral);
          color: #1a0a0a;
          font-weight: 600;
          transition: filter .15s ease;
        }
        .tf-execute-btn:hover { filter: brightness(1.1); }

        @media (prefers-reduced-motion: reduce) {
          .tf-radar-sweep, .tf-blip circle.pulse { animation: none !important; }
        }
      `}</style>

      {/* RAIL */}
      <div className="tf-rail w-16 md:w-56 flex flex-col shrink-0">
        <div className="h-16 flex items-center justify-center md:justify-start md:px-5 gap-3 border-b" style={{ borderColor: 'var(--line)' }}>
          <RadarIcon size={22} style={{ color: 'var(--amber)' }} />
          <span className="tf-display hidden md:inline text-[15px] font-semibold tracking-wide">
            TRANSIT<span style={{ color: 'var(--amber)' }}>FLOW</span>
          </span>
        </div>

        <nav className="flex-1 py-5 px-2 md:px-3 flex flex-col gap-1">
          <RailItem icon={<Activity size={18} />} label="Control Tower" active />
          <RailItem icon={<Truck size={18} />} label="Active Shipments" />
          <RailItem icon={<ListTree size={18} />} label="Route Analytics" />
          <RailItem icon={<AlertTriangle size={18} />} label="Delay Alerts" badge="1" />
        </nav>

        <div className="hidden md:block p-4 border-t tf-mono text-[10px]" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
          WnCC × Kaya AI HACKATHON
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* TOP BAR */}
        <header className="h-16 flex items-center justify-between px-6 border-b shrink-0" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-4">
            <Menu className="md:hidden" size={20} style={{ color: 'var(--muted)' }} />
            <div>
              <h2 className="tf-display text-base font-semibold">Supply Chain Control Tower</h2>
              <p className="tf-eyebrow mt-0.5">Live Ops · Automotive & IHM Corridor</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="tf-mono text-sm hidden sm:flex items-center gap-2" style={{ color: 'var(--muted)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--sage)', boxShadow: '0 0 6px var(--sage)' }} />
              IST {clock}
            </div>
            <div className="relative cursor-pointer">
              <Bell size={19} style={{ color: 'var(--muted)' }} />
              <span className="tf-mono absolute -top-1.5 -right-1.5 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full" style={{ background: 'var(--coral)' }}>1</span>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs tf-mono" style={{ background: 'var(--panel-raised)', border: '1px solid var(--line)' }}>
              TM
            </div>
          </div>
        </header>

        {/* SCROLL AREA */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* KPI ROW */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <Kpi label="Active Shipments" value="24" unit="in transit" accent="var(--amber)" icon={<Truck size={16} />} />
            <Kpi label="Critical Delays" value="01" unit="+1 vs yesterday" accent="var(--coral)" icon={<AlertTriangle size={16} />} />
            <Kpi label="Forecast Confidence" value="94.2%" unit="XGBoost model" accent="var(--sage)" icon={<TrendingUp size={16} />} />
            <Kpi label="Idle Labor Saved" value="₹1.2L" unit="this month" accent="var(--sage)" icon={<CheckCircle2 size={16} />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* LEFT */}
            <div className="lg:col-span-2 flex flex-col gap-5">

              {/* RADAR */}
              <div className="tf-panel overflow-hidden">
                <div className="flex items-center justify-between px-5 pt-4">
                  <div>
                    <h3 className="tf-display text-sm font-semibold">Risk Radar</h3>
                    <p className="tf-eyebrow mt-0.5">Distance from center = severity</p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] tf-mono" style={{ color: 'var(--muted)' }}>
                    <LegendDot color="var(--coral)" label="CRITICAL" />
                    <LegendDot color="var(--amber)" label="MEDIUM" />
                    <LegendDot color="var(--sage)" label="LOW" />
                  </div>
                </div>

                <div className="tf-radar-wrap flex items-center justify-center py-4">
                  <svg width="220" height="220" viewBox="0 0 220 220">
                    <circle className="tf-radar-ring" cx="110" cy="110" r="34" />
                    <circle className="tf-radar-ring" cx="110" cy="110" r="66" />
                    <circle className="tf-radar-ring" cx="110" cy="110" r="96" />
                    <line className="tf-radar-crosshair" x1="110" y1="8" x2="110" y2="212" />
                    <line className="tf-radar-crosshair" x1="8" y1="110" x2="212" y2="110" />

                    <g className="tf-radar-sweep">
                      <path d="M 110 110 L 110 8 A 102 102 0 0 1 165 33 Z" fill="url(#sweepGrad)" opacity="0.5" />
                    </g>
                    <defs>
                      <linearGradient id="sweepGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#F2A93B" stopOpacity="0" />
                        <stop offset="100%" stopColor="#F2A93B" stopOpacity="0.6" />
                      </linearGradient>
                    </defs>

                    {MOCK_SHIPMENTS.map(s => {
                      const r = RISK_RADIUS[s.riskLevel];
                      const rad = (s.angle * Math.PI) / 180;
                      const x = 110 + r * Math.cos(rad);
                      const y = 110 + r * Math.sin(rad);
                      const color = RISK_COLOR[s.riskLevel];
                      const isSel = selectedShipment.id === s.id;
                      return (
                        <g key={s.id} className="tf-blip" onClick={() => setSelectedShipment(s)}>
                          <circle className="pulse" cx={x} cy={y} r="5" fill={color} />
                          <circle className="core" cx={x} cy={y} r={isSel ? 7 : 5} fill={color} stroke={isSel ? '#fff' : 'none'} strokeWidth="1.5" />
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div className="px-5 pb-4 flex justify-between items-center text-xs tf-mono" style={{ color: 'var(--muted)' }}>
                  <span>TRACKING: {selectedShipment.id}</span>
                  <span className="flex items-center gap-1.5">
                    <CloudRain size={13} />
                    {selectedShipment.weatherImpact}
                  </span>
                </div>
              </div>

              {/* SHIPMENT BOARD */}
              <div className="tf-panel flex-1">
                <div className="px-5 py-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--line)' }}>
                  <h3 className="tf-display text-sm font-semibold">Shipment Board</h3>
                  <button className="text-xs tf-mono" style={{ color: 'var(--amber)' }}>VIEW ALL →</button>
                </div>

                {/* header row */}
                <div className="hidden sm:grid grid-cols-12 px-5 py-2 tf-eyebrow" style={{ borderBottom: '1px solid var(--line)' }}>
                  <span className="col-span-4">Shipment</span>
                  <span className="col-span-4">Route</span>
                  <span className="col-span-2">ETA</span>
                  <span className="col-span-2 text-right">Status</span>
                </div>

                <div>
                  {MOCK_SHIPMENTS.map(shipment => {
                    const sel = selectedShipment.id === shipment.id;
                    const color = RISK_COLOR[shipment.riskLevel];
                    return (
                      <div
                        key={shipment.id}
                        onClick={() => setSelectedShipment(shipment)}
                        className={`tf-row grid grid-cols-12 items-center px-5 py-3 ${sel ? 'selected' : ''}`}
                        style={{ borderBottom: '1px solid var(--line)' }}
                      >
                        <div className="col-span-12 sm:col-span-4">
                          <p className="tf-mono text-sm font-medium">{shipment.id}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{shipment.material}</p>
                        </div>
                        <div className="col-span-6 sm:col-span-4 text-xs mt-2 sm:mt-0" style={{ color: 'var(--muted)' }}>
                          {shipment.origin} → {shipment.dest}
                        </div>
                        <div className="col-span-6 sm:col-span-2 tf-mono text-xs mt-2 sm:mt-0" style={{ color: 'var(--muted)' }}>
                          {shipment.originalEta}
                        </div>
                        <div className="col-span-12 sm:col-span-2 flex sm:justify-end mt-2 sm:mt-0">
                          <span className="tf-badge" style={{ background: `${color}22`, color }}>
                            {shipment.predictedDelay > 0 ? `+${shipment.predictedDelay}H` : 'ON TIME'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT — PRESCRIPTIVE ACTION CONSOLE */}
            <div className="lg:col-span-1">
              <div className="tf-panel overflow-hidden sticky top-0">
                <div className="tf-console-header px-5 py-4 flex items-center gap-2.5">
                  <Activity size={17} style={{ color: 'var(--amber)' }} />
                  <h3 className="tf-display text-sm font-semibold">Prescriptive Action Engine</h3>
                </div>

                <div className="p-5 flex flex-col gap-4">
                  <div>
                    <p className="tf-eyebrow mb-1">Target Shipment</p>
                    <p className="tf-mono text-base font-semibold">{selectedShipment.id}</p>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{selectedShipment.material}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded" style={{ background: 'var(--panel-raised)', border: '1px solid var(--line)' }}>
                      <p className="tf-eyebrow mb-1">Original ETA</p>
                      <p className="tf-mono text-sm">{selectedShipment.originalEta}</p>
                    </div>
                    <div className="p-3 rounded" style={{ background: 'var(--panel-raised)', border: `1px solid ${RISK_COLOR[selectedShipment.riskLevel]}55` }}>
                      <p className="tf-eyebrow mb-1">Forecast</p>
                      <p className="tf-mono text-lg font-semibold" style={{ color: RISK_COLOR[selectedShipment.riskLevel] }}>
                        +{selectedShipment.predictedDelay}H
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="tf-eyebrow">Delay Factors Detected</p>
                    <div className="flex items-center gap-2.5 p-2 rounded text-sm" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <CloudRain size={15} style={{ color: 'var(--amber)' }} />
                      {selectedShipment.weatherImpact}
                    </div>
                    <div className="flex items-center gap-2.5 p-2 rounded text-sm" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <MapPin size={15} style={{ color: 'var(--amber)' }} />
                      {selectedShipment.trafficImpact}
                    </div>
                  </div>

                  <div
                    className="mt-1 p-4 rounded"
                    style={{
                      background: `${RISK_COLOR[selectedShipment.riskLevel]}14`,
                      border: `1px solid ${RISK_COLOR[selectedShipment.riskLevel]}44`
                    }}
                  >
                    <p className="tf-eyebrow mb-2 flex items-center gap-1.5" style={{ color: RISK_COLOR[selectedShipment.riskLevel] }}>
                      <Bell size={12} /> Recommendation
                    </p>
                    <p className="text-sm leading-relaxed">{selectedShipment.action}</p>

                    {selectedShipment.riskLevel === 'CRITICAL' && (
                      <button className="tf-execute-btn mt-4 w-full py-2.5 rounded text-sm">
                        Execute Labor Reallocation
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function RailItem({ icon, label, active, badge }) {
  return (
    <div className={`tf-rail-item flex items-center justify-between px-3 py-2.5 rounded cursor-pointer ${active ? 'active' : ''}`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="hidden md:inline text-sm font-medium">{label}</span>
      </div>
      {badge && (
        <span className="tf-mono hidden md:flex text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white" style={{ background: 'var(--coral)' }}>
          {badge}
        </span>
      )}
    </div>
  );
}

function Kpi({ label, value, unit, accent, icon }) {
  return (
    <div className="tf-kpi p-4" style={{ '--accent': accent }}>
      <div className="flex items-center justify-between mb-2">
        <p className="tf-eyebrow">{label}</p>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <p className="tf-display text-2xl font-semibold tf-mono">{value}</p>
      <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{unit}</p>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
      {label}
    </span>
  );
}