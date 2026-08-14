import React, { useState, useMemo } from 'react';
import { LineChart, Compass } from 'lucide-react';
import { CalculationInputs, CalculationResults } from '../types';

interface SystemCurveChartProps {
  inputs: CalculationInputs;
  results: CalculationResults;
}

export const SystemCurveChart: React.FC<SystemCurveChartProps> = ({ inputs, results }) => {
  const [yAxisMetric, setYAxisMetric] = useState<'pressure' | 'head'>('pressure');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const isSI = inputs.unitSystem === 'SI';
  const curve = results.systemCurve;

  // Chart dimensions & margins
  const width = 800;
  const height = 360;
  const margin = { top: 35, right: 35, bottom: 50, left: 65 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Compute domains
  const { maxX, maxY, staticValue, operatingX, operatingY, points } = useMemo(() => {
    if (!curve || curve.length === 0) {
      return { maxX: 100, maxY: 100, staticValue: 0, operatingX: 0, operatingY: 0, points: [] };
    }

    const maxXVal = isSI ? curve[curve.length - 1].flowRateM3h : curve[curve.length - 1].flowRateGpm;
    
    let maxYVal = 0;
    if (yAxisMetric === 'pressure') {
      maxYVal = Math.max(...curve.map(pt => isSI ? pt.pressureDropKPa : pt.pressureDropPsi)) * 1.15;
    } else {
      maxYVal = Math.max(...curve.map(pt => isSI ? pt.headLossM : pt.headLossFt)) * 1.15;
    }
    maxYVal = Math.max(maxYVal, 10);

    const staticVal = yAxisMetric === 'pressure'
      ? (isSI ? (results.density * 9.80665 * results.staticHeadM) / 1000 : ((results.density * 9.80665 * results.staticHeadM) / 1000) * 0.145038)
      : (isSI ? results.staticHeadM : results.staticHeadM * 3.28084);

    const opX = isSI ? inputs.flowRateM3h : inputs.flowRateM3h * 4.40287;
    const opY = yAxisMetric === 'pressure'
      ? (isSI ? results.totalPressureDropKPa : results.totalPressureDropPsi)
      : (isSI ? results.totalHeadLossM : results.totalHeadLossM * 3.28084);

    const mappedPoints = curve.map((pt, idx) => {
      const xVal = isSI ? pt.flowRateM3h : pt.flowRateGpm;
      const yVal = yAxisMetric === 'pressure'
        ? (isSI ? pt.pressureDropKPa : pt.pressureDropPsi)
        : (isSI ? pt.headLossM : pt.headLossFt);

      const px = margin.left + (xVal / maxXVal) * innerWidth;
      const py = margin.top + innerHeight - (yVal / maxYVal) * innerHeight;

      return {
        ...pt,
        xVal,
        yVal,
        px,
        py,
        idx,
      };
    });

    return {
      maxX: maxXVal,
      maxY: maxYVal,
      staticValue: staticVal,
      operatingX: opX,
      operatingY: opY,
      points: mappedPoints,
    };
  }, [curve, isSI, yAxisMetric, inputs.flowRateM3h, results]);

  if (!results.isValid || points.length === 0) {
    return null;
  }

  // Construct SVG path string for system curve
  const pathD = points.reduce((acc, pt, index) => {
    return index === 0 ? `M ${pt.px},${pt.py}` : `${acc} L ${pt.px},${pt.py}`;
  }, '');

  // Static head horizontal line Y pixel
  const staticPy = margin.top + innerHeight - (Math.max(0, staticValue) / maxY) * innerHeight;

  // Operating point coordinates
  const opPx = margin.left + (operatingX / maxX) * innerWidth;
  const opPy = margin.top + innerHeight - (operatingY / maxY) * innerHeight;

  // Generate grid ticks
  const xTicksCount = 6;
  const yTicksCount = 5;
  const xTicks = Array.from({ length: xTicksCount }, (_, i) => (maxX / (xTicksCount - 1)) * i);
  const yTicks = Array.from({ length: yTicksCount }, (_, i) => (maxY / (yTicksCount - 1)) * i);

  const hoveredPoint = hoverIndex !== null && hoverIndex >= 0 && hoverIndex < points.length ? points[hoverIndex] : null;

  return (
    <div id="system-curve-container" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
      
      {/* Header with Bento Grid style controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/60">
        <div>
          <div className="flex items-center space-x-2.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              System Curve Visualization
            </h3>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>{yAxisMetric === 'pressure' ? 'ΔP vs Q' : 'TDH vs Q'}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Frictional head loss (<code className="font-mono text-slate-700 font-semibold">hf ∝ Q²</code>) plus static lift (<code className="font-mono text-slate-700 font-semibold">Δz</code>) across flow spectrum.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Y-Axis Metric Switcher */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs shadow-inner">
            <button
              id="btn-curve-pressure"
              onClick={() => setYAxisMetric('pressure')}
              className={`px-3 py-1 rounded-md font-bold transition ${
                yAxisMetric === 'pressure' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pressure ΔP ({isSI ? 'kPa' : 'psi'})
            </button>
            <button
              id="btn-curve-head"
              onClick={() => setYAxisMetric('head')}
              className={`px-3 py-1 rounded-md font-bold transition ${
                yAxisMetric === 'head' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Head TDH ({isSI ? 'm' : 'ft'})
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Chart Canvas */}
      <div className="p-5 relative bg-white">
        
        {/* Quick Current Value Floating Badge */}
        <div className="absolute top-6 right-6 hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono shadow-sm z-10">
          <span className="text-slate-400 font-semibold">Operating {yAxisMetric === 'pressure' ? 'ΔP:' : 'TDH:'}</span>
          <span className="text-slate-900 font-black">
            {yAxisMetric === 'pressure'
              ? (isSI ? `${results.totalPressureDropKPa.toFixed(2)} kPa` : `${results.totalPressureDropPsi.toFixed(2)} psi`)
              : (isSI ? `${results.totalHeadLossM.toFixed(2)} m` : `${(results.totalHeadLossM * 3.28084).toFixed(2)} ft`)}
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full h-auto select-none overflow-visible"
            onMouseLeave={() => setHoverIndex(null)}
          >
            {/* Background & Grid */}
            <rect x={margin.left} y={margin.top} width={innerWidth} height={innerHeight} fill="#f8fafc" rx={6} stroke="#f1f5f9" strokeWidth="1" />

            {/* Horizontal Gridlines & Y-Ticks */}
            {yTicks.map((val, idx) => {
              const yPos = margin.top + innerHeight - (val / maxY) * innerHeight;
              return (
                <g key={`y-grid-${idx}`}>
                  <line
                    x1={margin.left}
                    y1={yPos}
                    x2={margin.left + innerWidth}
                    y2={yPos}
                    stroke="#e2e8f0"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={margin.left - 10}
                    y={yPos + 4}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="500"
                  >
                    {val.toFixed(val >= 10 ? 0 : 1)}
                  </text>
                </g>
              );
            })}

            {/* Vertical Gridlines & X-Ticks */}
            {xTicks.map((val, idx) => {
              const xPos = margin.left + (val / maxX) * innerWidth;
              return (
                <g key={`x-grid-${idx}`}>
                  <line
                    x1={xPos}
                    y1={margin.top}
                    x2={xPos}
                    y2={margin.top + innerHeight}
                    stroke="#e2e8f0"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={xPos}
                    y={margin.top + innerHeight + 18}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="500"
                  >
                    {val.toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* Static Elevation Head Baseline */}
            {staticValue > 0 && staticPy <= margin.top + innerHeight && staticPy >= margin.top && (
              <g>
                <line
                  x1={margin.left}
                  y1={staticPy}
                  x2={margin.left + innerWidth}
                  y2={staticPy}
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={margin.left + innerWidth - 8}
                  y={staticPy - 6}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="sans-serif"
                  fontWeight="600"
                >
                  Static Lift Base: {staticValue.toFixed(1)} {yAxisMetric === 'pressure' ? (isSI ? 'kPa' : 'psi') : (isSI ? 'm' : 'ft')}
                </text>
              </g>
            )}

            {/* System Curve Path */}
            <path
              d={pathD}
              fill="none"
              stroke="#2563eb"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Area under curve for subtle gradient */}
            <path
              d={`${pathD} L ${points[points.length - 1].px},${margin.top + innerHeight} L ${points[0].px},${margin.top + innerHeight} Z`}
              fill="url(#bentoCurveGradient)"
              opacity="0.12"
            />

            <defs>
              <linearGradient id="bentoCurveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Operating Point Pinpoint */}
            {opPx >= margin.left && opPx <= margin.left + innerWidth && (
              <g>
                {/* Crosshairs to axes */}
                <line
                  x1={opPx}
                  y1={opPy}
                  x2={opPx}
                  y2={margin.top + innerHeight}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <line
                  x1={margin.left}
                  y1={opPy}
                  x2={opPx}
                  y2={opPy}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                {/* Outer halo */}
                <circle cx={opPx} cy={opPy} r={9} fill="#ef4444" opacity="0.25" />
                <circle cx={opPx} cy={opPy} r={6} fill="#ef4444" stroke="#ffffff" strokeWidth="2.5" />
                
                {/* Operating point badge tag */}
                <rect
                  x={Math.max(margin.left + 10, opPx - 110)}
                  y={Math.max(margin.top + 5, opPy - 30)}
                  width="116"
                  height="22"
                  rx="6"
                  fill="#1e293b"
                  stroke="#334155"
                  strokeWidth="1"
                />
                <text
                  x={Math.max(margin.left + 10, opPx - 110) + 58}
                  y={Math.max(margin.top + 5, opPy - 30) + 15}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  Operating Point
                </text>
              </g>
            )}

            {/* Hover Crosshair and Markers */}
            {hoveredPoint && (
              <g>
                <line
                  x1={hoveredPoint.px}
                  y1={margin.top}
                  x2={hoveredPoint.px}
                  y2={margin.top + innerHeight}
                  stroke="#2563eb"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={hoveredPoint.px}
                  cy={hoveredPoint.py}
                  r={5}
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            )}

            {/* Invisible hover overlay rectangles */}
            {points.map((pt, idx) => (
              <rect
                key={`hover-col-${idx}`}
                x={pt.px - innerWidth / (points.length * 2)}
                y={margin.top}
                width={innerWidth / points.length}
                height={innerHeight}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(idx)}
                className="cursor-crosshair"
              />
            ))}

            {/* Axes Lines */}
            <line
              x1={margin.left}
              y1={margin.top + innerHeight}
              x2={margin.left + innerWidth}
              y2={margin.top + innerHeight}
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
            <line
              x1={margin.left}
              y1={margin.top}
              x2={margin.left}
              y2={margin.top + innerHeight}
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />

            {/* X-Axis Label */}
            <text
              x={margin.left + innerWidth / 2}
              y={height - 12}
              textAnchor="middle"
              fill="#475569"
              fontSize="11"
              fontWeight="700"
              fontFamily="sans-serif"
            >
              Volumetric Flow Rate Q ({isSI ? 'm³/h' : 'GPM'})
            </text>

            {/* Y-Axis Label */}
            <text
              transform={`rotate(-90)`}
              x={-(margin.top + innerHeight / 2)}
              y={20}
              textAnchor="middle"
              fill="#475569"
              fontSize="11"
              fontWeight="700"
              fontFamily="sans-serif"
            >
              {yAxisMetric === 'pressure'
                ? `System Pressure Drop ΔP (${isSI ? 'kPa' : 'psi'})`
                : `Total Dynamic Head TDH (${isSI ? 'm' : 'ft'})`}
            </text>
          </svg>
        </div>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div 
            className="absolute top-6 left-20 bg-slate-900/95 border border-slate-800 text-white rounded-xl p-3.5 shadow-xl backdrop-blur-sm text-xs space-y-1.5 z-20 pointer-events-none"
          >
            <div className="font-bold text-blue-400 border-b border-slate-800 pb-1.5 flex items-center justify-between gap-4">
              <span className="uppercase text-[10px] tracking-wider">Point Coordinates</span>
              <span className="font-mono text-white">
                {hoveredPoint.xVal.toFixed(2)} {isSI ? 'm³/h' : 'GPM'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-slate-300">
              <span className="text-slate-400">Total ΔP:</span>
              <span className="text-blue-400 font-bold">
                {isSI ? `${hoveredPoint.pressureDropKPa} kPa` : `${hoveredPoint.pressureDropPsi} psi`}
              </span>
              
              <span className="text-slate-400">Total Head (H):</span>
              <span>{isSI ? `${hoveredPoint.headLossM} m` : `${hoveredPoint.headLossFt} ft`}</span>
              
              <span className="text-slate-400">Velocity (v):</span>
              <span>{hoveredPoint.velocityMs} m/s</span>

              <span className="text-slate-400">Friction (f):</span>
              <span>{hoveredPoint.frictionFactor}</span>
            </div>
          </div>
        )}

      </div>

      {/* Legend & Analytical Insights */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-4 text-slate-700 font-medium">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-1 bg-blue-600 rounded"></span>
            <span>System Resistance (H_sys = Δz + K_sys · Q²)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
            <span className="font-bold text-red-600">Design Operating Point</span>
          </div>
        </div>

        <div className="text-slate-500 flex items-center space-x-1.5 text-[11px] font-medium">
          <Compass className="w-3.5 h-3.5 text-blue-600" />
          <span>Pump selection requires pump H-Q curve to intersect above this curve.</span>
        </div>
      </div>

    </div>
  );
};
