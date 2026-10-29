/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DiagramType =
  | 'erd'
  | 'bpmn'
  | 'swimlane'
  | 'uml'
  | 'uml-sequence'
  | 'uml-usecase'
  | 'uml-state'
  | 'dfd'
  | 'yourdon'
  | 'idef0'
  | 'sipoc'
  | 'flowchart'
  | 'ceqa'
  | 'gantt'
  | 'pert'
  | 'c4'
  | 'mindmap'
  | 'vsm'
  | 'fishbone'
  | 'generic';

export type UserRole = 'admin' | 'editor' | 'reviewer' | 'viewer';

export interface Collaborator {
  id: string;
  name: string;
  role: UserRole;
  color: string;
  avatar: string;
  activePageId: string;
  cursorPosition?: { x: number; y: number };
  lastAction?: string;
  selectedNodeId?: string;
}

export interface StickyNote {
  id: string;
  text: string;
  color: 'yellow' | 'pink' | 'green' | 'blue' | 'purple';
  author: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  author: string;
  authorColor: string;
  text: string;
  createdAt: string;
  resolved?: boolean;
}

export interface NodeDocumentation {
  description: string;
  tags: string[];
  apiEndpoint?: string;
  owner?: string;
  status: 'draft' | 'in-review' | 'approved' | 'deprecated';
  customFields?: Record<string, string>;
  externalDocUrl?: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
}

export interface DiagramNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  parentId?: string; // For nested grouping inside other nodes
  isGroup?: boolean;
  collapsed?: boolean;
  drilldownPageId?: string; // Linked sub-process / page for drill-down navigation
  childDiagramFilename?: string; // Linked child diagram JSON filename (Change 4)
  childDiagramTitle?: string;
  childDiagramType?: DiagramType;
  style: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    textColor?: string;
    fontSize?: number;
    rounded?: number;
    opacity?: number;
  };
  data: Record<string, any>; // Diagram-specific data (ERD fields, BPMN tasks, PERT numbers, etc.)
  documentation?: NodeDocumentation;
  stickyNotes?: StickyNote[];
  comments?: Comment[];
}

export interface DiagramEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceAnchor: 'top' | 'right' | 'bottom' | 'left';
  targetAnchor: 'top' | 'right' | 'bottom' | 'left';
  label?: string;
  type: 'straight' | 'orthogonal' | 'curved';
  lineStyle: 'solid' | 'dashed' | 'dotted';
  markerStart: 'none' | 'arrow' | 'crow-foot' | 'diamond' | 'circle';
  markerEnd:
    | 'none'
    | 'arrow'
    | 'crow-foot-one'
    | 'crow-foot-many'
    | 'diamond'
    | 'diamond-filled'
    | 'circle'
    | 'icom-arrow';
  cardinality?: {
    source?: string;
    target?: string;
  };
  color?: string;
  strokeWidth?: number;
}

export interface DiagramPage {
  id: string;
  title: string;
  diagramType: DiagramType;
  parentId?: string; // For breadcrumb page hierarchy
  description?: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}

export interface DiagramVersion {
  id: string;
  versionNumber: number;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  changesSummary: string;
  snapshot: {
    pages: DiagramPage[];
    activePageId: string;
  };
}

export type AppTheme =
  | 'dark'
  | 'light'
  | 'cyberpunk'
  | 'parchment'
  | 'nord'
  | 'monochrome'
  | 'pastel-mint'
  | 'pastel-rose'
  | 'pastel-lavender'
  | 'pastel-peach'
  | 'pastel-sky';

export type GridStyle = 'dots' | 'lines' | 'crosshairs' | 'none';

export interface StudioSettings {
  theme: AppTheme;
  gridStyle: GridStyle;
  gridSize: number;
  snapToGrid: boolean;
  showHoverTooltips: boolean;
  showCollaborators: boolean;
  autoSaveInterval: 'instant' | '30s' | 'manual';
  defaultConnectorType: 'orthogonal' | 'curved' | 'straight';
  rootDir?: string;
}

export interface DiagramDocument {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  activePageId: string;
  pages: DiagramPage[];
  versions: DiagramVersion[];
  settings: {
    gridSnap: boolean;
    showGrid: boolean;
    theme: AppTheme;
    showMinimap: boolean;
  };
}

export interface SyncQueueItem {
  id: string;
  timestamp: string;
  action: 'UPDATE_PAGE' | 'CREATE_PAGE' | 'DELETE_PAGE' | 'CREATE_VERSION' | 'FULL_SYNC';
  payload: any;
  status: 'pending' | 'synced' | 'failed';
}
