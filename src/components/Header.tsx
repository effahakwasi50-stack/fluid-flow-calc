import React from 'react';
import { Play, Code2, BookOpen, Download, Copy, Check, Waves } from 'lucide-react';
import { UnitSystem } from '../types';

interface HeaderProps {
  activeTab: 'simulation' | 'code' | 'theory';
  setActiveTab: (tab: 'simulation' | 'code' | 'theory') => void;
  unitSystem: UnitSystem;
  setUnitSystem: (units: UnitSystem) => void;
  onCopyCode: () => void;
  onDownloadCode: () => void;
  copied: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  unitSystem,
  setUnitSystem,
  onCopyCode,
  onDownloadCode,
  copied,
}) => {
  return (
    <header id="main-header" className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white">HydroFlow</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 tracking-wide uppercase">
                  Darcy-Weisbach
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                Engineering Grade Pipe Pressure Drop & System Curve Simulator
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
            <button
              id="tab-simulation-btn"
              onClick={() => setActiveTab('simulation')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'simulation'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>Interactive App</span>
            </button>

            <button
              id="tab-code-btn"
              onClick={() => setActiveTab('code')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'code'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>app.py Script</span>
            </button>

            <button
              id="tab-theory-btn"
              onClick={() => setActiveTab('theory')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'theory'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Engineering Theory</span>
              <span className="sm:hidden">Theory</span>
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Units Toggle */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                id="unit-si-btn"
                onClick={() => setUnitSystem('SI')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                  unitSystem === 'SI'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                SI (Metric)
              </button>
              <button
                id="unit-imp-btn"
                onClick={() => setUnitSystem('Imperial')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                  unitSystem === 'Imperial'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                US (Imp)
              </button>
            </div>

            {/* Copy Button */}
            <button
              id="header-copy-code-btn"
              onClick={onCopyCode}
              title="Copy app.py script to clipboard"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden md:inline">Copy Code</span>
                </>
              )}
            </button>

            {/* Download Button */}
            <button
              id="header-download-btn"
              onClick={onDownloadCode}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Download app.py</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
