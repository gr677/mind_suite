/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  DiagramDocument,
  DiagramPage,
  DiagramNode,
  DiagramEdge,
  Collaborator,
  UserRole,
  SyncQueueItem,
  DiagramType,
  AppTheme,
  StudioSettings,
} from './types/diagram';
import { initialDiagramDocument } from './data/seedDiagrams';
import { SHAPE_TEMPLATES } from './data/shapeDefinitions';
import { offlineSyncService } from './services/offlineSync';
import { collaborationService } from './services/collaboration';
import { AppHeader } from './components/header/AppHeader';
import { ShapePaletteSidebar } from './components/sidebar/ShapePaletteSidebar';
import { DiagramCanvas } from './components/canvas/DiagramCanvas';
import { NodeInspector } from './components/inspector/NodeInspector';
import { VersionHistoryModal } from './components/modals/VersionHistoryModal';
import { RestApiModal } from './components/modals/RestApiModal';
import { OfflineSyncModal } from './components/modals/OfflineSyncModal';
import { NewPageModal } from './components/modals/NewPageModal';
import { DiagramTypesGalleryModal } from './components/modals/DiagramTypesGalleryModal';
import { GitHubPublishModal } from './components/modals/GitHubPublishModal';
import { WorkspaceModal } from './components/modals/WorkspaceModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { CreateChildDiagramModal } from './components/modals/CreateChildDiagramModal';
import { SaveSuccessModal } from './components/modals/SaveSuccessModal';
import { workspaceService } from './services/workspaceService';
import { getExampleDiagramForType } from './data/diagramExamples';
import { THEMES } from './utils/themeConfig';

