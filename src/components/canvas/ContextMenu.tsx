/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { DiagramNode } from '../../types/diagram';
import {
  Trash2,
  Edit3,
  Copy,
  ArrowUp,
  ArrowDown,
  Table,
  Plus,
  Palette,
  Eye,
  Maximize2,
  Grid,
  Magnet,
  FileText,
  FilePlus,
  Component,
} from 'lucide-react';

export interface ContextMenuPosition {
  x: number;
  y: number;
  nodeId?: string | null;
  edgeId?: string | null;
}

interface ContextMenuProps {
  position: ContextMenuPosition | null;
  selectedNode: DiagramNode | null;
  onClose: () => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge?: (edgeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onBringToFront: (nodeId: string) => void;
  onSendToBack: (nodeId: string) => void;
  onOpenEditModal: (node: DiagramNode) => void;
  onQuickAddColumn?: (nodeId: string) => void;
  onQuickAddMethod?: (nodeId: string) => void;
  onChangeColor: (nodeId: string, fill: string, stroke: string) => void;
  onOpenDoc: (node: DiagramNode) => void;
  onResetZoom: () => void;
  onToggleGridSnap: () => void;
  onToggleGrid: () => void;
  onOpenNewPageModal: () => void;
  isReadOnly?: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  position,
  selectedNode,
  onClose,
  onDeleteNode,
  onDeleteEdge,
  onDuplicateNode,
  onBringToFront,
  onSendToBack,
  onOpenEditModal,
  onQuickAddColumn,
  onQuickAddMethod,
  onChangeColor,
  onOpenDoc,
  onResetZoom,
  onToggleGridSnap,
  onToggleGrid,
  onOpenNewPageModal,
  isReadOnly,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape key
  useEffect(() => {
    if (!position) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [position, onClose]);

  if (!position) return null;

  // Keep menu inside viewport boundaries
  const menuWidth = 240;
  const menuHeight = selectedNode ? 360 : 200;
  const x = Math.min(position.x, window.innerWidth - menuWidth - 10);
  const y = Math.min(position.y, window.innerHeight - menuHeight - 10);

  const colorSwatches = [
    { label: 'Slate', fill: 'rgba(15, 23, 42, 0.95)', stroke: '#0284c7' },
    { label: 'Blue', fill: 'rgba(30, 58, 138, 0.9)', stroke: '#3b82f6' },
    { label: 'Emerald', fill: 'rgba(6, 78, 59, 0.9)', stroke: '#10b981' },
    { label: 'Amber', fill: 'rgba(120, 53, 15, 0.9)', stroke: '#f59e0b' },
    { label: 'Purple', fill: 'rgba(88, 28, 135, 0.9)', stroke: '#a855f7' },
    { label: 'Rose', fill: 'rgba(136, 19, 55, 0.9)', stroke: '#f43f5e' },
    { label: 'Teal', fill: 'rgba(19, 78, 74, 0.9)', stroke: '#14b8a6' },
    { label: 'Obsidian', fill: 'rgba(24, 24, 27, 0.95)', stroke: '#71717a' },
  ];

  return (
    <div
      ref={menuRef}
      style={{ left: `${x}px`, top: `${y}px` }}
      className="fixed z-50 w-60 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 text-xs text-slate-200 select-none animate-in fade-in-50 zoom-in-95 backdrop-blur-md"
      onClick={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
    >
      {selectedNode ? (
        // NODE CONTEXT MENU
        <div className="space-y-0.5">
          {/* Header */}
          <div className="px-2.5 py-1.5 border-b border-slate-800/80 mb-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="truncate max-w-[150px] font-semibold text-white">
              {selectedNode.label}
            </span>
            <span className="text-[9px] uppercase px-1 py-0.2 bg-slate-800 rounded text-sky-400">
              {selectedNode.type}
            </span>
          </div>

          {/* Quick Color Swatches Bar */}
          <div className="px-2 py-1">
            <div className="text-[10px] uppercase font-mono text-slate-400 mb-1 flex items-center gap-1">
              <Palette className="w-3 h-3 text-blue-400" />
              <span>Color Theme</span>
            </div>
            <div className="flex items-center gap-1.5">
              {colorSwatches.map(swatch => (
                <button
                  key={swatch.label}
                  type="button"
                  onClick={() => {
                    onChangeColor(selectedNode.id, swatch.fill, swatch.stroke);
                    onClose();
                  }}
                  className="w-5 h-5 rounded-full border border-slate-600 hover:scale-125 transition-transform cursor-pointer relative"
                  style={{ backgroundColor: swatch.stroke }}
                  title={`Set ${swatch.label} theme`}
                />
              ))}
            </div>
          </div>

          <div className="h-[1px] bg-slate-800/80 my-1" />

          {/* Edit Schema & Content */}
          <button
            onClick={() => {
              onOpenEditModal(selectedNode);
              onClose();
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-blue-600/20 hover:text-blue-300 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium">Edit Schema &amp; Content...</span>
          </button>

          {/* Special Quick Actions: Add Column for ERD */}
          {selectedNode.type === 'erd-entity' && onQuickAddColumn && (
            <button
              onClick={() => {
                onQuickAddColumn(selectedNode.id);
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-sky-600/20 text-sky-300 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-sky-400" />
              <span>+ Quick Add Column</span>
            </button>
          )}

          {/* Special Quick Actions: Add Method for UML */}
          {selectedNode.type === 'uml-class' && onQuickAddMethod && (
            <button
              onClick={() => {
                onQuickAddMethod(selectedNode.id);
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-cyan-600/20 text-cyan-300 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>+ Quick Add Method</span>
            </button>
          )}

          {/* Duplicate Node */}
          {!isReadOnly && (
            <button
              onClick={() => {
                onDuplicateNode(selectedNode.id);
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Duplicate Object</span>
            </button>
          )}

          {/* Bring to Front / Send to Back */}
          <button
            onClick={() => {
              onBringToFront(selectedNode.id);
              onClose();
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5 text-slate-400" />
            <span>Bring to Front</span>
          </button>
          <button
            onClick={() => {
              onSendToBack(selectedNode.id);
              onClose();
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Send to Back</span>
          </button>

          {/* Open Docs in Inspector */}
          <button
            onClick={() => {
              onOpenDoc(selectedNode);
              onClose();
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>View Documentation &amp; Notes</span>
          </button>

          {/* DELETE OBJECT (Change 2 requirement) */}
          {!isReadOnly && (
            <>
              <div className="h-[1px] bg-slate-800/80 my-1" />
              <button
                onClick={() => {
                  onDeleteNode(selectedNode.id);
                  onClose();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Object</span>
              </button>
            </>
          )}
        </div>
      ) : position.edgeId ? (
        // EDGE CONTEXT MENU
        <div className="space-y-0.5">
          <div className="px-2.5 py-1 border-b border-slate-800 text-[10px] uppercase font-mono text-slate-400">
            Connector Edge
          </div>
          {!isReadOnly && (
            <button
              onClick={() => {
                if (position.edgeId && onDeleteEdge) {
                  onDeleteEdge(position.edgeId);
                }
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Connector</span>
            </button>
          )}
        </div>
      ) : (
        // CANVAS BACKGROUND CONTEXT MENU
        <div className="space-y-0.5">
          <div className="px-2.5 py-1 border-b border-slate-800 text-[10px] uppercase font-mono text-slate-400 mb-1">
            Canvas Options
          </div>
          <button
            onClick={() => {
              onResetZoom();
              onClose();
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Reset Zoom to 100%</span>
          </button>
          <button
            onClick={() => {
              onToggleGrid();
              onClose();
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Grid className="w-3.5 h-3.5 text-blue-400" />
            <span>Toggle Background Grid</span>
          </button>
          <button
            onClick={() => {
              onToggleGridSnap();
              onClose();
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Magnet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Toggle Grid Snapping</span>
          </button>
          <div className="h-[1px] bg-slate-800/80 my-1" />
          <button
            onClick={() => {
              onOpenNewPageModal();
              onClose();
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-blue-600/20 text-blue-300 font-medium transition-colors cursor-pointer"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>+ Create New Diagram Page</span>
          </button>
        </div>
      )}
    </div>
  );
};
