import React from 'react';
import { BookOpen } from 'lucide-react';

export const TheoryCard: React.FC = () => {
  return (
    <div id="theory-container" className="space-y-6">
      
      {/* Overview Banner (Bento Grid) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 text-blue-600 mb-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Darcy-Weisbach & Colebrook-White Fluid Mechanics Theory</h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl font-medium">
          The Darcy-Weisbach equation is the universally accepted theoretical standard in chemical, mechanical, and civil engineering for computing frictional head loss and pressure drops in full-flowing pressurized circular pipes. Unlike empirical formulas (e.g., Hazen-Williams, Manning), Darcy-Weisbach applies accurately to all Newtonian fluids (water, hydrocarbons, glycols, slurries) across laminar, transition, and fully turbulent regimes.
        </p>
      </div>

      {/* Grid of Theory Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Pillar 1: Darcy-Weisbach Equation */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5 text-blue-600 font-bold text-sm">
              <span className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-xs font-mono font-bold">1</span>
              <h3 className="text-slate-900">Darcy-Weisbach Frictional Head Loss</h3>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center font-mono text-base font-bold text-blue-700 shadow-inner">
              h_f = f · (L / D) · (v² / 2g)
            </div>

            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li><strong className="text-slate-900">h_f:</strong> Frictional head loss (m or ft)</li>
              <li><strong className="text-slate-900">f:</strong> Dimensionless Darcy friction factor</li>
              <li><strong className="text-slate-900">L:</strong> Total pipe length (m or ft)</li>
              <li><strong className="text-slate-900">D:</strong> Pipe inner diameter (m or ft)</li>
              <li><strong className="text-slate-900">v:</strong> Mean fluid velocity = 4Q / (π D²) (m/s or ft/s)</li>
              <li><strong className="text-slate-900">g:</strong> Gravitational acceleration (9.80665 m/s² or 32.174 ft/s²)</li>
            </ul>
          </div>

          <div className="text-xs text-slate-500 border-t border-slate-100 pt-3">
            Pressure drop converted via hydrostatic relation: <code className="text-blue-700 font-mono font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">ΔP = ρ · g · h_f</code>.
          </div>
        </div>

        {/* Pillar 2: Colebrook-White Friction Factor */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5 text-blue-600 font-bold text-sm">
              <span className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-xs font-mono font-bold">2</span>
              <h3 className="text-slate-900">Colebrook-White Implicit Equation</h3>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center font-mono text-xs sm:text-sm font-bold text-blue-700 shadow-inner">
              1 / √f = -2 · log₁₀[ (ε / D)/3.7 + 2.51 / (Re · √f) ]
            </div>

            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li><strong className="text-slate-900">ε / D:</strong> Relative roughness (wall roughness / diameter)</li>
              <li><strong className="text-slate-900">Re:</strong> Reynolds number = ρ v D / μ</li>
              <li><strong className="text-slate-900">Implicit Nature:</strong> Requires numerical iterative root finding (Newton-Raphson method).</li>
              <li><strong className="text-slate-900">Initial Guess:</strong> Swamee-Jain explicit formula provides initial estimate within 1-2% of root.</li>
            </ul>
          </div>

          <div className="text-xs text-slate-500 border-t border-slate-100 pt-3">
            Formulated by Cyril Frank Colebrook in 1939 to model turbulent rough pipes in the Moody chart.
          </div>
        </div>

        {/* Pillar 3: Flow Regimes & Critical Zone */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5 text-blue-600 font-bold text-sm">
              <span className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-xs font-mono font-bold">3</span>
              <h3 className="text-slate-900">Flow Regimes & Transition Handling</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-emerald-700">Laminar Flow (Re &lt; 2,000)</span>
                  <p className="text-[11px] text-slate-500 font-medium">Viscous forces dominate; Poiseuille analytical solution</p>
                </div>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  f = 64 / Re
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-amber-700">Transition Zone (2,000 ≤ Re ≤ 4,000)</span>
                  <p className="text-[11px] text-slate-500 font-medium">Intermittent bursts; smooth Hermite interpolation prevents step jumps</p>
                </div>
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                  Cubic Spline
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-blue-700">Turbulent Flow (Re &gt; 4,000)</span>
                  <p className="text-[11px] text-slate-500 font-medium">Vortices & turbulent boundary layer; Colebrook-White applies</p>
                </div>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                  Newton-Raphson
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pillar 4: Total Dynamic Head & Pumping Power */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5 text-blue-600 font-bold text-sm">
              <span className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-xs font-mono font-bold">4</span>
              <h3 className="text-slate-900">Total Dynamic Head & Pumping Power</h3>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center font-mono text-sm font-bold text-blue-700 shadow-inner">
              H_total = h_f + Σ K · (v² / 2g) + Δz
            </div>

            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li><strong className="text-slate-900">Minor Losses (h_m):</strong> Resistance from valves, elbows, reducers, and tees.</li>
              <li><strong className="text-slate-900">Static Head (Δz):</strong> Net elevation difference between discharge and suction reservoirs.</li>
              <li><strong className="text-slate-900">Hydraulic Fluid Power:</strong> <code className="text-blue-700 font-mono">P_hyd = Q · ΔP = ρ · g · Q · H_total</code></li>
              <li><strong className="text-slate-900">Motor Brake Power:</strong> <code className="text-blue-700 font-mono">P_shaft = P_hyd / η_pump</code></li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};
