import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from '../types';
import { ArrowDown, ArrowUp, RefreshCw, Database, Split, Merge } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  // Calculate fill percentage if capacity exists
  const fillPercentage = data.capacity && data.capacity > 0
    ? Math.min(100, Math.max(0, (data.value / data.capacity) * 100))
    : 0;

  return (
    <BaseNodeWrapper selected={selected}>
      <Handle type="target" position={Position.Top} className="!bg-blue-400 !w-3 !h-3" />

      <div className="relative w-24 h-24 rounded-full bg-slate-900 border-4 border-blue-400 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] z-10 overflow-hidden">

        {/* Fill Level Background */}
        {data.capacity && data.capacity > 0 && (
          <div
            className="absolute bottom-0 left-0 right-0 bg-blue-600/50 transition-all duration-500 ease-in-out"
            style={{ height: `${fillPercentage}%` }}
          />
        )}

        {/* Content Layer (on top of fill) */}
        <div className="relative z-10 flex flex-col items-center">
          <Database size={20} className="text-blue-200 mb-1" />
          <span className="text-xl font-bold text-white">{Math.round(data.value)}</span>

          {/* Capacity Indicator if set */}
          {data.capacity && data.capacity > 0 ? (
            <span className="text-[10px] text-blue-200 font-mono mt-0.5">
              /{data.capacity}
            </span>
          ) : (
            <span className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">{t('nodes.stock')}</span>
          )}
        </div>
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

// --- Splitter Node (Y-Shape/Triangle) ---
export const SplitterNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const { t } = useTranslation();
  return (
    <BaseNodeWrapper selected={selected}>
      <Handle type="target" position={Position.Top} className="!bg-indigo-500 !w-3 !h-3" />

      <div className="w-14 h-14 bg-indigo-900/80 border-2 border-indigo-500 rounded-lg flex items-center justify-center transform rotate-180">
        <div className="transform rotate-180 text-indigo-300">
          <Split size={24} />
        </div>
      </div>

      <div className="absolute -bottom-6 text-xs text-indigo-400 font-semibold whitespace-nowrap bg-slate-900/80 px-2 py-0.5 rounded">
        {data.label}
      </div>

      {/* Visual Rate Indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white pointer-events-none">
        {formatRate(data)}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !w-3 !h-3" />
    </BaseNodeWrapper>
  );
});

// --- Merger Node (Inverted Y) ---
export const MergerNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const { t } = useTranslation();
  return (
    <BaseNodeWrapper selected={selected}>
      <Handle type="target" position={Position.Top} className="!bg-violet-500 !w-3 !h-3" />

      <div className="w-14 h-14 bg-violet-900/80 border-2 border-violet-500 rounded-lg flex items-center justify-center">
        <div className="text-violet-300">
          <Merge size={24} />
        </div>
      </div>

      <div className="absolute -bottom-6 text-xs text-violet-400 font-semibold whitespace-nowrap bg-slate-900/80 px-2 py-0.5 rounded">
        {data.label}
      </div>

      {/* Visual Rate Indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white pointer-events-none">
        {formatRate(data)}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-violet-500 !w-3 !h-3" />
    </BaseNodeWrapper>
  );
});

// --- Text Node (Annotation) ---
export const TextNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <div
      className={`min-w-[100px] min-h-[50px] p-2 transition-all duration-200 border-2 rounded ${selected ? 'border-dashed border-white/50 bg-white/5' : 'border-transparent hover:border-white/20'}`}
      style={{
        fontSize: data.fontSize || 16,
      }}
    >
      <div className="text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
        {data.label}
      </div>
    </div>
  );
});