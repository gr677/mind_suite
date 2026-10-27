/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Folder,
  FileCode,
  Copy,
  Check,
  Download,
  X,
  HardDrive,
  ExternalLink,
} from 'lucide-react';
import { AppTheme } from '../../types/diagram';
import { THEMES } from '../../utils/themeConfig';
import { workspaceService } from '../../services/workspaceService';

interface SaveSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  fullPath: string;
  filename: string;
  diagramName: string;
  workspaceName: string;
  theme?: AppTheme;
  onOpenWorkspaceModal?: () => void;
}

export const SaveSuccessModal: React.FC<SaveSuccessModalProps> = ({
  isOpen,
  onClose,
  fullPath,
  filename,
  diagramName,
  workspaceName,
  theme = 'dark',
  onOpenWorkspaceModal,
}) => {
  const [copied, setCopied] = useState(false);
  const themeDef = THEMES[theme] || THEMES.dark;
  const isDark = themeDef.isDark;

  // Reset copied state when opened
  useEffect(() => {
    if (isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyPath = () => {
    navigator.clipboard.writeText(fullPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJson = () => {
    workspaceService.downloadDiagramJson(filename);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden border transition-all duration-200 transform scale-100 ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-slate-300 text-slate-800'
        }`}
      >
        {/* Header with Success Badge */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className={`text-sm font-bold uppercase tracking-wide ${
                    isDark ? 'text-slate-100' : 'text-slate-900'
                  }`}
                >
                  Diagram Saved Successfully
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LOCAL DISK PATH
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Saved to local workspace storage and ready for export
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Full Path Showcase Banner */}
          <div>
            <label
              className={`text-[10px] uppercase font-mono block mb-1.5 font-bold flex items-center gap-1.5 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5 text-sky-400" />
              <span>Full File Save Path:</span>
            </label>

            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 group transition-colors ${
                isDark
                  ? 'bg-slate-950 border-slate-700 text-sky-300'
                  : 'bg-slate-50 border-slate-300 text-sky-700'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 font-mono text-xs">
                <FileCode className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="font-bold truncate select-all">{fullPath}</span>
              </div>

              <button
                type="button"
                onClick={handleCopyPath}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-all shrink-0 text-xs shadow-xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : isDark
                    ? 'bg-slate-850 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                }`}
                title="Copy full path to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Path'}</span>
              </button>
            </div>
          </div>

          {/* Breakdown Details Table */}
          <div
            className={`p-3.5 rounded-xl border space-y-2 text-[11px] ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/70 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Diagram Title:</span>
              <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {diagramName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>JSON File:</span>
              <span className="font-mono font-bold text-sky-400">{filename}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Target Workspace:</span>
              <span className="font-mono text-amber-400">{workspaceName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Storage Engine:</span>
              <span className="font-mono text-emerald-400">Local Browser Storage (Persistent)</span>
            </div>
          </div>

          {/* Quick Actions Note */}
          <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            You can also download a direct copy of this <code className="font-mono font-semibold text-sky-400">{filename}</code> to your physical disk downloads folder, or manage multiple diagrams in the Workspace Manager.
          </p>
        </div>

        {/* Footer Actions */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between gap-2 ${
            isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadJson}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors border ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
              }`}
              title="Download standalone diagram JSON file directly to local computer"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Download .JSON File</span>
            </button>

            {onOpenWorkspaceModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWorkspaceModal();
                }}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  isDark
                    ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                    : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                <span>Open Workspaces</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-lg shadow-blue-600/30"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
