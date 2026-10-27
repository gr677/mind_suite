/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import fsp from 'fs/promises';
import { initialDiagramDocument } from './src/data/seedDiagrams';
import { DiagramDocument, DiagramPage, DiagramVersion } from './src/types/diagram';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '20mb' }));

// Server-side physical disk storage configurations
const STORAGE_DIR = path.join(__dirname, 'storage_data');
const CONFIG_FILE = path.join(__dirname, '.storage_root.txt');
const DEFAULT_CONFIGURED_ROOT = 'c:/omnimind/data';

function getConfiguredRootDir(): string {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const val = fs.readFileSync(CONFIG_FILE, 'utf-8').trim();
      if (val) return val;
    }
  } catch (err) {
    console.warn('[Storage] Error reading config file:', err);
  }
  return DEFAULT_CONFIGURED_ROOT;
}

function setConfiguredRootDir(newPath: string): string {
  try {
    const trimmed = (newPath || DEFAULT_CONFIGURED_ROOT).trim();
    fs.writeFileSync(CONFIG_FILE, trimmed, 'utf-8');
    return trimmed;
  } catch (err) {
    console.error('[Storage] Error writing config file:', err);
    return DEFAULT_CONFIGURED_ROOT;
  }
}

function sanitizeName(name: string): string {
  return (name || '').replace(/[^a-zA-Z0-9._-]/g, '_');
}

function toWindowsPath(base: string, workspace: string, filename: string): string {
  const normBase = (base || DEFAULT_CONFIGURED_ROOT).replace(/\/+/g, '\\').replace(/\\+$/, '');
  let win = `${normBase}\\${workspace}\\${filename}`;
  if (/^[a-z]:\\/i.test(win)) {
    win = win.charAt(0).toUpperCase() + win.slice(1);
  }
  return win;
}

// Ensure storage directories and default workspace with root.json exist on disk
async function initStorageOnDisk() {
  try {
    await fsp.mkdir(STORAGE_DIR, { recursive: true });
    const ws1Dir = path.join(STORAGE_DIR, 'workspace1');
    await fsp.mkdir(ws1Dir, { recursive: true });

    const rootFile = path.join(ws1Dir, 'root.json');
    const legacyDiagram1 = path.join(ws1Dir, 'diagram1.json');

    if (!fs.existsSync(rootFile)) {
      if (fs.existsSync(legacyDiagram1)) {
        await fsp.copyFile(legacyDiagram1, rootFile);
        console.log('[Storage] Migrated workspace1/diagram1.json -> workspace1/root.json on server disk');
      } else {
        await fsp.writeFile(rootFile, JSON.stringify(initialDiagramDocument, null, 2), 'utf-8');
        console.log('[Storage] Initialized workspace1/root.json on server disk');
      }
    }
  } catch (err) {
    console.error('[Storage] Error initializing disk storage:', err);
  }
}

// In-memory document storage initialized with multi-page diagrams
const documents: Map<string, DiagramDocument> = new Map();
documents.set(initialDiagramDocument.id, JSON.parse(JSON.stringify(initialDiagramDocument)));

// REST API Endpoints

// OpenAPI specification document
app.get('/api/openapi.json', (req: Request, res: Response) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'OmniModel Studio REST API',
      version: '1.0.0',
      description: 'Programmatic REST API for querying, updating, and synchronizing multi-page diagrams (ERD, BPMN, UML, DFD, IDEF0, CEQA, Gantt, PERT).',
    },
    paths: {
      '/api/diagrams': {
        get: { summary: 'List all diagrams' },
        post: { summary: 'Create new diagram' },
      },
      '/api/diagrams/{id}': {
        get: { summary: 'Get complete diagram JSON document' },
        put: { summary: 'Update diagram document' },
      },
      '/api/diagrams/{id}/pages': {
        get: { summary: 'List all pages in diagram' },
        post: { summary: 'Add a new page or sub-process' },
      },
      '/api/diagrams/{id}/pages/{pageId}': {
        get: { summary: 'Get specific page nodes & edges' },
        put: { summary: 'Update specific page nodes & edges' },
        delete: { summary: 'Delete page' },
      },
      '/api/diagrams/{id}/versions': {
        get: { summary: 'Get version history commits' },
        post: { summary: 'Create a named version snapshot' },
      },
      '/api/diagrams/{id}/versions/{versionId}/restore': {
        post: { summary: 'Restore a previous version snapshot' },
      },
      '/api/sync': {
        post: { summary: 'Batch offline synchronization with conflict resolution' },
      },
    },
  });
});

