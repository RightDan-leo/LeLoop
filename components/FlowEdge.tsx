import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { EdgeData } from '../types';

export const FlowEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
    label,
}: EdgeProps<EdgeData>) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    // Default rate is 1 if not specified
    const rate = data?.rate || 1;

    // 1. Dynamic Stroke Width: 2px base + (rate scaling), capped at 8px
    const strokeWidth = Math.min(8, Math.max(2, 2 + Math.log2(rate)));

    // 2. Dynamic Animation Speed: Higher rate = faster
    // React Flow default 'animated' class uses 'animation: dashdraw 0.5s linear infinite;'
    // effective duration = 1s / sqrt(rate)
    const animationDuration = `${Math.max(0.2, 1.5 / Math.sqrt(rate))}s`;

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    strokeWidth,
                    animationDuration,
                }}
            />

            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            fontSize: 12,
                            pointerEvents: 'all',
                        }}
                        className="nodrag nopan"
                    >
                        <div
                            className="bg-slate-800 text-slate-400 border border-slate-600 px-1.5 py-0.5 rounded text-xs font-semibold shadow-sm"
                        >
                            {label}
                        </div>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
};
