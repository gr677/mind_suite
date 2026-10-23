/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DiagramNode, Collaborator } from '../../types/diagram';
import {
  Table,
  CheckCircle2,
  GitFork,
  Layers,
  ArrowUpRight,
  FileText,
  StickyNote as StickyIcon,
  Clock,
  Sparkles,
  Database,
  Cpu,
  UserCheck,
  Calendar,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';

interface NodeRendererProps {
  node: DiagramNode;
  isSelected: boolean;
  isDragging: boolean;
  collaborators: Collaborator[];
  onNodeMouseDown?: (nodeId: string, e: React.MouseEvent) => void;
  onStartResize?: (
    nodeId: string,
    direction: 'se' | 'e' | 's' | 'sw' | 'ne' | 'nw' | 'n' | 'w',
    e: React.MouseEvent
  ) => void;
  onDrillDown?: (pageId: string) => void;
  onStartConnection?: (nodeId: string, anchor: 'top' | 'right' | 'bottom' | 'left', e: React.MouseEvent) => void;
  onOpenDoc?: (node: DiagramNode) => void;
  onUpdateLabel?: (nodeId: string, newLabel: string) => void;
  isReadOnly?: boolean;
}

export const NodeRenderer: React.FC<NodeRendererProps> = ({
  node,
  isSelected,
  isDragging,
  collaborators,
  onNodeMouseDown,
  onStartResize,
  onDrillDown,
  onStartConnection,
  onOpenDoc,
  onUpdateLabel,
  isReadOnly,
}) => {
  const [isEditingLabel, setIsEditingLabel] = React.useState(false);
  const [editedLabel, setEditedLabel] = React.useState(node.label);
  const activeCollaborator = collaborators.find(c => c.selectedNodeId === node.id);

  // Render anchor handles on hover for wiring connections
  const renderAnchor = (anchor: 'top' | 'right' | 'bottom' | 'left', className: string) => {
    if (isReadOnly) return null;
    return (
      <div
        className={`absolute w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 shadow-md opacity-0 group-hover:opacity-100 hover:scale-125 transition-all z-30 cursor-crosshair ${className}`}
        onMouseDown={e => {
          e.stopPropagation();
          onStartConnection?.(node.id, anchor, e);
        }}
        title={`Connect from ${anchor}`}
      />
    );
  };

  // Node Content based on type
  const renderNodeBody = () => {
    switch (node.type) {
      // 1. ERD Entity Table
      case 'erd-entity': {
        const fields = node.data?.fields || [];
        return (
          <div className="flex flex-col h-full bg-slate-900/95 dark:bg-slate-900/95 border-2 border-sky-500/80 rounded-md shadow-xl overflow-hidden text-xs">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-sky-950/80 border-b border-sky-500/40 text-sky-300 font-semibold tracking-wide">
              <div className="flex items-center gap-1.5 truncate">
                <Table className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">{node.data?.tableName || node.label}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-sky-400/80 font-mono">TABLE</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-sky-900/60 text-sky-300 font-mono">
                  {fields.length} cols
                </span>
              </div>
            </div>
            {/* Fields list */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-1">
              {fields.length === 0 ? (
                <div className="p-2 text-center text-[10px] text-slate-500 italic">
                  No columns defined. Select node to add schema in Inspector.
                </div>
              ) : (
                fields.map((f: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-2 py-1 hover:bg-slate-800/60 font-mono text-[11px] rounded transition-colors group/col"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {f.isPk && (
                        <span className="px-1 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold rounded">
                          PK
                        </span>
                      )}
                      {f.isFk && (
                        <span className="px-1 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-bold rounded">
                          FK
                        </span>
                      )}
                      {f.isUnique && (
                        <span className="px-1 py-0.2 bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[9px] font-bold rounded">
                          UQ
                        </span>
                      )}
                      <span className="text-slate-200 truncate">{f.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0 ml-2">
                      <span>{f.type}</span>
                      {f.isNullable && <span className="text-slate-500 text-[8px] italic">null</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      }

      // 2. BPMN Event (Start, Intermediate, End)
      case 'bpmn-event': {
        const eventType = node.data?.eventType || 'start';
        const isEnd = eventType === 'end';
        return (
          <div
            className={`flex flex-col items-center justify-center h-full rounded-full shadow-lg text-white font-medium p-2 text-center transition-all ${
              isEnd
                ? 'bg-rose-600 border-4 border-rose-900 text-rose-50'
                : 'bg-emerald-600 border-2 border-emerald-400 text-emerald-50'
            }`}
          >
            <span className="text-[11px] leading-tight px-1 font-semibold truncate max-w-[90%]">
              {node.label}
            </span>
          </div>
        );
      }

      // 3. BPMN Task / Sub-Process
      case 'bpmn-task': {
        const isSubprocess = node.data?.taskType === 'subprocess' || !!node.drilldownPageId;
        return (
          <div
            className={`flex flex-col justify-between h-full p-2.5 rounded-lg shadow-xl text-left border-2 transition-all ${
              isSubprocess
                ? 'bg-purple-950/80 border-purple-500/90 text-purple-100 border-dashed'
                : 'bg-slate-900/90 border-blue-500/80 text-slate-100'
            }`}
          >
            <div className="flex items-start justify-between gap-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                {isSubprocess ? <Layers className="w-3 h-3 text-purple-400" /> : <Cpu className="w-3 h-3 text-blue-400" />}
                {node.data?.taskType || 'Task'}
              </span>
              {node.drilldownPageId && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (node.drilldownPageId) onDrillDown?.(node.drilldownPageId);
                  }}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-500/30 hover:bg-purple-500 text-purple-200 hover:text-white rounded text-[10px] font-semibold transition-all cursor-pointer shadow-sm"
                  title="Drill down into sub-process diagram"
                >
                  <ArrowUpRight className="w-3 h-3" />
                  Drill-down
                </button>
              )}
            </div>

            <div className="font-medium text-xs text-slate-100 leading-snug line-clamp-2 my-1">
              {node.label}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-700/50">
              <span>{node.data?.duration || 'Standard SLA'}</span>
              {isSubprocess && <span className="font-mono text-purple-300 font-bold">[ + ]</span>}
            </div>
          </div>
        );
      }

      // 4. BPMN / Flow Gateway (Diamond)
      case 'bpmn-gateway':
      case 'flow-decision': {
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Diamond shape using rotated square */}
            <div className="absolute inset-1.5 rotate-45 bg-amber-600/90 border-2 border-amber-400 rounded-sm shadow-xl flex items-center justify-center" />
            <div className="relative z-10 text-center px-2 text-white font-semibold text-[11px] leading-tight line-clamp-2">
              {node.label}
            </div>
          </div>
        );
      }

      // 5. Swimlane Pool / Container
      case 'swimlane-pool': {
        const lanes: string[] = node.data?.lanes || ['Default Lane'];
        return (
          <div className="flex flex-col h-full border-2 border-blue-500/60 bg-slate-900/40 rounded-lg shadow-sm overflow-hidden pointer-events-auto">
            {/* Pool Header */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-blue-950/70 border-b border-blue-500/40 text-blue-300 font-semibold text-xs tracking-wider">
              <span className="flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-blue-400" />
                {node.label}
              </span>
              <span className="text-[10px] text-blue-400/80 font-mono">POOL CONTAINER</span>
            </div>
            {/* Lanes Visual Breakdown */}
            <div className="flex-1 flex flex-col divide-y divide-blue-500/20">
              {lanes.map((lane, i) => (
                <div key={i} className="flex-1 p-2 bg-slate-950/20 relative">
                  <span className="text-[11px] font-mono uppercase text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                    {lane}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 6. Generic Nested Group Container
      case 'group-container': {
        return (
          <div className="flex flex-col h-full border-2 border-dashed border-slate-500/70 bg-slate-900/30 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-1 border-b border-slate-700/40">
              <span>{node.label}</span>
              <span className="text-[10px] font-mono text-slate-400">NESTED GROUP</span>
            </div>
          </div>
        );
      }

      // 7. UML Class
      case 'uml-class': {
        const attrs = node.data?.attributes || [];
        const methods = node.data?.methods || [];
        return (
          <div className="flex flex-col h-full bg-slate-900/95 border-2 border-cyan-500/80 rounded-md shadow-xl overflow-hidden text-xs">
            <div className="px-3 py-1.5 bg-cyan-950/80 border-b border-cyan-500/40 text-center">
              {node.data?.stereotype && (
                <div className="text-[10px] text-cyan-400/90 font-mono">«{node.data.stereotype}»</div>
              )}
              <div className="font-bold text-cyan-200 truncate">{node.label}</div>
            </div>
            {/* Attributes */}
            <div className="px-2.5 py-1.5 border-b border-slate-800 font-mono text-[11px] text-slate-300 divide-y divide-slate-800/40 max-h-[80px] overflow-y-auto">
              {attrs.map((a: string, i: number) => (
                <div key={i} className="py-0.5 truncate">{a}</div>
              ))}
            </div>
            {/* Methods */}
            <div className="flex-1 px-2.5 py-1.5 font-mono text-[11px] text-slate-300 divide-y divide-slate-800/40 overflow-y-auto">
              {methods.map((m: string, i: number) => (
                <div key={i} className="py-0.5 text-cyan-100/90 truncate">{m}</div>
              ))}
            </div>
          </div>
        );
      }

      // 8. DFD Process (Round bubble)
      case 'dfd-process': {
        return (
          <div className="flex flex-col items-center justify-center h-full rounded-full bg-sky-900/90 border-2 border-sky-400 text-sky-100 p-3 shadow-xl text-center">
            <span className="text-[10px] font-mono text-sky-300 font-bold">{node.data?.processNumber || '1.0'}</span>
            <span className="text-xs font-semibold leading-tight mt-1 line-clamp-3">{node.label}</span>
          </div>
        );
      }

      // 9. DFD Store (Yourdon Open Box)
      case 'dfd-store': {
        return (
          <div className="flex items-center justify-start h-full bg-slate-900/90 border-y-2 border-amber-400/90 px-3 shadow-lg">
            <span className="font-mono text-xs font-bold text-amber-400 mr-2 border-r border-amber-500/40 pr-2">
              {node.data?.storeId || 'D1'}
            </span>
            <span className="text-xs font-medium text-slate-200 truncate">{node.label}</span>
          </div>
        );
      }

      // 10. DFD External Entity
      case 'dfd-entity': {
        return (
          <div className="flex items-center justify-center h-full bg-slate-800/90 border-2 border-slate-400 rounded p-2 text-center shadow-lg">
            <span className="text-xs font-semibold text-slate-200">{node.label}</span>
          </div>
        );
      }

      // 11. IDEF0 Box
      case 'idef0-box': {
        return (
          <div className="flex flex-col justify-between h-full bg-slate-900/95 border-2 border-blue-500 rounded p-3 text-left shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 font-mono">{node.data?.boxNumber || 'A0'}</span>
              <span className="text-[9px] font-mono text-slate-400">IDEF0 FUNCTION</span>
            </div>
            <div className="text-xs font-semibold text-slate-100 my-auto text-center px-1">
              {node.label}
            </div>
            <div className="text-[9px] text-slate-400 flex justify-between border-t border-slate-800 pt-1">
              <span>I/C</span>
              <span>O/M</span>
            </div>
          </div>
        );
      }

      // 12. CEQA Phase Box
      case 'ceqa-phase':
      case 'ceqa-review':
      case 'ceqa-eir': {
        return (
          <div className="flex flex-col justify-between h-full bg-slate-900/95 border-2 border-emerald-500/90 rounded-lg p-2.5 shadow-xl text-left">
            <div className="flex items-center justify-between text-[10px]">
              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded font-mono">
                {node.data?.phaseNumber || 'CEQA'}
              </span>
              <span className="text-slate-400 font-mono text-[9px] truncate max-w-[100px]">
                {node.data?.statute || 'CEQA § 15000'}
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-100 my-1 line-clamp-2">
              {node.label}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-amber-300 font-mono pt-1 border-t border-slate-800">
              <Clock className="w-3 h-3 shrink-0" />
              <span className="truncate">{node.data?.deadline || 'Statutory review'}</span>
            </div>
          </div>
        );
      }

      // 13. SIPOC Card
      case 'sipoc-card': {
        const items = node.data?.items || [];
        return (
          <div className="flex flex-col h-full bg-slate-900/95 border-2 border-amber-500/80 rounded-lg shadow-xl overflow-hidden text-xs">
            <div className="px-2.5 py-1.5 bg-amber-950/80 border-b border-amber-500/40 font-bold text-amber-300 text-center tracking-wider">
              {node.label}
            </div>
            <div className="flex-1 p-2 space-y-1.5 overflow-y-auto">
              {items.map((item: string, idx: number) => (
                <div key={idx} className="p-1.5 bg-slate-800/80 rounded border border-slate-700/60 text-[11px] text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 14. PERT Activity Node (6-Quadrant)
      case 'pert-activity': {
        const isCritical = node.data?.isCritical;
        return (
          <div
            className={`flex flex-col h-full bg-slate-900 border-2 rounded-md shadow-2xl overflow-hidden text-xs ${
              isCritical ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-blue-500'
            }`}
          >
            {/* Top row: ES | Duration | EF */}
            <div className="grid grid-cols-3 text-center border-b border-slate-800 bg-slate-950 text-[10px] font-mono py-0.5">
              <div className="border-r border-slate-800 text-sky-400" title="Early Start (ES)">ES: {node.data?.es ?? 0}</div>
              <div className="border-r border-slate-800 font-bold text-slate-200" title="Duration (D)">D: {node.data?.duration ?? 0}d</div>
              <div className="text-emerald-400" title="Early Finish (EF)">EF: {node.data?.ef ?? 0}</div>
            </div>
            {/* Center label */}
            <div className="flex-1 flex flex-col justify-center px-2 py-1 text-center">
              <span className="text-[11px] font-semibold text-slate-100 leading-tight line-clamp-2">
                {node.label}
              </span>
              {isCritical && (
                <span className="text-[9px] uppercase font-bold text-rose-400 tracking-wider mt-0.5">
                  ★ Critical Path
                </span>
              )}
            </div>
            {/* Bottom row: LS | Slack | LF */}
            <div className="grid grid-cols-3 text-center border-t border-slate-800 bg-slate-950 text-[10px] font-mono py-0.5">
              <div className="border-r border-slate-800 text-sky-400" title="Late Start (LS)">LS: {node.data?.ls ?? 0}</div>
              <div className={`border-r border-slate-800 font-bold ${node.data?.slack === 0 ? 'text-rose-400' : 'text-amber-400'}`} title="Slack Buffer">
                S: {node.data?.slack ?? 0}
              </div>
              <div className="text-emerald-400" title="Late Finish (LF)">LF: {node.data?.lf ?? 0}</div>
            </div>
          </div>
        );
      }

      // 15. Gantt Task Node
      case 'gantt-task': {
        const progress = node.data?.progress ?? 0;
        return (
          <div className="flex flex-col justify-between h-full bg-slate-900 border-2 border-emerald-500/80 rounded-lg p-2 shadow-xl text-left">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-emerald-400 font-semibold truncate">{node.label}</span>
              <span className="font-mono text-slate-400">{progress}%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-1">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
              <span>{node.data?.startDate || '2026-11-01'}</span>
              <span>{node.data?.assignee || 'Unassigned'}</span>
            </div>
          </div>
        );
      }

      // 16. Sticky Note
      case 'sticky-note': {
        const color = node.data?.color || 'yellow';
        const colorClasses: Record<string, string> = {
          yellow: 'bg-amber-100 text-amber-950 border-amber-300 shadow-amber-900/20',
          pink: 'bg-rose-100 text-rose-950 border-rose-300 shadow-rose-900/20',
          green: 'bg-emerald-100 text-emerald-950 border-emerald-300 shadow-emerald-900/20',
          blue: 'bg-sky-100 text-sky-950 border-sky-300 shadow-sky-900/20',
          purple: 'bg-purple-100 text-purple-950 border-purple-300 shadow-purple-900/20',
        };
        return (
          <div
            className={`flex flex-col justify-between h-full p-2.5 rounded-sm border shadow-md font-sans text-xs ${
              colorClasses[color] || colorClasses.yellow
            }`}
          >
            <div className="flex items-center justify-between opacity-70 pb-1 border-b border-black/10 text-[10px]">
              <StickyIcon className="w-3 h-3" />
              <span>{node.data?.author || 'Note'}</span>
            </div>
            <div className="flex-1 py-1 font-medium leading-relaxed whitespace-pre-wrap overflow-y-auto">
              {node.label}
            </div>
          </div>
        );
      }

      // Default Standard Flowchart Box
      default: {
        return (
          <div className="flex items-center justify-center h-full p-2.5 rounded-md bg-slate-900 border-2 border-blue-500 text-slate-100 shadow-xl text-center">
            <span className="text-xs font-medium leading-snug line-clamp-3">{node.label}</span>
          </div>
        );
      }
    }
  };

  const handleSaveLabel = () => {
    if (editedLabel.trim() && editedLabel !== node.label) {
      onUpdateLabel?.(node.id, editedLabel.trim());
    }
    setIsEditingLabel(false);
  };

  return (
    <div
      id={`node-${node.id}`}
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: `${node.width}px`,
        height: `${node.height}px`,
        touchAction: 'none',
      }}
      className={`absolute group select-none transition-shadow pointer-events-auto ${
        isSelected ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950 z-20' : 'z-10'
      } ${isDragging ? 'cursor-grabbing opacity-90' : 'cursor-grab'}`}
      onMouseDown={e => {
        if (
          (e.target as HTMLElement).closest('button') ||
          (e.target as HTMLElement).closest('.cursor-crosshair') ||
          (e.target as HTMLElement).tagName === 'INPUT' ||
          (e.target as HTMLElement).tagName === 'TEXTAREA'
        ) {
          return;
        }
        e.stopPropagation();
        onNodeMouseDown?.(node.id, e);
      }}
      onDoubleClick={e => {
        e.stopPropagation();
        if (!isReadOnly) {
          setIsEditingLabel(true);
          setEditedLabel(node.label);
        }
      }}
    >
      {/* Connection Anchor Handles */}
      {renderAnchor('top', '-top-1.5 left-1/2 -translate-x-1/2')}
      {renderAnchor('right', '-right-1.5 top-1/2 -translate-y-1/2')}
      {renderAnchor('bottom', '-bottom-1.5 left-1/2 -translate-x-1/2')}
      {renderAnchor('left', '-left-1.5 top-1/2 -translate-y-1/2')}

      {/* Render Node Body */}
      {renderNodeBody()}

      {/* Interactive Resize Handles (Rendered when node is selected) */}
      {isSelected && !isReadOnly && (
        <>
          {/* Corner Handles */}
          <div
            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm shadow-md cursor-nwse-resize z-40 pointer-events-auto hover:scale-125 transition-transform"
            onMouseDown={e => {
              e.stopPropagation();
              onStartResize?.(node.id, 'nw', e);
            }}
            title="Resize node"
          />
          <div
            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm shadow-md cursor-nesw-resize z-40 pointer-events-auto hover:scale-125 transition-transform"
            onMouseDown={e => {
              e.stopPropagation();
              onStartResize?.(node.id, 'ne', e);
            }}
            title="Resize node"
          />
          <div
            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm shadow-md cursor-nesw-resize z-40 pointer-events-auto hover:scale-125 transition-transform"
            onMouseDown={e => {
              e.stopPropagation();
              onStartResize?.(node.id, 'sw', e);
            }}
            title="Resize node"
          />
          <div
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm shadow-md cursor-nwse-resize z-40 pointer-events-auto hover:scale-125 transition-transform"
            onMouseDown={e => {
              e.stopPropagation();
              onStartResize?.(node.id, 'se', e);
            }}
            title="Resize node"
          />

          {/* Edge Handles */}
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-white border border-blue-500 rounded-full shadow-md cursor-ns-resize z-40 pointer-events-auto hover:scale-125 transition-transform"
            onMouseDown={e => {
              e.stopPropagation();
              onStartResize?.(node.id, 'n', e);
            }}
            title="Resize height"
          />
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-white border border-blue-500 rounded-full shadow-md cursor-ns-resize z-40 pointer-events-auto hover:scale-125 transition-transform"
            onMouseDown={e => {
              e.stopPropagation();
              onStartResize?.(node.id, 's', e);
            }}
            title="Resize height"
          />
          <div
            className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-4 bg-white border border-blue-500 rounded-full shadow-md cursor-ew-resize z-40 pointer-events-auto hover:scale-125 transition-transform"
            onMouseDown={e => {
              e.stopPropagation();
              onStartResize?.(node.id, 'w', e);
            }}
            title="Resize width"
          />
          <div
            className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-4 bg-white border border-blue-500 rounded-full shadow-md cursor-ew-resize z-40 pointer-events-auto hover:scale-125 transition-transform"
            onMouseDown={e => {
              e.stopPropagation();
              onStartResize?.(node.id, 'e', e);
            }}
            title="Resize width"
          />
        </>
      )}

      {/* Inline Label Editor (on Double Click) */}
      {isEditingLabel && (
        <div
          className="absolute inset-0 bg-slate-900/90 rounded border-2 border-blue-400 flex items-center justify-center p-2 z-50 shadow-2xl"
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
        >
          <input
            type="text"
            value={editedLabel}
            onChange={e => setEditedLabel(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSaveLabel();
              if (e.key === 'Escape') setIsEditingLabel(false);
            }}
            onBlur={handleSaveLabel}
            autoFocus
            className="w-full bg-slate-950 text-white text-xs px-2 py-1 rounded border border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-400 text-center"
          />
        </div>
      )}
    </div>
  );
};
