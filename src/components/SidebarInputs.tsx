import React from 'react';
import { 
  Sliders, 
  Layers, 
  Droplet, 
  Activity, 
  RotateCcw, 
  Sparkles, 
  Info,
  ChevronDown
} from 'lucide-react';
import { CalculationInputs } from '../types';
import { PIPE_MATERIALS, FLUID_PRESETS } from '../utils/hydraulicPhysics';

interface SidebarInputsProps {
  inputs: CalculationInputs;
  onChange: (updated: Partial<CalculationInputs>) => void;
  onReset: () => void;
  onApplyPreset: (presetKey: string) => void;
}

export const SidebarInputs: React.FC<SidebarInputsProps> = ({
  inputs,
  onChange,
  onReset,
  onApplyPreset,
}) => {
  const isSI = inputs.unitSystem === 'SI';

  // Handle unit-converted changes
  const handleDiameterChange = (val: number) => {
    onChange({ diameterMm: isSI ? val : val * 25.4 });
  };

  const handleLengthChange = (val: number) => {
    onChange({ lengthM: isSI ? val : val * 0.3048 });
  };

  const handleFlowRateChange = (val: number) => {
    onChange({ flowRateM3h: isSI ? val : val / 4.40287 });
  };

  const handleElevationChange = (val: number) => {
    onChange({ elevationChangeM: isSI ? val : val * 0.3048 });
  };

  // Display values
  const displayDiameter = isSI ? inputs.diameterMm : Number((inputs.diameterMm / 25.4).toFixed(2));
  const displayLength = isSI ? inputs.lengthM : Number((inputs.lengthM * 3.28084).toFixed(1));
  const displayFlowRate = isSI ? inputs.flowRateM3h : Number((inputs.flowRateM3h * 4.40287).toFixed(1));
  const displayElevation = isSI ? inputs.elevationChangeM : Number((inputs.elevationChangeM * 3.28084).toFixed(1));

  const selectedMaterial = PIPE_MATERIALS[inputs.materialKey] || PIPE_MATERIALS.commercial_steel;
  const selectedFluid = FLUID_PRESETS[inputs.fluidKey] || FLUID_PRESETS.water_20c;

  return (
    <aside id="sidebar-panel" className="w-full lg:w-80 bg-slate-900 text-slate-100 border-r border-slate-800 flex flex-col shrink-0 shadow-xl">
      
      {/* Sidebar Header / Control Panel Title */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Control Panel</span>
          </div>
          <h2 className="text-lg font-black text-white tracking-tight">Input Parameters</h2>
        </div>
        <button
          id="btn-reset-defaults"
          onClick={onReset}
          className="text-xs flex items-center space-x-1.5 text-slate-400 hover:text-blue-300 transition px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60"
          title="Reset to engineering defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="font-semibold">Reset</span>
        </button>
      </div>

      <div className="p-5 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-xs sm:text-sm">
        
        {/* Quick Engineering Presets */}
        <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center space-x-1.5 text-blue-400 font-bold mb-2.5 text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quick Benchmarks</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              id="preset-water-main"
              onClick={() => onApplyPreset('water_main')}
              className="px-2.5 py-2 text-left text-xs bg-slate-800 hover:bg-blue-900/50 hover:text-blue-200 border border-slate-700/60 rounded-lg text-slate-300 font-medium transition"
            >
              💧 Water Main (DN150)
            </button>
            <button
              id="preset-hvac-chiller"
              onClick={() => onApplyPreset('hvac_chiller')}
              className="px-2.5 py-2 text-left text-xs bg-slate-800 hover:bg-blue-900/50 hover:text-blue-200 border border-slate-700/60 rounded-lg text-slate-300 font-medium transition"
            >
              ❄️ Chilled Water Loop
            </button>
            <button
              id="preset-crude-oil"
              onClick={() => onApplyPreset('crude_oil')}
              className="px-2.5 py-2 text-left text-xs bg-slate-800 hover:bg-blue-900/50 hover:text-blue-200 border border-slate-700/60 rounded-lg text-slate-300 font-medium transition"
            >
              🛢️ Oil Pipeline
            </button>
            <button
              id="preset-plastic-plumbing"
              onClick={() => onApplyPreset('pvc_plumbing')}
              className="px-2.5 py-2 text-left text-xs bg-slate-800 hover:bg-blue-900/50 hover:text-blue-200 border border-slate-700/60 rounded-lg text-slate-300 font-medium transition"
            >
              🧪 Smooth PVC Flow
            </button>
          </div>
        </div>

        {/* Section 1: Pipe Geometry & Material */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-white font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>1. Pipe Geometry & Material</span>
          </div>

          {/* Pipe Material Selectbox */}
          <div className="space-y-1.5">
            <label htmlFor="select-pipe-material" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Pipe Material
            </label>
            <div className="relative">
              <select
                id="select-pipe-material"
                value={inputs.materialKey}
                onChange={(e) => onChange({ materialKey: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-medium"
              >
                {Object.entries(PIPE_MATERIALS).map(([key, mat]) => (
                  <option key={key} value={key} className="bg-slate-900">
                    {mat.name} {key !== 'custom' ? `(ε = ${mat.roughnessMm} mm)` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-400 italic">{selectedMaterial.description}</p>
          </div>

          {/* Custom Roughness if selected */}
          {inputs.materialKey === 'custom' && (
            <div className="space-y-1 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700">
              <label htmlFor="input-custom-roughness" className="block text-[11px] font-semibold text-slate-400 uppercase">
                Absolute Roughness ε (mm)
              </label>
              <input
                id="input-custom-roughness"
                type="number"
                step="0.001"
                min="0.0001"
                value={inputs.customRoughnessMm}
                onChange={(e) => onChange({ customRoughnessMm: parseFloat(e.target.value) || 0.001 })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
            </div>
          )}

          {/* Pipe Inner Diameter */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="input-pipe-diameter" className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Inner Diameter ({isSI ? 'mm' : 'in'})
              </label>
              <span className="text-blue-400 font-mono text-xs font-bold">
                {displayDiameter} {isSI ? 'mm' : 'in'}
              </span>
            </div>
            <input
              id="input-pipe-diameter"
              type="number"
              step={isSI ? '5' : '0.25'}
              value={displayDiameter}
              onChange={(e) => handleDiameterChange(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              placeholder="e.g. 100"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Std: {isSI ? 'DN50 - DN600' : '2" - 24"'}</span>
              <span>D = {(inputs.diameterMm / 1000).toFixed(3)} m</span>
            </div>
          </div>

          {/* Pipe Length */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="input-pipe-length" className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Pipe Length ({isSI ? 'm' : 'ft'})
              </label>
              <span className="text-blue-400 font-mono text-xs font-bold">
                {displayLength} {isSI ? 'm' : 'ft'}
              </span>
            </div>
            <input
              id="input-pipe-length"
              type="number"
              step={isSI ? '10' : '25'}
              value={displayLength}
              onChange={(e) => handleLengthChange(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              placeholder="e.g. 250"
            />
          </div>

          {/* Flow Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="input-flow-rate" className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Flow Rate ({isSI ? 'm³/h' : 'GPM'})
              </label>
              <span className="text-blue-400 font-mono text-xs font-bold">
                {displayFlowRate} {isSI ? 'm³/h' : 'GPM'}
              </span>
            </div>
            <input
              id="input-flow-rate"
              type="number"
              step={isSI ? '2' : '10'}
              value={displayFlowRate}
              onChange={(e) => handleFlowRateChange(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              placeholder="e.g. 50"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>{isSI ? `${(inputs.flowRateM3h / 3.6).toFixed(2)} L/s` : `${(inputs.flowRateM3h).toFixed(1)} m³/h`}</span>
              <span>{(inputs.flowRateM3h / 3600).toFixed(4)} m³/s</span>
            </div>
          </div>
        </div>

        {/* Section 2: Fluid Properties */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-white font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
            <Droplet className="w-4 h-4 text-blue-400" />
            <span>2. Working Fluid Properties</span>
          </div>

          {/* Fluid Selectbox */}
          <div className="space-y-1.5">
            <label htmlFor="select-working-fluid" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Fluid Preset
            </label>
            <div className="relative">
              <select
                id="select-working-fluid"
                value={inputs.fluidKey}
                onChange={(e) => onChange({ fluidKey: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-medium"
              >
                {Object.entries(FLUID_PRESETS).map(([key, fluid]) => (
                  <option key={key} value={key} className="bg-slate-900">
                    {fluid.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-400">{selectedFluid.description}</p>
          </div>

          {/* Custom Fluid Inputs */}
          {inputs.fluidKey === 'custom' ? (
            <div className="grid grid-cols-2 gap-2 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700">
              <div>
                <label htmlFor="input-custom-density" className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                  Density ρ (kg/m³)
                </label>
                <input
                  id="input-custom-density"
                  type="number"
                  step="10"
                  value={inputs.customDensity}
                  onChange={(e) => onChange({ customDensity: parseFloat(e.target.value) || 1000 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label htmlFor="input-custom-viscosity" className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                  Viscosity μ (cP)
                </label>
                <input
                  id="input-custom-viscosity"
                  type="number"
                  step="0.1"
                  value={inputs.customViscosity * 1000}
                  onChange={(e) => onChange({ customViscosity: (parseFloat(e.target.value) || 1.0) / 1000 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 rounded-lg p-2.5 text-xs grid grid-cols-2 gap-2 border border-slate-700/60">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Density (ρ):</span>
                <span className="font-mono text-white font-semibold">{selectedFluid.density} kg/m³</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Viscosity (μ):</span>
                <span className="font-mono text-white font-semibold">{(selectedFluid.viscosity * 1000).toFixed(3)} cP</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Minor Losses & Elevation */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-white font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>3. Minor Losses & Elevation</span>
          </div>

          {/* Minor Loss Coefficient */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="input-minor-loss-k" className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Fittings & Losses (Σ K)
              </label>
              <span className="text-blue-400 font-mono text-xs font-bold">K = {inputs.minorLossK}</span>
            </div>
            <input
              id="input-minor-loss-k"
              type="number"
              step="0.5"
              min="0"
              value={inputs.minorLossK}
              onChange={(e) => onChange({ minorLossK: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
            <p className="text-[11px] text-slate-500">
              (90° elbow ≈ 0.75, gate valve ≈ 0.2, tee ≈ 1.5)
            </p>
          </div>

          {/* Static Elevation */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="input-static-elevation" className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Static Lift Δz ({isSI ? 'm' : 'ft'})
              </label>
              <span className="text-blue-400 font-mono text-xs font-bold">
                {displayElevation} {isSI ? 'm' : 'ft'}
              </span>
            </div>
            <input
              id="input-static-elevation"
              type="number"
              step={isSI ? '1' : '5'}
              value={displayElevation}
              onChange={(e) => handleElevationChange(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
          </div>

          {/* Pump Efficiency */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="input-pump-efficiency" className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Pump Efficiency (η)
              </label>
              <span className="text-blue-400 font-mono text-xs font-bold">{inputs.pumpEfficiency}%</span>
            </div>
            <input
              id="input-pump-efficiency"
              type="range"
              min="30"
              max="95"
              step="1"
              value={inputs.pumpEfficiency}
              onChange={(e) => onChange({ pumpEfficiency: parseInt(e.target.value, 10) || 75 })}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Informational Help Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-slate-300 text-xs space-y-1.5">
          <div className="flex items-center space-x-1.5 font-bold text-blue-400 uppercase tracking-wider text-[10px]">
            <Info className="w-3.5 h-3.5" />
            <span>Darcy Formulation</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Frictional head loss <code className="bg-slate-800 px-1 py-0.5 rounded text-blue-300 font-mono">hf = f·(L/D)·(v²/2g)</code> solved across laminar and Colebrook-White regimes.
          </p>
        </div>

      </div>

      {/* Bottom Calculate Action Bar */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <div className="w-full bg-blue-600/20 border border-blue-500/40 text-blue-300 font-bold py-2 px-3 rounded-lg text-center text-xs flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Live Auto-Calculation Active</span>
        </div>
      </div>
    </aside>
  );
};
