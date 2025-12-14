import type { Node, Edge } from 'reactflow';

export enum NodeType {
  SOURCE = 'source',
  POOL = 'pool',
  DRAIN = 'drain',
  CONVERTER = 'converter',
  SPLITTER = 'splitter',
  MERGER = 'merger',
  TEXT = 'text',
}

export interface NodeData {
  label: string;
  // Current resource amount (mainly for Pools)
  value: number;
  // Capacity limit (optional, for Pools)
  capacity?: number;

  // Generation or Consumption rate per tick
  // If isRandom is true, 'rate' is the MINIMUM value, and 'rateMax' is the MAXIMUM.
  rate: number;
  rateMax?: number;
  isRandom?: boolean;

  // For visual tracking in charts (random ID assigned on creation)
  id: string;

  // For Text Node
  fontSize?: number;
}

export interface EdgeData {
  // If isRandom is true, 'rate' is MIN, 'rateMax' is MAX.
  rate: number;
  rateMax?: number;
  isRandom?: boolean;
}

export type EcoNode = Node<NodeData>;
export type EcoEdge = Edge<EdgeData>;

export interface SimulationHistoryPoint {
  tick: number;
  [nodeId: string]: number; // dynamic keys for node values (e.g. "pool-1") and stats (e.g. "conv-1:rate")
}

export interface SimulationState {
  isPlaying: boolean;
  tick: number;
  history: SimulationHistoryPoint[];
}