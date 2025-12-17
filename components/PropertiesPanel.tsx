import React from 'react';
import { useTranslation } from 'react-i18next';
import { EcoNode, EcoEdge, NodeType } from '../types';
import { X, Settings2, ArrowRightLeft, Shuffle } from 'lucide-react';

interface PropertiesPanelProps {
    selectedNode: EcoNode | null;
    selectedEdge: EcoEdge | null;
    onUpdateNode: (id: string, data: any) => void;
    onUpdateEdge: (id: string, data: any) => void;
    onClose: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
    selectedNode,
    selectedEdge,
    onUpdateNode,
    onUpdateEdge,
    onClose
}) => {
    const { t } = useTranslation();
    if (!selectedNode && !selectedEdge) return null;

    // --- Node Logic ---
    const handleNodeChange = (field: string, value: any) => {
        if (!selectedNode) return;
        onUpdateNode(selectedNode.id, {
            ...selectedNode.data,
            [field]: value,
        });
    };

    // --- Edge Logic ---
    const handleEdgeChange = (field: string, value: any) => {
        if (!selectedEdge) return;
        onUpdateEdge(selectedEdge.id, {
            [field]: value
        });
    };

    // Helper for Rate Inputs (Shared between Node and Edge)
    const renderRateInputs = (
        data: { rate: number, rateMax?: number, isRandom?: boolean },
        onChange: (field: string, val: any) => void,
        labels: { single: string, min: string, max: string }
    ) => {
        return (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded border border-slate-200 dark:border-slate-700/50 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">数值设定</span>
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={data.isRandom || false}
                            onChange={(e) => {
                                const isRandom = e.target.checked;
                                onChange('isRandom', isRandom);
                                // Initialize max if it doesn't exist when turning on
                                if (isRandom && (data.rateMax === undefined || data.rateMax < data.rate)) {
                                    onChange('rateMax', data.rate + 5);
                                }
                            }}
                            className="w-3 h-3 rounded border-slate-300 dark:border-slate-600 text-blue-500 focus:ring-offset-0 focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700"
                        />
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 flex items-center gap-1 transition-colors">
                            <Shuffle size={10} /> 随机范围
                        </span>
                    </label>
                </div>

                {!data.isRandom ? (
                    <div>
                        <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">{labels.single}</label>
                        <input
                            type="number"
                            value={data.rate}
                            onChange={(e) => onChange('rate', parseFloat(e.target.value))}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">{labels.min}</label>
                            <input
                                type="number"
                                value={data.rate}
                                onChange={(e) => onChange('rate', parseFloat(e.target.value))}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="flex items-end pb-2 text-slate-400 dark:text-slate-500">-</div>
                        <div className="flex-1">
                            <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">{labels.max}</label>
                            <input
                                type="number"
                                value={data.rateMax || data.rate}
                                onChange={(e) => onChange('rateMax', parseFloat(e.target.value))}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderContent = () => {
        if (selectedNode) {
            const isSource = selectedNode.type === NodeType.SOURCE;
            const isDrain = selectedNode.type === NodeType.DRAIN;
            const isPool = selectedNode.type === NodeType.POOL;
            const isConverter = selectedNode.type === NodeType.CONVERTER;
            const isText = selectedNode.type === NodeType.TEXT;
            const isRegister = selectedNode.type === NodeType.REGISTER;

            return (
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                            {isText ? t('nodes.text.label') : '标签'}
                        </label>
                        {isText ? (
                            <textarea
                                value={selectedNode.data.label}
                                onChange={(e) => handleNodeChange('label', e.target.value)}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[80px]"
                                placeholder={t('nodes.text.desc')}
                            />
                        ) : (
                            <input
                                type="text"
                                value={selectedNode.data.label}
                                onChange={(e) => handleNodeChange('label', e.target.value)}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        )}
                    </div>

                    {isText && (
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('properties.font_size') || 'Font Size'} ({selectedNode.data.fontSize || 16}px)</label>
                            <input
                                type="range"
                                min="12"
                                max="64"
                                step="2"
                                value={selectedNode.data.fontSize || 16}
                                onChange={(e) => handleNodeChange('fontSize', parseInt(e.target.value))}
                                className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                    )}

                    {isPool && (
                        <>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">当前值</label>
                                <input
                                    type="number"
                                    value={selectedNode.data.value}
                                    onChange={(e) => handleNodeChange('value', parseFloat(e.target.value))}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">最大容量 (可选)</label>
                                <input
                                    type="number"
                                    value={selectedNode.data.capacity || ''}
                                    placeholder="无限"
                                    onChange={(e) => handleNodeChange('capacity', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </>
                    )}

                    {(isSource || isDrain) && renderRateInputs(
                        selectedNode.data,
                        handleNodeChange,
                        { single: '流速 (每Tick)', min: '最小流速', max: '最大流速' }
                    )}

                    {isConverter && (
                        <>
                            {renderRateInputs(
                                selectedNode.data,
                                handleNodeChange,
                                { single: '执行倍率 (吞吐量)', min: '最小倍率', max: '最大倍率' }
                            )}
                            <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-2 p-2 bg-slate-100 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700">
                                提示: 具体的消耗和产出数量请点击连接该节点的<b>连线</b>进行设置。
                            </p>
                        </>
                    )}

                    {isRegister && (
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">公式 (Javascript 表达式)</label>
                            <input
                                type="text"
                                value={selectedNode.data.formula || ''}
                                onChange={(e) => handleNodeChange('formula', e.target.value)}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                placeholder="例如: a * a <= b"
                            />
                            <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-2">
                                使用连线上的<b>变量名</b>作为参数。<br />
                                支持数学运算 (+, -, *, /) 和逻辑运算 (&lt;, &gt;, ==).
                            </p>
                        </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">ID: {selectedNode.id}</p>
                    </div>
                </div>
            );
        }

        if (selectedEdge) {
            return (
                <div className="space-y-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded mb-4">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-1">
                            <ArrowRightLeft size={14} />
                            连线属性
                        </div>
                        <div className="text-[10px] text-blue-600/80 dark:text-blue-200/70">
                            定义资源流动的数量或配方。支持随机波动。
                        </div>
                    </div>

                    {/* Variable Name for Formula input */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">变量名 (仅限连接到寄存器)</label>
                        <input
                            type="text"
                            value={selectedEdge.data?.variableName || ''}
                            onChange={(e) => handleEdgeChange('variableName', e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            placeholder="例如: a, b (用于公式)"
                        />
                    </div>

                    {renderRateInputs(
                        selectedEdge.data || { rate: 1 },
                        handleEdgeChange,
                        { single: '流量 / 数量', min: '最小数量', max: '最大数量' }
                    )}

                    <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-500">
                        如果是连接到转换器：
                        <ul className="list-disc list-inside mt-1 ml-1 space-y-0.5">
                            <li>输入线代表消耗原料数量</li>
                            <li>输出线代表产出成品数量</li>
                        </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">Edge ID: {selectedEdge.id}</p>
                    </div>
                </div>
            );
        }
    };


    return (
        <div className="absolute top-4 right-4 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-right-10 duration-200">
            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    <Settings2 size={16} />
                    {selectedNode ? '节点属性' : '连线属性'}
                </h3>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
                    <X size={18} />
                </button>
            </div>

            <div className="p-4">
                {renderContent()}
            </div>
        </div>
    );
};