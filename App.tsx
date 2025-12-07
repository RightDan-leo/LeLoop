import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Background,
  Controls,
  Node,
  useReactFlow,
  Panel,
  MarkerType,
} from 'reactflow';
// import 'reactflow/dist/style.css'; // Removed: handled via CDN in index.html to avoid loader issues
import { Play, Pause, RotateCcw, Activity, StepForward, Download, Upload } from 'lucide-react';

import { NodeType, EcoNode, EcoEdge, SimulationState, NodeData, EdgeData } from './types';
import { Sidebar } from './components/Sidebar';
import { SourceNode, PoolNode, DrainNode, ConverterNode } from './components/CustomNodes';
import { PropertiesPanel } from './components/PropertiesPanel';
import { AnalyticsChart } from './components/AnalyticsChart';
import { runSimulationTick } from './services/simulationEngine';

// --- Constants ---
const INITIAL_NODES: EcoNode[] = [
  {
    id: 'source-1',
    type: NodeType.SOURCE,
    position: { x: 100, y: 100 },
    data: { label: '金矿', rate: 5, value: 0, id: 'source-1' },
  },
  {
    id: 'pool-1',
    type: NodeType.POOL,
    position: { x: 100, y: 300 },
    data: { label: '国库', value: 10, rate: 0, id: 'pool-1' },
  },
];

const INITIAL_EDGES: EcoEdge[] = [
    { 
      id: 'e1-2', 
      source: 'source-1', 
      target: 'pool-1', 
      animated: true,
      data: { rate: 1 },
      label: '1',
      labelStyle: { fill: '#94a3b8', fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: '#1e293b', fillOpacity: 0.9, rx: 4, ry: 4 },
      labelBgPadding: [4, 2],
      style: { stroke: '#64748b', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#64748b',
      },
    }
];

const TICK_RATE_MS = 1000;

// Register custom node types
const nodeTypes = {
  source: SourceNode,
  pool: PoolNode,
  drain: DrainNode,
  converter: ConverterNode,
};

const NODE_TYPE_LABELS: Record<NodeType, string> = {
  [NodeType.SOURCE]: '资源源',
  [NodeType.POOL]: '资源池',
  [NodeType.DRAIN]: '消耗器',
  [NodeType.CONVERTER]: '转换器',
};

// Helper to format edge label based on data
const getEdgeLabel = (data?: EdgeData) => {
    if (!data) return '1';
    if (data.isRandom && data.rateMax) {
        return `${data.rate}-${data.rateMax}`;
    }
    return data.rate.toString();
};

