'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

interface ChartRecord {
  timeLabel: string;
  hour: number;
  // Historical measured observations
  historicalFS?: number;
  historicalMoisture?: number;
  // Dynamic forecast trajectory
  forecastFS?: number;
  fsConfidenceUpper?: number;
  fsConfidenceLower?: number;
  // Pore water pressure (kPa)
  porePressure?: number;
  type: 'HISTORICAL' | 'NOW' | 'FORECAST';
}

const predictiveDataset: ChartRecord[] = [
  // Historical measured observations (Scatter)
  { timeLabel: 'T-4h', hour: -4, historicalFS: 1.62, historicalMoisture: 18.2, porePressure: 8.5, type: 'HISTORICAL' },
  { timeLabel: 'T-3h', hour: -3, historicalFS: 1.58, historicalMoisture: 19.5, porePressure: 9.8, type: 'HISTORICAL' },
  { timeLabel: 'T-2h', hour: -2, historicalFS: 1.54, historicalMoisture: 20.8, porePressure: 10.9, type: 'HISTORICAL' },
  { timeLabel: 'T-1h', hour: -1, historicalFS: 1.50, historicalMoisture: 21.6, porePressure: 11.7, type: 'HISTORICAL' },
  { 
    timeLabel: 'Now', 
    hour: 0, 
    historicalFS: 1.48, 
    forecastFS: 1.48, 
    fsConfidenceUpper: 1.58, 
    fsConfidenceLower: 1.38, 
    historicalMoisture: 22.4, 
    porePressure: 12.1, 
    type: 'NOW' 
  },
  // Forecast curve with Bayesian confidence interval
  { timeLabel: 'T+1h', hour: 1, forecastFS: 1.35, fsConfidenceUpper: 1.47, fsConfidenceLower: 1.23, porePressure: 18.5, type: 'FORECAST' },
  { timeLabel: 'T+2h', hour: 2, forecastFS: 1.21, fsConfidenceUpper: 1.36, fsConfidenceLower: 1.06, porePressure: 26.4, type: 'FORECAST' },
  { timeLabel: 'T+3h', hour: 3, forecastFS: 1.08, fsConfidenceUpper: 1.24, fsConfidenceLower: 0.92, porePressure: 35.8, type: 'FORECAST' },
  { timeLabel: 'T+4h', hour: 4, forecastFS: 0.88, fsConfidenceUpper: 1.05, fsConfidenceLower: 0.71, porePressure: 48.2, type: 'FORECAST' },
  { timeLabel: 'T+5h', hour: 5, forecastFS: 0.72, fsConfidenceUpper: 0.91, fsConfidenceLower: 0.53, porePressure: 61.0, type: 'FORECAST' },
  { timeLabel: 'T+6h', hour: 6, forecastFS: 0.59, fsConfidenceUpper: 0.79, fsConfidenceLower: 0.39, porePressure: 74.5, type: 'FORECAST' },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartRecord }>;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isFailure = (data.forecastFS !== undefined && data.forecastFS < 1.0) || (data.historicalFS !== undefined && data.historicalFS < 1.0);
    return (
      <div className="bg-white/95 border border-slate-200 p-2.5 rounded-lg shadow-xl text-[11px] font-mono text-slate-800 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5 font-bold">
          <span className="text-blue-900">{data.timeLabel}</span>
          <span className="text-slate-400 text-[10px]">{data.type}</span>
        </div>
        {data.historicalFS !== undefined && (
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Observed FS:</span>
            <span className="font-bold text-blue-700">{data.historicalFS.toFixed(2)}</span>
          </div>
        )}
        {data.forecastFS !== undefined && (
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">PINN Forecast FS:</span>
            <span className={`font-bold ${isFailure ? 'text-red-600' : 'text-emerald-600'}`}>
              {data.forecastFS.toFixed(2)}
            </span>
          </div>
        )}
        {data.fsConfidenceLower !== undefined && (
          <div className="flex justify-between gap-4 text-[10px] text-slate-500">
            <span>95% CI:</span>
            <span className="text-slate-700 font-semibold">[{data.fsConfidenceLower.toFixed(2)} - {data.fsConfidenceUpper?.toFixed(2)}]</span>
          </div>
        )}
        {data.porePressure !== undefined && (
          <div className="flex justify-between gap-4 mt-1 pt-1 border-t border-slate-100 text-[10px]">
            <span className="text-slate-500">Pore Pressure:</span>
            <span className="text-amber-700 font-bold">{data.porePressure.toFixed(1)} kPa</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const PredictiveChart: React.FC = () => {
  return (
    <div className="w-full select-none flex flex-col gap-2 font-mono">
      
      {/* Light Glass Status Pill Banner */}
      <div className="bg-red-50/90 border border-red-200 px-3 py-2 rounded-lg flex items-center justify-between text-xs font-mono text-red-800 tracking-wider shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></div>
          <span className="font-bold">FAILURE PROBABLE : T+4h (FS 0.88)</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] bg-red-100 border border-red-300 px-2 py-0.5 rounded-full text-red-700 font-bold">
          <span>CRITICAL LIMIT EXCEEDED</span>
        </div>
      </div>

      {/* Chart Canvas Container */}
      <div className="bg-white/60 border border-slate-200/80 rounded-xl p-3 flex flex-col shadow-inner backdrop-blur-md">
        
        {/* Top Metric Header & Legend */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 border-b border-slate-200/80 pb-1.5 font-sans">
          <div className="flex items-center gap-3 font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
              <span>Observed Data</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-amber-600 inline-block"></span>
              <span>Forecasted FS</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-blue-100 border border-blue-300 inline-block rounded-sm"></span>
              <span>95% CI Range</span>
            </span>
          </div>
          <div className="text-slate-400 text-[10px] font-mono">
            Green-Ampt + Mohr Coulomb PINN
          </div>
        </div>

        {/* High-Fidelity Responsive Chart */}
        <div className="w-full h-44">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={predictiveDataset}
              margin={{ top: 8, right: 12, left: -22, bottom: 0 }}
            >
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" opacity={0.8} />
              
              <XAxis 
                dataKey="timeLabel" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                fontFamily="monospace"
              />
              <YAxis 
                domain={[0.2, 1.8]} 
                ticks={[0.4, 0.7, 1.0, 1.3, 1.6]} 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false}
                fontFamily="monospace"
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Equilibrium Failure Threshold Reference Line */}
              <ReferenceLine 
                y={1.0} 
                stroke="#dc2626" 
                strokeWidth={1.8} 
                strokeDasharray="4 4"
                label={{
                  value: 'CRITICAL THRESHOLD (FS=1.0)',
                  fill: '#dc2626',
                  fontSize: 9,
                  position: 'right',
                  fontFamily: 'monospace',
                  fontWeight: 700
                }} 
              />

              {/* Shaded Confidence Interval Band */}
              <Area
                type="monotone"
                dataKey="fsConfidenceUpper"
                stroke="transparent"
                fill="#2563eb"
                fillOpacity={0.12}
                isAnimationActive={false}
              />

              {/* Dynamic Forecasted FS Curve */}
              <Line
                type="monotone"
                dataKey="forecastFS"
                stroke="#d97706"
                strokeWidth={2.4}
                dot={{ r: 3, fill: '#d97706', stroke: '#ffffff', strokeWidth: 1 }}
                activeDot={{ r: 5, fill: '#dc2626', stroke: '#ffffff', strokeWidth: 1.5 }}
                isAnimationActive={false}
              />

              {/* Historical Sensor Data Points as Scatter Plot */}
              <Scatter
                name="Historical FS"
                dataKey="historicalFS"
                fill="#1e3a8a"
                shape="circle"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Technical HUD Summary */}
        <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div>
            <span>Cohesion: </span>
            <strong className="text-slate-800">14.0 kPa</strong>
          </div>
          <div>
            <span>Friction Angle: </span>
            <strong className="text-slate-800">28.0°</strong>
          </div>
          <div>
            <span>Pore Pressure Peak: </span>
            <strong className="text-red-600 font-bold">48.2 kPa</strong>
          </div>
        </div>

      </div>

    </div>
  );
};
