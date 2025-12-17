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
 * Returns a NEW array of nodes with updated values and execution stats.
 */
export const runSimulationTick = (nodes: EcoNode[], edges: EcoEdge[]): { nextNodes: EcoNode[], stats: Record<string, number> } => {
  // Deep copy nodes to avoid direct mutation of state during calculation
  const nextNodes = nodes.map(node => ({
    ...node,
    data: { ...node.data }
  }));

  const stats: Record<string, number> = {};

  // Create a map for quick access
  const nodeMap = new Map<string, EcoNode>();
  nextNodes.forEach(n => nodeMap.set(n.id, n));

  // Helper to find connections
  const getSources = (targetId: string) => edges.filter(e => e.target === targetId);
  const getTargets = (sourceId: string) => edges.filter(e => e.source === sourceId);

  // 0. Process Register Nodes (Formulas) - Calculate signals first
  const registers = nextNodes.filter(n => n.type === NodeType.REGISTER);

  // Sort registers to handle simple dependencies? (For now, assumes acyclic or single-pass order)
  // To strictly support chains (A->B->C), we might need topological sort, but for now simple pass.
  registers.forEach(reg => {
    const inputEdges = getSources(reg.id);
    const variables: Record<string, number> = {};

    inputEdges.forEach(edge => {
      const sourceNode = nodeMap.get(edge.source);
      if (sourceNode && edge.data?.variableName) {
        // Get value based on source type
        let val = 0;
        if (sourceNode.type === NodeType.POOL || sourceNode.type === NodeType.REGISTER) {
          val = sourceNode.data.value;
        } else if (sourceNode.type === NodeType.SOURCE) {
          val = sourceNode.data.rate; // Source gives its rate as a value signal
        }
        variables[edge.data.variableName] = val;
      }
    });

    // Evaluate Formula
    if (reg.data.formula) {
      try {
        // Create function with variable names
        const varNames = Object.keys(variables);
        const varValues = Object.values(variables);

        // Allow math functions in formula without "Math." prefix if desired, or just standard JS
        // "return a * b"
        const func = new Function(...varNames, `return ${reg.data.formula};`);
        const result = func(...varValues);

        // Convert boolean to 1/0, ensure number
        reg.data.value = Number(result);
      } catch (e) {
        // console.warn(`Formula error in node ${reg.id}:`, e);
        reg.data.value = 0; // Default to 0 on error
      }
    } else {
      // If no formula, maybe just sum inputs? or 0.
      reg.data.value = 0;
    }
  });

  // 1. Process Converters
  const converters = nextNodes.filter(n => n.type === NodeType.CONVERTER);

  converters.forEach(converter => {
    const inputEdges = getSources(converter.id);
    const outputEdges = getTargets(converter.id);

    // Throughput: How many times to ATTEMPT to run the recipe per tick
    const key = `${converter.id}:rate`;
    stats[key] = 0; // Initialize throughput stat

    const maxAttempts = Math.max(1, calculateValue(converter.data));

    for (let i = 0; i < maxAttempts; i++) {
      let canConvert = true;

      // --- Validation Phase ---
      const currentIterationCosts = new Map<string, number>();

      for (const edge of inputEdges) {
        const sourceNode = nodeMap.get(edge.source);
        const requiredAmount = calculateValue(edge.data || { rate: 1 });

        // Store the cost for the execution phase
        currentIterationCosts.set(edge.id, requiredAmount);

        if (sourceNode) {
          if (sourceNode.type === NodeType.POOL) {
            if (sourceNode.data.value < requiredAmount) {
              canConvert = false;
              break;
            }
          } else if (sourceNode.type === NodeType.REGISTER) {
            // Register acts as a gate/signal. value must be >= requiredAmount
            if (sourceNode.data.value < requiredAmount) {
              canConvert = false;
              break;
            }
          }
        }
      }

      if (canConvert && inputEdges.length > 0 && outputEdges.length > 0) {
        // --- Execution Phase ---
        stats[key]++; // Increment successful throughput

        // 1. Consume Inputs
        inputEdges.forEach(edge => {
          const sourceNode = nodeMap.get(edge.source);
          const amount = currentIterationCosts.get(edge.id) || 1;

          if (sourceNode && sourceNode.type === NodeType.POOL) {
            sourceNode.data.value -= amount;
          }
          // Registers are NOT consumed
        });

        // 2. Produce Outputs
        outputEdges.forEach(edge => {
          const targetNode = nodeMap.get(edge.target);
          const amount = calculateValue(edge.data || { rate: 1 });

          if (targetNode && targetNode.type === NodeType.POOL) {
            targetNode.data.value += amount;
            if (targetNode.data.capacity && targetNode.data.value > targetNode.data.capacity) {
              targetNode.data.value = targetNode.data.capacity;
            }
          }
        });
      } else {
        // Blockage or shortage stops this converter for this tick
        break;
      }
    }
  });

  // 2. Process Sources
  const sources = nextNodes.filter(n => n.type === NodeType.SOURCE);
  sources.forEach(source => {
    const generatedAmount = calculateValue(source.data);

    const targets = getTargets(source.id);
    targets.forEach(edge => {
      const targetNode = nodeMap.get(edge.target);

      if (targetNode && targetNode.type === NodeType.POOL) {
        targetNode.data.value += generatedAmount;
        if (targetNode.data.capacity && targetNode.data.value > targetNode.data.capacity) {
          targetNode.data.value = targetNode.data.capacity;
        }
      }
    });
  });

  // 3. Process Drains
  const drains = nextNodes.filter(n => n.type === NodeType.DRAIN);
  drains.forEach(drain => {
    const drainAmount = calculateValue(drain.data);

    const inputs = getSources(drain.id);
    inputs.forEach(edge => {
      const sourceNode = nodeMap.get(edge.source);
      if (sourceNode && sourceNode.type === NodeType.POOL) {
        sourceNode.data.value = Math.max(0, sourceNode.data.value - drainAmount);
      }
    });
  });


  // 4. Process Splitters (Distribute resources)
  const splitters = nextNodes.filter(n => n.type === NodeType.SPLITTER);
  splitters.forEach(splitter => {
    const throughput = calculateValue(splitter.data);
    const inputs = getSources(splitter.id);
    const outputs = getTargets(splitter.id);

    if (inputs.length === 0 || outputs.length === 0) return;

    // Pull resources from inputs up to throughput
    let gathered = 0;

    // Simple strategy: Try to fill 'throughput' by draining inputs sequentially
    for (const edge of inputs) {
      if (gathered >= throughput) break;
      const sourceNode = nodeMap.get(edge.source);
      if (sourceNode) {
        if (sourceNode.type === NodeType.POOL) {
          const available = sourceNode.data.value;
          const canTake = Math.min(available, throughput - gathered);

          sourceNode.data.value -= canTake;
          gathered += canTake;
        } else if (sourceNode.type === NodeType.REGISTER) {
          // Registers contribute specific amount (value) without being consumed
          // Use minimal logic here: Register gives 'value' amount towards throughput
          const available = sourceNode.data.value;
          const canTake = Math.min(available, throughput - gathered);
          gathered += canTake;
        }
      }
    }

    if (gathered > 0) {
      // Distribute to outputs equally
      const baseAmount = Math.floor(gathered / outputs.length);
      let remainder = gathered % outputs.length;

      outputs.forEach(edge => {
        const targetNode = nodeMap.get(edge.target);
        if (targetNode && targetNode.type === NodeType.POOL) {
          let amount = baseAmount;
          if (remainder > 0) {
            amount += 1;
            remainder--;
          }

          targetNode.data.value += amount;
          if (targetNode.data.capacity && targetNode.data.value > targetNode.data.capacity) {
            targetNode.data.value = targetNode.data.capacity;
          }
        }
      });

      // Update stats for visualization (active rate)
      stats[`${splitter.id}:rate`] = gathered;
    }
  });

  // 5. Process Mergers (Combine resources)
  const mergers = nextNodes.filter(n => n.type === NodeType.MERGER);
  mergers.forEach(merger => {
    const throughput = calculateValue(merger.data);
    const inputs = getSources(merger.id);
    const outputs = getTargets(merger.id);

    if (inputs.length === 0 || outputs.length === 0) return;

    // Pull resources from inputs up to throughput
    let gathered = 0;

    for (const edge of inputs) {
      if (gathered >= throughput) break;
      const sourceNode = nodeMap.get(edge.source);
      if (sourceNode) {
        if (sourceNode.type === NodeType.POOL) {
          const available = sourceNode.data.value;
          const canTake = Math.min(available, throughput - gathered);

          sourceNode.data.value -= canTake;
          gathered += canTake;
        } else if (sourceNode.type === NodeType.REGISTER) {
          const available = sourceNode.data.value;
          const canTake = Math.min(available, throughput - gathered);
          gathered += canTake;
        }
      }
    }

    if (gathered > 0) {
      // Reuse Splitter distribution logic for Merger outputs (N -> M support)
      const baseAmount = Math.floor(gathered / outputs.length);
      let remainder = gathered % outputs.length;

      outputs.forEach(edge => {
        const targetNode = nodeMap.get(edge.target);
        if (targetNode && targetNode.type === NodeType.POOL) {
          let amount = baseAmount;
          if (remainder > 0) {
            amount += 1;
            remainder--;
          }

          targetNode.data.value += amount;
          if (targetNode.data.capacity && targetNode.data.value > targetNode.data.capacity) {
            targetNode.data.value = targetNode.data.capacity;
          }
        }
      });

      stats[`${merger.id}:rate`] = gathered;
    }
  });

  return { nextNodes, stats };
};