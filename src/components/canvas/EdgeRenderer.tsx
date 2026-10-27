/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DiagramEdge, DiagramNode } from '../../types/diagram';

interface EdgeRendererProps {
  edge: DiagramEdge;
  sourceNode?: DiagramNode;
  targetNode?: DiagramNode;
  isSelected?: boolean;
  onSelect?: (edgeId: string) => void;
  onContextMenu?: (edgeId: string, e: React.MouseEvent) => void;
}

export const EdgeRenderer: React.FC<EdgeRendererProps> = ({
  edge,
  sourceNode,
  targetNode,
  isSelected,
  onSelect,
  onContextMenu,
}) => {
  if (!sourceNode || !targetNode) return null;

  // Calculate coordinates for source anchor
  const getAnchorCoords = (node: DiagramNode, anchor: 'top' | 'right' | 'bottom' | 'left') => {
    switch (anchor) {
      case 'top':
        return { x: node.x + node.width / 2, y: node.y };
      case 'right':
        return { x: node.x + node.width, y: node.y + node.height / 2 };
      case 'bottom':
        return { x: node.x + node.width / 2, y: node.y + node.height };
      case 'left':
        return { x: node.x, y: node.y + node.height / 2 };
      default:
        return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
    }
  };

  const start = getAnchorCoords(sourceNode, edge.sourceAnchor);
  const end = getAnchorCoords(targetNode, edge.targetAnchor);

  // Generate SVG path string based on edge type
  let pathD = '';
  let midX = (start.x + end.x) / 2;
  let midY = (start.y + end.y) / 2;

  const edgeType = edge.type || 'orthogonal';

  if (edgeType === 'straight') {
    pathD = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  } else if (edgeType === 'curved') {
    // Organic bezier curve (standard for Mind Map, Fishbone)
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const isHorizontal =
      edge.sourceAnchor === 'right' ||
      edge.sourceAnchor === 'left' ||
      Math.abs(dx) > Math.abs(dy);

    if (isHorizontal) {
      const cx1 = start.x + dx * 0.5;
      const cy1 = start.y;
      const cx2 = start.x + dx * 0.5;
      const cy2 = end.y;
      pathD = `M ${start.x} ${start.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${end.x} ${end.y}`;
    } else {
      const cx1 = start.x;
      const cy1 = start.y + dy * 0.5;
      const cx2 = end.x;
      const cy2 = start.y + dy * 0.5;
      pathD = `M ${start.x} ${start.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${end.x} ${end.y}`;
    }
  } else {
    // Orthogonal / Stepped path with 90° corners (standard for ERD, BPMN, Architecture)
    if (edge.sourceAnchor === 'right' || edge.sourceAnchor === 'left') {
      midX = start.x + (end.x - start.x) / 2;
      pathD = `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
      midY = (start.y + end.y) / 2;
    } else {
      midY = start.y + (end.y - start.y) / 2;
      pathD = `M ${start.x} ${start.y} L ${start.x} ${midY} L ${end.x} ${midY} L ${end.x} ${end.y}`;
      midX = (start.x + end.x) / 2;
    }
  }

  // Determine marker
  let markerEndId = 'marker-arrow';
  if (edge.markerEnd === 'crow-foot-many') markerEndId = 'marker-crow-many';
  else if (edge.markerEnd === 'crow-foot-one') markerEndId = 'marker-crow-one';
  else if (edge.markerEnd === 'diamond') markerEndId = 'marker-diamond';
  else if (edge.markerEnd === 'diamond-filled') markerEndId = 'marker-diamond-filled';
  else if (edge.markerEnd === 'circle') markerEndId = 'marker-circle';
  else if (edge.markerEnd === 'none') markerEndId = '';

  const strokeColor = edge.color || (isSelected ? '#38bdf8' : '#94a3b8');
  const strokeDash =
    edge.lineStyle === 'dashed'
      ? '6 4'
      : edge.lineStyle === 'dotted'
      ? '2 3'
      : undefined;

  const styleLabel =
    edgeType === 'curved'
      ? 'Curved (Bezier)'
      : edgeType === 'straight'
      ? 'Straight'
      : 'Corners (Orthogonal)';

  return (
    <g
      className="cursor-pointer group"
      onClick={e => {
        e.stopPropagation();
        onSelect?.(edge.id);
      }}
      onContextMenu={e => {
        if (onContextMenu) {
          e.preventDefault();
          e.stopPropagation();
          onContextMenu(edge.id, e);
        }
      }}
    >
      <title>{`Connector: ${sourceNode.label} → ${targetNode.label} (${styleLabel}) - Click to configure or right-click to flip style`}</title>

      {/* Invisible wider path for easier clicking/hover */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="pointer-events-auto"
      />

      {/* Selection Glow Indicator */}
      {isSelected && (
        <path
          d={pathD}
          fill="none"
          stroke="#38bdf8"
          strokeWidth={(edge.strokeWidth || 2) + 6}
          strokeOpacity={0.25}
          strokeLinecap="round"
          className="pointer-events-none animate-pulse"
        />
      )}

      {/* Visible Path */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={edge.strokeWidth || (isSelected ? 2.5 : 1.75)}
        strokeDasharray={strokeDash}
        markerEnd={markerEndId ? `url(#${markerEndId})` : undefined}
        className="transition-colors group-hover:stroke-sky-400"
      />

      {/* Edge Label (e.g. 1..*, has_many, etc.) */}
      {edge.label && (
        <g transform={`translate(${midX}, ${midY})`} className="pointer-events-auto">
          <rect
            x={-edge.label.length * 3.5 - 6}
            y={-10}
            width={edge.label.length * 7 + 12}
            height={20}
            rx={4}
            fill="#0f172a"
            stroke={isSelected ? '#38bdf8' : '#334155'}
            strokeWidth={1}
            className="shadow-sm"
          />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill={isSelected ? '#38bdf8' : '#cbd5e1'}
            fontSize={11}
            fontWeight="500"
            fontFamily="monospace"
          >
            {edge.label}
          </text>
        </g>
      )}
    </g>
  );
};
