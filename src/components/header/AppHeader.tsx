/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DiagramDocument, DiagramPage, Collaborator, UserRole } from '../../types/diagram';
import {
  ChevronRight,
  Layers,
  Plus,
  History,
  Server,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  Shield,
  Users,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Download,
  Github,
} from 'lucide-react';

interface AppHeaderProps {
  document: DiagramDocument;
  currentPage: DiagramPage;
  collaborators: Collaborator[];
  userRole: UserRole;
  isOnline: boolean;
  queuedCount: number;
  theme: 'dark' | 'light';
  onSelectPage: (pageId: string) => void;
  onOpenNewPageModal: () => void;
  onOpenGallery: () => void;
  onOpenGitHubModal: () => void;
  onOpenVersionsModal: () => void;
  onOpenRestApiModal: () => void;
  onOpenOfflineModal: () => void;
  onChangeRole: (newRole: UserRole) => void;
  onToggleTheme: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  document,
  currentPage,
  collaborators,
  userRole,
  isOnline,
  queuedCount,
  theme,
  onSelectPage,
  onOpenNewPageModal,
  onOpenGallery,
  onOpenGitHubModal,
  onOpenVersionsModal,
  onOpenRestApiModal,
  onOpenOfflineModal,
  onChangeRole,
  onToggleTheme,
}) => {
  const [isPageDropdownOpen, setIsPageDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Compute breadcrumb trail
  const breadcrumbs: { id: string; title: string }[] = [];
  let curr: DiagramPage | undefined = currentPage;
  while (curr) {
    breadcrumbs.unshift({ id: curr.id, title: curr.title });
    curr = curr.parentId ? document.pages.find(p => p.id === curr?.parentId) : undefined;
  }

  const roleColors: Record<UserRole, string> = {
    admin: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    editor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    reviewer: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    viewer: 'bg-slate-700/50 text-slate-300 border-slate-600',
  };

  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 text-slate-200 select-none z-30 shrink-0">
      {/* Left: Brand, Diagram Types Gallery & Breadcrumbs Navigation */}
      <div className="flex items-center gap-3 min-w-0">
        {/* App Logo */}
        <div className="flex items-center gap-2 pr-3 border-r border-slate-800 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-sm">
            OM
          </div>
          <div className="hidden xl:block">
            <h1 className="text-xs font-bold text-slate-100 tracking-wide uppercase">OmniModel Studio</h1>
            <p className="text-[10px] text-slate-400 font-mono">Enterprise Architecture Suite</p>
          </div>
        </div>

        {/* Big Diagram Types Catalog Launcher Button */}
        <button
          onClick={onOpenGallery}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-md shadow-blue-600/20 shrink-0"
          title="Open complete catalog of 19 standardized diagram types"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Diagram Types (19)</span>
        </button>

        {/* Current Diagram Type Badge */}
        <div
          onClick={onOpenGallery}
          className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-blue-300 text-[11px] font-mono cursor-pointer transition-colors shrink-0"
          title="Click to view diagram standard details or switch diagram type"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="uppercase font-semibold">{currentPage.diagramType}</span>
        </div>

        {/* Dynamic Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs truncate">
          <button
            onClick={() => onSelectPage(document.pages[0].id)}
            className="text-slate-400 hover:text-slate-200 font-medium cursor-pointer"
          >
            Pages
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.id}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                {isLast ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsPageDropdownOpen(o => !o)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 font-semibold text-blue-400 cursor-pointer max-w-[200px] truncate"
                    >
                      <span className="truncate">{crumb.title}</span>
                      <ChevronDown className="w-3 h-3 shrink-0 text-slate-400" />
                    </button>

                    {/* Page Switcher Dropdown */}
                    {isPageDropdownOpen && (
                      <div className="absolute left-0 mt-1 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50">
                        <div className="px-2 py-1 text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800 mb-1 flex items-center justify-between">
                          <span>Switch Diagram Page</span>
                          <span className="text-slate-500">{document.pages.length} total</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto space-y-0.5">
                          {document.pages.map(page => (
                            <button
                              key={page.id}
                              onClick={() => {
                                onSelectPage(page.id);
                                setIsPageDropdownOpen(false);
                              }}
                              className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                                page.id === currentPage.id
                                  ? 'bg-blue-600 text-white font-medium'
                                  : 'hover:bg-slate-800 text-slate-300'
                              }`}
                            >
                              <span className="truncate">{page.title}</span>
                              <span className="text-[9px] font-mono opacity-70 uppercase ml-2 px-1 py-0.2 bg-slate-950/60 rounded border border-slate-800">
                                {page.diagramType}
                              </span>
                            </button>
                          ))}
                        </div>
                        <div className="pt-1.5 border-t border-slate-800 mt-1 space-y-1">
                          <button
                            onClick={() => {
                              setIsPageDropdownOpen(false);
                              onOpenNewPageModal();
                            }}
                            className="w-full py-1 px-2 text-center text-xs text-blue-400 hover:bg-slate-800 rounded font-medium cursor-pointer"
                          >
                            + Create New Diagram Page
                          </button>
                          <button
                            onClick={() => {
                              setIsPageDropdownOpen(false);
                              onOpenGallery();
                            }}
                            className="w-full py-1 px-2 text-center text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded font-medium cursor-pointer"
                          >
                            Browse All 19 Diagram Types &amp; Templates...
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectPage(crumb.id)}
                    className="text-slate-400 hover:text-slate-200 cursor-pointer truncate max-w-[140px]"
                  >
                    {crumb.title}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Add Page Button */}
        <button
          onClick={onOpenNewPageModal}
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded cursor-pointer transition-colors"
          title="Add Diagram Page"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Actions, RBAC Role Switcher, Collaborators & Modals */}
      <div className="flex items-center gap-2.5">
        {/* RBAC Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(r => !r)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold cursor-pointer transition-colors ${roleColors[userRole]}`}
            title="Switch User Role (RBAC)"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="capitalize">{userRole}</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-1 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 text-xs">
              <div className="px-2 py-1 text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800 mb-1">
                Select RBAC Role
              </div>
              {(['admin', 'editor', 'reviewer', 'viewer'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => {
                    onChangeRole(role);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg capitalize flex items-center justify-between cursor-pointer ${
                    userRole === role
                      ? 'bg-blue-600 text-white font-medium'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span>{role}</span>
                  <span className="text-[10px] text-slate-400 lowercase font-mono">
                    {role === 'admin' ? 'full rights' : role === 'editor' ? 'can edit' : role === 'reviewer' ? 'comments only' : 'read-only'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Real-Time Collaborator Avatars (Hidden for now as requested) */}
        {/*
        <div className="hidden sm:flex items-center -space-x-1.5 px-1">
          {collaborators.map(c => (
            <div
              key={c.id}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-slate-950 shadow cursor-pointer transition-transform hover:scale-110"
              style={{ backgroundColor: c.color }}
              title={`${c.name} (${c.role}) - ${c.lastAction || 'Active'}`}
            >
              {c.avatar}
            </div>
          ))}
        </div>
        */}

        {/* Offline Sync Status Pill */}
        <button
          onClick={onOpenOfflineModal}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-colors ${
            !isOnline
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
              : queuedCount > 0
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}
          title="Inspect Offline Sync & Local Queue"
        >
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">
            {!isOnline
              ? `Offline (${queuedCount} queued)`
              : queuedCount > 0
              ? `Syncing (${queuedCount})`
              : 'Online'}
          </span>
        </button>

        {/* GitHub Publish Button */}
        <button
          onClick={onOpenGitHubModal}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-sm"
          title="Publish project to GitHub repository"
        >
          <Github className="w-3.5 h-3.5 text-slate-200" />
          <span className="hidden lg:inline">GitHub</span>
        </button>

        {/* REST API & JSON Hub Button */}
        <button
          onClick={onOpenRestApiModal}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-sm"
          title="Open REST API & JSON Data Explorer"
        >
          <Server className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden lg:inline">REST API &amp; JSON</span>
        </button>

        {/* Version History Button */}
        <button
          onClick={onOpenVersionsModal}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-sm"
          title="Version History Snapshots"
        >
          <History className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden lg:inline">History ({document.versions.length})</span>
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg cursor-pointer transition-colors"
          title="Toggle Dark / Light Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
        </button>
      </div>
    </header>
  );
};
