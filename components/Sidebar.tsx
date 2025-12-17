import React from 'react';
import { useTranslation } from 'react-i18next';
import { NodeType } from '../types';
import { ArrowUp, Database, ArrowDown, RefreshCw, LayoutGrid, Split, Merge, FunctionSquare } from 'lucide-react';

export const Sidebar = () => {
  const { t } = useTranslation();

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col z-20 shadow-xl transition-colors duration-300">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <LayoutGrid size={20} className="text-blue-500 dark:text-blue-400" />
          {t('sidebar.title')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{t('sidebar.subtitle')}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        <div
          className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-grab hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-white dark:hover:bg-slate-750 transition-all group shadow-sm hover:shadow-md"
          onDragStart={(event) => onDragStart(event, NodeType.SOURCE)}
          draggable
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-500 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ArrowUp size={16} />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-700 dark:text-emerald-100">{t('nodes.source.label')}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t('nodes.source.desc')}</div>
            </div>
          </div>
        </div>

        <div
          className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-grab hover:border-blue-500 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-slate-750 transition-all group shadow-sm hover:shadow-md"
          onDragStart={(event) => onDragStart(event, NodeType.POOL)}
          draggable
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-500 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Database size={16} />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-700 dark:text-blue-100">{t('nodes.pool.label')}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t('nodes.pool.desc')}</div>
            </div>
          </div>
        </div>

        <div
          className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-grab hover:border-orange-500 dark:hover:border-orange-500 hover:bg-white dark:hover:bg-slate-750 transition-all group shadow-sm hover:shadow-md"
          onDragStart={(event) => onDragStart(event, NodeType.CONVERTER)}
          draggable
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-orange-100 dark:bg-orange-900/50 border border-orange-500 flex items-center justify-center text-orange-600 dark:text-orange-400 transform rotate-45 scale-75">
              <div className="transform -rotate-45"><RefreshCw size={16} /></div>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-700 dark:text-orange-100">{t('nodes.converter.label')}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t('nodes.converter.desc')}</div>
            </div>
          </div>
        </div>

        <div
          className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-grab hover:border-red-500 dark:hover:border-red-500 hover:bg-white dark:hover:bg-slate-750 transition-all group shadow-sm hover:shadow-md"
          onDragStart={(event) => onDragStart(event, NodeType.DRAIN)}
          draggable
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-red-100 dark:bg-red-900/50 border border-red-500 flex items-center justify-center text-red-600 dark:text-red-400">
              <ArrowDown size={16} />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-700 dark:text-red-100">{t('nodes.drain.label')}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t('nodes.drain.desc')}</div>
            </div>
          </div>
        </div>

        <div
          className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-grab hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-750 transition-all group shadow-sm hover:shadow-md"
          onDragStart={(event) => onDragStart(event, NodeType.SPLITTER)}
          draggable
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-500 flex items-center justify-center text-indigo-600 dark:text-indigo-400 transform rotate-180">
              <div className="transform rotate-180"><Split size={16} /></div>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-700 dark:text-indigo-100">{t('nodes.splitter.label')}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t('nodes.splitter.desc')}</div>
            </div>
          </div>
        </div>

        <div
          className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-grab hover:border-violet-500 dark:hover:border-violet-500 hover:bg-white dark:hover:bg-slate-750 transition-all group shadow-sm hover:shadow-md"
          onDragStart={(event) => onDragStart(event, NodeType.MERGER)}
          draggable
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-violet-100 dark:bg-violet-900/50 border border-violet-500 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Merge size={16} />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-700 dark:text-violet-100">{t('nodes.merger.label')}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t('nodes.merger.desc')}</div>
            </div>
          </div>
        </div>

        <div
          className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-grab hover:border-pink-500 dark:hover:border-pink-500 hover:bg-white dark:hover:bg-slate-750 transition-all group shadow-sm hover:shadow-md"
          onDragStart={(event) => onDragStart(event, NodeType.REGISTER)}
          draggable
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-pink-50 dark:bg-slate-900 border border-pink-500 flex items-center justify-center text-pink-600 dark:text-pink-500">
              <FunctionSquare size={16} />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-700 dark:text-pink-100">{t('nodes.register.label') || '寄存器'}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t('nodes.register.desc') || '执行自定义公式'}</div>
            </div>
          </div>
        </div>

        <div
          className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-grab hover:border-slate-400 hover:bg-white dark:hover:bg-slate-750 transition-all group shadow-sm hover:shadow-md"
          onDragStart={(event) => onDragStart(event, NodeType.TEXT)}
          draggable
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-700/50 border border-slate-400 dark:border-slate-500 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <span className="font-serif font-bold text-lg">T</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('nodes.text.label')}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t('nodes.text.desc')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-100 dark:bg-slate-950 text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800">
        Legou Loop v1.0.0
      </div>
    </aside>
  );
};