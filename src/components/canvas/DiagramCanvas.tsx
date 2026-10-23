/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DiagramNode, DiagramEdge, Collaborator, UserRole } from '../../types/diagram';
import { NodeRenderer } from './NodeRenderer';
import { EdgeRenderer } from './EdgeRenderer';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Magnet,
  Trash2,
  Plus,
  Compass,
} from 'lucide-react';

interface DiagramCanvasProps {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  collaborators: Collaborator[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  userRole: UserRole;
  theme: 'dark' | 'light';
  onSelectNode: (nodeId: string | null) => void;
  onSelectEdge: (edgeId: string | null) => void;
  onUpdateNodes: (nodes: DiagramNode[]) => void;
  onAddEdge: (edge: DiagramEdge) => void;
  onDeleteSelected: () => void;
  onDrillDown: (pageId: string) => void;
  onOpenDoc: (node: DiagramNode) => void;
  onDropNewShape: (shapeTemplateId: string, canvasX: number, canvasY: number) => void;
  onUpdateNodeLabel?: (nodeId: string, label: string) => void;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({
  nodes,
  edges,
  collaborators,
  selectedNodeId,
  selectedEdgeId,
  userRole,
  theme,
  onSelectNode,
  onSelectEdge,
  onUpdateNodes,
  onAddEdge,
  onDeleteSelected,
  onDrillDown,
  onOpenDoc,
  onDropNewShape,
  onUpdateNodeLabel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Viewport transformation
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Grid & Snap options
  const [gridSnap, setGridSnap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  // Node Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialChildPositions, setInitialChildPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Node Resizing state
  const [resizing, setResizing] = useState<{
    nodeId: string;
    direction: 'se' | 'e' | 's' | 'sw' | 'ne' | 'nw' | 'n' | 'w';
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialWidth: number;
    initialHeight: number;
  } | null>(null);

  // Edge drawing state
  const [connectingFrom, setConnectingFrom] = useState<{
    nodeId: string;
    anchor: 'top' | 'right' | 'bottom' | 'left';
  } | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState({ x: 0, y: 0 });

  const isReadOnly = userRole === 'viewer';

  // Start Resizing a node from handles
  const handleStartResize = (
    nodeId: string,
    direction: 'se' | 'e' | 's' | 'sw' | 'ne' | 'nw' | 'n' | 'w',
    e: React.MouseEvent
  ) => {
    if (isReadOnly) return;
    const targetNode = nodes.find(n => n.id === nodeId);
    if (!targetNode) return;
    const canvasCoords = screenToCanvasCoords(e.clientX, e.clientY);
    setResizing({
      nodeId,
      direction,
      startX: canvasCoords.x,
      startY: canvasCoords.y,
      initialX: targetNode.x,
      initialY: targetNode.y,
      initialWidth: targetNode.width,
      initialHeight: targetNode.height,
    });
  };

  // Handle Canvas Zooming via wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.4), 2.2);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Zoom towards mouse pointer
      setPan(prev => ({
        x: mouseX - (mouseX - prev.x) * (newZoom / zoom),
        y: mouseY - (mouseY - prev.y) * (newZoom / zoom),
      }));
    }
    setZoom(newZoom);
  };

  // Convert Screen pixel coordinates to Canvas coordinates
  const screenToCanvasCoords = useCallback((screenX: number, screenY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (screenX - rect.left - pan.x) / zoom,
      y: (screenY - rect.top - pan.y) / zoom,
    };
  }, [pan, zoom]);

  // Handle Drag & Drop of new shapes onto Canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    const shapeId = e.dataTransfer.getData('application/x-shape-template');
    if (shapeId) {
      const coords = screenToCanvasCoords(e.clientX, e.clientY);
      const snappedX = gridSnap ? Math.round(coords.x / 20) * 20 : coords.x;
      const snappedY = gridSnap ? Math.round(coords.y / 20) * 20 : coords.y;
      onDropNewShape(shapeId, Math.max(20, snappedX), Math.max(20, snappedY));
    }
  };

