import React, { useState } from 'react';
import { 
  Gauge, 
  Wind, 
  TrendingDown, 
  Zap, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Search
} from 'lucide-react';
import { CalculationInputs, CalculationResults } from '../types';
import { PIPE_MATERIALS } from '../utils/hydraulicPhysics';

interface ResultsTableProps {
  inputs: CalculationInputs;
  results: CalculationResults;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ inputs, results }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedTable, setCopiedTable] = useState(false);

  if (!results.isValid) {
    return (
      <div id="results-error-container" className="p-6 bg-red-50 border border-red-200 rounded-2xl space-y-4 text-red-900 shadow-sm">
        <div className="flex items-center space-x-3 text-red-600">
          <XCircle className="w-7 h-7 shrink-0 text-red-600" />
          <div>
            <h3 className="text-base font-bold text-red-900">Invalid Hydraulic Parameters Detected</h3>
            <p className="text-xs text-red-700">The physics calculation engine cannot proceed with non-positive or negative geometric values.</p>
          </div>
        </div>
        <div className="bg-white/80 p-4 rounded-xl border border-red-200 space-y-2">
          {results.errors.map((err, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-xs text-red-800 font-mono">
              <span className="text-red-500 font-bold">●</span>
              <span>{err}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-red-600 italic">
          Tip: In Streamlit, this is handled using <code className="bg-red-100 px-1.5 py-0.5 rounded font-mono">st.error(...)</code> and <code className="bg-red-100 px-1.5 py-0.5 rounded font-mono">st.stop()</code>.
        </p>
      </div>
    );
  }

  const mat = PIPE_MATERIALS[inputs.materialKey] || PIPE_MATERIALS.commercial_steel;
  const roughnessMm = inputs.materialKey === 'custom' ? inputs.customRoughnessMm : mat.roughnessMm;

  // Build the complete Pandas table dataset
  const tableRows = [
    {
      category: 'Geometry',
      param: 'Pipe Inner Diameter (D)',
      symbol: 'D',
      si: `${inputs.diameterMm.toFixed(1)} mm`,
      imperial: `${(inputs.diameterMm / 25.4).toFixed(3)} in`,
      description: 'Internal flow cross-section bore'
    },
    {
      category: 'Geometry',
      param: 'Pipe Total Length (L)',
      symbol: 'L',
      si: `${inputs.lengthM.toFixed(1)} m`,
      imperial: `${(inputs.lengthM * 3.28084).toFixed(1)} ft`,
      description: 'Linear pipe run distance'
    },
    {
      category: 'Geometry',
      param: 'Cross-Sectional Flow Area (A)',
      symbol: 'A = π D² / 4',
      si: `${results.areaM2.toFixed(6)} m²`,
      imperial: `${(results.areaM2 * 1550.0).toFixed(3)} in²`,
      description: 'Internal pipe passage area'
    },
    {
      category: 'Kinematics',
      param: 'Volumetric Flow Rate (Q)',
      symbol: 'Q',
      si: `${inputs.flowRateM3h.toFixed(2)} m³/h (${(results.flowRateM3s * 1000).toFixed(2)} L/s)`,
      imperial: `${(inputs.flowRateM3h * 4.40287).toFixed(2)} GPM (${(results.flowRateM3s * 35.3147).toFixed(3)} CFS)`,
      description: 'Volume flow throughput'
    },
    {
      category: 'Kinematics',
      param: 'Mean Flow Velocity (v)',
      symbol: 'v = Q / A',
      si: `${results.velocityMs.toFixed(3)} m/s`,
      imperial: `${(results.velocityMs * 3.28084).toFixed(3)} ft/s`,
      description: 'Bulk average fluid velocity'
    },
    {
      category: 'Fluid State',
      param: 'Fluid Density (ρ)',
      symbol: 'ρ',
      si: `${results.density.toFixed(1)} kg/m³`,
      imperial: `${(results.density * 0.062428).toFixed(2)} lb/ft³`,
      description: 'Mass per unit volume'
    },
    {
      category: 'Fluid State',
      param: 'Dynamic Viscosity (μ)',
      symbol: 'μ',
      si: `${(results.dynamicViscosity * 1000).toFixed(3)} mPa·s (cP)`,
      imperial: `${(results.dynamicViscosity * 0.00067197).toFixed(6)} lb/(ft·s)`,
      description: 'Resistance to shear deformation'
    },
    {
      category: 'Fluid State',
      param: 'Kinematic Viscosity (ν)',
      symbol: 'ν = μ / ρ',
      si: `${(results.kinematicViscosity * 1e6).toFixed(4)} cSt (mm²/s)`,
      imperial: `${(results.kinematicViscosity * 10.7639).toFixed(6)} ft²/s`,
      description: 'Diffusivity of linear momentum'
    },
    {
      category: 'Roughness',
      param: 'Absolute Wall Roughness (ε)',
      symbol: 'ε',
      si: `${roughnessMm.toFixed(4)} mm`,
      imperial: `${(roughnessMm / 25.4).toFixed(5)} in`,
      description: 'Mean height of surface asperities'
    },
    {
      category: 'Roughness',
      param: 'Relative Pipe Roughness (ε/D)',
      symbol: 'ε / D',
      si: `${results.relativeRoughness.toFixed(6)}`,
      imperial: `${results.relativeRoughness.toFixed(6)}`,
      description: 'Dimensionless roughness ratio'
    },
    {
      category: 'Dimensionless',
      param: 'Reynolds Number (Re)',
      symbol: 'Re = ρ v D / μ',
      si: `${results.reynoldsNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      imperial: `${results.reynoldsNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      description: 'Inertial to viscous forces ratio'
    },
    {
      category: 'Dimensionless',
      param: 'Flow Regime Classification',
      symbol: 'Regime',
      si: `${results.flowRegime} Flow`,
      imperial: `${results.flowRegime} Flow`,
      description: results.flowRegime === 'Laminar' ? 'Re < 2,000 (Streamline flow)' : results.flowRegime === 'Transition' ? '2,000 ≤ Re ≤ 4,000 (Critical unstable)' : 'Re > 4,000 (Fully turbulent vortices)'
    },
    {
      category: 'Friction',
      param: 'Darcy Friction Factor (f)',
      symbol: 'f (Colebrook-White)',
      si: `${results.frictionFactor.toFixed(5)}`,
      imperial: `${results.frictionFactor.toFixed(5)}`,
      description: 'Darcy-Weisbach resistance coefficient'
    },
    {
      category: 'Head Loss',
      param: 'Velocity Dynamic Head',
      symbol: 'v² / (2g)',
      si: `${results.velocityHeadM.toFixed(3)} m`,
      imperial: `${(results.velocityHeadM * 3.28084).toFixed(3)} ft`,
      description: 'Kinetic energy head equivalent'
    },
    {
      category: 'Head Loss',
      param: 'Frictional Pipe Head Loss (h_f)',
      symbol: 'hf = f·(L/D)·(v²/2g)',
      si: `${results.frictionalHeadLossM.toFixed(2)} m`,
      imperial: `${(results.frictionalHeadLossM * 3.28084).toFixed(2)} ft`,
      description: 'Darcy frictional dissipation head'
    },
    {
      category: 'Head Loss',
      param: 'Fittings & Minor Head Loss (h_m)',
      symbol: 'hm = ΣK·(v²/2g)',
      si: `${results.minorHeadLossM.toFixed(2)} m`,
      imperial: `${(results.minorHeadLossM * 3.28084).toFixed(2)} ft`,
      description: `Minor losses for ΣK = ${inputs.minorLossK}`
    },
    {
      category: 'Head Loss',
      param: 'Static Elevation Head (Δz)',
      symbol: 'Δz',
      si: `${results.staticHeadM.toFixed(2)} m`,
      imperial: `${(results.staticHeadM * 3.28084).toFixed(2)} ft`,
      description: 'Geometrical elevation rise'
    },
    {
      category: 'Head Loss',
      param: 'Total Dynamic Head (TDH)',
      symbol: 'H = hf + hm + Δz',
      si: `${results.totalHeadLossM.toFixed(2)} m`,
      imperial: `${(results.totalHeadLossM * 3.28084).toFixed(2)} ft`,
      description: 'Total hydraulic head requirement'
    },
    {
      category: 'Pressure',
      param: 'Frictional Pressure Drop (ΔP_friction)',
      symbol: 'ΔP_f = ρ g hf',
      si: `${results.frictionalPressureDropKPa.toFixed(2)} kPa (${(results.frictionalPressureDropKPa / 100).toFixed(3)} bar)`,
      imperial: `${(results.frictionalPressureDropKPa * 0.145038).toFixed(2)} psi`,
      description: 'Pressure loss due to pipe wall shear'
    },
    {
      category: 'Pressure',
      param: 'Total System Pressure Drop (ΔP_total)',
      symbol: 'ΔP = ρ g H',
      si: `${results.totalPressureDropKPa.toFixed(2)} kPa (${results.totalPressureDropBar.toFixed(3)} bar)`,
      imperial: `${results.totalPressureDropPsi.toFixed(2)} psi`,
      description: 'Total pressure drop needed from pump'
    },
    {
      category: 'Power',
      param: 'Theoretical Hydraulic Fluid Power',
      symbol: 'P_hyd = Q · ΔP',
      si: `${results.hydraulicPowerKw.toFixed(3)} kW`,
      imperial: `${results.hydraulicPowerHp.toFixed(3)} HP`,
      description: 'Net power delivered to fluid stream'
    },
    {
      category: 'Power',
      param: `Brake Shaft Power (η = ${inputs.pumpEfficiency}%)`,
      symbol: 'P_shaft = P_hyd / η',
      si: `${results.shaftPowerKw.toFixed(3)} kW`,
      imperial: `${(results.shaftPowerKw * 1.34102).toFixed(3)} HP`,
      description: 'Estimated motor brake shaft power'
    }
  ];

  const filteredRows = tableRows.filter(r => 
    r.param.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyTable = () => {
    const header = 'Category\tParameter\tFormula/Symbol\tSI (Metric)\tImperial (US)\tDescription\n';
    const body = tableRows.map(r => `${r.category}\t${r.param}\t${r.symbol}\t${r.si}\t${r.imperial}\t${r.description}`).join('\n');
    navigator.clipboard.writeText(header + body);
    setCopiedTable(true);
    setTimeout(() => setCopiedTable(false), 2000);
  };

  return (
    <div id="results-dashboard-container" className="space-y-6">
      
      {/* Warnings & Notices */}
      {results.warnings.length > 0 && (
        <div id="results-warnings-banner" className="space-y-2">
          {results.warnings.map((warn, idx) => (
            <div 
              key={idx} 
              className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs shadow-sm font-medium"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}

      {/* Primary KPI Metric Cards (Bento style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Metric 1: Mean Velocity */}
        <div id="metric-velocity-card" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Flow Velocity (v)</span>
              <Wind className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {results.velocityMs.toFixed(2)} <span className="text-sm font-semibold text-slate-400">m/s</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between font-mono">
            <span>{(results.velocityMs * 3.28084).toFixed(2)} ft/s</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-sans ${
              results.velocityMs >= 0.5 && results.velocityMs <= 3.0 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {results.velocityMs < 0.5 ? 'Low' : results.velocityMs > 3.5 ? 'High' : 'Optimal'}
            </span>
          </div>
        </div>

        {/* Metric 2: Reynolds Number */}
        <div id="metric-reynolds-card" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Reynolds (Re)</span>
              <Gauge className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              {results.reynoldsNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="text-xs mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-400 font-mono text-[11px]">Regime:</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
              results.flowRegime === 'Turbulent'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : results.flowRegime === 'Laminar'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {results.flowRegime}
            </span>
          </div>
        </div>

        {/* Metric 3: Friction Factor */}
        <div id="metric-friction-card" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Darcy Friction (f)</span>
              <TrendingDown className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              {results.frictionFactor.toFixed(5)}
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between font-mono text-[11px]">
            <span>ε/D = {results.relativeRoughness.toFixed(5)}</span>
            <span className="text-slate-400 uppercase font-sans font-bold text-[10px]">Colebrook</span>
          </div>
        </div>

        {/* Metric 4: Total Pressure Drop */}
        <div id="metric-dp-card" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total ΔP</span>
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight">
              {results.totalPressureDropKPa.toFixed(2)} <span className="text-sm font-semibold text-slate-500">kPa</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between font-mono text-[11px]">
            <span className="font-bold text-slate-800">{results.totalPressureDropPsi.toFixed(2)} psi</span>
            <span className="text-slate-400">({results.totalPressureDropBar.toFixed(3)} bar)</span>
          </div>
        </div>

      </div>

      {/* Pandas Dataframe Table Section (Bento Grid Card) */}
      <div id="pandas-table-container" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
        
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/60">
          <div>
            <div className="flex items-center space-x-2.5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Fluid & Hydraulic Properties
              </h3>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full uppercase tracking-wider">
                Pandas DataFrame
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Complete thermodynamic, kinematic, and resistance properties generated by the model.
            </p>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {/* Search filter */}
            <div className="relative flex-1 sm:w-52">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="search-table-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter properties..."
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm"
              />
            </div>

            {/* Copy Table */}
            <button
              id="btn-copy-dataframe"
              onClick={handleCopyTable}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg transition shadow-sm"
              title="Copy table data as TSV"
            >
              {copiedTable ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied TSV</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy TSV</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table id="hydraulic-dataframe-table" className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4">Parameter Name</th>
                <th className="py-3 px-4">Equation / Symbol</th>
                <th className="py-3 px-4 text-blue-700">Metric (SI Units)</th>
                <th className="py-3 px-4 text-indigo-700">US Customary (Imperial)</th>
                <th className="py-3 px-4 text-slate-400 hidden lg:table-cell">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {filteredRows.map((row, index) => {
                const isHighlight = row.category === 'Head Loss' || row.category === 'Pressure';
                return (
                  <tr 
                    key={index}
                    className={`hover:bg-slate-50/80 transition-colors ${isHighlight ? 'bg-blue-50/20' : ''}`}
                  >
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                      <span className="text-[9px] text-slate-400 block uppercase font-mono tracking-widest font-bold">{row.category}</span>
                      {row.param}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200 font-mono">
                        {row.symbol}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-blue-700">
                      {row.si}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-indigo-700">
                      {row.imperial}
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-500 text-[11px] hidden lg:table-cell">
                      {row.description}
                    </td>
                  </tr>
                );
              })}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                    No properties match "{searchTerm}". Try another keyword.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary / Hydraulic Power Callout */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Hydraulic Fluid Power (P_hyd)</div>
              <div className="text-base font-black text-slate-900 font-mono">
                {results.hydraulicPowerKw.toFixed(3)} kW <span className="text-xs text-slate-500 font-medium font-sans">({results.hydraulicPowerHp.toFixed(3)} HP)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Motor Shaft Power (η = {inputs.pumpEfficiency}%)</div>
              <div className="text-base font-black text-blue-700 font-mono">
                {results.shaftPowerKw.toFixed(3)} kW <span className="text-xs text-slate-500 font-medium font-sans">({(results.shaftPowerKw * 1.34102).toFixed(3)} HP)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
