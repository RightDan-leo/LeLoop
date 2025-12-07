import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SimulationHistoryPoint } from '../types';

interface AnalyticsChartProps {
  history: SimulationHistoryPoint[];
  poolIds: { id: string, label: string, color: string }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ history, poolIds }) => {
  // Only show last 50 ticks for performance and readability
  const data = history.slice(-50);

  return (
    <div className="h-64 bg-slate-900 border-t border-slate-700 flex flex-col">
      <div className="px-4 py-2 border-b border-slate-800 flex justify-between items-center">
         <h3 className="text-sm font-semibold text-slate-300">经济平衡</h3>
         <span className="text-xs text-slate-500">实时资源池数值</span>
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
            {poolIds.map((pool, index) => (
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
            ))}
            </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};