// List all diagrams
app.get('/api/diagrams', (req: Request, res: Response) => {
  const list = Array.from(documents.values()).map(doc => ({
    id: doc.id,
    name: doc.name,
    pageCount: doc.pages.length,
    versionCount: doc.versions.length,
    updatedAt: doc.updatedAt,
    activePageId: doc.activePageId,
  }));
  res.json(list);
});

// Get a single diagram
app.get('/api/diagrams/:id', (req: Request, res: Response) => {
  const doc = documents.get(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Diagram not found' });
  }
  res.json(doc);
});

// Create new diagram
app.post('/api/diagrams', (req: Request, res: Response) => {
  const newDoc: DiagramDocument = {
    id: `doc-${Date.now()}`,
    name: req.body.name || 'Untitled Diagram Suite',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activePageId: 'page-1',
    settings: {
      gridSnap: true,
      showGrid: true,
      theme: 'dark',
      showMinimap: true,
    },
    versions: [],
    pages: [
      {
        id: 'page-1',
        title: 'Main Flow',
        diagramType: 'generic',
        nodes: [],
        edges: [],
        viewport: { x: 50, y: 50, zoom: 1 },
      },
    ],
    ...req.body,
  };
  documents.set(newDoc.id, newDoc);
  res.status(201).json(newDoc);
});

// Update an entire diagram
app.put('/api/diagrams/:id', (req: Request, res: Response) => {
  const existing = documents.get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Diagram not found' });
  }

  const updated: DiagramDocument = {
    ...existing,
    ...req.body,
    id: req.params.id,
    updatedAt: new Date().toISOString(),
  };
  documents.set(req.params.id, updated);
  res.json(updated);
});

// Get pages of a diagram
app.get('/api/diagrams/:id/pages', (req: Request, res: Response) => {
  const doc = documents.get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Diagram not found' });
  res.json(doc.pages);
});

// Get a specific page
app.get('/api/diagrams/:id/pages/:pageId', (req: Request, res: Response) => {
  const doc = documents.get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Diagram not found' });
  const page = doc.pages.find(p => p.id === req.params.pageId);
  if (!page) return res.status(404).json({ error: 'Page not found' });
  res.json(page);
});

// Create a page
app.post('/api/diagrams/:id/pages', (req: Request, res: Response) => {
  const doc = documents.get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Diagram not found' });

  const newPage: DiagramPage = {
    id: req.body.id || `page-${Date.now()}`,
    title: req.body.title || 'New Page',
    diagramType: req.body.diagramType || 'flowchart',
    parentId: req.body.parentId,
    description: req.body.description || '',
    nodes: req.body.nodes || [],
    edges: req.body.edges || [],
    viewport: { x: 50, y: 50, zoom: 1 },
  };

  doc.pages.push(newPage);
  doc.updatedAt = new Date().toISOString();
  documents.set(doc.id, doc);
  res.status(201).json(newPage);
});

// Update a specific page
app.put('/api/diagrams/:id/pages/:pageId', (req: Request, res: Response) => {
  const doc = documents.get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Diagram not found' });

  const pageIndex = doc.pages.findIndex(p => p.id === req.params.pageId);
  if (pageIndex === -1) return res.status(404).json({ error: 'Page not found' });

  doc.pages[pageIndex] = {
    ...doc.pages[pageIndex],
    ...req.body,
    id: req.params.pageId,
  };
  doc.updatedAt = new Date().toISOString();
  documents.set(doc.id, doc);
  res.json(doc.pages[pageIndex]);
});

