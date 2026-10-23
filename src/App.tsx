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
import { getExampleDiagramForType } from './data/diagramExamples';

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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

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

    return () => {
      unsubOffline();
      unsubCollab();
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

  return (
    <div className={`w-screen h-screen flex flex-col overflow-hidden ${theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-100'}`}>
      {/* Top Application Header with Breadcrumbs, RBAC & Status */}
      <AppHeader
        document={document}
        currentPage={currentPage}
        collaborators={collaborators}
        userRole={userRole}
        isOnline={isOnline}
        queuedCount={syncQueue.length}
        theme={theme}
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
        onToggleTheme={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
      />

      {/* Main Studio Body: Sidebar + Canvas + Inspector */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Shape & Tool Palette */}
        <ShapePaletteSidebar
          currentDiagramType={currentPage.diagramType}
          userRole={userRole}
          selectedCategory={selectedCategory}
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
          theme={theme}
          onSelectNode={nodeId => {
            setSelectedNodeId(nodeId);
            if (nodeId) setIsInspectorOpen(true);
          }}
          onSelectEdge={edgeId => {
            setSelectedEdgeId(edgeId);
            setSelectedNodeId(null);
          }}
          onUpdateNodes={handleUpdateNodes}
          onAddEdge={handleAddEdge}
          onDeleteSelected={handleDeleteSelected}
          onDrillDown={handleDrillDown}
          onOpenDoc={node => {
            setSelectedNodeId(node.id);
            setIsInspectorOpen(true);
          }}
          onDropNewShape={handleDropNewShape}
        />

        {/* Right Sidebar: Inspector, Documentation, Comments & Groups */}
        {isInspectorOpen && (
          <NodeInspector
            selectedNode={selectedNode}
            currentPage={currentPage}
            allPages={document.pages}
            userRole={userRole}
            onUpdateNode={handleUpdateSingleNode}
            onDeleteNode={handleDeleteNode}
            onClose={() => setIsInspectorOpen(false)}
            onDrillDown={handleDrillDown}
          />
        )}
      </div>

      {/* Modals */}
      <DiagramTypesGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        currentType={currentPage.diagramType}
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
        onCreatePage={handleCreatePage}
      />
    </div>
  );
}
