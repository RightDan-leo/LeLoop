import React from 'react';
import { NodeType } from '../types';
import { ArrowUp, Database, ArrowDown, RefreshCw, LayoutGrid } from 'lucide-react';

export const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col z-20 shadow-xl">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <LayoutGrid size={20} className="text-blue-400"/>
            工具箱
        </h2>
        <p className="text-slate-400 text-xs mt-1">拖拽节点到画布</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        
        <div 
          className="bg-slate-800 p-3 rounded-lg border border-slate-700 cursor-grab hover:border-emerald-500 hover:bg-slate-750 transition-all group"
          onDragStart={(event) => onDragStart(event, NodeType.SOURCE)}
          draggable
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-900/50 border border-emerald-500 flex items-center justify-center text-emerald-400">
                <ArrowUp size={16} />
            </div>
            <div>
                <div className="text-sm font-semibold text-emerald-100">资源源</div>
                <div className="text-xs text-slate-400">生成资源</div>
            </div>
          </div>
        </div>

        <div 
          className="bg-slate-800 p-3 rounded-lg border border-slate-700 cursor-grab hover:border-blue-500 hover:bg-slate-750 transition-all group"
          onDragStart={(event) => onDragStart(event, NodeType.POOL)}
          draggable
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-900/50 border border-blue-500 flex items-center justify-center text-blue-400">
                <Database size={16} />
            </div>
             <div>
                <div className="text-sm font-semibold text-blue-100">资源池</div>
                <div className="text-xs text-slate-400">存储资源</div>
            </div>
          </div>
        </div>

        <div 
          className="bg-slate-800 p-3 rounded-lg border border-slate-700 cursor-grab hover:border-orange-500 hover:bg-slate-750 transition-all group"
          onDragStart={(event) => onDragStart(event, NodeType.CONVERTER)}
          draggable
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-orange-900/50 border border-orange-500 flex items-center justify-center text-orange-400 transform rotate-45 scale-75">
                <div className="transform -rotate-45"><RefreshCw size={16} /></div>
            </div>
             <div>
                <div className="text-sm font-semibold text-orange-100">转换器</div>
                <div className="text-xs text-slate-400">转换输入资源</div>
            </div>
          </div>
        </div>

        <div 
          className="bg-slate-800 p-3 rounded-lg border border-slate-700 cursor-grab hover:border-red-500 hover:bg-slate-750 transition-all group"
          onDragStart={(event) => onDragStart(event, NodeType.DRAIN)}
          draggable
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-red-900/50 border border-red-500 flex items-center justify-center text-red-400">
                <ArrowDown size={16} />
            </div>
             <div>
                <div className="text-sm font-semibold text-red-100">消耗器</div>
                <div className="text-xs text-slate-400">消耗资源</div>
            </div>
          </div>
        </div>

      </div>
      
      <div className="p-4 bg-slate-950 text-xs text-slate-500 border-t border-slate-800">
        EcoFlow v1.0.0
      </div>
    </aside>
  );
};