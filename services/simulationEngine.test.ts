import { describe, it, expect } from 'vitest';
import { runSimulationTick } from './simulationEngine';
import { NodeType, EcoNode, EcoEdge } from '../types';

describe('runSimulationTick', () => {
    it('should generate resources from Source nodes', () => {
        const nodes: EcoNode[] = [
            {
                id: 'source-1',
                type: NodeType.SOURCE,
                position: { x: 0, y: 0 },
                data: { label: 'Source', rate: 5, value: 0, id: 'source-1' }
            },
            {
                id: 'pool-1',
                type: NodeType.POOL,
                position: { x: 100, y: 0 },
                data: { label: 'Pool', value: 0, rate: 0, id: 'pool-1' }
            }
        ];

        const edges: EcoEdge[] = [
            {
                id: 'e1',
                source: 'source-1',
                target: 'pool-1',
                data: { rate: 1 } // Edge rate is usually for visual or capacity, source generation is on node
            }
        ];

        const { nextNodes } = runSimulationTick(nodes, edges);
        const pool = nextNodes.find(n => n.id === 'pool-1');

        // Source generates 5, adds to pool
        expect(pool?.data.value).toBe(5);
    });

    it('should respect source generation randomness', () => {
        // Mocking Math.random would be ideal, but for now we check bounds if applicable
        // implementation uses: if (data.isRandom && data.rateMax)
        const nodes: EcoNode[] = [
            {
                id: 'source-1',
                type: NodeType.SOURCE,
                position: { x: 0, y: 0 },
                data: { label: 'Source', rate: 5, rateMax: 10, isRandom: true, value: 0, id: 'source-1' }
            },
            {
                id: 'pool-1',
                type: NodeType.POOL,
                position: { x: 100, y: 0 },
                data: { label: 'Pool', value: 0, rate: 0, id: 'pool-1' }
            }
        ];

        const edges: EcoEdge[] = [{ id: 'e1', source: 'source-1', target: 'pool-1', data: { rate: 1 } }];

        const { nextNodes } = runSimulationTick(nodes, edges);
        const pool = nextNodes.find(n => n.id === 'pool-1');

        expect(pool?.data.value).toBeGreaterThanOrEqual(5);
        expect(pool?.data.value).toBeLessThanOrEqual(10);
    });

    it('should convert resources correctly (1:1 ratio)', () => {
        const nodes: EcoNode[] = [
            {
                id: 'pool-source',
                type: NodeType.POOL,
                position: { x: 0, y: 0 },
                data: { label: 'Input', value: 10, rate: 0, id: 'pool-source' }
            },
            {
                id: 'converter',
                type: NodeType.CONVERTER,
                position: { x: 50, y: 0 },
                data: { label: 'Conv', rate: 1, value: 0, id: 'converter' } // rate=1 means 1 execution per tick
            },
            {
                id: 'pool-target',
                type: NodeType.POOL,
                position: { x: 100, y: 0 },
                data: { label: 'Output', value: 0, rate: 0, id: 'pool-target' }
            }
        ];

        const edges: EcoEdge[] = [
            { id: 'e1', source: 'pool-source', target: 'converter', data: { rate: 2 } }, // Needs 2 input
            { id: 'e2', source: 'converter', target: 'pool-target', data: { rate: 3 } }  // Produces 3 output
        ];

        const { nextNodes } = runSimulationTick(nodes, edges);

        const inputPool = nextNodes.find(n => n.id === 'pool-source');
        const outputPool = nextNodes.find(n => n.id === 'pool-target');

        // Consumed 2, Produced 3
        expect(inputPool?.data.value).toBe(8); // 10 - 2
        expect(outputPool?.data.value).toBe(3); // 0 + 3
    });

    it('should NOT convert if input is insufficient', () => {
        const nodes: EcoNode[] = [
            {
                id: 'pool-source',
                type: NodeType.POOL,
                position: { x: 0, y: 0 },
                data: { label: 'Input', value: 1, rate: 0, id: 'pool-source' } // Only 1 available
            },
            {
                id: 'converter',
                type: NodeType.CONVERTER,
                position: { x: 50, y: 0 },
                data: { label: 'Conv', rate: 1, value: 0, id: 'converter' }
            },
            {
                id: 'pool-target',
                type: NodeType.POOL,
                position: { x: 100, y: 0 },
                data: { label: 'Output', value: 0, rate: 0, id: 'pool-target' }
            }
        ];

        const edges: EcoEdge[] = [
            { id: 'e1', source: 'pool-source', target: 'converter', data: { rate: 2 } }, // Needs 2
            { id: 'e2', source: 'converter', target: 'pool-target', data: { rate: 1 } }
        ];

        const { nextNodes, stats } = runSimulationTick(nodes, edges);

        const inputPool = nextNodes.find(n => n.id === 'pool-source');
        const outputPool = nextNodes.find(n => n.id === 'pool-target');

        expect(inputPool?.data.value).toBe(1); // Unchanged
        expect(outputPool?.data.value).toBe(0); // Unchanged
        expect(stats['converter:rate']).toBe(0); // 0 executions
    });

    it('should drain resources', () => {
        const nodes: EcoNode[] = [
            {
                id: 'pool-1',
                type: NodeType.POOL,
                position: { x: 0, y: 0 },
                data: { label: 'Pool', value: 10, rate: 0, id: 'pool-1' }
            },
            {
                id: 'drain-1',
                type: NodeType.DRAIN,
                position: { x: 100, y: 0 },
                data: { label: 'Drain', rate: 3, value: 0, id: 'drain-1' }
            }
        ];

        const edges: EcoEdge[] = [
            { id: 'e1', source: 'pool-1', target: 'drain-1', data: { rate: 1 } }
        ];

        const { nextNodes } = runSimulationTick(nodes, edges);
        const pool = nextNodes.find(n => n.id === 'pool-1');

        expect(pool?.data.value).toBe(7); // 10 - 3
    });

    it('should respect pool capacity', () => {
        const nodes: EcoNode[] = [
            {
                id: 'source-1',
                type: NodeType.SOURCE,
                position: { x: 0, y: 0 },
                data: { label: 'Source', rate: 10, value: 0, id: 'source-1' }
            },
            {
                id: 'pool-1',
                type: NodeType.POOL,
                position: { x: 100, y: 0 },
                data: { label: 'Pool', value: 95, capacity: 100, rate: 0, id: 'pool-1' }
            }
        ];

        const edges: EcoEdge[] = [{ id: 'e1', source: 'source-1', target: 'pool-1', data: { rate: 1 } }];

        const { nextNodes } = runSimulationTick(nodes, edges);
        const pool = nextNodes.find(n => n.id === 'pool-1');

        // 95 + 10 = 105, but capped at 100
        expect(pool?.data.value).toBe(100);
    });
});
