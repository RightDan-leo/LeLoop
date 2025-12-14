import { useState, useCallback, useRef, useEffect } from 'react';
import { EcoNode, EcoEdge, SimulationState, NodeType } from '../types';
import { runSimulationTick } from '../services/simulationEngine';

const TICK_RATE_MS = 1000;

interface UseSimulationProps {
    nodes: EcoNode[];
    edges: EcoEdge[];
    setNodes: (nodes: EcoNode[] | ((nodes: EcoNode[]) => EcoNode[])) => void;
}

export const useSimulation = ({ nodes, edges, setNodes }: UseSimulationProps) => {
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

    const processTick = useCallback(() => {
        const currentNodes = nodesRef.current;
        const currentEdges = edgesRef.current;

        // Run logic
        const { nextNodes, stats } = runSimulationTick(currentNodes, currentEdges);

        // Update Node State
        setNodes(nextNodes);

        // Update History
        setSimState(prev => {
            const nextTick = prev.tick + 1;

            // Capture pool values
            const historyPoint: any = { tick: nextTick, ...stats };
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

    const handleStepForward = useCallback(() => {
        // Pause if currently playing
        if (simState.isPlaying) {
            setSimState(s => ({ ...s, isPlaying: false }));
        }
        processTick();
    }, [simState.isPlaying, processTick]);

    const resetSimulation = useCallback(() => {
        setSimState({ isPlaying: false, tick: 0, history: [] });
        // Reset pool values to 0
        setNodes((nds) => nds.map(n => ({ ...n, data: { ...n.data, value: 0 } })));
    }, [setNodes]);

    const togglePlay = useCallback(() => {
        setSimState(s => ({ ...s, isPlaying: !s.isPlaying }));
    }, []);

    // Simulation Loop
    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval>;

        if (simState.isPlaying) {
            intervalId = setInterval(processTick, TICK_RATE_MS);
        }

        return () => clearInterval(intervalId);
    }, [simState.isPlaying, processTick]);

    return {
        simState,
        setSimState,
        togglePlay,
        stepForward: handleStepForward,
        resetSimulation
    };
};
