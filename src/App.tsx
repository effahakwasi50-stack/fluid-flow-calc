import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { SidebarInputs } from './components/SidebarInputs';
import { ResultsTable } from './components/ResultsTable';
import { SystemCurveChart } from './components/SystemCurveChart';
import { PythonCodeViewer } from './components/PythonCodeViewer';
import { TheoryCard } from './components/TheoryCard';
import { CalculationInputs, UnitSystem } from './types';
import { computeHydraulics } from './utils/hydraulicPhysics';
import { STREAMLIT_APP_PY_CODE } from './utils/pythonScript';

const DEFAULT_INPUTS: CalculationInputs = {
  unitSystem: 'SI',
  diameterMm: 100, // 100 mm (approx 4")
  lengthM: 250, // 250 meters
  flowRateM3h: 50, // 50 m3/h
  materialKey: 'commercial_steel',
  customRoughnessMm: 0.045,
  fluidKey: 'water_20c',
  customDensity: 1000,
  customViscosity: 0.001,
  elevationChangeM: 5,
  minorLossK: 2.5,
  pumpEfficiency: 75,
};

export default function App() {
  const [inputs, setInputs] = useState<CalculationInputs>(DEFAULT_INPUTS);
  const [activeTab, setActiveTab] = useState<'simulation' | 'code' | 'theory'>('simulation');
  const [copied, setCopied] = useState(false);

  // Compute live physics
  const results = useMemo(() => computeHydraulics(inputs), [inputs]);

  const handleInputChange = (updated: Partial<CalculationInputs>) => {
    setInputs(prev => ({ ...prev, ...updated }));
  };

  const handleSetUnitSystem = (unitSystem: UnitSystem) => {
    setInputs(prev => ({ ...prev, unitSystem }));
  };

  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
  };

  const handleApplyPreset = (presetKey: string) => {
    if (presetKey === 'water_main') {
      setInputs(prev => ({
        ...prev,
        diameterMm: 150,
        lengthM: 500,
        flowRateM3h: 80,
        materialKey: 'commercial_steel',
        fluidKey: 'water_20c',
        minorLossK: 2.0,
        elevationChangeM: 10,
      }));
    } else if (presetKey === 'hvac_chiller') {
      setInputs(prev => ({
        ...prev,
        diameterMm: 80,
        lengthM: 120,
        flowRateM3h: 35,
        materialKey: 'stainless_steel',
        fluidKey: 'ethylene_glycol_50',
        minorLossK: 4.5,
        elevationChangeM: 0,
      }));
    } else if (presetKey === 'crude_oil') {
      setInputs(prev => ({
        ...prev,
        diameterMm: 250,
        lengthM: 2000,
        flowRateM3h: 220,
        materialKey: 'commercial_steel',
        fluidKey: 'crude_oil_medium',
        minorLossK: 1.5,
        elevationChangeM: 15,
      }));
    } else if (presetKey === 'pvc_plumbing') {
      setInputs(prev => ({
        ...prev,
        diameterMm: 50,
        lengthM: 45,
        flowRateM3h: 12,
        materialKey: 'pvc_plastic',
        fluidKey: 'water_20c',
        minorLossK: 3.0,
        elevationChangeM: 3,
      }));
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(STREAMLIT_APP_PY_CODE.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([STREAMLIT_APP_PY_CODE.trim()], { type: 'text/x-python;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'app.py';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unitSystem={inputs.unitSystem}
        setUnitSystem={handleSetUnitSystem}
        onCopyCode={handleCopyCode}
        onDownloadCode={handleDownloadCode}
        copied={copied}
      />

      {/* Main Body Area */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto">
        
        {/* Sidebar Controls */}
        <SidebarInputs
          inputs={inputs}
          onChange={handleInputChange}
          onReset={handleReset}
          onApplyPreset={handleApplyPreset}
        />

        {/* Central Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-7xl">
          
          {/* Main Title & Instructions Banner (Bento Grid Style) */}
          <div id="main-instructions-card" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2.5">
                  <span>🌊 Pipe Pressure Drop & Hydraulic Calculator</span>
                </h1>
                <p className="text-xs sm:text-sm text-blue-600 font-semibold mt-1">
                  Darcy-Weisbach Equation & Colebrook-White System Resistance Analyzer
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  Live Physics Active
                </span>
              </div>
            </div>

            {/* Brief User Instructions */}
            <div className="text-xs text-slate-600 leading-relaxed grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
              <div className="flex items-start space-x-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-inner">
                <span className="w-5 h-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-mono font-bold text-xs shrink-0">1</span>
                <span>
                  <strong className="text-slate-900 block mb-0.5">Sidebar Inputs:</strong> Adjust diameter, length, flow rate, and material roughness ($\epsilon$).
                </span>
              </div>

              <div className="flex items-start space-x-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-inner">
                <span className="w-5 h-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-mono font-bold text-xs shrink-0">2</span>
                <span>
                  <strong className="text-slate-900 block mb-0.5">Fluid Properties:</strong> Select fluid presets (Water, Oil, Glycol) or custom density ($\rho$) & viscosity ($\mu$).
                </span>
              </div>

              <div className="flex items-start space-x-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-inner">
                <span className="w-5 h-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-mono font-bold text-xs shrink-0">3</span>
                <span>
                  <strong className="text-slate-900 block mb-0.5">Analyze System Curve:</strong> Review the Pandas table and interactive Plotly curve to size pumps and evaluate resistance.
                </span>
              </div>
            </div>
          </div>

          {/* Tab 1: Live Interactive Simulation */}
          {activeTab === 'simulation' && (
            <div className="space-y-6">
              {/* Dynamic System Resistance Curve */}
              <SystemCurveChart inputs={inputs} results={results} />

              {/* Comprehensive Fluid Properties DataFrame */}
              <ResultsTable inputs={inputs} results={results} />
            </div>
          )}

          {/* Tab 2: Python Code Viewer */}
          {activeTab === 'code' && (
            <div className="space-y-6">
              <PythonCodeViewer
                onCopy={handleCopyCode}
                onDownload={handleDownloadCode}
                copied={copied}
              />
            </div>
          )}

          {/* Tab 3: Engineering Theory Reference */}
          {activeTab === 'theory' && (
            <div className="space-y-6">
              <TheoryCard />
            </div>
          )}

        </main>

      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 font-medium">
        Darcy-Weisbach & Colebrook-White Engineering Hydraulics Engine • Python / Streamlit / Plotly Script Generator
      </footer>

    </div>
  );
}
