import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SimulationHistoryPoint } from '../types';

interface AnalyticsChartProps {
  history: SimulationHistoryPoint[];
  poolIds: { id: string, label: string, color: string }[];
  converterIds: { id: string, label: string, color: string }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ history, poolIds, converterIds }) => {
  const [viewMode, setViewMode] = useState<'inventory' | 'throughput'>('inventory');

  // Only show last 50 ticks for performance and readability
  const data = history.slice(-50);

  return (
    <div className="h-64 bg-slate-900 border-t border-slate-700 flex flex-col">
      <div className="px-4 py-2 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-slate-300">数据分析</h3>
          <div className="flex bg-slate-800 rounded p-0.5 border border-slate-700">
            <button
              onClick={() => setViewMode('inventory')}
              className={`px-3 py-1 text-xs rounded transition-colors ${viewMode === 'inventory' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              库存量
            </button>
            <button
              onClick={() => setViewMode('throughput')}
              className={`px-3 py-1 text-xs rounded transition-colors ${viewMode === 'throughput' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              吞吐量
            </button>
          </div>
        </div>
        <span className="text-xs text-slate-500">
          {viewMode === 'inventory' ? '资源池实时储量' : '转换器每秒执行次数'}
        </span>
      </div>
      <div className="flex-1 w-full p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="tick"
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(val) => `t${val}`}
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
              itemStyle={{ fontSize: 12 }}
              labelStyle={{ color: '#94a3b8', marginBottom: 5 }}
            />
            <Legend />

            {viewMode === 'inventory'
              ? poolIds.map((pool, index) => (
                <Line
                  key={pool.id}
                  type="monotone"
                  dataKey={pool.id}
                  name={pool.label}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  animationDuration={300}
                />
              ))
              : converterIds.map((conv, index) => (
                <Line
                  key={conv.id}
                  type="stepAfter"
                  dataKey={`${conv.id}:rate`} // Matches the key set in simulationEngine
                  name={conv.label}
                  stroke={COLORS[(index + 2) % COLORS.length]} // Shift colors slightly
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  animationDuration={300}
                />
              ))
            }
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};