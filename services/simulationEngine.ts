import { EcoNode, EcoEdge, NodeType } from '../types';

/**
 * Helper to calculate the actual value for a tick based on configuration.
 * Handles fixed values and random ranges.
 */
const calculateValue = (data: { rate: number, rateMax?: number, isRandom?: boolean }): number => {
  if (data.isRandom && data.rateMax !== undefined && data.rateMax >= data.rate) {
    // Return random integer between rate (min) and rateMax (max) inclusive
    return Math.floor(Math.random() * (data.rateMax - data.rate + 1)) + data.rate;
  }
  return data.rate;
};

/**
 * Performs one 'tick' of the simulation.
 * Returns a NEW array of nodes with updated values.
 */
export const runSimulationTick = (nodes: EcoNode[], edges: EcoEdge[]): EcoNode[] => {
  // Deep copy nodes to avoid direct mutation of state during calculation
  const nextNodes = nodes.map(node => ({
    ...node,
    data: { ...node.data }
  }));

  // Create a map for quick access
  const nodeMap = new Map<string, EcoNode>();
  nextNodes.forEach(n => nodeMap.set(n.id, n));

  // Helper to find connections
  const getSources = (targetId: string) => edges.filter(e => e.target === targetId);
  const getTargets = (sourceId: string) => edges.filter(e => e.source === sourceId);

  // 1. Process Converters
  const converters = nextNodes.filter(n => n.type === NodeType.CONVERTER);
  
  converters.forEach(converter => {
    const inputEdges = getSources(converter.id);
    const outputEdges = getTargets(converter.id);
    
    // Throughput: How many times to ATTEMPT to run the recipe per tick
    const throughput = Math.max(1, calculateValue(converter.data));

    for (let i = 0; i < throughput; i++) {
        let canConvert = true;
        
        // --- Validation Phase ---
        // We need to calculate the specific costs for THIS iteration of the recipe.
        // If an edge is random (e.g. 1-3 wood), we determine the cost now.
        const currentIterationCosts = new Map<string, number>();

        for (const edge of inputEdges) {
            const sourceNode = nodeMap.get(edge.source);
            const requiredAmount = calculateValue(edge.data || { rate: 1 });
            
            // Store the cost for the execution phase
            currentIterationCosts.set(edge.id, requiredAmount);

            if (sourceNode && sourceNode.type === NodeType.POOL) {
                if (sourceNode.data.value < requiredAmount) {
                    canConvert = false;
                    break;
                }
            }
        }
        
        if (canConvert && inputEdges.length > 0 && outputEdges.length > 0) {
            // --- Execution Phase ---
            
            // 1. Consume Inputs (using the costs calculated in validation)
            inputEdges.forEach(edge => {
                const sourceNode = nodeMap.get(edge.source);
                const amount = currentIterationCosts.get(edge.id) || 1;
                
                if (sourceNode && sourceNode.type === NodeType.POOL) {
                    sourceNode.data.value -= amount;
                }
            });

            // 2. Produce Outputs
            outputEdges.forEach(edge => {
                const targetNode = nodeMap.get(edge.target);
                // Calculate output amount for this iteration
                const amount = calculateValue(edge.data || { rate: 1 });
                
                if (targetNode && targetNode.type === NodeType.POOL) {
                    targetNode.data.value += amount;
                    // Cap at capacity
                    if (targetNode.data.capacity && targetNode.data.value > targetNode.data.capacity) {
                        targetNode.data.value = targetNode.data.capacity;
                    }
                }
            });
        } else {
            // If we can't convert even once, we stop trying for this converter in this tick
            // (Simulates blockage)
            break;
        }
    }
  });

  // 2. Process Sources (Generate resources -> Push to connected Pools)
  const sources = nextNodes.filter(n => n.type === NodeType.SOURCE);
  sources.forEach(source => {
    // Determine how much this source generates this tick
    const generatedAmount = calculateValue(source.data);

    const targets = getTargets(source.id);
    targets.forEach(edge => {
      const targetNode = nodeMap.get(edge.target);
      
      if (targetNode && targetNode.type === NodeType.POOL) {
        // Add the generated amount to connected pools
        targetNode.data.value += generatedAmount;
        if (targetNode.data.capacity && targetNode.data.value > targetNode.data.capacity) {
            targetNode.data.value = targetNode.data.capacity;
        }
      }
    });
  });

  // 3. Process Drains (Pull from connected Pools -> Consume)
  const drains = nextNodes.filter(n => n.type === NodeType.DRAIN);
  drains.forEach(drain => {
    // Determine how much to drain this tick
    const drainAmount = calculateValue(drain.data);

    const inputs = getSources(drain.id);
    inputs.forEach(edge => {
      const sourceNode = nodeMap.get(edge.source);
      if (sourceNode && sourceNode.type === NodeType.POOL) {
        sourceNode.data.value = Math.max(0, sourceNode.data.value - drainAmount);
      }
    });
  });

  return nextNodes;
};