const AppContent = () => {
  const reactFlowInstance = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // React Flow State
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  
  // Selection State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Simulation State
  const [simState, setSimState] = useState<SimulationState>({
    isPlaying: false,
    tick: 0,
    history: [],
  });

  // Refs for access inside intervals to avoid stale closures
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  
  // Keep refs synced
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

  // --- Handlers ---

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ 
        ...params, 
        animated: true, 
        // Default edge data: rate 1
        data: { rate: 1 }, 
        label: '1',
        labelStyle: { fill: '#94a3b8', fontWeight: 600, fontSize: 12 },
        labelBgStyle: { fill: '#1e293b', fillOpacity: 0.9, rx: 4, ry: 4 },
        labelBgPadding: [4, 2],
        style: { stroke: '#64748b', strokeWidth: 2 },
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#64748b',
        },
    }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const newNodeId = `${type}-${Date.now()}`;
      const newNode: EcoNode = {
        id: newNodeId,
        type,
        position,
        data: { 
            label: `新${NODE_TYPE_LABELS[type]}`, 
            value: 0, 
            // Converter rate now means "Throughput" (executions per tick), default to 1
            rate: type === NodeType.CONVERTER ? 1 : 5,
            id: newNodeId // for tracking
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null); // Deselect edge
  }, []);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null); // Deselect node
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  const onUpdateNodeData = useCallback((id: string, newData: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onUpdateEdgeData = useCallback((id: string, newData: Partial<EdgeData>) => {
    setEdges((eds) => 
        eds.map((edge) => {
            if (edge.id === id) {
                const updatedData = { ...edge.data, ...newData };
                return {
                    ...edge,
                    data: updatedData,
                    label: getEdgeLabel(updatedData as EdgeData) // Update visual label
                };
            }
            return edge;
        })
    );
  }, [setEdges]);

  const resetSimulation = useCallback(() => {
    setSimState({ isPlaying: false, tick: 0, history: [] });
    // Reset pool values to 0
    setNodes((nds) => nds.map(n => ({...n, data: {...n.data, value: 0}})));
  }, [setNodes]);

  // --- File Save/Load Logic ---
  
  const handleSave = useCallback(() => {
    const flowData = {
      nodes: nodesRef.current,
      edges: edgesRef.current,
      version: '1.0'
    };
    
    const jsonString = JSON.stringify(flowData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `ecoflow-layout-${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleLoadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const flowData = JSON.parse(result);
        
        if (flowData.nodes && flowData.edges) {
          // Reset simulation first
          resetSimulation();
          
          // Restore nodes and edges
          setNodes(flowData.nodes);
          setEdges(flowData.edges);
          
          // Clear selection
          setSelectedNodeId(null);
          setSelectedEdgeId(null);
        } else {
          alert('无法读取文件：格式不正确');
        }
      } catch (err) {
        console.error(err);
        alert('无法解析文件');
      }
    };
    reader.readAsText(file);
    
    // Clear input so the same file can be selected again if needed
    event.target.value = '';
  }, [setNodes, setEdges, resetSimulation]);

  // --- Simulation Logic ---

  // Refactor tick logic into a stable callback
  const processTick = useCallback(() => {
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;

    // Run logic
    const nextNodes = runSimulationTick(currentNodes, currentEdges);

    // Update Node State
    setNodes(nextNodes);
    
    // Update History
    setSimState(prev => {
        const nextTick = prev.tick + 1;
        
        // Capture pool values
        const historyPoint: any = { tick: nextTick };
        nextNodes.forEach(n => {
            if (n.type === NodeType.POOL) {
                historyPoint[n.id] = n.data.value;
            }
        });

        const nextHistory = [...prev.history, historyPoint];
        // Limit history size to prevent memory leak in long runs
        if (nextHistory.length > 100) nextHistory.shift();

        return {
            ...prev,
            tick: nextTick,
            history: nextHistory
        };
    });
  }, [setNodes]);

  // Handle single step
  const handleStepForward = useCallback(() => {
      // Pause if currently playing
      if (simState.isPlaying) {
          setSimState(s => ({...s, isPlaying: false}));
      }
      processTick();
  }, [simState.isPlaying, processTick]);

  // Simulation Loop
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (simState.isPlaying) {
      intervalId = setInterval(processTick, TICK_RATE_MS);
    }

    return () => clearInterval(intervalId);
  }, [simState.isPlaying, processTick]);

  // Derived data for UI
  const selectedNode = useMemo(() => 
    nodes.find(n => n.id === selectedNodeId) || null, 
  [nodes, selectedNodeId]);

  const selectedEdge = useMemo(() => 
    edges.find(e => e.id === selectedEdgeId) || null,
  [edges, selectedEdgeId]);

  const poolIds = useMemo(() => 
    nodes.filter(n => n.type === NodeType.POOL).map(n => ({
        id: n.id,
        label: n.data.label,
        color: '' // Handled in chart component
    })),
  [nodes]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-white">
      {/* Hidden File Input for Loading */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded">
                <Activity size={20} className="text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">EcoFlow <span className="text-blue-500">模拟器</span></h1>
        </div>

        <div className="flex items-center gap-4 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button 
                onClick={() => setSimState(s => ({...s, isPlaying: !s.isPlaying}))}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    simState.isPlaying 
                    ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' 
                    : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400'
                }`}
            >
                {simState.isPlaying ? <><Pause size={16} /> 暂停</> : <><Play size={16} fill="currentColor" /> 运行</>}
            </button>
            
            <div className="h-4 w-[1px] bg-slate-600"></div>

            <button 
                onClick={handleStepForward}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                title="单步执行"
            >
                <StepForward size={16} />
                <span className="hidden sm:inline">单步</span>
            </button>

            <div className="h-4 w-[1px] bg-slate-600"></div>
            
            <button 
                onClick={resetSimulation}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                title="重置模拟"
            >
                <RotateCcw size={16} />
            </button>
        </div>

        <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700 mr-4">
                 <button 
                     onClick={handleSave}
                     className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                     title="保存布局"
                 >
                     <Download size={14} />
                     保存
                 </button>
                 <div className="h-4 w-[1px] bg-slate-600"></div>
                 <button 
                     onClick={handleLoadClick}
                     className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                     title="读取布局"
                 >
                     <Upload size={14} />
                     读取
                 </button>
            </div>

            <div className="flex flex-col items-end">
                <span className="text-slate-400 text-xs uppercase tracking-wider">时间步</span>
                <span className="font-mono text-blue-400 font-bold">{simState.tick}</span>
            </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        
        <div className="flex-1 relative h-full flex flex-col">
            <div className="flex-1 relative" onDragOver={onDragOver} onDrop={onDrop}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onEdgeClick={onEdgeClick}
                    onPaneClick={onPaneClick}
                    fitView
                    className="bg-slate-950"
                >
                    <Background color="#1e293b" gap={20} />
                    <Controls className="!bg-slate-800 !border-slate-700 !shadow-xl [&>button]:!fill-slate-400 [&>button:hover]:!fill-white" />
                    
                    {/* Floating Properties Panel */}
                    <PropertiesPanel 
                        selectedNode={selectedNode}
                        selectedEdge={selectedEdge}
                        onUpdateNode={onUpdateNodeData}
                        onUpdateEdge={onUpdateEdgeData}
                        onClose={() => { setSelectedNodeId(null); setSelectedEdgeId(null); }}
                    />
                </ReactFlow>
            </div>
            
            {/* Bottom Analytics Panel */}
            <AnalyticsChart history={simState.history} poolIds={poolIds} />
        </div>
      </div>
    </div>
  );
};

// Wrap with Provider
const App = () => (
    <ReactFlowProvider>
        <AppContent />
    </ReactFlowProvider>
);

export default App;