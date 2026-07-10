import React, { useState } from 'react';
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
  ListTree,
  Loader2,
  Send
} from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000/api/v1/predict-delay';

const RISK_COLOR = {
  CRITICAL: 'var(--coral)',
  MEDIUM: 'var(--amber)',
  LOW: 'var(--sage)'
};
const RISK_RADIUS = { CRITICAL: 34, MEDIUM: 66, LOW: 96 };

// golden-angle spacing so new blips don't stack on top of old ones
function angleForIndex(i) {
  return (i * 137.5) % 360;
}

const EMPTY_FORM = {
  shipment_id: '',
  material_type: '',
  origin: '',
  destination: '',
  distance_km: '',
  useSimulated: false,
  simulated_weather_severity: 5,
  simulated_traffic_index: 5,
};

export default function App() {
  const [shipments, setShipments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedShipment = shipments.find(s => s.id === selectedId) || null;

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.shipment_id || !form.material_type || !form.origin || !form.destination || !form.distance_km) {
      setError('Please fill in all required fields.');
      return;
    }

    const payload = {
      shipment_id: form.shipment_id,
      material_type: form.material_type,
      origin: form.origin,
      destination: form.destination,
      distance_km: parseFloat(form.distance_km),
    };
    if (form.useSimulated) {
      payload.simulated_weather_severity = Number(form.simulated_weather_severity);
      payload.simulated_traffic_index = Number(form.simulated_traffic_index);
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server responded ${res.status}: ${text}`);
      }

      const data = await res.json();

      const merged = {
        id: data.shipment_id,
        material: form.material_type,
        origin: form.origin,
        dest: form.destination,
        distanceKm: payload.distance_km,
        predictedDelay: data.predicted_delay_hours,
        riskLevel: data.risk_level,
        weatherImpact: data.weather_impact,
        trafficImpact: data.traffic_impact,
        action: data.prescriptive_action,
      };

      setShipments(prev => {
        // replace if same shipment_id resubmitted, else append
        const withoutDupe = prev.filter(s => s.id !== merged.id);
        return [...withoutDupe, merged];
      });
      setSelectedId(merged.id);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(
        err.message.includes('Failed to fetch')
          ? "Couldn't reach the backend. Is FastAPI running on port 8000, and is CORS enabled for this origin?"
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  const criticalCount = shipments.filter(s => s.riskLevel === 'CRITICAL').length;
  const avgDelay = shipments.length
    ? (shipments.reduce((sum, s) => sum + s.predictedDelay, 0) / shipments.length).toFixed(1)
    : '—';

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

        .tf-radar-wrap {
          background: radial-gradient(circle at center, #0F1B33 0%, #0A1220 75%);
        }
        .tf-radar-ring { fill: none; stroke: var(--line); stroke-width: 1; }
        .tf-radar-crosshair { stroke: var(--line); stroke-width: 1; }
        .tf-radar-sweep {
          transform-origin: 110px 110px;
          animation: sweep 4.5s linear infinite;
        }
        @keyframes sweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .tf-blip { cursor: pointer; }
        .tf-blip circle.core { transition: r .15s ease; }
        .tf-blip:hover circle.core { r: 7; }
        .tf-blip circle.pulse { animation: blip-pulse 2.2s ease-out infinite; }
        @keyframes blip-pulse { 0% { r: 5; opacity: 0.6; } 100% { r: 16; opacity: 0; } }

        .tf-row {
          border-left: 2px solid transparent;
          transition: background .15s ease, border-color .15s ease;
          cursor: pointer;
        }
        .tf-row:hover { background: rgba(255,255,255,0.02); }
        .tf-row.selected { background: rgba(242,169,59,0.07); border-left-color: var(--amber); }

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

        .tf-execute-btn { background: var(--coral); color: #1a0a0a; font-weight: 600; transition: filter .15s ease; }
        .tf-execute-btn:hover { filter: brightness(1.1); }

        .tf-input {
          background: var(--panel-raised);
          border: 1px solid var(--line);
          color: var(--text);
          font-size: 13px;
          padding: 8px 10px;
          border-radius: 4px;
          width: 100%;
        }
        .tf-input:focus { outline: none; border-color: var(--amber); }
        .tf-submit-btn {
          background: var(--amber);
          color: #1a1204;
          font-weight: 600;
          transition: filter .15s ease;
        }
        .tf-submit-btn:hover { filter: brightness(1.08); }
        .tf-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

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
          <RailItem icon={<AlertTriangle size={18} />} label="Delay Alerts" badge={criticalCount > 0 ? String(criticalCount) : null} />
        </nav>

        <div className="hidden md:block p-4 border-t tf-mono text-[10px]" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
          WnCC × Kaya AI HACKATHON
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b shrink-0" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-4">
            <Menu className="md:hidden" size={20} style={{ color: 'var(--muted)' }} />
            <div>
              <h2 className="tf-display text-base font-semibold">Supply Chain Control Tower</h2>
              <p className="tf-eyebrow mt-0.5">Live Ops · Automotive & IHM Corridor</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative cursor-pointer">
              <Bell size={19} style={{ color: 'var(--muted)' }} />
              {criticalCount > 0 && (
                <span className="tf-mono absolute -top-1.5 -right-1.5 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full" style={{ background: 'var(--coral)' }}>
                  {criticalCount}
                </span>
              )}
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs tf-mono" style={{ background: 'var(--panel-raised)', border: '1px solid var(--line)' }}>
              TM
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <Kpi label="Active Shipments" value={String(shipments.length)} unit="submitted" accent="var(--amber)" icon={<Truck size={16} />} />
            <Kpi label="Critical Delays" value={String(criticalCount).padStart(2, '0')} unit="of total" accent="var(--coral)" icon={<AlertTriangle size={16} />} />
            <Kpi label="Avg Predicted Delay" value={avgDelay === '—' ? '—' : `${avgDelay}H`} unit="across shipments" accent="var(--sage)" icon={<TrendingUp size={16} />} />
            <Kpi label="Idle Labor Saved" value="₹1.2L" unit="illustrative" accent="var(--sage)" icon={<CheckCircle2 size={16} />} />
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

                    {shipments.map((s, i) => {
                      const r = RISK_RADIUS[s.riskLevel] ?? 96;
                      const rad = (angleForIndex(i) * Math.PI) / 180;
                      const x = 110 + r * Math.cos(rad);
                      const y = 110 + r * Math.sin(rad);
                      const color = RISK_COLOR[s.riskLevel] ?? 'var(--muted)';
                      const isSel = selectedId === s.id;
                      return (
                        <g key={s.id} className="tf-blip" onClick={() => setSelectedId(s.id)}>
                          <circle className="pulse" cx={x} cy={y} r="5" fill={color} />
                          <circle className="core" cx={x} cy={y} r={isSel ? 7 : 5} fill={color} stroke={isSel ? '#fff' : 'none'} strokeWidth="1.5" />
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div className="px-5 pb-4 flex justify-between items-center text-xs tf-mono" style={{ color: 'var(--muted)' }}>
                  <span>{shipments.length === 0 ? 'AWAITING SHIPMENT DATA' : `TRACKING: ${selectedShipment ? selectedShipment.id : '—'}`}</span>
                  {selectedShipment && (
                    <span className="flex items-center gap-1.5">
                      <CloudRain size={13} />
                      {selectedShipment.weatherImpact}
                    </span>
                  )}
                </div>
              </div>

              {/* SHIPMENT BOARD */}
              <div className="tf-panel flex-1">
                <div className="px-5 py-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--line)' }}>
                  <h3 className="tf-display text-sm font-semibold">Shipment Board</h3>
                </div>

                {shipments.length === 0 ? (
                  <div className="px-5 py-8 text-sm text-center" style={{ color: 'var(--muted)' }}>
                    No shipments yet — submit one using the form to run a live prediction.
                  </div>
                ) : (
                  <>
                    <div className="hidden sm:grid grid-cols-12 px-5 py-2 tf-eyebrow" style={{ borderBottom: '1px solid var(--line)' }}>
                      <span className="col-span-4">Shipment</span>
                      <span className="col-span-4">Route</span>
                      <span className="col-span-2">Distance</span>
                      <span className="col-span-2 text-right">Status</span>
                    </div>
                    <div>
                      {shipments.map(shipment => {
                        const sel = selectedId === shipment.id;
                        const color = RISK_COLOR[shipment.riskLevel] ?? 'var(--muted)';
                        return (
                          <div
                            key={shipment.id}
                            onClick={() => setSelectedId(shipment.id)}
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
                              {shipment.distanceKm} km
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
                  </>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-1 flex flex-col gap-5">

              {/* SUBMISSION FORM */}
              <div className="tf-panel overflow-hidden">
                <div className="tf-console-header px-5 py-4 flex items-center gap-2.5">
                  <Send size={16} style={{ color: 'var(--amber)' }} />
                  <h3 className="tf-display text-sm font-semibold">New Shipment</h3>
                </div>
                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3">
                  <Field label="Shipment ID">
                    <input className="tf-input" value={form.shipment_id} onChange={e => updateField('shipment_id', e.target.value)} placeholder="SHP-1001" />
                  </Field>
                  <Field label="Material Type">
                    <input className="tf-input" value={form.material_type} onChange={e => updateField('material_type', e.target.value)} placeholder="Structural Steel" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Origin">
                      <input className="tf-input" value={form.origin} onChange={e => updateField('origin', e.target.value)} placeholder="Chennai Hub" />
                    </Field>
                    <Field label="Destination">
                      <input className="tf-input" value={form.destination} onChange={e => updateField('destination', e.target.value)} placeholder="Hyderabad Site" />
                    </Field>
                  </div>
                  <Field label="Distance (km)">
                    <input className="tf-input" type="number" step="0.1" value={form.distance_km} onChange={e => updateField('distance_km', e.target.value)} placeholder="630.5" />
                  </Field>

                  <label className="flex items-center gap-2 text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    <input type="checkbox" checked={form.useSimulated} onChange={e => updateField('useSimulated', e.target.checked)} />
                    Override with simulated conditions (skip live weather lookup)
                  </label>

                  {form.useSimulated && (
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={`Weather Severity: ${form.simulated_weather_severity}`}>
                        <input type="range" min="1" max="10" value={form.simulated_weather_severity}
                          onChange={e => updateField('simulated_weather_severity', e.target.value)} className="w-full" />
                      </Field>
                      <Field label={`Traffic Index: ${form.simulated_traffic_index}`}>
                        <input type="range" min="1" max="10" value={form.simulated_traffic_index}
                          onChange={e => updateField('simulated_traffic_index', e.target.value)} className="w-full" />
                      </Field>
                    </div>
                  )}

                  {error && (
                    <p className="text-xs p-2 rounded" style={{ background: 'rgba(229,72,77,0.12)', color: 'var(--coral)' }}>
                      {error}
                    </p>
                  )}

                  <button type="submit" disabled={loading} className="tf-submit-btn mt-1 py-2.5 rounded text-sm flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    {loading ? 'Running Prediction…' : 'Run Prediction'}
                  </button>
                </form>
              </div>

              {/* PRESCRIPTIVE CONSOLE */}
              <div className="tf-panel overflow-hidden">
                <div className="tf-console-header px-5 py-4 flex items-center gap-2.5">
                  <Activity size={17} style={{ color: 'var(--amber)' }} />
                  <h3 className="tf-display text-sm font-semibold">Prescriptive Action Engine</h3>
                </div>

                {!selectedShipment ? (
                  <div className="p-5 text-sm" style={{ color: 'var(--muted)' }}>
                    Submit or select a shipment to view its forecast and recommendation.
                  </div>
                ) : (
                  <div className="p-5 flex flex-col gap-4">
                    <div>
                      <p className="tf-eyebrow mb-1">Target Shipment</p>
                      <p className="tf-mono text-base font-semibold">{selectedShipment.id}</p>
                      <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{selectedShipment.material}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded" style={{ background: 'var(--panel-raised)', border: '1px solid var(--line)' }}>
                        <p className="tf-eyebrow mb-1">Distance</p>
                        <p className="tf-mono text-sm">{selectedShipment.distanceKm} km</p>
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
                )}
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

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="tf-eyebrow">{label}</span>
      {children}
    </label>
  );
}