  // Direct Node Mouse Down for robust dragging & selection
  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    onSelectNode(nodeId);
    onSelectEdge(null);

    if (isReadOnly) return;

    const clickedNode = nodes.find(n => n.id === nodeId);
    if (clickedNode) {
      const canvasCoords = screenToCanvasCoords(e.clientX, e.clientY);
      setDraggingNodeId(nodeId);
      setDragOffset({
        x: canvasCoords.x - clickedNode.x,
        y: canvasCoords.y - clickedNode.y,
      });

      // If this node is a group container, capture all child node positions for synced movement!
      if (clickedNode.isGroup) {
        const children: Record<string, { x: number; y: number }> = {};
        nodes.filter(n => n.parentId === clickedNode.id).forEach(c => {
          children[c.id] = { x: c.x, y: c.y };
        });
        setInitialChildPositions(children);
      }
    }
  };

  // Mouse Down on Canvas (Pan or background click)
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isBackground =
      target === containerRef.current ||
      target.id === 'canvas-background' ||
      target.id === 'canvas-background-rect' ||
      target.tagName === 'svg' ||
      target.tagName === 'rect';

    if (e.button === 1 || (e.button === 0 && isBackground)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      onSelectNode(null);
      onSelectEdge(null);
      return;
    }
  };

  // Window-level mouse move and mouse up listeners while dragging, resizing, or panning
  useEffect(() => {
    if (!isPanning && !draggingNodeId && !resizing) return;

    const onWindowMouseMove = (e: MouseEvent) => {
      const canvasCoords = screenToCanvasCoords(e.clientX, e.clientY);
      setCurrentMousePos(canvasCoords);

      if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
        return;
      }

      // Handle Node Resizing
      if (resizing && !isReadOnly) {
        const nodeIndex = nodes.findIndex(n => n.id === resizing.nodeId);
        if (nodeIndex !== -1) {
          const deltaX = canvasCoords.x - resizing.startX;
          const deltaY = canvasCoords.y - resizing.startY;
          let newX = resizing.initialX;
          let newY = resizing.initialY;
          let newWidth = resizing.initialWidth;
          let newHeight = resizing.initialHeight;

          const minWidth = 80;
          const minHeight = 40;

          switch (resizing.direction) {
            case 'se':
              newWidth = Math.max(minWidth, resizing.initialWidth + deltaX);
              newHeight = Math.max(minHeight, resizing.initialHeight + deltaY);
              break;
            case 'e':
              newWidth = Math.max(minWidth, resizing.initialWidth + deltaX);
              break;
            case 's':
              newHeight = Math.max(minHeight, resizing.initialHeight + deltaY);
              break;
            case 'sw':
              newWidth = Math.max(minWidth, resizing.initialWidth - deltaX);
              newX = resizing.initialX + (resizing.initialWidth - newWidth);
              newHeight = Math.max(minHeight, resizing.initialHeight + deltaY);
              break;
            case 'ne':
              newWidth = Math.max(minWidth, resizing.initialWidth + deltaX);
              newHeight = Math.max(minHeight, resizing.initialHeight - deltaY);
              newY = resizing.initialY + (resizing.initialHeight - newHeight);
              break;
            case 'nw':
              newWidth = Math.max(minWidth, resizing.initialWidth - deltaX);
              newX = resizing.initialX + (resizing.initialWidth - newWidth);
              newHeight = Math.max(minHeight, resizing.initialHeight - deltaY);
              newY = resizing.initialY + (resizing.initialHeight - newHeight);
              break;
            case 'n':
              newHeight = Math.max(minHeight, resizing.initialHeight - deltaY);
              newY = resizing.initialY + (resizing.initialHeight - newHeight);
              break;
            case 'w':
              newWidth = Math.max(minWidth, resizing.initialWidth - deltaX);
              newX = resizing.initialX + (resizing.initialWidth - newWidth);
              break;
          }

          if (gridSnap) {
            newWidth = Math.round(newWidth / 20) * 20;
            newHeight = Math.round(newHeight / 20) * 20;
            newX = Math.round(newX / 20) * 20;
            newY = Math.round(newY / 20) * 20;
          }

          const updatedNodes = [...nodes];
          updatedNodes[nodeIndex] = {
            ...updatedNodes[nodeIndex],
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
          };
          onUpdateNodes(updatedNodes);
        }
        return;
      }

      // Handle Node Dragging
      if (draggingNodeId && !isReadOnly) {
        const nodeIndex = nodes.findIndex(n => n.id === draggingNodeId);
        if (nodeIndex !== -1) {
          const currentNode = nodes[nodeIndex];
          let newX = canvasCoords.x - dragOffset.x;
          let newY = canvasCoords.y - dragOffset.y;

          if (gridSnap) {
            newX = Math.round(newX / 20) * 20;
            newY = Math.round(newY / 20) * 20;
          }

          const deltaX = newX - currentNode.x;
          const deltaY = newY - currentNode.y;

          const updatedNodes = [...nodes];
          updatedNodes[nodeIndex] = { ...currentNode, x: newX, y: newY };

          // Synchronously move all nested child nodes if moving a group container!
          if (currentNode.isGroup) {
            nodes.forEach((n, idx) => {
              if (n.parentId === currentNode.id) {
                updatedNodes[idx] = {
                  ...n,
                  x: n.x + deltaX,
                  y: n.y + deltaY,
                };
              }
            });
          }

          onUpdateNodes(updatedNodes);
        }
      }
    };

    const onWindowMouseUp = (e: MouseEvent) => {
      if (isPanning) {
        setIsPanning(false);
      }

      if (resizing) {
        setResizing(null);
      }

      if (draggingNodeId && !isReadOnly) {
        const movedNode = nodes.find(n => n.id === draggingNodeId);
        if (movedNode && !movedNode.isGroup) {
          const enclosingGroup = nodes.find(
            g =>
              g.isGroup &&
              g.id !== movedNode.id &&
              movedNode.x >= g.x &&
              movedNode.y >= g.y &&
              movedNode.x + movedNode.width <= g.x + g.width &&
              movedNode.y + movedNode.height <= g.y + g.height
          );

          if (enclosingGroup && movedNode.parentId !== enclosingGroup.id) {
            const updated = nodes.map(n =>
              n.id === movedNode.id ? { ...n, parentId: enclosingGroup.id } : n
            );
            onUpdateNodes(updated);
          }
        }
        setDraggingNodeId(null);
      }
    };

    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
    };
  }, [
    isPanning,
    panStart,
    draggingNodeId,
    dragOffset,
    resizing,
    gridSnap,
    isReadOnly,
    nodes,
    onUpdateNodes,
    screenToCanvasCoords,
  ]);

  // Local canvas mouse move for cursor position and edge drawing
  const handleMouseMove = (e: React.MouseEvent) => {
    const canvasCoords = screenToCanvasCoords(e.clientX, e.clientY);
    setCurrentMousePos(canvasCoords);
  };

  // Local mouse up on canvas (e.g., finishing edge drawing)
  const handleMouseUp = (e: React.MouseEvent) => {
    if (connectingFrom && !isReadOnly) {
      const targetElement = (e.target as HTMLElement).closest('[id^="node-"]');
      if (targetElement) {
        const targetNodeId = targetElement.id.replace('node-', '');
        if (targetNodeId !== connectingFrom.nodeId) {
          const newEdge: DiagramEdge = {
            id: `edge-${Date.now()}`,
            sourceNodeId: connectingFrom.nodeId,
            targetNodeId,
            sourceAnchor: connectingFrom.anchor,
            targetAnchor: 'left',
            type: 'orthogonal',
            lineStyle: 'solid',
            markerStart: 'none',
            markerEnd: 'arrow',
          };
          onAddEdge(newEdge);
        }
      }
      setConnectingFrom(null);
    }
  };

  // Keyboard shortcut listener (Delete selected node)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isReadOnly) {
        // Ensure not typing in input or textarea
        if (
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA'
        ) {
          if (selectedNodeId || selectedEdgeId) {
            e.preventDefault();
            onDeleteSelected();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedEdgeId, isReadOnly, onDeleteSelected]);

  return (
    <div
      ref={containerRef}
      id="canvas-container"
      className="relative flex-1 w-full h-full overflow-hidden bg-slate-950 select-none cursor-default"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Interactive Floating Canvas Toolbar */}
      <div className="absolute top-4 left-6 z-30 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-1.5 shadow-xl backdrop-blur-md">
        <button
          onClick={() => setZoom(z => Math.max(z - 0.15, 0.4))}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded cursor-pointer transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono text-slate-300 px-1 min-w-[45px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(z => Math.min(z + 0.15, 2.2))}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded cursor-pointer transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-slate-700 mx-1" />
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded cursor-pointer transition-colors"
          title="Reset View (100%)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowGrid(g => !g)}
          className={`p-1.5 rounded cursor-pointer transition-colors ${
            showGrid ? 'bg-blue-600/30 text-blue-400' : 'hover:bg-slate-800 text-slate-400'
          }`}
          title="Toggle Canvas Grid"
        >
          <Grid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setGridSnap(s => !s)}
          className={`p-1.5 rounded cursor-pointer transition-colors ${
            gridSnap ? 'bg-emerald-600/30 text-emerald-400' : 'hover:bg-slate-800 text-slate-400'
          }`}
          title="Toggle Grid Snapping"
        >
          <Magnet className="w-4 h-4" />
        </button>
        {selectedNodeId && !isReadOnly && (
          <>
            <div className="w-[1px] h-4 bg-slate-700 mx-1" />
            <button
              onClick={onDeleteSelected}
              className="p-1.5 hover:bg-rose-500/20 text-rose-400 rounded cursor-pointer transition-colors"
              title="Delete Selected Shape (Del)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* SVG Canvas Root for Lines, Connectors & Grid */}
      <svg
        id="canvas-background"
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <defs>
          {/* Dot Grid Pattern */}
          <pattern
            id="canvas-dot-grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.2" fill={showGrid ? '#334155' : 'transparent'} />
          </pattern>

          {/* Standard Arrow Marker */}
          <marker
            id="marker-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#94a3b8" />
          </marker>

          {/* Crow's Foot: Zero or Many (0..*) */}
          <marker
            id="marker-crow-many"
            viewBox="0 0 16 16"
            refX="14"
            refY="8"
            markerWidth="10"
            markerHeight="10"
            orient="auto"
          >
            <path d="M 1 8 L 14 2 M 1 8 L 14 8 M 1 8 L 14 14" stroke="#38bdf8" strokeWidth="2" fill="none" />
          </marker>

          {/* Crow's Foot: Exactly One (1) */}
          <marker
            id="marker-crow-one"
            viewBox="0 0 16 16"
            refX="14"
            refY="8"
            markerWidth="10"
            markerHeight="10"
            orient="auto"
          >
            <path d="M 10 2 L 10 14 M 14 2 L 14 14" stroke="#34d399" strokeWidth="2" fill="none" />
          </marker>

          {/* Diamond Marker (UML Composition) */}
          <marker
            id="marker-diamond"
            viewBox="0 0 16 16"
            refX="14"
            refY="8"
            markerWidth="10"
            markerHeight="10"
            orient="auto"
          >
            <polygon points="1,8 8,2 15,8 8,14" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
          </marker>
        </defs>

        {/* Grid Background Rectangle */}
        <rect
          id="canvas-background-rect"
          x="-50000"
          y="-50000"
          width="100000"
          height="100000"
          fill="url(#canvas-dot-grid)"
        />

        {/* Render Edges */}
        {edges.map(edge => {
          const source = nodes.find(n => n.id === edge.sourceNodeId);
          const target = nodes.find(n => n.id === edge.targetNodeId);
          return (
            <EdgeRenderer
              key={edge.id}
              edge={edge}
              sourceNode={source}
              targetNode={target}
              isSelected={selectedEdgeId === edge.id}
              onSelect={onSelectEdge}
            />
          );
        })}

        {/* Temporary Drawing Line while dragging connection handle */}
        {connectingFrom && (
          <line
            x1={(() => {
              const src = nodes.find(n => n.id === connectingFrom.nodeId);
              return src ? src.x + src.width / 2 : currentMousePos.x;
            })()}
            y1={(() => {
              const src = nodes.find(n => n.id === connectingFrom.nodeId);
              return src ? src.y + src.height / 2 : currentMousePos.y;
            })()}
            x2={currentMousePos.x}
            y2={currentMousePos.y}
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeDasharray="5 5"
            markerEnd="url(#marker-arrow)"
          />
        )}
      </svg>

      {/* HTML Layer for High-Fidelity Nodes */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {nodes.map(node => (
          <NodeRenderer
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            isDragging={draggingNodeId === node.id}
            collaborators={collaborators}
            onNodeMouseDown={handleNodeMouseDown}
            onStartResize={handleStartResize}
            onDrillDown={onDrillDown}
            onStartConnection={(nodeId, anchor) => {
              setConnectingFrom({ nodeId, anchor });
            }}
            onOpenDoc={onOpenDoc}
            onUpdateLabel={onUpdateNodeLabel}
            isReadOnly={isReadOnly}
          />
        ))}

        {/* Real-Time Live Collaborator Cursors (Hidden for now as requested) */}
        {/*
        {collaborators.map(c => {
          if (!c.cursorPosition) return null;
          return (
            <div
              key={c.id}
              className="absolute pointer-events-none transition-all duration-300 ease-out z-40"
              style={{
                left: `${c.cursorPosition.x}px`,
                top: `${c.cursorPosition.y}px`,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={c.color}>
                <path d="M5.5 3.2L18.4 12.8L12.2 14.1L8.8 20.8L5.5 3.2Z" stroke="#ffffff" strokeWidth="1.5" />
              </svg>
              <div
                className="mt-1 px-2 py-0.5 rounded text-[10px] font-semibold text-white whitespace-nowrap shadow-lg flex items-center gap-1.5"
                style={{ backgroundColor: c.color }}
              >
                <span>{c.name}</span>
                {c.lastAction && (
                  <span className="opacity-80 font-normal">· {c.lastAction}</span>
                )}
              </div>
            </div>
          );
        })}
        */}
      </div>

      {/* Bottom-Right Minimap Indicator */}
      <div className="absolute bottom-4 right-4 z-30 bg-slate-900/90 border border-slate-800 rounded-lg p-2 shadow-xl backdrop-blur-md hidden sm:block">
        <div className="flex items-center gap-1.5 pb-1 text-[10px] font-mono text-slate-400">
          <Compass className="w-3 h-3 text-blue-400" />
          <span>MINIMAP</span>
        </div>
        <div className="w-32 h-20 bg-slate-950 border border-slate-800 rounded relative overflow-hidden">
          {nodes.map(n => (
            <div
              key={n.id}
              className="absolute rounded-xs bg-blue-500/70"
              style={{
                left: `${Math.min(115, Math.max(2, (n.x / 1400) * 120))}px`,
                top: `${Math.min(70, Math.max(2, (n.y / 900) * 75))}px`,
                width: `${Math.max(4, (n.width / 1400) * 120)}px`,
                height: `${Math.max(3, (n.height / 900) * 75)}px`,
              }}
            />
          ))}
          {/* Viewport boundary indicator */}
          <div
            className="absolute border border-emerald-400/80 bg-emerald-500/10 pointer-events-none rounded-xs"
            style={{
              left: `${Math.max(0, (-pan.x / (1400 * zoom)) * 120)}px`,
              top: `${Math.max(0, (-pan.y / (900 * zoom)) * 75)}px`,
              width: `${Math.min(120, (1000 / (1400 * zoom)) * 120)}px`,
              height: `${Math.min(75, (700 / (900 * zoom)) * 75)}px`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