export default function App() {
  // Document state
  const [document, setDocument] = useState<DiagramDocument>(() => {
    return offlineSyncService.getCachedDocument() || initialDiagramDocument;
  });

  const [activePageId, setActivePageId] = useState<string>(() => {
    return (
      offlineSyncService.getCachedDocument()?.activePageId ||
      initialDiagramDocument.activePageId
    );
  });

  // Current User Role (RBAC)
  const [userRole, setUserRole] = useState<UserRole>('admin');

  // Canvas Selection
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Inspector visibility
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  // Modals state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lastPageByType, setLastPageByType] = useState<Record<string, string>>({});
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
  const [isRestApiModalOpen, setIsRestApiModalOpen] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSaveSuccessModalOpen, setIsSaveSuccessModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [activeWs, setActiveWs] = useState(() => workspaceService.getActiveWorkspace());
  const [childModalNode, setChildModalNode] = useState<DiagramNode | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<
    Array<{ filename: string; diagramName: string; pageId?: string; nodeLabel?: string }>
  >([]);

  // Real-time Collaboration & Network Status
  const [collaborators, setCollaborators] = useState<Collaborator[]>(() =>
    collaborationService.getCollaborators()
  );
  const [isOnline, setIsOnline] = useState<boolean>(() => offlineSyncService.isOnline());
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() =>
    offlineSyncService.getSimulatedOffline()
  );
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>(() =>
    offlineSyncService.getQueue()
  );

  // Studio Settings (Themes, Grid, Auto-Save, Shortcuts)
  const [settings, setSettings] = useState<StudioSettings>(() => {
    try {
      const saved = localStorage.getItem('omnimind_settings_v1');
      if (saved) return JSON.parse(saved);
      const oldTheme = localStorage.getItem('omnimodel_theme');
      if (oldTheme) {
        return {
          theme: oldTheme as AppTheme,
          gridStyle: 'dots',
          gridSize: 24,
          snapToGrid: true,
          showHoverTooltips: true,
          showCollaborators: false,
          autoSaveInterval: 'instant',
          defaultConnectorType: 'orthogonal',
        };
      }
    } catch {
      // ignore
    }
    return {
      theme: 'dark',
      gridStyle: 'dots',
      gridSize: 24,
      snapToGrid: true,
      showHoverTooltips: true,
      showCollaborators: false,
      autoSaveInterval: 'instant',
      defaultConnectorType: 'orthogonal',
    };
  });

  const currentThemeDef = THEMES[settings.theme] || THEMES.dark;

  useEffect(() => {
    if (currentThemeDef.isDark) {
      window.document.documentElement.classList.add('dark');
      window.document.documentElement.style.colorScheme = 'dark';
    } else {
      window.document.documentElement.classList.remove('dark');
      window.document.documentElement.style.colorScheme = 'light';
    }
    try {
      localStorage.setItem('omnimind_settings_v1', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings, currentThemeDef]);

  // Active page accessor
  const currentPage =
    document.pages.find(p => p.id === activePageId) || document.pages[0];

  // Track last opened page by diagram type
  useEffect(() => {
    if (currentPage) {
      setLastPageByType(prev => ({
        ...prev,
        [currentPage.diagramType]: currentPage.id,
      }));
    }
  }, [currentPage]);

  // Selected node accessor
  const selectedNode =
    currentPage?.nodes.find(n => n.id === selectedNodeId) || null;

  // Subscribe to offline sync & collaboration services
  useEffect(() => {
    const unsubOffline = offlineSyncService.subscribe(() => {
      setIsOnline(offlineSyncService.isOnline());
      setIsSimulatedOffline(offlineSyncService.getSimulatedOffline());
      setSyncQueue(offlineSyncService.getQueue());
    });

    const unsubCollab = collaborationService.subscribe(() => {
      setCollaborators(collaborationService.getCollaborators());
    });

    const unsubWs = workspaceService.subscribe(() => {
      setActiveWs({ ...workspaceService.getActiveWorkspace() });
    });

    return () => {
      unsubOffline();
      unsubCollab();
      unsubWs();
    };
  }, []);

  // Fetch initial document from REST API on startup if online
  useEffect(() => {
    async function loadRemoteDoc() {
      if (offlineSyncService.isOnline()) {
        try {
          const res = await fetch(`/api/diagrams/${initialDiagramDocument.id}`);
          if (res.ok) {
            const data: DiagramDocument = await res.json();
            setDocument(data);
            offlineSyncService.cacheDocument(data);
            workspaceService.saveCurrentDiagram(data);
          }
        } catch (err) {
          console.warn('Using offline cached document on startup:', err);
        }
      }
    }
    loadRemoteDoc();
  }, []);

  // Save document state locally and sync remotely
  const persistDocument = useCallback((updatedDoc: DiagramDocument) => {
    setDocument(updatedDoc);
    offlineSyncService.cacheDocument(updatedDoc);
    workspaceService.saveCurrentDiagram(updatedDoc);

    if (offlineSyncService.isOnline()) {
      fetch(`/api/diagrams/${updatedDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDoc),
      }).catch(err => {
        console.warn('Network write failed, enqueuing mutation:', err);
        offlineSyncService.enqueueMutation('UPDATE_PAGE', {
          pageId: updatedDoc.activePageId,
          data: updatedDoc.pages.find(p => p.id === updatedDoc.activePageId),
        });
      });
    } else {
      offlineSyncService.enqueueMutation('UPDATE_PAGE', {
        pageId: updatedDoc.activePageId,
        data: updatedDoc.pages.find(p => p.id === updatedDoc.activePageId),
      });
    }
  }, []);

  // Update nodes for current page
  const handleUpdateNodes = useCallback(
    (newNodes: DiagramNode[]) => {
      const updatedPages = document.pages.map(page =>
        page.id === currentPage.id ? { ...page, nodes: newNodes } : page
      );
      persistDocument({ ...document, pages: updatedPages });
    },
    [document, currentPage, persistDocument]
  );

  // Update single node
  const handleUpdateSingleNode = useCallback(
    (updatedNode: DiagramNode) => {
      const updatedNodes = currentPage.nodes.map(n =>
        n.id === updatedNode.id ? updatedNode : n
      );
      handleUpdateNodes(updatedNodes);
    },
    [currentPage, handleUpdateNodes]
  );

  // Delete single node & connected edges
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      const updatedNodes = currentPage.nodes.filter(n => n.id !== nodeId);
      const updatedEdges = currentPage.edges.filter(
        e => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId
      );
      const updatedPages = document.pages.map(page =>
        page.id === currentPage.id
          ? { ...page, nodes: updatedNodes, edges: updatedEdges }
          : page
      );
      persistDocument({ ...document, pages: updatedPages });
      if (selectedNodeId === nodeId) setSelectedNodeId(null);
    },
    [document, currentPage, selectedNodeId, persistDocument]
  );

  // Add edge connector
  const handleAddEdge = useCallback(
    (newEdge: DiagramEdge) => {
      const updatedEdges = [...currentPage.edges, newEdge];
      const updatedPages = document.pages.map(page =>
        page.id === currentPage.id ? { ...page, edges: updatedEdges } : page
      );
      persistDocument({ ...document, pages: updatedPages });
    },
    [document, currentPage, persistDocument]
  );

  // Update edge connector (Change 1: Flip connector style)
  const handleUpdateEdge = useCallback(
    (updatedEdge: DiagramEdge) => {
      const updatedEdges = currentPage.edges.map(e =>
        e.id === updatedEdge.id ? updatedEdge : e
      );
      const updatedPages = document.pages.map(page =>
        page.id === currentPage.id ? { ...page, edges: updatedEdges } : page
      );
      persistDocument({ ...document, pages: updatedPages });
    },
    [document, currentPage, persistDocument]
  );

  // Delete single edge
  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      const updatedEdges = currentPage.edges.filter(e => e.id !== edgeId);
      const updatedPages = document.pages.map(page =>
        page.id === currentPage.id ? { ...page, edges: updatedEdges } : page
      );
      persistDocument({ ...document, pages: updatedPages });
      if (selectedEdgeId === edgeId) setSelectedEdgeId(null);
    },
    [document, currentPage, selectedEdgeId, persistDocument]
  );

  // Delete selected element (node or edge)
  const handleDeleteSelected = useCallback(() => {
    if (selectedNodeId) {
      handleDeleteNode(selectedNodeId);
    } else if (selectedEdgeId) {
      const updatedEdges = currentPage.edges.filter(e => e.id !== selectedEdgeId);
      const updatedPages = document.pages.map(page =>
        page.id === currentPage.id ? { ...page, edges: updatedEdges } : page
      );
      persistDocument({ ...document, pages: updatedPages });
      setSelectedEdgeId(null);
    }
  }, [selectedNodeId, selectedEdgeId, currentPage, handleDeleteNode, document, persistDocument]);

  // Drop or add new shape from template
  const handleDropNewShape = useCallback(
    (templateId: string, canvasX: number, canvasY: number) => {
      const template = SHAPE_TEMPLATES.find(t => t.id === templateId);
      if (!template) return;

      const newNode: DiagramNode = {
        ...JSON.parse(JSON.stringify(template.defaultNode)),
        id: `node-${Date.now()}`,
        x: canvasX,
        y: canvasY,
      };

      // Check if dropped inside a container group
      const enclosingGroup = currentPage.nodes.find(
        g =>
          g.isGroup &&
          canvasX >= g.x &&
          canvasY >= g.y &&
          canvasX + newNode.width <= g.x + g.width &&
          canvasY + newNode.height <= g.y + g.height
      );

      if (enclosingGroup) {
        newNode.parentId = enclosingGroup.id;
      }

      const updatedNodes = [...currentPage.nodes, newNode];
      handleUpdateNodes(updatedNodes);
      setSelectedNodeId(newNode.id);
      setIsInspectorOpen(true);
    },
    [currentPage, handleUpdateNodes]
  );

  // Drill-down into a child page (Sub-Process Navigation)
  const handleDrillDown = useCallback(
    (pageId: string) => {
      const targetPage = document.pages.find(p => p.id === pageId);
      if (targetPage) {
        setActivePageId(pageId);
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
        collaborationService.addActivity(
          'You',
          '#3b82f6',
          `Drilled down into '${targetPage.title}'`
        );
      }
    },
    [document]
  );

  // Create new page
  const handleCreatePage = useCallback(
    (title: string, diagramType: DiagramType, parentId?: string, description?: string) => {
      const newPage: DiagramPage = {
        id: `page-${Date.now()}`,
        title,
        diagramType,
        parentId,
        description: description || '',
        nodes: [],
        edges: [],
        viewport: { x: 50, y: 50, zoom: 1 },
      };

      const updatedPages = [...document.pages, newPage];
      const updatedDoc = {
        ...document,
        pages: updatedPages,
        activePageId: newPage.id,
      };
      setActivePageId(newPage.id);
      persistDocument(updatedDoc);
    },
    [document, persistDocument]
  );

  // Flip between diagram types: Show last one open, or generate starter example!
  const handleFlipDiagramType = useCallback(
    (type: DiagramType) => {
      // 1. If we have a recorded last-opened page of this type that still exists:
      const lastId = lastPageByType[type];
      const existingLast = document.pages.find(p => p.id === lastId);
      if (existingLast) {
        setActivePageId(existingLast.id);
        setSelectedCategory(type);
        collaborationService.addActivity(
          'You',
          '#3b82f6',
          `Flipped to last visited ${type.toUpperCase()} page`
        );
        return;
      }

      // 2. Or check if any page of this type exists in document.pages:
      const existingAny = document.pages.find(p => p.diagramType === type);
      if (existingAny) {
        setActivePageId(existingAny.id);
        setSelectedCategory(type);
        collaborationService.addActivity(
          'You',
          '#3b82f6',
          `Switched to ${existingAny.title}`
        );
        return;
      }

      // 3. Otherwise, automatically instantiate a rich starter example diagram!
      const examplePage = getExampleDiagramForType(type);
      const updatedPages = [...document.pages, examplePage];
      const updatedDoc = {
        ...document,
        pages: updatedPages,
        activePageId: examplePage.id,
      };
      persistDocument(updatedDoc);
      setActivePageId(examplePage.id);
      setSelectedCategory(type);
      setLastPageByType(prev => ({ ...prev, [type]: examplePage.id }));
      collaborationService.addActivity(
        'You',
        '#10b981',
        `Created starter example for ${type.toUpperCase()}`
      );
    },
    [document, lastPageByType, persistDocument]
  );

  // Version snapshot commits
  const handleCreateVersion = useCallback(
    async (name: string, description: string, summary: string) => {
      const nextVerNumber =
        (document.versions.length
          ? Math.max(...document.versions.map(v => v.versionNumber))
          : 0) + 1;

      const newVer = {
        id: `ver-${Date.now()}`,
        versionNumber: nextVerNumber,
        name,
        description,
        createdAt: new Date().toISOString(),
        createdBy: userRole === 'admin' ? 'Sarah Chen (Lead Architect)' : 'Current User',
        changesSummary: summary,
        snapshot: {
          pages: JSON.parse(JSON.stringify(document.pages)),
          activePageId: document.activePageId,
        },
      };

      const updatedVersions = [newVer, ...document.versions];
      persistDocument({ ...document, versions: updatedVersions });

      if (offlineSyncService.isOnline()) {
        try {
          await fetch(`/api/diagrams/${document.id}/versions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newVer),
          });
        } catch (e) {
          console.warn('Version sync failed:', e);
        }
      }
    },
    [document, userRole, persistDocument]
  );

  // Restore previous version snapshot
  const handleRestoreVersion = useCallback(
    async (versionId: string) => {
      const targetVersion = document.versions.find(v => v.id === versionId);
      if (!targetVersion) return;

      const restoredPages = JSON.parse(
        JSON.stringify(targetVersion.snapshot.pages)
      );
      const restoredDoc: DiagramDocument = {
        ...document,
        pages: restoredPages,
        activePageId: targetVersion.snapshot.activePageId || restoredPages[0].id,
      };

      setActivePageId(restoredDoc.activePageId);
      persistDocument(restoredDoc);
      setIsVersionsModalOpen(false);
    },
    [document, persistDocument]
  );

  // Open Child Diagram creation/linking modal for a node (Change 4)
  const handleOpenChildDiagramModal = useCallback((node: DiagramNode) => {
    setChildModalNode(node);
  }, []);

  // Link child diagram info to a node
  const handleLinkChildDiagram = useCallback(
    (nodeId: string, filename: string, title: string, childType: DiagramType) => {
      const updatedNodes = currentPage.nodes.map(n =>
        n.id === nodeId
          ? {
              ...n,
              childDiagramFilename: filename,
              childDiagramTitle: title,
              childDiagramType: childType,
            }
          : n
      );
      handleUpdateNodes(updatedNodes);
    },
    [currentPage, handleUpdateNodes]
  );

  // Navigate into a child diagram JSON file (pushing current parent to history stack)
  const handleNavigateToChildDiagram = useCallback(
    (filename: string, nodeLabel?: string) => {
      const currentWs = workspaceService.getActiveWorkspace();
      const currentFilename = currentWs.activeDiagramFilename || 'diagram1.json';

      // Save current document before navigating
      workspaceService.saveCurrentDiagram(document);

      // Push to history
      setNavigationHistory(prev => [
        ...prev,
        {
          filename: currentFilename,
          diagramName: document.name || currentFilename,
          pageId: activePageId,
          nodeLabel: nodeLabel || selectedNode?.label,
        },
      ]);

      // Load child diagram from local workspace storage
      const childDoc = workspaceService.setActiveDiagram(filename);
      setDocument(childDoc);
      offlineSyncService.cacheDocument(childDoc);
      if (childDoc.pages && childDoc.pages.length > 0) {
        setActivePageId(childDoc.activePageId || childDoc.pages[0].id);
      }
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      collaborationService.addActivity(
        'You',
        '#8b5cf6',
        `Navigated into child diagram '${filename}'`
      );
    },
    [document, activePageId, selectedNode]
  );

  // Return to the parent diagram in the breadcrumb history
  const handleNavigateBackParent = useCallback(() => {
    if (navigationHistory.length === 0) return;

    // Save current child diagram
    workspaceService.saveCurrentDiagram(document);

    const prevHistory = [...navigationHistory];
    const parentEntry = prevHistory.pop()!;
    setNavigationHistory(prevHistory);

    const parentDoc = workspaceService.setActiveDiagram(parentEntry.filename);
    setDocument(parentDoc);
    offlineSyncService.cacheDocument(parentDoc);
    if (parentEntry.pageId && parentDoc.pages.some(p => p.id === parentEntry.pageId)) {
      setActivePageId(parentEntry.pageId);
    } else if (parentDoc.pages && parentDoc.pages.length > 0) {
      setActivePageId(parentDoc.activePageId || parentDoc.pages[0].id);
    }
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    collaborationService.addActivity(
      'You',
      '#3b82f6',
      `Returned to parent diagram '${parentEntry.filename}'`
    );
  }, [document, navigationHistory]);

  const handleLoadWorkspaceDiagram = useCallback(
    (doc: DiagramDocument) => {
      setDocument(doc);
      offlineSyncService.cacheDocument(doc);
      if (doc.pages && doc.pages.length > 0) {
        setActivePageId(doc.activePageId || doc.pages[0].id);
      }
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    },
    []
  );

  const handleUpdateSettings = useCallback((newSettings: StudioSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('omnimind_settings_v1', JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed to save settings to localStorage:', e);
    }
  }, []);

  const handleManualSave = useCallback(() => {
    setSaveStatus('saving');
    persistDocument(document);
    workspaceService.saveCurrentDiagram(document);
    collaborationService.addActivity(
      'You',
      '#10b981',
      `Saved diagram to ${activeWs.name}/${activeWs.activeDiagramFilename}`
    );
    setSaveStatus('saved');
    setIsSaveSuccessModalOpen(true);
    setTimeout(() => setSaveStatus('idle'), 2500);
  }, [document, persistDocument, activeWs]);

  const handleToggleTheme = useCallback(() => {
    const themeKeys: AppTheme[] = ['dark', 'light', 'cyberpunk', 'parchment', 'nord', 'monochrome'];
    const nextIdx = (themeKeys.indexOf(settings.theme) + 1) % themeKeys.length;
    handleUpdateSettings({ ...settings, theme: themeKeys[nextIdx] });
  }, [settings, handleUpdateSettings]);

  // Global Ctrl+S keyboard shortcut to save diagram
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleManualSave]);

  return (
    <div
      className={`w-screen h-screen flex flex-col overflow-hidden transition-colors duration-200 ${
        currentThemeDef.isDark ? 'dark' : ''
      }`}
      style={{ backgroundColor: currentThemeDef.canvasBg }}
    >
      {/* Top Application Header with Breadcrumbs, RBAC & Status */}
      <AppHeader
        document={document}
        currentPage={currentPage}
        collaborators={collaborators}
        userRole={userRole}
        isOnline={isOnline}
        queuedCount={syncQueue.length}
        theme={settings.theme}
        saveStatus={saveStatus}
        activeWorkspaceName={activeWs.name}
        activeDiagramFilename={activeWs.activeDiagramFilename}
        navigationHistory={navigationHistory}
        onNavigateBack={handleNavigateBackParent}
        onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onManualSave={handleManualSave}
        onSelectPage={pageId => {
          setActivePageId(pageId);
          setSelectedNodeId(null);
          setSelectedEdgeId(null);
        }}
        onOpenNewPageModal={() => setIsNewPageModalOpen(true)}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
        onOpenVersionsModal={() => setIsVersionsModalOpen(true)}
        onOpenRestApiModal={() => setIsRestApiModalOpen(true)}
        onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
        onChangeRole={setUserRole}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Studio Body: Sidebar + Canvas + Inspector */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Shape & Tool Palette */}
        <ShapePaletteSidebar
          currentDiagramType={currentPage.diagramType}
          userRole={userRole}
          selectedCategory={selectedCategory}
          theme={settings.theme}
          onSelectCategory={cat => {
            if (cat === 'all' || cat === 'notes' || cat === 'containers') {
              setSelectedCategory(cat);
            } else {
              handleFlipDiagramType(cat as DiagramType);
            }
          }}
          onSelectTemplate={templateId => {
            handleDropNewShape(templateId, 240, 200);
          }}
          onOpenGallery={() => setIsGalleryOpen(true)}
        />

        {/* Center: Infinite Interactive Diagram Canvas */}
        <DiagramCanvas
          nodes={currentPage.nodes}
          edges={currentPage.edges}
          collaborators={collaborators}
          selectedNodeId={selectedNodeId}
          selectedEdgeId={selectedEdgeId}
          userRole={userRole}
          theme={settings.theme}
          diagramType={currentPage.diagramType}
          settings={settings}
          onSelectNode={nodeId => {
            setSelectedNodeId(nodeId);
            if (nodeId) {
              setSelectedEdgeId(null);
              setIsInspectorOpen(true);
            }
          }}
          onSelectEdge={edgeId => {
            setSelectedEdgeId(edgeId);
            if (edgeId) {
              setSelectedNodeId(null);
              setIsInspectorOpen(true);
            }
          }}
          onUpdateNodes={handleUpdateNodes}
          onAddEdge={handleAddEdge}
          onUpdateEdge={handleUpdateEdge}
          onDeleteSelected={handleDeleteSelected}
          onDrillDown={handleDrillDown}
          onOpenDoc={node => {
            setSelectedNodeId(node.id);
            setIsInspectorOpen(true);
          }}
          onDropNewShape={handleDropNewShape}
          onOpenNewPageModal={() => setIsNewPageModalOpen(true)}
          onDeleteEdge={handleDeleteEdge}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onOpenChildDiagramModal={handleOpenChildDiagramModal}
          onNavigateChildDiagram={handleNavigateToChildDiagram}
          onUpdateNodeLabel={(nodeId, label) => {
            const targetNode = currentPage.nodes.find(n => n.id === nodeId);
            if (targetNode) {
              handleUpdateSingleNode({ ...targetNode, label });
            }
          }}
        />

        {/* Right Sidebar: Inspector, Documentation, Comments & Groups */}
        {isInspectorOpen && (
          <NodeInspector
            selectedNode={selectedNode}
            selectedEdge={currentPage.edges.find(e => e.id === selectedEdgeId) || null}
            currentPage={currentPage}
            allPages={document.pages}
            userRole={userRole}
            theme={settings.theme}
            onUpdateNode={handleUpdateSingleNode}
            onUpdateEdge={handleUpdateEdge}
            onDeleteNode={handleDeleteNode}
            onDeleteEdge={handleDeleteEdge}
            onClose={() => setIsInspectorOpen(false)}
            onDrillDown={handleDrillDown}
            onOpenChildDiagramModal={handleOpenChildDiagramModal}
            onNavigateChildDiagram={handleNavigateToChildDiagram}
          />
        )}
      </div>

      {/* Modals */}
      <DiagramTypesGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        currentType={currentPage.diagramType}
        theme={settings.theme}
        onSelectDiagramType={handleFlipDiagramType}
        onCreateNewPageOfType={(type, name) => {
          handleCreatePage(name, type);
          setSelectedCategory(type);
        }}
        onFilterToolbox={handleFlipDiagramType}
      />

      <GitHubPublishModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        document={document}
        currentPage={currentPage}
      />

      <VersionHistoryModal
        isOpen={isVersionsModalOpen}
        onClose={() => setIsVersionsModalOpen(false)}
        versions={document.versions}
        userRole={userRole}
        onCreateVersion={handleCreateVersion}
        onRestoreVersion={handleRestoreVersion}
      />

      <RestApiModal
        isOpen={isRestApiModalOpen}
        onClose={() => setIsRestApiModalOpen(false)}
        document={document}
        onImportJson={imported => {
          persistDocument(imported);
          setActivePageId(imported.pages[0].id);
        }}
      />

      <OfflineSyncModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        isOnline={isOnline}
        isSimulatedOffline={isSimulatedOffline}
        queue={syncQueue}
        onTriggerSync={async () => {
          await offlineSyncService.flushQueue();
        }}
        onToggleSimulatedOffline={() => {
          offlineSyncService.toggleSimulatedOffline();
        }}
      />

      <NewPageModal
        isOpen={isNewPageModalOpen}
        onClose={() => setIsNewPageModalOpen(false)}
        pages={document.pages}
        theme={settings.theme}
        onCreatePage={handleCreatePage}
      />

      <CreateChildDiagramModal
        isOpen={!!childModalNode}
        parentNode={childModalNode}
        parentDiagramType={currentPage.diagramType}
        theme={settings.theme}
        onClose={() => setChildModalNode(null)}
        onNavigateToChildDiagram={handleNavigateToChildDiagram}
        onLinkChildDiagram={handleLinkChildDiagram}
      />

      <SaveSuccessModal
        isOpen={isSaveSuccessModalOpen}
        onClose={() => setIsSaveSuccessModalOpen(false)}
        fullPath={workspaceService.getFullPath()}
        filename={activeWs.activeDiagramFilename || 'diagram1.json'}
        diagramName={document.name || 'Diagram'}
        workspaceName={activeWs.name}
        theme={settings.theme}
        onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
      />

      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        onLoadDiagram={handleLoadWorkspaceDiagram}
        theme={settings.theme}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        document={document}
        activeWorkspacePath={workspaceService.getActiveWorkspacePath()}
        onManualSave={handleManualSave}
        onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
      />
    </div>
  );
}
