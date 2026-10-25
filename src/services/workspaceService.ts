/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DiagramDocument } from '../types/diagram';
import { initialDiagramDocument } from '../data/seedDiagrams';

export interface WorkspaceDiagram {
  filename: string; // e.g. "diagram1.json"
  name: string; // Display name
  lastModified: string;
  document: DiagramDocument;
}

export interface Workspace {
  id: string; // e.g. "workspace1"
  name: string; // e.g. "workspace1"
  basePath: string; // e.g. "c:/omnimind/data"
  diagrams: Record<string, WorkspaceDiagram>;
  activeDiagramFilename: string; // e.g. "diagram1.json"
}

export interface WorkspaceStore {
  activeWorkspaceId: string;
  workspaces: Record<string, Workspace>;
}

const STORAGE_KEY = 'omnimind_workspaces_v1';
const DEFAULT_BASE_PATH = 'c:/omnimind/data';

class WorkspaceService {
  private store: WorkspaceStore;
  private listeners: Array<() => void> = [];

  constructor() {
    this.store = this.loadStore();
  }

  private loadStore(): WorkspaceStore {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.workspaces && parsed?.activeWorkspaceId) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved workspaces from localStorage:', e);
    }

    // Default Seed Workspace
    const defaultWorkspace: Workspace = {
      id: 'workspace1',
      name: 'workspace1',
      basePath: DEFAULT_BASE_PATH,
      activeDiagramFilename: 'diagram1.json',
      diagrams: {
        'diagram1.json': {
          filename: 'diagram1.json',
          name: initialDiagramDocument.name || 'Enterprise Architecture & Workflows',
          lastModified: new Date().toISOString(),
          document: initialDiagramDocument,
        },
      },
    };

    return {
      activeWorkspaceId: 'workspace1',
      workspaces: {
        workspace1: defaultWorkspace,
      },
    };
  }

  private saveStore(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store));
    } catch (e) {
      console.error('Failed to write workspaces to localStorage:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }

  public getStore(): WorkspaceStore {
    return this.store;
  }

  public getActiveWorkspace(): Workspace {
    const ws = this.store.workspaces[this.store.activeWorkspaceId];
    if (!ws) {
      const firstId = Object.keys(this.store.workspaces)[0];
      if (firstId) {
        this.store.activeWorkspaceId = firstId;
        return this.store.workspaces[firstId];
      }
      // Re-create default
      const defaultWs: Workspace = {
        id: 'workspace1',
        name: 'workspace1',
        basePath: DEFAULT_BASE_PATH,
        activeDiagramFilename: 'diagram1.json',
        diagrams: {
          'diagram1.json': {
            filename: 'diagram1.json',
            name: 'Default Architecture',
            lastModified: new Date().toISOString(),
            document: initialDiagramDocument,
          },
        },
      };
      this.store.workspaces = { workspace1: defaultWs };
      this.store.activeWorkspaceId = 'workspace1';
      this.saveStore();
      return defaultWs;
    }
    return ws;
  }

  public getActiveDiagram(): WorkspaceDiagram {
    const ws = this.getActiveWorkspace();
    let diag = ws.diagrams[ws.activeDiagramFilename];
    if (!diag) {
      const firstKey = Object.keys(ws.diagrams)[0];
      if (firstKey) {
        ws.activeDiagramFilename = firstKey;
        diag = ws.diagrams[firstKey];
      } else {
        const newDiag: WorkspaceDiagram = {
          filename: 'diagram1.json',
          name: 'New Architecture Model',
          lastModified: new Date().toISOString(),
          document: initialDiagramDocument,
        };
        ws.diagrams['diagram1.json'] = newDiag;
        ws.activeDiagramFilename = 'diagram1.json';
        this.saveStore();
        return newDiag;
      }
    }
    return diag;
  }

  public getFullPath(workspaceId?: string, filename?: string): string {
    const ws = workspaceId ? this.store.workspaces[workspaceId] : this.getActiveWorkspace();
    if (!ws) return `${DEFAULT_BASE_PATH}/workspace1/diagram1.json`;
    const fn = filename || ws.activeDiagramFilename || 'diagram1.json';
    const basePath = (ws.basePath || DEFAULT_BASE_PATH).replace(/\/$/, '');
    return `${basePath}/${ws.name}/${fn}`;
  }

  public setActiveWorkspace(workspaceId: string): Workspace {
    if (this.store.workspaces[workspaceId]) {
      this.store.activeWorkspaceId = workspaceId;
      this.saveStore();
      return this.store.workspaces[workspaceId];
    }
    return this.getActiveWorkspace();
  }

  public createWorkspace(name: string, basePath?: string): Workspace {
    const safeId = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_') || `workspace_${Date.now()}`;
    const id = this.store.workspaces[safeId] ? `${safeId}_${Date.now().toString().slice(-4)}` : safeId;
    const cleanBasePath = (basePath || DEFAULT_BASE_PATH).trim();

    const newWorkspace: Workspace = {
      id,
      name: name.trim() || id,
      basePath: cleanBasePath,
      activeDiagramFilename: 'diagram1.json',
      diagrams: {
        'diagram1.json': {
          filename: 'diagram1.json',
          name: `${name.trim()} Diagram 1`,
          lastModified: new Date().toISOString(),
          document: {
            ...initialDiagramDocument,
            id: `doc-${id}-diagram1`,
            name: `${name.trim()} Model`,
          },
        },
      },
    };

    this.store.workspaces[id] = newWorkspace;
    this.store.activeWorkspaceId = id;
    this.saveStore();
    return newWorkspace;
  }

  public renameWorkspace(id: string, newName: string): void {
    const ws = this.store.workspaces[id];
    if (ws) {
      ws.name = newName.trim();
      this.saveStore();
    }
  }

  public updateBasePath(id: string, newBasePath: string): void {
    const ws = this.store.workspaces[id];
    if (ws) {
      ws.basePath = newBasePath.trim();
      this.saveStore();
    }
  }

  public deleteWorkspace(id: string): void {
    const keys = Object.keys(this.store.workspaces);
    if (keys.length <= 1) {
      alert('Cannot delete the only remaining workspace.');
      return;
    }
    delete this.store.workspaces[id];
    if (this.store.activeWorkspaceId === id) {
      this.store.activeWorkspaceId = Object.keys(this.store.workspaces)[0];
    }
    this.saveStore();
  }

  public setActiveDiagram(filename: string): DiagramDocument {
    const ws = this.getActiveWorkspace();
    if (ws.diagrams[filename]) {
      ws.activeDiagramFilename = filename;
      this.saveStore();
      return ws.diagrams[filename].document;
    }
    return this.getActiveDiagram().document;
  }

  public saveCurrentDiagram(doc: DiagramDocument): void {
    const ws = this.getActiveWorkspace();
    const filename = ws.activeDiagramFilename || 'diagram1.json';
    ws.diagrams[filename] = {
      filename,
      name: doc.name || filename.replace('.json', ''),
      lastModified: new Date().toISOString(),
      document: doc,
    };
    this.saveStore();
  }

  public createDiagram(filename: string, name: string, doc?: DiagramDocument): void {
    const ws = this.getActiveWorkspace();
    let safeFilename = filename.trim().toLowerCase();
    if (!safeFilename.endsWith('.json')) safeFilename += '.json';
    safeFilename = safeFilename.replace(/[^a-z0-9._-]/g, '_');

    const newDoc: DiagramDocument = doc || {
      ...initialDiagramDocument,
      id: `doc-${ws.id}-${Date.now()}`,
      name: name || safeFilename.replace('.json', ''),
    };

    ws.diagrams[safeFilename] = {
      filename: safeFilename,
      name: name || safeFilename.replace('.json', ''),
      lastModified: new Date().toISOString(),
      document: newDoc,
    };
    ws.activeDiagramFilename = safeFilename;
    this.saveStore();
  }

  public renameDiagram(oldFilename: string, newFilename: string, newName?: string): void {
    const ws = this.getActiveWorkspace();
    if (!ws.diagrams[oldFilename]) return;

    let safeNewFilename = newFilename.trim().toLowerCase();
    if (!safeNewFilename.endsWith('.json')) safeNewFilename += '.json';
    safeNewFilename = safeNewFilename.replace(/[^a-z0-9._-]/g, '_');

    const diag = ws.diagrams[oldFilename];
    delete ws.diagrams[oldFilename];

    diag.filename = safeNewFilename;
    if (newName) diag.name = newName.trim();
    ws.diagrams[safeNewFilename] = diag;

    if (ws.activeDiagramFilename === oldFilename) {
      ws.activeDiagramFilename = safeNewFilename;
    }
    this.saveStore();
  }

  public deleteDiagram(filename: string): void {
    const ws = this.getActiveWorkspace();
    const keys = Object.keys(ws.diagrams);
    if (keys.length <= 1) {
      alert('Cannot delete the last diagram in this workspace. Create another diagram first.');
      return;
    }
    delete ws.diagrams[filename];
    if (ws.activeDiagramFilename === filename) {
      ws.activeDiagramFilename = Object.keys(ws.diagrams)[0];
    }
    this.saveStore();
  }

  public downloadDiagramJson(filename?: string): void {
    const ws = this.getActiveWorkspace();
    const targetFilename = filename || ws.activeDiagramFilename || 'diagram1.json';
    const diag = ws.diagrams[targetFilename];
    if (!diag) return;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(diag.document, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', targetFilename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  public exportWorkspaceBundle(workspaceId?: string): void {
    const ws = workspaceId ? this.store.workspaces[workspaceId] : this.getActiveWorkspace();
    if (!ws) return;

    const bundle = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      workspace: ws,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${ws.name}_workspace_bundle.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  public importDiagramJson(filename: string, jsonContent: string): DiagramDocument {
    const parsed = JSON.parse(jsonContent);
    if (!parsed || !parsed.pages) {
      throw new Error('Invalid diagram JSON format. Missing pages array.');
    }
    this.createDiagram(filename, parsed.name || filename.replace('.json', ''), parsed);
    return parsed;
  }

  public importWorkspaceBundle(jsonContent: string): Workspace {
    const parsed = JSON.parse(jsonContent);
    const wsData: Workspace = parsed.workspace || parsed;
    if (!wsData || !wsData.name || !wsData.diagrams) {
      throw new Error('Invalid workspace bundle format.');
    }

    const newId = `imported_${Date.now()}`;
    const importedWs: Workspace = {
      ...wsData,
      id: newId,
      name: `${wsData.name} (Imported)`,
    };

    this.store.workspaces[newId] = importedWs;
    this.store.activeWorkspaceId = newId;
    this.saveStore();
    return importedWs;
  }
}

export const workspaceService = new WorkspaceService();
