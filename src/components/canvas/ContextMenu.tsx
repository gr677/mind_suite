/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { DiagramNode, AppTheme } from '../../types/diagram';
import {
  Trash2,
  Edit3,
  Copy,
  ArrowUp,
  ArrowDown,
  Plus,
  Palette,
  Maximize2,
  Grid,
  Magnet,
  FileText,
  FilePlus,
  Link2,
  ChevronRight,
  MousePointerClick,
} from 'lucide-react';
import { THEMES } from '../../utils/themeConfig';

export interface ContextMenuPosition {
  x: number;
  y: number;
  nodeId?: string | null;
  edgeId?: string | null;
}

interface ContextMenuProps {
  position: ContextMenuPosition | null;
  selectedNode: DiagramNode | null;
  otherNodes?: DiagramNode[];
  theme?: AppTheme;
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
  onStartConnectFromNode?: (nodeId: string) => void;
  onConnectNodes?: (sourceId: string, targetId: string) => void;
  isReadOnly?: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  position,
  selectedNode,
  otherNodes = [],
  theme = 'dark',
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
  onStartConnectFromNode,
  onConnectNodes,
  isReadOnly,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showConnectSubmenu, setShowConnectSubmenu] = useState(false);
  const themeDef = THEMES[theme] || THEMES.dark;
  const isDark = themeDef.isDark;

  // Close on outside click or Escape key
  useEffect(() => {
    if (!position) return;
    setShowConnectSubmenu(false);

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
  const menuWidth = 260;
  const menuHeight = selectedNode ? 420 : 220;
  const x = Math.min(position.x, window.innerWidth - menuWidth - 20);
  const y = Math.min(position.y, window.innerHeight - menuHeight - 20);

  const colorSwatches = [
    { label: 'Slate', fill: 'rgba(15, 23, 42, 0.95)', stroke: '#0284c7' },
    { label: 'Blue', fill: 'rgba(30, 58, 138, 0.9)', stroke: '#3b82f6' },
    { label: 'Emerald', fill: 'rgba(6, 78, 59, 0.9)', stroke: '#10b981' },
    { label: 'Amber', fill: 'rgba(120, 53, 15, 0.9)', stroke: '#f59e0b' },
    { label: 'Purple', fill: 'rgba(88, 28, 135, 0.9)', stroke: '#a855f7' },
    { label: 'Rose', fill: 'rgba(136, 19, 55, 0.9)', stroke: '#f43f5e' },
    { label: 'Teal', fill: 'rgba(19, 78, 74, 0.9)', stroke: '#14b8a6' },
    { label: 'Light Clean', fill: '#f8fafc', stroke: '#64748b' },
  ];

  const candidateNodes = otherNodes.filter(n => n.id !== selectedNode?.id);

  return (
    <div
      ref={menuRef}
      style={{ left: `${Math.max(10, x)}px`, top: `${Math.max(10, y)}px` }}
      className={`fixed z-50 w-64 rounded-xl shadow-2xl p-1.5 text-xs select-none animate-in fade-in-50 zoom-in-95 backdrop-blur-md border ${
        isDark
          ? 'bg-slate-900/95 border-slate-800 text-slate-200'
          : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/60'
      }`}
      onClick={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
    >
      {selectedNode ? (
        // NODE CONTEXT MENU
        <div className="space-y-0.5">
          {/* Header */}
          <div
            className={`px-2.5 py-1.5 border-b mb-1 flex items-center justify-between text-[11px] font-mono ${
              isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-500'
            }`}
          >
            <span
              className={`truncate max-w-[150px] font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              {selectedNode.label}
            </span>
            <span
              className={`text-[9px] uppercase px-1 py-0.5 rounded font-mono ${
                isDark ? 'bg-slate-800 text-sky-400' : 'bg-slate-100 text-sky-600'
              }`}
            >
              {selectedNode.type}
            </span>
          </div>

          {/* Quick Color Swatches Bar */}
          <div className="px-2 py-1">
            <div
              className={`text-[10px] uppercase font-mono mb-1 flex items-center gap-1 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <Palette className="w-3 h-3 text-blue-500" />
              <span>Color Theme</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {colorSwatches.map(swatch => (
                <button
                  key={swatch.label}
                  type="button"
                  onClick={() => {
                    onChangeColor(selectedNode.id, swatch.fill, swatch.stroke);
                    onClose();
                  }}
                  className="w-5 h-5 rounded-full border border-slate-400/50 hover:scale-125 transition-transform cursor-pointer relative shadow-xs"
                  style={{ backgroundColor: swatch.stroke }}
                  title={`Set ${swatch.label} theme`}
                />
              ))}
            </div>
          </div>

          <div className={`h-[1px] my-1 ${isDark ? 'bg-slate-800/80' : 'bg-slate-200'}`} />

          {/* CONNECT TO NODE (User request fix!) */}
          {!isReadOnly && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowConnectSubmenu(prev => !prev)}
                onMouseEnter={() => setShowConnectSubmenu(true)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                  showConnectSubmenu
                    ? 'bg-blue-600/20 text-blue-400 font-semibold'
                    : isDark
                    ? 'hover:bg-slate-800 text-blue-400 hover:text-blue-300'
                    : 'hover:bg-blue-50 text-blue-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-semibold">Connect to Node...</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Submenu for Connection Targets */}
              {showConnectSubmenu && (
                <div
                  className={`absolute left-full top-0 ml-1.5 w-60 rounded-xl shadow-2xl p-1.5 text-xs border backdrop-blur-md z-50 animate-in fade-in slide-in-from-left-2 ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-slate-200'
                      : 'bg-white border-slate-200 text-slate-800 shadow-slate-300/80'
                  }`}
                  onMouseLeave={() => setShowConnectSubmenu(false)}
                >
                  <div
                    className={`px-2 py-1 text-[10px] font-mono uppercase border-b mb-1 ${
                      isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-100'
                    }`}
                  >
                    Select Target Node
                  </div>

                  {/* Option 1: Interactive canvas wire */}
                  <button
                    onClick={() => {
                      onStartConnectFromNode?.(selectedNode.id);
                      onClose();
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer mb-1 ${
                      isDark ? 'hover:bg-slate-800 text-emerald-400' : 'hover:bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    <MousePointerClick className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-medium">Click target on canvas...</span>
                  </button>

                  <div className={`h-[1px] my-1 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

                  {/* Option 2: Direct List of candidate nodes */}
                  <div className="max-h-48 overflow-y-auto space-y-0.5">
                    {candidateNodes.length === 0 ? (
                      <div
                        className={`px-2 py-1.5 text-[11px] italic ${
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        No other nodes on page
                      </div>
                    ) : (
                      candidateNodes.map(target => (
                        <button
                          key={target.id}
                          onClick={() => {
                            onConnectNodes?.(selectedNode.id, target.id);
                            onClose();
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer group ${
                            isDark
                              ? 'hover:bg-blue-600/20 hover:text-blue-300'
                              : 'hover:bg-blue-50 hover:text-blue-700'
                          }`}
                        >
                          <span className="truncate max-w-[140px] font-medium">{target.label}</span>
                          <span
                            className={`text-[9px] uppercase px-1 py-0.2 rounded font-mono ${
                              isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {target.type.replace('-', ' ')}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Edit Schema & Content */}
          <button
            onClick={() => {
              onOpenEditModal(selectedNode);
              onClose();
            }}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
              isDark
                ? 'hover:bg-blue-600/20 hover:text-blue-300 text-slate-200'
                : 'hover:bg-blue-50 hover:text-blue-700 text-slate-700'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-medium">Edit Schema &amp; Content...</span>
          </button>

          {/* Special Quick Actions: Add Column for ERD */}
          {selectedNode.type === 'erd-entity' && onQuickAddColumn && (
            <button
              onClick={() => {
                onQuickAddColumn(selectedNode.id);
                onClose();
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                isDark ? 'hover:bg-sky-600/20 text-sky-300' : 'hover:bg-sky-50 text-sky-600'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-sky-500" />
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
              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                isDark ? 'hover:bg-cyan-600/20 text-cyan-300' : 'hover:bg-cyan-50 text-cyan-600'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-cyan-500" />
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
              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                isDark
                  ? 'hover:bg-slate-800 hover:text-white text-slate-300'
                  : 'hover:bg-slate-100 hover:text-slate-900 text-slate-700'
              }`}
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
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
              isDark
                ? 'hover:bg-slate-800 hover:text-white text-slate-300'
                : 'hover:bg-slate-100 hover:text-slate-900 text-slate-700'
            }`}
          >
            <ArrowUp className="w-3.5 h-3.5 text-slate-400" />
            <span>Bring to Front</span>
          </button>
          <button
            onClick={() => {
              onSendToBack(selectedNode.id);
              onClose();
            }}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
              isDark
                ? 'hover:bg-slate-800 hover:text-white text-slate-300'
                : 'hover:bg-slate-100 hover:text-slate-900 text-slate-700'
            }`}
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
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
              isDark
                ? 'hover:bg-slate-800 hover:text-white text-slate-300'
                : 'hover:bg-slate-100 hover:text-slate-900 text-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>View Documentation &amp; Notes</span>
          </button>

          {/* DELETE OBJECT */}
          {!isReadOnly && (
            <>
              <div className={`h-[1px] my-1 ${isDark ? 'bg-slate-800/80' : 'bg-slate-200'}`} />
              <button
                onClick={() => {
                  onDeleteNode(selectedNode.id);
                  onClose();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-rose-500 hover:bg-rose-500/20 font-semibold transition-colors cursor-pointer"
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
          <div
            className={`px-2.5 py-1 border-b text-[10px] uppercase font-mono ${
              isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
            }`}
          >
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
              className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-rose-500 hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Connector</span>
            </button>
          )}
        </div>
      ) : (
        // CANVAS BACKGROUND CONTEXT MENU
        <div className="space-y-0.5">
          <div
            className={`px-2.5 py-1 border-b text-[10px] uppercase font-mono mb-1 ${
              isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
            }`}
          >
            Canvas Options
          </div>
          <button
            onClick={() => {
              onResetZoom();
              onClose();
            }}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Reset Zoom to 100%</span>
          </button>
          <button
            onClick={() => {
              onToggleGrid();
              onClose();
            }}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-blue-500" />
            <span>Toggle Background Grid</span>
          </button>
          <button
            onClick={() => {
              onToggleGridSnap();
              onClose();
            }}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <Magnet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Toggle Grid Snapping</span>
          </button>
          <div className={`h-[1px] my-1 ${isDark ? 'bg-slate-800/80' : 'bg-slate-200'}`} />
          <button
            onClick={() => {
              onOpenNewPageModal();
              onClose();
            }}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 font-medium transition-colors cursor-pointer ${
              isDark ? 'hover:bg-blue-600/20 text-blue-400' : 'hover:bg-blue-50 text-blue-600'
            }`}
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>+ Create New Diagram Page</span>
          </button>
        </div>
      )}
    </div>
  );
};
