/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DiagramPage, DiagramType } from '../../types/diagram';
import { Plus, X, Layers } from 'lucide-react';

interface NewPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: DiagramPage[];
  onCreatePage: (title: string, diagramType: DiagramType, parentId?: string, description?: string) => void;
}

export const NewPageModal: React.FC<NewPageModalProps> = ({
  isOpen,
  onClose,
  pages,
  onCreatePage,
}) => {
  const [title, setTitle] = useState('');
  const [diagramType, setDiagramType] = useState<DiagramType>('bpmn');
  const [parentId, setParentId] = useState<string>('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreatePage(
      title.trim(),
      diagramType,
      parentId ? parentId : undefined,
      description.trim()
    );
    setTitle('');
    setDescription('');
    setParentId('');
    onClose();
  };

  const types: { id: DiagramType; label: string; category: string }[] = [
    { id: 'bpmn', label: 'BPMN 2.0 Business Process', category: 'Business Process' },
    { id: 'erd', label: 'Entity Relationship Diagram (ERD)', category: 'Software & Data' },
    { id: 'swimlane', label: 'Swimlanes & Cross-Functional', category: 'Business Process' },
    { id: 'uml', label: 'UML Class Diagram & Interfaces', category: 'Software & Data' },
    { id: 'uml-sequence', label: 'UML Sequence Diagram', category: 'Software & Data' },
    { id: 'uml-usecase', label: 'UML Use Case Diagram', category: 'Software & Data' },
    { id: 'uml-state', label: 'UML State Machine Diagram', category: 'Software & Data' },
    { id: 'dfd', label: 'Data Flow Diagram (DFD - Gane & Sarson)', category: 'Software & Data' },
    { id: 'yourdon', label: 'Yourdon / DeMarco Structured Flow', category: 'Software & Data' },
    { id: 'idef0', label: 'IDEF0 Function Architecture (ICOM)', category: 'Industrial & Engineering' },
    { id: 'ceqa', label: 'CEQA Environmental Clearance Flow', category: 'Regulatory & Quality' },
    { id: 'sipoc', label: 'SIPOC High-Level Value Matrix', category: 'Regulatory & Quality' },
    { id: 'pert', label: 'PERT Network (Critical Path)', category: 'Project Management' },
    { id: 'gantt', label: 'Gantt Timeline Schedule', category: 'Project Management' },
    { id: 'flowchart', label: 'Standard ANSI/ISO Flowchart', category: 'Business Process' },
    { id: 'c4', label: 'C4 Software Architecture Model', category: 'Software & Data' },
    { id: 'mindmap', label: 'Mind Map & Concept Map', category: 'Business Process' },
    { id: 'vsm', label: 'Value Stream Mapping (VSM)', category: 'Industrial & Engineering' },
    { id: 'fishbone', label: 'Cause & Effect (Fishbone / Ishikawa)', category: 'Regulatory & Quality' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Create Diagram Page</h2>
              <p className="text-xs text-slate-400">Add a top-level diagram or nested sub-process</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Page Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Payment Gateway Orchestration"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Diagram Model Type</label>
            <select
              value={diagramType}
              onChange={e => setDiagramType(e.target.value as DiagramType)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {types.map(t => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
              Parent Page (Hierarchy &amp; Breadcrumbs)
            </label>
            <select
              value={parentId}
              onChange={e => setParentId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">None (Top-Level Root Page)</option>
              {pages.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.diagramType.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="High-level purpose of this diagram page..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium cursor-pointer transition-colors"
            >
              Create Page
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