// Delete a page
app.delete('/api/diagrams/:id/pages/:pageId', (req: Request, res: Response) => {
  const doc = documents.get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Diagram not found' });

  if (doc.pages.length <= 1) {
    return res.status(400).json({ error: 'Cannot delete the only page in a diagram' });
  }

  doc.pages = doc.pages.filter(p => p.id !== req.params.pageId);
  if (doc.activePageId === req.params.pageId) {
    doc.activePageId = doc.pages[0].id;
  }
  doc.updatedAt = new Date().toISOString();
  documents.set(doc.id, doc);
  res.json({ success: true, activePageId: doc.activePageId });
});

// Get version history
app.get('/api/diagrams/:id/versions', (req: Request, res: Response) => {
  const doc = documents.get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Diagram not found' });
  res.json(doc.versions);
});

// Commit a new version snapshot
app.post('/api/diagrams/:id/versions', (req: Request, res: Response) => {
  const doc = documents.get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Diagram not found' });

  const nextVer = (doc.versions.length ? Math.max(...doc.versions.map(v => v.versionNumber)) : 0) + 1;
  const newVersion: DiagramVersion = {
    id: `ver-${Date.now()}`,
    versionNumber: nextVer,
    name: req.body.name || `v${nextVer}.0 Release`,
    description: req.body.description || 'Snapshot commit',
    createdAt: new Date().toISOString(),
    createdBy: req.body.createdBy || 'Admin User',
    changesSummary: req.body.changesSummary || 'Model update committed',
    snapshot: {
      pages: JSON.parse(JSON.stringify(doc.pages)),
      activePageId: doc.activePageId,
    },
  };

  doc.versions.unshift(newVersion);
  doc.updatedAt = new Date().toISOString();
  documents.set(doc.id, doc);
  res.status(201).json(newVersion);
});

// Restore version
app.post('/api/diagrams/:id/versions/:versionId/restore', (req: Request, res: Response) => {
  const doc = documents.get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Diagram not found' });

  const version = doc.versions.find(v => v.id === req.params.versionId);
  if (!version) return res.status(404).json({ error: 'Version not found' });

  doc.pages = JSON.parse(JSON.stringify(version.snapshot.pages));
  doc.activePageId = version.snapshot.activePageId;
  doc.updatedAt = new Date().toISOString();
  documents.set(doc.id, doc);
  res.json({ success: true, restoredVersion: version.name, doc });
});

// Batch offline sync endpoint
app.post('/api/sync', (req: Request, res: Response) => {
  const { documentId, mutations, clientTimestamp } = req.body;
  const doc = documents.get(documentId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found for sync' });
  }

  // Apply mutations in order
  let appliedCount = 0;
  if (Array.isArray(mutations)) {
    for (const item of mutations) {
      if (item.action === 'UPDATE_PAGE' && item.payload?.pageId) {
        const pageIdx = doc.pages.findIndex(p => p.id === item.payload.pageId);
        if (pageIdx !== -1) {
          doc.pages[pageIdx] = { ...doc.pages[pageIdx], ...item.payload.data };
          appliedCount++;
        }
      } else if (item.action === 'CREATE_PAGE' && item.payload) {
        doc.pages.push(item.payload);
        appliedCount++;
      }
    }
  }

  doc.updatedAt = new Date().toISOString();
  documents.set(documentId, doc);

  res.json({
    synced: true,
    appliedMutations: appliedCount,
    serverTimestamp: new Date().toISOString(),
    latestDocument: doc,
  });
});

// Export diagram
app.get('/api/export/:id', (req: Request, res: Response) => {
  const doc = documents.get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Diagram not found' });

  const format = req.query.format || 'json';
  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${doc.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json"`);
    return res.json(doc);
  }

  // Fallback json
  res.json(doc);
});

// GitHub Integration Endpoints

// Check git status & commits
app.get('/api/github/status', async (req: Request, res: Response) => {
  try {
    const { stdout: status } = await execAsync('git status -s');
    const { stdout: branch } = await execAsync('git branch --show-current || echo main');
    const { stdout: commits } = await execAsync('git log -n 5 --oneline || echo "Initial commit"');
    const { stdout: remote } = await execAsync('git remote -v || echo ""');

    res.json({
      initialized: true,
      branch: branch.trim(),
      changes: status.trim() ? status.trim().split('\n') : [],
      recentCommits: commits.trim().split('\n'),
      remote: remote.trim(),
      targetRepo: 'https://github.com/gr677/mind_suite.git',
    });
  } catch (err: any) {
    res.json({
      initialized: false,
      error: err.message,
      targetRepo: 'https://github.com/gr677/mind_suite.git',
    });
  }
});

