/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DiagramNode, DiagramPage, StickyNote, Comment, UserRole, AppTheme } from '../../types/diagram';
import {
  FileText,
  Sliders,
  MessageSquare,
  Layers,
  Plus,
  Trash2,
  ExternalLink,
  StickyNote as StickyIcon,
  Tag,
  CheckCircle,
  Clock,
  Send,
  X,
  Code,
  ArrowUp,
  ArrowDown,
  Database,
  Cpu,
  FolderOpen,
} from 'lucide-react';
import { THEMES } from '../../utils/themeConfig';

interface NodeInspectorProps {
  selectedNode: DiagramNode | null;
  currentPage: DiagramPage;
  allPages: DiagramPage[];
  userRole: UserRole;
  theme?: AppTheme;
  onUpdateNode: (updatedNode: DiagramNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onClose: () => void;
  onDrillDown?: (pageId: string) => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  selectedNode,
  currentPage,
  allPages,
  userRole,
  theme = 'dark',
  onUpdateNode,
  onDeleteNode,
  onClose,
  onDrillDown,
}) => {
  const [activeTab, setActiveTab] = useState<'props' | 'docs' | 'comments' | 'group'>('props');
  const [newTagInput, setNewTagInput] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [newStickyText, setNewStickyText] = useState('');
  const [stickyColor, setStickyColor] = useState<StickyNote['color']>('yellow');

  const themeDef = THEMES[theme] || THEMES.dark;

  if (!selectedNode) {
    // Show Page Overview Inspector
    return (
      <div className={`w-80 h-full border-l flex flex-col select-none transition-colors duration-150 ${themeDef.sidebarClass}`}>
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">Page Architecture</h3>
          </div>
        </div>
        <div className="p-4 space-y-4 flex-1 overflow-y-auto text-xs">
          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Page Title</label>
            <div className="font-semibold text-slate-100">{currentPage.title}</div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Diagram Model</label>
            <div className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-mono uppercase text-[10px]">
              {currentPage.diagramType}
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Description</label>
            <p className="text-slate-400 leading-relaxed">{currentPage.description || 'No page description provided.'}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-center">
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <div className="text-base font-bold text-blue-400">{currentPage.nodes.length}</div>
              <div className="text-[10px] text-slate-400 font-mono">NODES</div>
            </div>
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <div className="text-base font-bold text-emerald-400">{currentPage.edges.length}</div>
              <div className="text-[10px] text-slate-400 font-mono">CONNECTORS</div>
            </div>
          </div>
          <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-lg text-[11px] text-blue-300">
            Click any node or shape on the canvas to configure its properties, documentation, sticky notes, and nested grouping.
          </div>
        </div>
      </div>
    );
  }

  const isReadOnly = userRole === 'viewer';
  const isReviewer = userRole === 'reviewer';

  // Documentation updater helper
  const updateDocs = (partial: Partial<NonNullable<DiagramNode['documentation']>>) => {
    const currentDocs = selectedNode.documentation || {
      description: '',
      tags: [],
      status: 'draft',
    };
    onUpdateNode({
      ...selectedNode,
      documentation: {
        ...currentDocs,
        ...partial,
        lastEditedBy: 'Current User',
        lastEditedAt: new Date().toISOString(),
      },
    });
  };

  // Add Sticky note
  const handleAddSticky = () => {
    if (!newStickyText.trim()) return;
    const notes = selectedNode.stickyNotes || [];
    const newNote: StickyNote = {
      id: `sn-${Date.now()}`,
      text: newStickyText.trim(),
      color: stickyColor,
      author: 'You',
      updatedAt: 'Just now',
    };
    onUpdateNode({
      ...selectedNode,
      stickyNotes: [...notes, newNote],
    });
    setNewStickyText('');
  };

  // Remove Sticky Note
  const handleRemoveSticky = (id: string) => {
    const notes = selectedNode.stickyNotes || [];
    onUpdateNode({
      ...selectedNode,
      stickyNotes: notes.filter(n => n.id !== id),
    });
  };

  // Add Comment
  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    const comments = selectedNode.comments || [];
    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      author: userRole === 'admin' ? 'Sarah Chen (Admin)' : 'You',
      authorColor: userRole === 'admin' ? '#3b82f6' : '#10b981',
      text: newCommentText.trim(),
      createdAt: 'Just now',
    };
    onUpdateNode({
      ...selectedNode,
      comments: [...comments, newComment],
    });
    setNewCommentText('');
  };

  return (
    <div className={`w-80 h-full border-l flex flex-col select-none transition-colors duration-150 ${themeDef.sidebarClass}`}>
      {/* Inspector Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-xs font-bold text-slate-100 truncate">{selectedNode.label}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-slate-800 bg-slate-950/40 text-xs">
        <button
          onClick={() => setActiveTab('props')}
          className={`flex-1 py-2 text-center border-b-2 font-medium cursor-pointer transition-colors ${
            activeTab === 'props'
              ? 'border-blue-500 text-blue-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Properties
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`flex-1 py-2 text-center border-b-2 font-medium cursor-pointer transition-colors ${
            activeTab === 'docs'
              ? 'border-blue-500 text-blue-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Docs &amp; Notes
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex-1 py-2 text-center border-b-2 font-medium cursor-pointer transition-colors ${
            activeTab === 'comments'
              ? 'border-blue-500 text-blue-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Comments
        </button>
        <button
          onClick={() => setActiveTab('group')}
          className={`flex-1 py-2 text-center border-b-2 font-medium cursor-pointer transition-colors ${
            activeTab === 'group'
              ? 'border-blue-500 text-blue-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Hierarchy
        </button>
      </div>

      {/* Tab 1: Properties */}
      {activeTab === 'props' && (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Node Title / Label</label>
            <input
              type="text"
              disabled={isReadOnly}
              value={selectedNode.label}
              onChange={e => onUpdateNode({ ...selectedNode, label: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          {/* Dimensions & Quick Resize Presets */}
          <div>
            <div className="grid grid-cols-2 gap-2 mb-1.5">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Width (px)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    disabled={isReadOnly}
                    value={selectedNode.width}
                    onChange={e => onUpdateNode({ ...selectedNode, width: Math.max(60, parseInt(e.target.value, 10) || 60) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-100 disabled:opacity-50"
                  />
                  <div className="flex flex-col gap-0.5">
                    <button
                      disabled={isReadOnly}
                      onClick={() => onUpdateNode({ ...selectedNode, width: selectedNode.width + 20 })}
                      className="px-1 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-mono leading-none cursor-pointer"
                      title="Increase width by 20px"
                    >
                      +
                    </button>
                    <button
                      disabled={isReadOnly}
                      onClick={() => onUpdateNode({ ...selectedNode, width: Math.max(60, selectedNode.width - 20) })}
                      className="px-1 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-mono leading-none cursor-pointer"
                      title="Decrease width by 20px"
                    >
                      -
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Height (px)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    disabled={isReadOnly}
                    value={selectedNode.height}
                    onChange={e => onUpdateNode({ ...selectedNode, height: Math.max(40, parseInt(e.target.value, 10) || 40) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-100 disabled:opacity-50"
                  />
                  <div className="flex flex-col gap-0.5">
                    <button
                      disabled={isReadOnly}
                      onClick={() => onUpdateNode({ ...selectedNode, height: selectedNode.height + 20 })}
                      className="px-1 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-mono leading-none cursor-pointer"
                      title="Increase height by 20px"
                    >
                      +
                    </button>
                    <button
                      disabled={isReadOnly}
                      onClick={() => onUpdateNode({ ...selectedNode, height: Math.max(40, selectedNode.height - 20) })}
                      className="px-1 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-mono leading-none cursor-pointer"
                      title="Decrease height by 20px"
                    >
                      -
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Size Presets */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              <span className="text-[9px] uppercase font-mono text-slate-500">Preset:</span>
              <button
                disabled={isReadOnly}
                onClick={() => onUpdateNode({ ...selectedNode, width: 180, height: 100 })}
                className="px-1.5 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[9px] text-slate-300 font-mono cursor-pointer"
              >
                180×100
              </button>
              <button
                disabled={isReadOnly}
                onClick={() => onUpdateNode({ ...selectedNode, width: 240, height: 180 })}
                className="px-1.5 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[9px] text-slate-300 font-mono cursor-pointer"
              >
                240×180
              </button>
              <button
                disabled={isReadOnly}
                onClick={() => onUpdateNode({ ...selectedNode, width: 320, height: 260 })}
                className="px-1.5 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[9px] text-slate-300 font-mono cursor-pointer"
              >
                320×260
              </button>
              <button
                disabled={isReadOnly}
                onClick={() => onUpdateNode({ ...selectedNode, width: 420, height: 320 })}
                className="px-1.5 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[9px] text-slate-300 font-mono cursor-pointer"
              >
                420×320
              </button>
            </div>
          </div>

          {/* Specialized ERD Attributes & Columns Schema Editor */}
          {selectedNode.type === 'erd-entity' && (
            <div className="pt-2 border-t border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[10px] uppercase font-mono text-sky-400 font-bold flex items-center gap-1">
                    <Database className="w-3.5 h-3.5" />
                    ERD Columns Schema
                  </label>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {(selectedNode.data?.fields || []).length} columns defined
                  </span>
                </div>
                <button
                  disabled={isReadOnly}
                  onClick={() => {
                    const fields = selectedNode.data?.fields || [];
                    onUpdateNode({
                      ...selectedNode,
                      data: {
                        ...selectedNode.data,
                        fields: [
                          ...fields,
                          { name: `col_${fields.length + 1}`, type: 'VARCHAR(255)', isPk: false, isFk: false, isNullable: true },
                        ],
                      },
                    });
                  }}
                  className="px-2 py-0.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-[10px] font-semibold cursor-pointer transition-colors shadow-sm flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Column
                </button>
              </div>

              {/* Quick Schema Helpers */}
              <div className="flex flex-wrap gap-1 p-1.5 bg-slate-950/60 rounded border border-slate-800/80">
                <span className="text-[9px] text-slate-400 font-mono w-full">Quick Schema Helpers:</span>
                <button
                  disabled={isReadOnly}
                  onClick={() => {
                    const fields = selectedNode.data?.fields || [];
                    onUpdateNode({
                      ...selectedNode,
                      data: {
                        ...selectedNode.data,
                        fields: [{ name: 'id', type: 'UUID', isPk: true, isFk: false, unique: true }, ...fields],
                      },
                    });
                  }}
                  className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded text-[9px] text-amber-300 font-mono cursor-pointer"
                  title="Add Primary Key id UUID column"
                >
                  + PK id
                </button>
                <button
                  disabled={isReadOnly}
                  onClick={() => {
                    const fields = selectedNode.data?.fields || [];
                    onUpdateNode({
                      ...selectedNode,
                      data: {
                        ...selectedNode.data,
                        fields: [
                          ...fields,
                          { name: 'created_at', type: 'TIMESTAMPTZ', isPk: false, isFk: false },
                          { name: 'updated_at', type: 'TIMESTAMPTZ', isPk: false, isFk: false },
                        ],
                      },
                    });
                  }}
                  className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded text-[9px] text-sky-300 font-mono cursor-pointer"
                  title="Add created_at and updated_at timestamps"
                >
                  + Timestamps
                </button>
                <button
                  disabled={isReadOnly}
                  onClick={() => {
                    const fields = selectedNode.data?.fields || [];
                    onUpdateNode({
                      ...selectedNode,
                      data: {
                        ...selectedNode.data,
                        fields: [
                          ...fields,
                          { name: 'status', type: 'VARCHAR(50)', isPk: false, isFk: false },
                        ],
                      },
                    });
                  }}
                  className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded text-[9px] text-emerald-300 font-mono cursor-pointer"
                >
                  + Status
                </button>
                <button
                  disabled={isReadOnly}
                  onClick={() => {
                    const fields = selectedNode.data?.fields || [];
                    onUpdateNode({
                      ...selectedNode,
                      data: {
                        ...selectedNode.data,
                        fields: [
                          ...fields,
                          { name: 'user_id', type: 'UUID', isPk: false, isFk: true },
                        ],
                      },
                    });
                  }}
                  className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded text-[9px] text-purple-300 font-mono cursor-pointer"
                  title="Add user_id foreign key"
                >
                  + FK User
                </button>
              </div>

              {/* Columns List with In-Depth Controls */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {(selectedNode.data?.fields || []).map((col: any, idx: number) => (
                  <div key={idx} className="p-2 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5 group">
                    <div className="flex items-center gap-1.5">
                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          disabled={isReadOnly || idx === 0}
                          onClick={() => {
                            const fields = [...(selectedNode.data?.fields || [])];
                            const temp = fields[idx];
                            fields[idx] = fields[idx - 1];
                            fields[idx - 1] = temp;
                            onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, fields } });
                          }}
                          className="text-slate-500 hover:text-slate-200 disabled:opacity-20 p-0.2 cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="w-2.5 h-2.5" />
                        </button>
                        <button
                          disabled={isReadOnly || idx === (selectedNode.data?.fields?.length || 1) - 1}
                          onClick={() => {
                            const fields = [...(selectedNode.data?.fields || [])];
                            const temp = fields[idx];
                            fields[idx] = fields[idx + 1];
                            fields[idx + 1] = temp;
                            onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, fields } });
                          }}
                          className="text-slate-500 hover:text-slate-200 disabled:opacity-20 p-0.2 cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      {/* Column Name */}
                      <input
                        type="text"
                        disabled={isReadOnly}
                        value={col.name}
                        onChange={e => {
                          const fields = [...(selectedNode.data?.fields || [])];
                          fields[idx] = { ...fields[idx], name: e.target.value };
                          onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, fields } });
                        }}
                        placeholder="column_name"
                        className="flex-1 bg-slate-900 border border-slate-700/60 rounded px-1.5 py-1 text-slate-100 font-mono text-xs focus:outline-none focus:border-sky-500"
                      />

                      {/* Delete Button */}
                      <button
                        disabled={isReadOnly}
                        onClick={() => {
                          const fields = (selectedNode.data?.fields || []).filter((_: any, i: number) => i !== idx);
                          onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, fields } });
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer rounded hover:bg-slate-900"
                        title="Delete Column"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Type & Constraint Badges Row */}
                    <div className="flex items-center gap-1.5">
                      {/* Data Type input */}
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          disabled={isReadOnly}
                          value={col.type}
                          onChange={e => {
                            const fields = [...(selectedNode.data?.fields || [])];
                            fields[idx] = { ...fields[idx], type: e.target.value };
                            onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, fields } });
                          }}
                          placeholder="DATA_TYPE"
                          className="w-full bg-slate-900 border border-slate-700/60 rounded px-1.5 py-0.5 text-sky-300 font-mono text-[10px] uppercase focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      {/* Constraints Toggles */}
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => {
                          const fields = [...(selectedNode.data?.fields || [])];
                          fields[idx] = { ...fields[idx], isPk: !fields[idx].isPk };
                          onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, fields } });
                        }}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono transition-colors border cursor-pointer ${
                          col.isPk
                            ? 'bg-amber-500/30 text-amber-300 border-amber-500/70 shadow-sm'
                            : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                        }`}
                        title="Toggle Primary Key"
                      >
                        PK
                      </button>

                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => {
                          const fields = [...(selectedNode.data?.fields || [])];
                          fields[idx] = { ...fields[idx], isFk: !fields[idx].isFk };
                          onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, fields } });
                        }}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono transition-colors border cursor-pointer ${
                          col.isFk
                            ? 'bg-purple-500/30 text-purple-300 border-purple-500/70 shadow-sm'
                            : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                        }`}
                        title="Toggle Foreign Key"
                      >
                        FK
                      </button>

                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => {
                          const fields = [...(selectedNode.data?.fields || [])];
                          fields[idx] = { ...fields[idx], isUnique: !fields[idx].isUnique };
                          onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, fields } });
                        }}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono transition-colors border cursor-pointer ${
                          col.isUnique
                            ? 'bg-teal-500/30 text-teal-300 border-teal-500/70 shadow-sm'
                            : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                        }`}
                        title="Toggle Unique Constraint"
                      >
                        UQ
                      </button>

                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => {
                          const fields = [...(selectedNode.data?.fields || [])];
                          fields[idx] = { ...fields[idx], isNullable: !fields[idx].isNullable };
                          onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, fields } });
                        }}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono transition-colors border cursor-pointer ${
                          col.isNullable
                            ? 'bg-slate-700 text-slate-200 border-slate-600'
                            : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                        }`}
                        title="Toggle Nullable"
                      >
                        NULL
                      </button>
                    </div>

                    {/* Quick Types Row */}
                    <div className="flex items-center gap-1.5 overflow-x-auto text-[8px] font-mono text-slate-500 pt-0.5">
                      {['UUID', 'INT', 'VARCHAR', 'TEXT', 'BOOLEAN', 'TIMESTAMPTZ', 'DECIMAL', 'JSONB'].map(qt => (
                        <button
                          key={qt}
                          type="button"
                          disabled={isReadOnly}
                          onClick={() => {
                            const fields = [...(selectedNode.data?.fields || [])];
                            fields[idx] = { ...fields[idx], type: qt === 'VARCHAR' ? 'VARCHAR(255)' : qt };
                            onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, fields } });
                          }}
                          className="hover:text-sky-300 hover:underline cursor-pointer"
                        >
                          {qt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specialized UML Class Attributes & Methods */}
          {selectedNode.type === 'uml-class' && (
            <div className="pt-2 border-t border-slate-800 space-y-3">
              {/* Stereotype */}
              <div>
                <label className="text-[10px] uppercase font-mono text-cyan-400 font-bold block mb-1">
                  Stereotype
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={selectedNode.data?.stereotype || ''}
                  onChange={e => onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, stereotype: e.target.value } })}
                  placeholder="e.g. interface, entity, service"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-100 font-mono text-xs"
                />
              </div>

              {/* Attributes Editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] uppercase font-mono text-cyan-400 font-bold">
                    Class Attributes
                  </label>
                  <button
                    disabled={isReadOnly}
                    onClick={() => {
                      const attrs = selectedNode.data?.attributes || [];
                      onUpdateNode({
                        ...selectedNode,
                        data: {
                          ...selectedNode.data,
                          attributes: [...attrs, '- newField: string'],
                        },
                      });
                    }}
                    className="px-1.5 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[10px] font-mono cursor-pointer"
                  >
                    + Add Field
                  </button>
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {(selectedNode.data?.attributes || []).map((attr: string, i: number) => (
                    <div key={i} className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800">
                      <input
                        type="text"
                        disabled={isReadOnly}
                        value={attr}
                        onChange={e => {
                          const attrs = [...(selectedNode.data?.attributes || [])];
                          attrs[i] = e.target.value;
                          onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, attributes: attrs } });
                        }}
                        className="flex-1 bg-transparent text-cyan-200 font-mono text-xs focus:outline-none"
                      />
                      <button
                        disabled={isReadOnly}
                        onClick={() => {
                          const attrs = (selectedNode.data?.attributes || []).filter((_: any, idx: number) => idx !== i);
                          onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, attributes: attrs } });
                        }}
                        className="text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Methods Editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] uppercase font-mono text-cyan-400 font-bold">
                    Class Methods
                  </label>
                  <button
                    disabled={isReadOnly}
                    onClick={() => {
                      const methods = selectedNode.data?.methods || [];
                      onUpdateNode({
                        ...selectedNode,
                        data: {
                          ...selectedNode.data,
                          methods: [...methods, '+ execute(): void'],
                        },
                      });
                    }}
                    className="px-1.5 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[10px] font-mono cursor-pointer"
                  >
                    + Add Method
                  </button>
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {(selectedNode.data?.methods || []).map((m: string, i: number) => (
                    <div key={i} className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800">
                      <input
                        type="text"
                        disabled={isReadOnly}
                        value={m}
                        onChange={e => {
                          const methods = [...(selectedNode.data?.methods || [])];
                          methods[i] = e.target.value;
                          onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, methods } });
                        }}
                        className="flex-1 bg-transparent text-cyan-200 font-mono text-xs focus:outline-none"
                      />
                      <button
                        disabled={isReadOnly}
                        onClick={() => {
                          const methods = (selectedNode.data?.methods || []).filter((_: any, idx: number) => idx !== i);
                          onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, methods } });
                        }}
                        className="text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Specialized Swimlane Pool / Lanes Editor */}
          {selectedNode.type === 'swimlane-pool' && (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-mono text-blue-400 font-bold flex items-center gap-1">
                  <FolderOpen className="w-3.5 h-3.5" />
                  Swimlanes (Partitions)
                </label>
                <button
                  disabled={isReadOnly}
                  onClick={() => {
                    const lanes = selectedNode.data?.lanes || [];
                    onUpdateNode({
                      ...selectedNode,
                      data: {
                        ...selectedNode.data,
                        lanes: [...lanes, `Lane ${lanes.length + 1}`],
                      },
                    });
                  }}
                  className="px-1.5 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-mono cursor-pointer"
                >
                  + Add Lane
                </button>
              </div>
              <div className="space-y-1.5">
                {(selectedNode.data?.lanes || []).map((lane: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded border border-slate-800">
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={lane}
                      onChange={e => {
                        const next = [...(selectedNode.data?.lanes || [])];
                        next[idx] = e.target.value;
                        onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, lanes: next } });
                      }}
                      className="flex-1 bg-transparent text-slate-100 font-mono text-xs focus:outline-none"
                    />
                    <button
                      disabled={isReadOnly}
                      onClick={() => {
                        const next = (selectedNode.data?.lanes || []).filter((_: any, i: number) => i !== idx);
                        onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, lanes: next } });
                      }}
                      className="text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specialized BPMN Task Configuration */}
          {selectedNode.type === 'bpmn-task' && (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="text-[10px] uppercase font-mono text-blue-400 font-bold flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" />
                BPMN Task Specifications
              </label>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Task Sub-Type</span>
                <select
                  disabled={isReadOnly}
                  value={selectedNode.data?.taskType || 'user'}
                  onChange={e => onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, taskType: e.target.value } })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-100 font-mono text-xs"
                >
                  <option value="user">User Task (Manual)</option>
                  <option value="service">Service Task (Automated / API)</option>
                  <option value="send">Send Message Task</option>
                  <option value="receive">Receive Message Task</option>
                  <option value="script">Script Task</option>
                  <option value="subprocess">Sub-Process Container</option>
                </select>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Expected SLA / Duration</span>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={selectedNode.data?.duration || ''}
                  onChange={e => onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, duration: e.target.value } })}
                  placeholder="e.g. 2 hours, 24h SLA"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-100 font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* Universal Custom Key-Value Attributes for ALL Node Types */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">
                Custom Data &amp; Attributes
              </label>
              <button
                disabled={isReadOnly}
                onClick={() => {
                  const attrs = selectedNode.data?.customAttributes || [];
                  onUpdateNode({
                    ...selectedNode,
                    data: {
                      ...selectedNode.data,
                      customAttributes: [...attrs, { key: 'attribute', value: 'value' }],
                    },
                  });
                }}
                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-mono cursor-pointer"
              >
                + Add Prop
              </button>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {(selectedNode.data?.customAttributes || []).length === 0 ? (
                <div className="text-[10px] text-slate-500 italic p-1">
                  No custom attributes added. Click "+ Add Prop" to store metadata like owner, port, cost, SLA, etc.
                </div>
              ) : (
                (selectedNode.data?.customAttributes || []).map((attr: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-slate-950 p-1 rounded border border-slate-800">
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={attr.key}
                      onChange={e => {
                        const attrs = [...(selectedNode.data?.customAttributes || [])];
                        attrs[idx] = { ...attrs[idx], key: e.target.value };
                        onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, customAttributes: attrs } });
                      }}
                      placeholder="key"
                      className="w-24 bg-transparent text-slate-400 font-mono text-[11px] focus:outline-none"
                    />
                    <span className="text-slate-600">:</span>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={attr.value}
                      onChange={e => {
                        const attrs = [...(selectedNode.data?.customAttributes || [])];
                        attrs[idx] = { ...attrs[idx], value: e.target.value };
                        onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, customAttributes: attrs } });
                      }}
                      placeholder="value"
                      className="flex-1 bg-transparent text-slate-100 font-mono text-[11px] focus:outline-none"
                    />
                    <button
                      disabled={isReadOnly}
                      onClick={() => {
                        const attrs = (selectedNode.data?.customAttributes || []).filter((_: any, i: number) => i !== idx);
                        onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, customAttributes: attrs } });
                      }}
                      className="text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Specialized PERT Analysis */}
          {selectedNode.type === 'pert-activity' && (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="text-[10px] uppercase font-mono text-rose-400 font-bold block">PERT Metrics</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400">Duration (Days)</span>
                  <input
                    type="number"
                    disabled={isReadOnly}
                    value={selectedNode.data?.duration ?? 5}
                    onChange={e => onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, duration: parseInt(e.target.value) || 0 } })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Slack Time</span>
                  <input
                    type="number"
                    disabled={isReadOnly}
                    value={selectedNode.data?.slack ?? 0}
                    onChange={e => onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, slack: parseInt(e.target.value) || 0 } })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-100 font-mono"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!selectedNode.data?.isCritical}
                  onChange={e => onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, isCritical: e.target.checked } })}
                  className="rounded text-rose-500 focus:ring-0"
                />
                <span className="text-xs font-semibold text-rose-300">Highlight as Critical Path</span>
              </label>
            </div>
          )}

          {/* Specialized CEQA Settings */}
          {(selectedNode.type === 'ceqa-phase' || selectedNode.type === 'ceqa-review' || selectedNode.type === 'ceqa-eir') && (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="text-[10px] uppercase font-mono text-emerald-400 font-bold block">CEQA Compliance Mandates</label>
              <div>
                <span className="text-[10px] text-slate-400">Statutory Deadline</span>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={selectedNode.data?.deadline || ''}
                  onChange={e => onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, deadline: e.target.value } })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-100 font-mono text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">CEQA Legal Statute</span>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={selectedNode.data?.statute || ''}
                  onChange={e => onUpdateNode({ ...selectedNode, data: { ...selectedNode.data, statute: e.target.value } })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-100 font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* Delete Node Button */}
          {!isReadOnly && (
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => onDeleteNode(selectedNode.id)}
                className="w-full py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-xs font-medium cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Node</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Documentation & Sticky Notes */}
      {activeTab === 'docs' && (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
          {/* Documentation Status */}
          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Architecture Status</label>
            <div className="flex items-center gap-1">
              {(['approved', 'in-review', 'draft', 'deprecated'] as const).map(st => (
                <button
                  key={st}
                  disabled={isReadOnly}
                  onClick={() => updateDocs({ status: st })}
                  className={`px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-all ${
                    (selectedNode.documentation?.status || 'draft') === st
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Description & Specs */}
          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Documentation &amp; Specifications</label>
            <textarea
              rows={4}
              disabled={isReadOnly}
              value={selectedNode.documentation?.description || ''}
              onChange={e => updateDocs({ description: e.target.value })}
              placeholder="Enter comprehensive node architecture notes, business logic, constraints..."
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          {/* API Endpoint mapping */}
          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Linked REST API Endpoint</label>
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 font-mono text-[11px]">
              <Code className="w-3.5 h-3.5 text-blue-400" />
              <input
                type="text"
                disabled={isReadOnly}
                value={selectedNode.documentation?.apiEndpoint || ''}
                onChange={e => updateDocs({ apiEndpoint: e.target.value })}
                placeholder="e.g. POST /api/v1/orders"
                className="w-full bg-transparent focus:outline-none text-slate-100"
              />
            </div>
          </div>

          {/* Sticky Notes section */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-mono text-amber-300 font-bold flex items-center gap-1">
                <StickyIcon className="w-3.5 h-3.5" />
                Attached Sticky Notes ({selectedNode.stickyNotes?.length || 0})
              </label>
            </div>

            {/* Sticky Notes List */}
            <div className="space-y-2">
              {(selectedNode.stickyNotes || []).map(note => {
                const colorBg =
                  note.color === 'yellow' ? 'bg-amber-100 text-amber-950 border-amber-300' :
                  note.color === 'pink' ? 'bg-rose-100 text-rose-950 border-rose-300' :
                  note.color === 'green' ? 'bg-emerald-100 text-emerald-950 border-emerald-300' :
                  note.color === 'blue' ? 'bg-sky-100 text-sky-950 border-sky-300' :
                  'bg-purple-100 text-purple-950 border-purple-300';
                return (
                  <div key={note.id} className={`p-2.5 rounded border shadow-sm ${colorBg}`}>
                    <div className="flex items-center justify-between text-[10px] font-semibold opacity-75 border-b border-black/10 pb-1 mb-1">
                      <span>{note.author}</span>
                      {!isReadOnly && (
                        <button
                          onClick={() => handleRemoveSticky(note.id)}
                          className="hover:text-rose-600 cursor-pointer p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs font-medium leading-relaxed">{note.text}</p>
                  </div>
                );
              })}
            </div>

            {/* Add Sticky Note Form */}
            {!isReadOnly && (
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800 space-y-2">
                <input
                  type="text"
                  value={newStickyText}
                  onChange={e => setNewStickyText(e.target.value)}
                  placeholder="New sticky annotation note..."
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-100 focus:outline-none"
                />
                <div className="flex items-center justify-between">
                  {/* Color pickers */}
                  <div className="flex items-center gap-1">
                    {(['yellow', 'pink', 'green', 'blue', 'purple'] as const).map(c => (
                      <button
                        key={c}
                        onClick={() => setStickyColor(c)}
                        className={`w-4 h-4 rounded-full border cursor-pointer transition-transform ${
                          stickyColor === c ? 'scale-125 ring-2 ring-white' : ''
                        } ${
                          c === 'yellow' ? 'bg-amber-300 border-amber-400' :
                          c === 'pink' ? 'bg-rose-300 border-rose-400' :
                          c === 'green' ? 'bg-emerald-300 border-emerald-400' :
                          c === 'blue' ? 'bg-sky-300 border-sky-400' :
                          'bg-purple-300 border-purple-400'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleAddSticky}
                    className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Attach Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Comments & Team Collaboration */}
      {activeTab === 'comments' && (
        <div className="flex-1 flex flex-col p-3.5 text-xs">
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {(selectedNode.comments || []).length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No comments yet. Start a team discussion on this node!
              </div>
            ) : (
              (selectedNode.comments || []).map(comm => (
                <div key={comm.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold" style={{ color: comm.authorColor }}>
                      {comm.author}
                    </span>
                    <span className="text-slate-500 font-mono">{comm.createdAt}</span>
                  </div>
                  <p className="text-slate-200 leading-snug">{comm.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Add comment input */}
          {userRole !== 'viewer' && (
            <div className="pt-2 border-t border-slate-800 mt-2 flex items-center gap-1.5">
              <input
                type="text"
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddComment();
                }}
                placeholder="Write a comment..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleAddComment}
                className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Hierarchy & Nested Grouping */}
      {activeTab === 'group' && (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
          {/* Sub-process Drill-down link */}
          <div>
            <label className="text-[10px] uppercase font-mono text-purple-400 font-bold block mb-1">
              Sub-Process Navigation Link
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Link this node to another page or sub-process diagram for breadcrumb drill-down.
            </p>
            <select
              disabled={isReadOnly}
              value={selectedNode.drilldownPageId || ''}
              onChange={e => onUpdateNode({ ...selectedNode, drilldownPageId: e.target.value || undefined })}
              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-100 focus:outline-none"
            >
              <option value="">None (Standard Node)</option>
              {allPages
                .filter(p => p.id !== currentPage.id)
                .map(page => (
                  <option key={page.id} value={page.id}>
                    {page.title} ({page.diagramType.toUpperCase()})
                  </option>
                ))}
            </select>

            {selectedNode.drilldownPageId && (
              <button
                onClick={() => {
                  if (selectedNode.drilldownPageId) onDrillDown?.(selectedNode.drilldownPageId);
                }}
                className="mt-2 w-full py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Drill-down into Linked Diagram</span>
              </button>
            )}
          </div>

          {/* Group Parent Container Selection */}
          <div className="pt-3 border-t border-slate-800">
            <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">
              Parent Container Enclosure
            </label>
            <select
              disabled={isReadOnly}
              value={selectedNode.parentId || ''}
              onChange={e => onUpdateNode({ ...selectedNode, parentId: e.target.value || undefined })}
              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-100 focus:outline-none"
            >
              <option value="">No Parent (Root Canvas)</option>
              {currentPage.nodes
                .filter(n => n.isGroup && n.id !== selectedNode.id)
                .map(group => (
                  <option key={group.id} value={group.id}>
                    {group.label} (Container)
                  </option>
                ))}
            </select>
          </div>

          {/* If node is itself a group container */}
          {selectedNode.isGroup && (
            <div className="pt-3 border-t border-slate-800">
              <label className="text-[10px] uppercase font-mono text-blue-400 font-bold block mb-1">
                Child Nodes Inside Container
              </label>
              <div className="space-y-1">
                {currentPage.nodes
                  .filter(n => n.parentId === selectedNode.id)
                  .map(child => (
                    <div key={child.id} className="p-1.5 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-300">
                      • {child.label} ({child.type})
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
