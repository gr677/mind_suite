/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DiagramDocument, DiagramPage, Collaborator, UserRole, AppTheme } from '../../types/diagram';
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
  Folder,
  HardDrive,
  Save,
  Check,
  Settings,
  Palette,
} from 'lucide-react';
import { THEMES } from '../../utils/themeConfig';

interface AppHeaderProps {
  document: DiagramDocument;
  currentPage: DiagramPage;
  collaborators: Collaborator[];
  userRole: UserRole;
  isOnline: boolean;
  queuedCount: number;
  theme: AppTheme;
  saveStatus?: 'idle' | 'saving' | 'saved';
  activeWorkspaceName?: string;
  activeDiagramFilename?: string;
  onOpenWorkspaceModal: () => void;
  onOpenSettingsModal: () => void;
  onManualSave: () => void;
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
  saveStatus = 'idle',
  activeWorkspaceName,
  activeDiagramFilename,
  onOpenWorkspaceModal,
  onOpenSettingsModal,
  onManualSave,
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

  const themeDef = THEMES[theme] || THEMES.dark;
  const isDark = themeDef.isDark;

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
    <header className={`h-14 border-b flex items-center justify-between px-4 select-none z-30 shrink-0 transition-colors duration-150 ${themeDef.headerClass}`}>
      {/* Left: Brand, Diagram Types Gallery & Breadcrumbs Navigation */}
      <div className="flex items-center gap-3 min-w-0">
        {/* App Logo */}
        <div className={`flex items-center gap-2 pr-3 border-r shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-sm">
            OM
          </div>
          <div className="hidden xl:block">
            <h1 className={`text-xs font-bold tracking-wide uppercase ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>OmniModel Studio</h1>
            <p className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Enterprise Architecture Suite</p>
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

        {/* Workspace Storage Path Pill (Change 4: c:/omnimind/data/workspace1/diagram1.json) */}
        <button
          onClick={onOpenWorkspaceModal}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer shadow-sm group shrink-0 ${
            isDark
              ? 'bg-slate-900 border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 text-slate-300 hover:text-white'
              : 'bg-slate-100 border-slate-200 hover:border-amber-500/50 hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
          title={`Click to manage workspaces & diagrams (c:/omnimind/data/${activeWorkspaceName || 'workspace1'}/${activeDiagramFilename || 'diagram1.json'})`}
        >
          <Folder className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
          <span className={`hidden xl:inline ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>c:/omnimind/data/</span>
          <span className={`${isDark ? 'text-amber-300' : 'text-amber-700'} font-bold`}>{activeWorkspaceName || 'workspace1'}</span>
          <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>/</span>
          <span className={`${isDark ? 'text-sky-300' : 'text-sky-700'} font-bold`}>{activeDiagramFilename || 'diagram1.json'}</span>
        </button>

        {/* Save Diagram Button */}
        <button
          onClick={onManualSave}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-xs shrink-0 ${
            saveStatus === 'saved'
              ? 'bg-emerald-600 text-white shadow-emerald-500/20'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
          title={`Save active diagram to ${activeWorkspaceName || 'workspace1'} (Ctrl+S)`}
        >
          {saveStatus === 'saved' ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saveStatus === 'saved' ? 'Saved!' : 'Save'}</span>
          <kbd className="hidden lg:inline text-[9px] font-mono px-1 py-0.2 rounded bg-black/25 opacity-80">
            Ctrl+S
          </kbd>
        </button>

        {/* Current Diagram Type Badge */}
        <div
          onClick={onOpenGallery}
          className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] font-mono cursor-pointer transition-colors shrink-0 ${
            isDark
              ? 'bg-slate-900 border-slate-800 hover:border-slate-700 text-blue-300'
              : 'bg-slate-100 border-slate-200 hover:border-slate-300 text-blue-700'
          }`}
          title="Click to view diagram standard details or switch diagram type"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="uppercase font-semibold">{currentPage.diagramType}</span>
        </div>

        {/* Dynamic Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs truncate">
          <button
            onClick={() => onSelectPage(document.pages[0].id)}
            className={`font-medium cursor-pointer ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Pages
          </button>
          <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />

          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.id}>
                {idx > 0 && <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />}
                {isLast ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsPageDropdownOpen(o => !o)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md border font-semibold cursor-pointer max-w-[200px] truncate ${
                        isDark
                          ? 'bg-slate-900 border-slate-800 hover:border-slate-700 text-blue-400'
                          : 'bg-slate-100 border-slate-200 hover:border-slate-300 text-blue-600'
                      }`}
                    >
                      <span className="truncate">{crumb.title}</span>
                      <ChevronDown className={`w-3 h-3 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    </button>

                    {/* Page Switcher Dropdown */}
                    {isPageDropdownOpen && (
                      <div className={`absolute left-0 mt-1 w-72 border rounded-xl shadow-2xl p-1.5 z-50 ${
                        isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}>
                        <div className={`px-2 py-1 text-[10px] uppercase font-mono border-b mb-1 flex items-center justify-between ${
                          isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-100'
                        }`}>
                          <span>Switch Diagram Page</span>
                          <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{document.pages.length} total</span>
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
                                  : isDark
                                  ? 'hover:bg-slate-800 text-slate-300'
                                  : 'hover:bg-slate-100 text-slate-700'
                              }`}
                            >
                              <span className="truncate">{page.title}</span>
                              <span className={`text-[9px] font-mono opacity-70 uppercase ml-2 px-1 py-0.2 rounded border ${
                                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100 border-slate-200 text-slate-600'
                              }`}>
                                {page.diagramType}
                              </span>
                            </button>
                          ))}
                        </div>
                        <div className={`pt-1.5 border-t mt-1 space-y-1 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                          <button
                            onClick={() => {
                              setIsPageDropdownOpen(false);
                              onOpenNewPageModal();
                            }}
                            className={`w-full py-1 px-2 text-center text-xs text-blue-500 rounded font-medium cursor-pointer ${
                              isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                            }`}
                          >
                            + Create New Diagram Page
                          </button>
                          <button
                            onClick={() => {
                              setIsPageDropdownOpen(false);
                              onOpenGallery();
                            }}
                            className={`w-full py-1 px-2 text-center text-xs rounded font-medium cursor-pointer ${
                              isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                            }`}
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
                    className={`cursor-pointer truncate max-w-[140px] ${
                      isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                    }`}
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
          className={`p-1 rounded cursor-pointer transition-colors ${
            isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
          }`}
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
            <div className={`absolute right-0 mt-1 w-52 border rounded-xl shadow-2xl p-1.5 z-50 text-xs ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <div className={`px-2 py-1 text-[10px] uppercase font-mono border-b mb-1 ${
                isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-100'
              }`}>
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
                      : isDark
                      ? 'hover:bg-slate-800 text-slate-300'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>{role}</span>
                  <span className={`text-[10px] lowercase font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {role === 'admin' ? 'full rights' : role === 'editor' ? 'can edit' : role === 'reviewer' ? 'comments only' : 'read-only'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

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
          className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-xs ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
          }`}
          title="Publish project to GitHub repository"
        >
          <Github className={`w-3.5 h-3.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`} />
          <span className="hidden lg:inline">GitHub</span>
        </button>

        {/* REST API & JSON Hub Button */}
        <button
          onClick={onOpenRestApiModal}
          className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-xs ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
          }`}
          title="Open REST API & JSON Data Explorer"
        >
          <Server className="w-3.5 h-3.5 text-emerald-500" />
          <span className="hidden lg:inline">REST API &amp; JSON</span>
        </button>

        {/* Version History Button */}
        <button
          onClick={onOpenVersionsModal}
          className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-xs ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
          }`}
          title="Version History Snapshots"
        >
          <History className="w-3.5 h-3.5 text-blue-500" />
          <span className="hidden lg:inline">History ({document.versions.length})</span>
        </button>

        {/* Settings Menu Button */}
        <button
          onClick={onOpenSettingsModal}
          className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-xs ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
          }`}
          title="Studio Settings & Themes"
        >
          <Settings className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Settings</span>
        </button>

        {/* Quick Theme Switcher Button */}
        <button
          onClick={onToggleTheme}
          className={`p-1.5 border rounded-lg cursor-pointer transition-colors ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
          }`}
          title={`Active Theme: ${themeDef.name} (Click to toggle theme)`}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>
    </header>
  );
};
