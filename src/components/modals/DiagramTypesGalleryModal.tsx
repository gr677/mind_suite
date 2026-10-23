/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DIAGRAM_TYPES_CATALOG, DiagramTypeDefinition } from '../../data/diagramTypesCatalog';
import { DiagramType } from '../../types/diagram';
import {
  Layers,
  Search,
  Check,
  Plus,
  ArrowRight,
  Filter,
  Sparkles,
  Table,
  Cpu,
  Columns3,
  Component,
  ArrowDownUp,
  Users,
  CircleDot,
  Database,
  Circle,
  SquareStack,
  FileCheck2,
  ListOrdered,
  Network,
  CalendarCheck,
  GitFork,
  TrendingUp,
  GitBranch,
  X,
} from 'lucide-react';

interface DiagramTypesGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentType: DiagramType;
  onSelectDiagramType: (type: DiagramType) => void;
  onCreateNewPageOfType: (type: DiagramType, name: string) => void;
  onFilterToolbox: (type: DiagramType) => void;
}

export const DiagramTypesGalleryModal: React.FC<DiagramTypesGalleryModalProps> = ({
  isOpen,
  onClose,
  currentType,
  onSelectDiagramType,
  onCreateNewPageOfType,
  onFilterToolbox,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = [
    'All',
    'Software & Data',
    'Business Process',
    'Regulatory & Quality',
    'Project Management',
    'Industrial & Engineering',
  ];

  const filteredTypes = DIAGRAM_TYPES_CATALOG.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase()) ||
      item.standard.toLowerCase().includes(search.toLowerCase()) ||
      item.keyElements.some(k => k.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCatalogIcon = (iconName: string) => {
    switch (iconName) {
      case 'Table': return <Table className="w-5 h-5 text-sky-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-blue-400" />;
      case 'Columns3': return <Columns3 className="w-5 h-5 text-indigo-400" />;
      case 'Component': return <Component className="w-5 h-5 text-cyan-400" />;
      case 'ArrowDownUp': return <ArrowDownUp className="w-5 h-5 text-teal-400" />;
      case 'Users': return <Users className="w-5 h-5 text-blue-400" />;
      case 'CircleDot': return <CircleDot className="w-5 h-5 text-purple-400" />;
      case 'Database': return <Database className="w-5 h-5 text-sky-400" />;
      case 'Circle': return <Circle className="w-5 h-5 text-amber-400" />;
      case 'SquareStack': return <SquareStack className="w-5 h-5 text-blue-400" />;
      case 'FileCheck2': return <FileCheck2 className="w-5 h-5 text-emerald-400" />;
      case 'ListOrdered': return <ListOrdered className="w-5 h-5 text-yellow-400" />;
      case 'Network': return <Network className="w-5 h-5 text-rose-400" />;
      case 'CalendarCheck': return <CalendarCheck className="w-5 h-5 text-emerald-400" />;
      case 'GitFork': return <GitFork className="w-5 h-5 text-blue-400" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-amber-400" />;
      case 'GitBranch': return <GitBranch className="w-5 h-5 text-rose-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-purple-400" />;
      default: return <Layers className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[88vh] text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                  Enterprise Diagram Types &amp; Standards
                </h2>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-mono font-bold">
                  {DIAGRAM_TYPES_CATALOG.length} Standardized Models
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Select from any standard modeling notation: ERD, BPMN, UML, DFD, IDEF0, CEQA, SIPOC, PERT, Gantt, C4 &amp; more.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by diagram name, standard (e.g. BPMN, CEQA, IDEF0, UML), or elements..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTypes.map(item => {
            const isCurrent = item.id === currentType;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-slate-950 border-blue-500/80 ring-2 ring-blue-500/30'
                    : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
                        {getCatalogIcon(item.iconName)}
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-slate-100 leading-snug">{item.name}</h3>
                        <span className="text-[10px] text-slate-400 font-mono">{item.standard}</span>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[9px] font-bold font-mono shrink-0">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-300 leading-relaxed my-2">{item.summary}</p>

                  {/* Key Elements tags */}
                  <div className="flex flex-wrap gap-1 my-2.5">
                    {item.keyElements.map((el, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 bg-slate-900 rounded text-[10px] text-slate-400 font-mono border border-slate-800"
                      >
                        {el}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
                  <button
                    onClick={() => {
                      onFilterToolbox(item.id);
                      onClose();
                    }}
                    className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    title="Filter Toolbox to show this diagram's shapes"
                  >
                    <Filter className="w-3 h-3 text-blue-400" />
                    <span>Filter Shapes</span>
                  </button>

                  <button
                    onClick={() => {
                      onCreateNewPageOfType(item.id, `New ${item.name}`);
                      onClose();
                    }}
                    className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-sm"
                    title="Create a new diagram page using this format"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Page</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>
            Current Active Model: <strong className="text-blue-400 uppercase font-mono">{currentType}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium cursor-pointer"
          >
            Close Gallery
          </button>
        </div>
      </div>
    </div>
  );
};
