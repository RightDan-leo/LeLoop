import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from '../types';
import { ArrowDown, ArrowUp, RefreshCw, Database } from 'lucide-react';

const BaseNodeWrapper = ({ 
  children, 
  selected, 
  className 
}: { 
  children: React.ReactNode, 
  selected: boolean, 
  className?: string 
}) => (
  <div className={`relative flex flex-col items-center justify-center transition-all duration-200 ${selected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105' : ''} ${className}`}>
    {children}
  </div>
);

// Helper to format rate display
const formatRate = (data: NodeData) => {
    if (data.isRandom && data.rateMax) {
        return `${data.rate}-${data.rateMax}`;
    }
    return data.rate;
};

// --- Source Node (Triangle) ---
export const SourceNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <BaseNodeWrapper selected={selected}>
      <div className="relative w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[70px] border-b-emerald-600 filter drop-shadow-lg">
        <div className="absolute -left-10 top-8 w-20 text-white font-bold flex flex-col items-center justify-center text-center">
            <ArrowUp size={16} />
            <span className="text-xs">+{formatRate(data)}</span>
        </div>
      </div>
      <div className="absolute -bottom-6 text-xs text-emerald-400 font-semibold whitespace-nowrap bg-slate-900/80 px-2 py-0.5 rounded">
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-400 !w-3 !h-3" />
    </BaseNodeWrapper>
  );
});

// --- Pool Node (Circle) ---
export const PoolNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <BaseNodeWrapper selected={selected}>
      <Handle type="target" position={Position.Top} className="!bg-blue-400 !w-3 !h-3" />
      <div className="w-24 h-24 rounded-full bg-blue-600 border-4 border-blue-400 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10">
        <Database size={20} className="text-blue-200 mb-1" />
        <span className="text-xl font-bold text-white">{Math.round(data.value)}</span>
        <span className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">库存</span>
      </div>
       <div className="absolute -bottom-6 text-xs text-blue-400 font-semibold whitespace-nowrap bg-slate-900/80 px-2 py-0.5 rounded">
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-400 !w-3 !h-3" />
    </BaseNodeWrapper>
  );
});

// --- Drain Node (Inverted Triangle) ---
export const DrainNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <BaseNodeWrapper selected={selected}>
      <Handle type="target" position={Position.Top} className="!bg-red-500 !w-3 !h-3" />
      <div className="relative w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-t-[70px] border-t-red-600 filter drop-shadow-lg">
         <div className="absolute -left-10 -top-14 w-20 text-white font-bold flex flex-col items-center justify-center text-center">
            <ArrowDown size={16} />
            <span className="text-xs">-{formatRate(data)}</span>
        </div>
      </div>
      <div className="absolute -bottom-6 text-xs text-red-400 font-semibold whitespace-nowrap bg-slate-900/80 px-2 py-0.5 rounded">
        {data.label}
      </div>
    </BaseNodeWrapper>
  );
});

// --- Converter Node (Diamond) ---
export const ConverterNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <BaseNodeWrapper selected={selected}>
      <Handle type="target" position={Position.Top} className="!bg-orange-500 !w-3 !h-3 -mt-6" />
      
      {/* Visual Diamond Shape using rotation */}
      <div className="w-20 h-20 bg-orange-600 transform rotate-45 border-4 border-orange-400 flex items-center justify-center shadow-lg">
        <div className="transform -rotate-45 flex flex-col items-center text-white">
           <RefreshCw size={20} />
           <span className="text-xs font-bold mt-1">x{formatRate(data)}</span>
        </div>
      </div>

       <div className="absolute -bottom-8 text-xs text-orange-400 font-semibold whitespace-nowrap bg-slate-900/80 px-2 py-0.5 rounded">
        {data.label}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!bg-orange-500 !w-3 !h-3 -mb-6" />
    </BaseNodeWrapper>
  );
});