// Push to GitHub using Personal Access Token
app.post('/api/github/push', async (req: Request, res: Response) => {
  const { token, repoUrl = 'https://github.com/gr677/mind_suite.git' } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'GitHub Personal Access Token is required to authenticate push.' });
  }

  try {
    const cleanUrl = repoUrl.replace(/^https:\/\//, '');
    const authUrl = `https://${encodeURIComponent(token.trim())}@${cleanUrl}`;

    // Ensure all changes are staged and committed
    await execAsync('git config user.name "gr677" && git config user.email "gordon.robb@gmail.com"');
    await execAsync('git add .');
    await execAsync('git commit -m "feat: complete Mind Suite enterprise diagramming suite" || true');
    await execAsync('git branch -M main');

    // Run push
    const { stdout, stderr } = await execAsync(`git push -u "${authUrl}" main --force`);

    res.json({
      success: true,
      message: 'Successfully pushed codebase to https://github.com/gr677/mind_suite.git!',
      output: (stdout || stderr || 'Pushed successfully.').replace(new RegExp(token, 'g'), '***'),
    });
  } catch (err: any) {
    const safeError = err.message ? err.message.replace(new RegExp(token, 'g'), '***') : 'Git push error';
    res.status(500).json({
      error: safeError,
      hint: 'Verify that your GitHub token has the "repo" (or Contents: Read and write) scope enabled.',
    });
  }
});

// ==========================================
// WORKSPACE & PHYSICAL DISK STORAGE API
// ==========================================

// 1. Get Root Directory Configuration
app.get('/api/storage/config', (req: Request, res: Response) => {
  const configuredRootDir = getConfiguredRootDir();
  res.json({
    configuredRootDir,
    serverDataDir: STORAGE_DIR,
    defaultEntrypoint: 'root.json',
  });
});

// 2. Update Root Directory Configuration
app.post('/api/storage/config', (req: Request, res: Response) => {
  const { rootDir } = req.body;
  if (!rootDir || typeof rootDir !== 'string') {
    return res.status(400).json({ error: 'rootDir string is required' });
  }
  const updated = setConfiguredRootDir(rootDir);
  res.json({
    success: true,
    configuredRootDir: updated,
    message: `Root directory configured to ${updated}`,
  });
});

