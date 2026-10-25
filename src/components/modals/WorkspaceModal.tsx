/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Folder,
  FileCode,
  Plus,
  Trash2,
  Download,
  Upload,
  Check,
  X,
  ExternalLink,
  HardDrive,
  Copy,
  Edit2,
  FolderPlus,
  Layers,
  Clock,
  Sparkles,
} from 'lucide-react';
import { workspaceService, Workspace, WorkspaceDiagram } from '../../services/workspaceService';
import { DiagramDocument } from '../../types/diagram';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDiagram: (doc: DiagramDocument) => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  onLoadDiagram,
}) => {
  const [store, setStore] = useState(() => workspaceService.getStore());
  const [activeWs, setActiveWs] = useState<Workspace>(() => workspaceService.getActiveWorkspace());
  const [newWsName, setNewWsName] = useState('');
  const [newDiagramName, setNewDiagramName] = useState('');
  const [newDiagramFilename, setNewDiagramFilename] = useState('');
  const [isCreatingWs, setIsCreatingWs] = useState(false);
  const [isCreatingDiagram, setIsCreatingDiagram] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const [editingBasePath, setEditingBasePath] = useState(false);
  const [customBasePath, setCustomBasePath] = useState(activeWs.basePath);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = workspaceService.subscribe(() => {
      setStore({ ...workspaceService.getStore() });
      setActiveWs({ ...workspaceService.getActiveWorkspace() });
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (activeWs) {
      setCustomBasePath(activeWs.basePath);
    }
  }, [activeWs]);

  if (!isOpen) return null;

  const currentPath = workspaceService.getFullPath();

  const handleCopyPath = () => {
    navigator.clipboard.writeText(currentPath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const handleSwitchWorkspace = (wsId: string) => {
    const switched = workspaceService.setActiveWorkspace(wsId);
    setActiveWs(switched);
    const diag = workspaceService.getActiveDiagram();
    onLoadDiagram(diag.document);
  };

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    const ws = workspaceService.createWorkspace(newWsName.trim());
    setActiveWs(ws);
    setNewWsName('');
    setIsCreatingWs(false);
    const diag = workspaceService.getActiveDiagram();
    onLoadDiagram(diag.document);
  };

  const handleSwitchDiagram = (filename: string) => {
    const doc = workspaceService.setActiveDiagram(filename);
    onLoadDiagram(doc);
    onClose();
  };

  const handleCreateDiagram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiagramFilename.trim()) return;
    workspaceService.createDiagram(
      newDiagramFilename.trim(),
      newDiagramName.trim() || newDiagramFilename.trim()
    );
    const diag = workspaceService.getActiveDiagram();
    onLoadDiagram(diag.document);
    setNewDiagramFilename('');
    setNewDiagramName('');
    setIsCreatingDiagram(false);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        if (file.name.includes('workspace_bundle')) {
          const imported = workspaceService.importWorkspaceBundle(content);
          setActiveWs(imported);
          const diag = workspaceService.getActiveDiagram();
          onLoadDiagram(diag.document);
        } else {
          const doc = workspaceService.importDiagramJson(file.name, content);
          onLoadDiagram(doc);
        }
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveBasePath = () => {
    workspaceService.updateBasePath(activeWs.id, customBasePath);
    setEditingBasePath(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                Workspace &amp; Diagram Manager
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-[10px] font-mono">
                  {Object.keys(store.workspaces).length} Workspaces
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Organize diagrams across file hierarchies on disk
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Path Bar (Prominently showing c:/omnimind/data/workspace1/diagram1.json) */}
        <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs text-slate-400 font-mono">Active Target Path:</span>
            <div className="flex items-center gap-1 font-mono text-xs px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 truncate">
              <span className="text-slate-400">{activeWs.basePath}/</span>
              <span className="text-amber-300 font-bold">{activeWs.name}/</span>
              <span className="text-sky-300 font-bold">{activeWs.activeDiagramFilename}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPath}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono transition-colors cursor-pointer"
              title="Copy path to clipboard"
            >
              {copiedPath ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPath ? 'Copied' : 'Copy Path'}</span>
            </button>
            <button
              onClick={() => workspaceService.downloadDiagramJson()}
              className="flex items-center gap-1.5 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              title="Download diagram JSON file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {activeWs.activeDiagramFilename}</span>
            </button>
          </div>
        </div>

        {/* Main Content Area (Workspaces list on left, Diagrams in workspace on right) */}
        <div className="flex-1 flex overflow-hidden min-h-[380px]">
          {/* Workspaces Sidebar */}
          <div className="w-1/3 bg-slate-950/40 border-r border-slate-800 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Workspaces ({Object.keys(store.workspaces).length})
              </span>
              <button
                onClick={() => setIsCreatingWs(c => !c)}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ New</span>
              </button>
            </div>

            {/* Create Workspace Inline Form */}
            {isCreatingWs && (
              <form onSubmit={handleCreateWorkspace} className="mb-3 p-2.5 bg-slate-900 border border-amber-500/40 rounded-lg space-y-2">
                <input
                  type="text"
                  placeholder="e.g. workspace2, cloud_prod..."
                  value={newWsName}
                  onChange={e => setNewWsName(e.target.value)}
                  autoFocus
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsCreatingWs(false)}
                    className="px-2 py-1 text-[10px] text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[10px]"
                  >
                    Create Workspace
                  </button>
                </div>
              </form>
            )}

            {/* Workspaces List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {Object.values(store.workspaces).map(ws => {
                const isActive = ws.id === activeWs.id;
                const diagCount = Object.keys(ws.diagrams).length;
                return (
                  <div
                    key={ws.id}
                    onClick={() => handleSwitchWorkspace(ws.id)}
                    className={`group p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-100 shadow-sm'
                        : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <Folder
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-amber-400 fill-amber-400/20' : 'text-slate-500'
                        }`}
                      />
                      <div className="truncate">
                        <div className="text-xs font-semibold truncate font-mono">{ws.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {diagCount} diagram{diagCount === 1 ? '' : 's'}
                        </div>
                      </div>
                    </div>

                    {Object.keys(store.workspaces).length > 1 && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (confirm(`Delete workspace "${ws.name}" and all its diagrams?`)) {
                            workspaceService.deleteWorkspace(ws.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-500/20 text-rose-400 rounded transition-all cursor-pointer"
                        title="Delete workspace"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Base Path Editor */}
            <div className="pt-3 border-t border-slate-800 mt-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>Base Folder:</span>
                {!editingBasePath ? (
                  <button
                    onClick={() => setEditingBasePath(true)}
                    className="text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                    <span>Change</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSaveBasePath}
                    className="text-emerald-400 hover:underline font-semibold"
                  >
                    Save
                  </button>
                )}
              </div>
              {editingBasePath ? (
                <input
                  type="text"
                  value={customBasePath}
                  onChange={e => setCustomBasePath(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-900 border border-blue-500 rounded text-[11px] font-mono text-white focus:outline-none"
                />
              ) : (
                <div className="text-[11px] font-mono text-slate-300 truncate bg-slate-900 px-2 py-1 rounded border border-slate-800/80">
                  {activeWs.basePath}
                </div>
              )}
            </div>
          </div>

          {/* Diagrams in Selected Workspace */}
          <div className="flex-1 p-5 flex flex-col bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                  <span>Diagrams in {activeWs.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                    {Object.keys(activeWs.diagrams).length} files
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Stored at: {activeWs.basePath}/{activeWs.name}/*.json
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCreatingDiagram(c => !c)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Diagram</span>
                </button>
                <button
                  onClick={() => workspaceService.exportWorkspaceBundle(activeWs.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                  title="Export full workspace as JSON bundle"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Export Bundle</span>
                </button>
              </div>
            </div>

            {/* Create Diagram Inline Form */}
            {isCreatingDiagram && (
              <form onSubmit={handleCreateDiagram} className="my-3 p-3 bg-slate-950 border border-blue-500/40 rounded-xl space-y-2.5">
                <div className="text-xs font-bold text-blue-300">Create New Diagram in {activeWs.name}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                      File Name (.json)
                    </label>
                    <input
                      type="text"
                      placeholder="diagram2.json"
                      value={newDiagramFilename}
                      onChange={e => setNewDiagramFilename(e.target.value)}
                      autoFocus
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                      Diagram Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Payments Microservices"
                      value={newDiagramName}
                      onChange={e => setNewDiagramName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreatingDiagram(false)}
                    className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-xs"
                  >
                    Create Diagram
                  </button>
                </div>
              </form>
            )}

            {/* Diagrams Grid / List */}
            <div className="flex-1 overflow-y-auto space-y-2 mt-3 pr-1">
              {Object.values(activeWs.diagrams).map(diag => {
                const isCurrent = diag.filename === activeWs.activeDiagramFilename;
                const pageCount = diag.document?.pages?.length || 1;
                const nodeCount = diag.document?.pages?.reduce((acc, p) => acc + (p.nodes?.length || 0), 0) || 0;

                return (
                  <div
                    key={diag.filename}
                    onClick={() => handleSwitchDiagram(diag.filename)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-500/10 border-blue-500/60 shadow-md ring-1 ring-blue-500/20'
                        : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-lg ${
                          isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <FileCode className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-sky-300">
                            {diag.filename}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[9px] font-mono">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-200 font-medium truncate mt-0.5">
                          {diag.name}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-1">
                          <span>{pageCount} page{pageCount === 1 ? '' : 's'}</span>
                          <span>•</span>
                          <span>{nodeCount} nodes</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(diag.lastModified).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          workspaceService.downloadDiagramJson(diag.filename);
                        }}
                        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-sky-300 rounded-lg transition-colors cursor-pointer"
                        title={`Download ${diag.filename} to local computer`}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {Object.keys(activeWs.diagrams).length > 1 && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            if (confirm(`Delete diagram "${diag.filename}" from ${activeWs.name}?`)) {
                              workspaceService.deleteDiagram(diag.filename);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                          title="Delete diagram"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom: Import JSON File */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-mono cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>Import Diagram / Bundle JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>

              {importError && (
                <span className="text-rose-400 text-xs font-mono">{importError}</span>
              )}

              <span className="text-[11px] text-slate-500 font-mono">
                Supports diagram JSON or workspace bundle JSON
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
