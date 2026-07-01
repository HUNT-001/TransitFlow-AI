import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Activity, 
  CloudRain, 
  TrendingUp,
  Bell,
  Menu,
  ChevronRight
} from 'lucide-react';

// --- MOCK DATA ---
const MOCK_SHIPMENTS = [
  {
    id: "SHP-9942",
    material: "Structural Steel Beams",
    origin: "Chennai Hub",
    dest: "Hyderabad Site Alpha",
    originalEta: "July 15, 08:00 AM",
    predictedDelay: 14.5, // hours
    riskLevel: "CRITICAL",
    weatherImpact: "Heavy Monsoon Rain",
    trafficImpact: "High Congestion (NH16)",
    action: "Reassign Sector B framing crew to foundational work to prevent idle labor."
  },
  {
    id: "SHP-8821",
    material: "Portland Cement (Bulk)",
    origin: "Coimbatore",
    dest: "Bengaluru Site Omega",
    originalEta: "July 12, 10:00 AM",
    predictedDelay: 2.1,
    riskLevel: "LOW",
    weatherImpact: "Clear",
    trafficImpact: "Normal",
    action: "Proceed as planned. Buffer is sufficient."
  },
  {
    id: "SHP-7734",
    material: "Excavator Machinery",
    origin: "Pune",
    dest: "Hyderabad Site Alpha",
    originalEta: "July 14, 02:00 PM",
    predictedDelay: 5.5,
    riskLevel: "MEDIUM",
    weatherImpact: "Moderate Rain",
    trafficImpact: "Accident Delay",
    action: "Notify site manager. Adjust immediate delivery staging area."
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedShipment, setSelectedShipment] = useState(MOCK_SHIPMENTS[0]);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shadow-xl hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-slate-700">
          <Activity className="text-blue-400" size={28} />
          <h1 className="text-xl font-bold tracking-wider">TransitFlow <span className="text-blue-400">AI</span></h1>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          <NavItem icon={<Activity size={20} />} label="Control Tower" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Truck size={20} />} label="Active Shipments" />
          <NavItem icon={<MapPin size={20} />} label="Route Analytics" />
          <NavItem icon={<AlertTriangle size={20} />} label="Delay Alerts" badge="1" />
        </nav>
        
        <div className="p-4 border-t border-slate-700 text-sm text-slate-400">
          WnCC × Kaya AI Hackathon
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Menu className="md:hidden text-slate-500 cursor-pointer" />
            <h2 className="text-xl font-semibold text-slate-800">Supply Chain Control Tower</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer">
              <Bell className="text-slate-500" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">1</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              TM
            </div>
          </div>
        </header>

        {/* DASHBOARD SCROLL AREA */}
        <main className="flex-1 overflow-y-auto p-6">
          
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <KpiCard title="Active Shipments" value="24" icon={<Truck className="text-blue-500" />} />
            <KpiCard title="Critical Delays" value="1" icon={<AlertTriangle className="text-red-500" />} trend="+1 since yesterday" trendColor="text-red-500" />
            <KpiCard title="Avg Prediction Confidence" value="94.2%" icon={<TrendingUp className="text-green-500" />} />
            <KpiCard title="Idle Labor Saved (Est.)" value="₹1.2L" icon={<CheckCircle2 className="text-emerald-500" />} trend="This month" trendColor="text-slate-400" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN - SHIPMENTS & MAP PLACEHOLDER */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* MAP VISUALIZER PLACEHOLDER */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex flex-col">
                <div className="bg-slate-100 rounded-lg h-64 flex items-center justify-center relative overflow-hidden">
                  {/* Decorative map lines */}
                  <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 50 200 Q 200 50, 400 150 T 800 100" stroke="#000" strokeWidth="2" fill="transparent" strokeDasharray="5,5" />
                  </svg>
                  <div className="absolute left-12 bottom-12 flex flex-col items-center">
                    <MapPin className="text-blue-600" size={32} />
                    <span className="text-xs font-bold mt-1 bg-white px-2 py-1 rounded shadow">Chennai Hub</span>
                  </div>
                  <div className="absolute right-24 top-24 flex flex-col items-center">
                    <MapPin className="text-emerald-600" size={32} />
                    <span className="text-xs font-bold mt-1 bg-white px-2 py-1 rounded shadow">Hyderabad Site</span>
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white p-2 rounded-full animate-pulse shadow-lg">
                    <Truck size={20} />
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center text-sm text-slate-500">
                  <span>Live Route Visualization: SHP-9942</span>
                  <span className="flex items-center gap-2"><CloudRain size={16} className="text-blue-400" /> Heavy Rain detected on route</span>
                </div>
              </div>

              {/* SHIPMENTS LIST */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold">Active Shipments Risk Radar</h3>
                  <button className="text-sm text-blue-600 hover:underline">View All</button>
                </div>
                <div className="divide-y divide-slate-100">
                  {MOCK_SHIPMENTS.map(shipment => (
                    <div 
                      key={shipment.id} 
                      onClick={() => setSelectedShipment(shipment)}
                      className={`p-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-slate-50 ${selectedShipment.id === shipment.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${
                          shipment.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-600' : 
                          shipment.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          <Truck size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{shipment.id} • {shipment.material}</p>
                          <p className="text-sm text-slate-500">{shipment.origin} <ChevronRight className="inline" size={14} /> {shipment.dest}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${shipment.riskLevel === 'CRITICAL' ? 'text-red-600' : 'text-slate-800'}`}>
                          {shipment.predictedDelay > 0 ? `+${shipment.predictedDelay}h Delay` : 'On Time'}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          shipment.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                          shipment.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {shipment.riskLevel} RISK
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - PREDICTIVE ENGINE DETAILS */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              
              {/* THE PRESCRIPTIVE ACTION ENGINE - CORE HACKATHON FEATURE */}
              <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 text-white overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center gap-3">
                  <Activity className="text-white animate-pulse" />
                  <h3 className="font-bold text-lg">Prescriptive Action Engine</h3>
                </div>
                
                <div className="p-6 flex flex-col gap-4">
                  <div className="mb-2">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Target Shipment</p>
                    <p className="text-lg font-semibold">{selectedShipment.id}</p>
                    <p className="text-slate-300 text-sm">{selectedShipment.material}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 p-3 rounded-lg">
                      <p className="text-slate-400 text-xs">Original ETA</p>
                      <p className="font-medium text-sm">{selectedShipment.originalEta}</p>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                      <p className="text-slate-400 text-xs">XGBoost Forecast</p>
                      <p className={`font-bold text-lg ${selectedShipment.riskLevel === 'CRITICAL' ? 'text-red-400' : selectedShipment.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        +{selectedShipment.predictedDelay} Hrs
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mt-2">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Delay Factors Detected</p>
                    <div className="flex items-center gap-3 bg-slate-800/50 p-2 rounded">
                      <CloudRain className="text-blue-400" size={18} />
                      <span className="text-sm">{selectedShipment.weatherImpact}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-800/50 p-2 rounded">
                      <MapPin className="text-amber-400" size={18} />
                      <span className="text-sm">{selectedShipment.trafficImpact}</span>
                    </div>
                  </div>

                  {/* ACTION RECOMMENDATION */}
                  <div className={`mt-4 p-4 rounded-lg border ${
                    selectedShipment.riskLevel === 'CRITICAL' ? 'bg-red-900/30 border-red-500/50' : 
                    selectedShipment.riskLevel === 'MEDIUM' ? 'bg-amber-900/30 border-amber-500/50' : 'bg-emerald-900/30 border-emerald-500/50'
                  }`}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Bell size={14} /> AI Recommendation
                    </p>
                    <p className="text-sm leading-relaxed text-slate-200">
                      {selectedShipment.action}
                    </p>
                    {selectedShipment.riskLevel === 'CRITICAL' && (
                      <button className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors text-sm">
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

// Sub-components
function NavItem({ icon, label, active, badge, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium text-sm">{label}</span>
      </div>
      {badge && (
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </div>
  );
}

function KpiCard({ title, value, icon, trend, trendColor }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <div className="p-2 bg-slate-50 rounded-lg">
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {trend && (
        <p className={`text-xs font-medium ${trendColor}`}>{trend}</p>
      )}
    </div>
  );
}