// 3. List all workspaces and their files on server disk
app.get('/api/workspaces', async (req: Request, res: Response) => {
  try {
    await initStorageOnDisk();
    const entries = await fsp.readdir(STORAGE_DIR, { withFileTypes: true });
    const workspaceFolders = entries.filter(e => e.isDirectory());

    const result = await Promise.all(
      workspaceFolders.map(async folder => {
        const wsId = folder.name;
        const wsPath = path.join(STORAGE_DIR, wsId);
        const fileEntries = await fsp.readdir(wsPath, { withFileTypes: true });
        const jsonFiles = fileEntries.filter(f => f.isFile() && f.name.endsWith('.json'));

        const files = await Promise.all(
          jsonFiles.map(async file => {
            const filePath = path.join(wsPath, file.name);
            const stats = await fsp.stat(filePath);
            let name = file.name.replace('.json', '');
            try {
              const content = await fsp.readFile(filePath, 'utf-8');
              const parsed = JSON.parse(content);
              if (parsed?.name) name = parsed.name;
            } catch {
              // ignore parse errors for preview
            }

            return {
              filename: file.name,
              name,
              isRoot: file.name === 'root.json',
              sizeBytes: stats.size,
              lastModified: stats.mtime.toISOString(),
              physicalPath: filePath,
              configuredPath: toWindowsPath(getConfiguredRootDir(), wsId, file.name),
            };
          })
        );

        return {
          id: wsId,
          name: wsId,
          basePath: getConfiguredRootDir(),
          defaultEntrypoint: 'root.json',
          files,
        };
      })
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list workspaces on server disk' });
  }
});

// 4. Create new workspace on server disk
app.post('/api/workspaces', async (req: Request, res: Response) => {
  try {
    const rawName = req.body.name || `workspace_${Date.now()}`;
    const safeId = sanitizeName(rawName.trim().toLowerCase()) || `workspace_${Date.now()}`;
    const wsDir = path.join(STORAGE_DIR, safeId);
    await fsp.mkdir(wsDir, { recursive: true });

    // Create root.json starting point
    const rootPath = path.join(wsDir, 'root.json');
    if (!fs.existsSync(rootPath)) {
      const templateDoc = {
        ...initialDiagramDocument,
        id: `doc-${safeId}-root`,
        name: `${req.body.name || safeId} Architecture`,
      };
      await fsp.writeFile(rootPath, JSON.stringify(templateDoc, null, 2), 'utf-8');
    }

    res.status(201).json({
      success: true,
      id: safeId,
      name: req.body.name || safeId,
      basePath: getConfiguredRootDir(),
      entrypoint: 'root.json',
      physicalPath: wsDir,
      configuredPath: toWindowsPath(getConfiguredRootDir(), safeId, 'root.json'),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create workspace on server disk' });
  }
});

// 5. Get a specific JSON diagram file from server disk
app.get('/api/workspaces/:workspaceId/files/:filename', async (req: Request, res: Response) => {
  try {
    const safeWs = sanitizeName(req.params.workspaceId);
    let safeFile = sanitizeName(req.params.filename);
    if (!safeFile.endsWith('.json')) safeFile += '.json';

    const filePath = path.join(STORAGE_DIR, safeWs, safeFile);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: `File not found on server disk: ${safeFile}`,
        workspaceId: safeWs,
        physicalPath: filePath,
        configuredPath: toWindowsPath(getConfiguredRootDir(), safeWs, safeFile),
      });
    }

    const content = await fsp.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({
      error: err.message || 'Failed to read file from server disk',
      details: String(err?.stack || err),
    });
  }
});

// 6. Save a specific JSON diagram file directly to server disk
app.post('/api/workspaces/:workspaceId/files/:filename', async (req: Request, res: Response) => {
  try {
    const safeWs = sanitizeName(req.params.workspaceId);
    let safeFile = sanitizeName(req.params.filename);
    if (!safeFile.endsWith('.json')) safeFile += '.json';

    const wsDir = path.join(STORAGE_DIR, safeWs);
    await fsp.mkdir(wsDir, { recursive: true });

    const filePath = path.join(wsDir, safeFile);
    const jsonStr = JSON.stringify(req.body, null, 2);

    await fsp.writeFile(filePath, jsonStr, 'utf-8');

    // Also update in-memory cache if it matches an active doc
    if (req.body?.id) {
      documents.set(req.body.id, req.body);
    }

    const configuredPath = toWindowsPath(getConfiguredRootDir(), safeWs, safeFile);

    res.json({
      success: true,
      workspaceId: safeWs,
      filename: safeFile,
      isRoot: safeFile === 'root.json',
      bytes: Buffer.byteLength(jsonStr, 'utf-8'),
      physicalPath: filePath,
      configuredPath,
      timestamp: new Date().toISOString(),
      message: `Successfully written ${safeFile} to server disk.`,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to write file to server disk',
      details: String(err?.stack || err),
    });
  }
});

// 7. Delete a diagram file from server disk
app.delete('/api/workspaces/:workspaceId/files/:filename', async (req: Request, res: Response) => {
  try {
    const safeWs = sanitizeName(req.params.workspaceId);
    let safeFile = sanitizeName(req.params.filename);
    if (!safeFile.endsWith('.json')) safeFile += '.json';

    if (safeFile === 'root.json') {
      return res.status(400).json({
        error: 'Cannot delete root.json: every workspace requires a root.json file as its starting entrypoint.',
      });
    }

    const filePath = path.join(STORAGE_DIR, safeWs, safeFile);
    if (fs.existsSync(filePath)) {
      await fsp.unlink(filePath);
      return res.json({ success: true, message: `Deleted ${safeFile} from server disk` });
    }

    res.status(404).json({ error: 'File does not exist on server disk' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete file from server disk' });
  }
});

// Dev vs Production Vite Setup
async function startServer() {
  await initStorageOnDisk();

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[OmniModel Studio] Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
