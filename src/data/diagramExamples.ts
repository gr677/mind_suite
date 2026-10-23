/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DiagramPage, DiagramType } from '../types/diagram';

export function getExampleDiagramForType(type: DiagramType): DiagramPage {
  const timestamp = Date.now();

  switch (type) {
    // 1. Universal Freeform Studio (No Rules - All Shapes Allowed!)
    case 'generic':
      return {
        id: `page-freeform-${timestamp}`,
        title: 'Universal Freeform Architecture (No Rules)',
        diagramType: 'generic',
        description: 'Multi-paradigm canvas with zero notation constraints. Mix ERD, BPMN, UML, Flowcharts, and Sticky Notes freely.',
        viewport: { x: 50, y: 50, zoom: 0.95 },
        nodes: [
          {
            id: 'ff-bpmn-task',
            type: 'bpmn-task',
            label: '1. Ingest Multi-Cloud Telemetry',
            x: 80,
            y: 120,
            width: 200,
            height: 80,
            style: { fill: 'rgba(30, 58, 138, 0.85)', stroke: '#3b82f6', strokeWidth: 2, textColor: '#f8fafc', rounded: 8 },
            data: { taskType: 'service' },
            documentation: { description: 'Kafka streaming consumer handling 50k events/sec.', tags: ['Kafka', 'Freeform'], status: 'approved' },
          },
          {
            id: 'ff-decision',
            type: 'flow-decision',
            label: 'Valid Schema & Key?',
            x: 350,
            y: 115,
            width: 140,
            height: 90,
            style: { fill: 'rgba(180, 83, 9, 0.8)', stroke: '#f59e0b', strokeWidth: 2, textColor: '#ffffff' },
            data: {},
          },
          {
            id: 'ff-erd-table',
            type: 'erd-entity',
            label: 'telemetry_events',
            x: 580,
            y: 80,
            width: 240,
            height: 200,
            style: { fill: 'rgba(15, 23, 42, 0.95)', stroke: '#0284c7', strokeWidth: 2, textColor: '#38bdf8', rounded: 6 },
            data: {
              tableName: 'telemetry_events',
              fields: [
                { name: 'event_id', type: 'UUID', isPk: true, isFk: false },
                { name: 'sensor_id', type: 'VARCHAR(64)', isPk: false, isFk: false },
                { name: 'reading_value', type: 'NUMERIC(10,2)', isPk: false, isFk: false },
                { name: 'recorded_at', type: 'TIMESTAMPTZ', isPk: false, isFk: false },
              ],
            },
          },
          {
            id: 'ff-sticky',
            type: 'sticky-note',
            label: 'Freeform Canvas Notice:\nNo rules enforced here! Feel free to mix databases, workflows, Gantt milestones, and industrial ICOM arrows together.',
            x: 280,
            y: 280,
            width: 260,
            height: 120,
            style: { fill: '#fef08a', stroke: '#facc15', strokeWidth: 1, textColor: '#713f12', rounded: 4 },
            data: { color: 'yellow', author: 'OmniModel Studio' },
          },
          {
            id: 'ff-gantt',
            type: 'gantt-task',
            label: 'Milestone: Streaming GA',
            x: 600,
            y: 330,
            width: 210,
            height: 80,
            style: { fill: 'rgba(16, 185, 129, 0.2)', stroke: '#10b981', strokeWidth: 2, textColor: '#6ee7b7', rounded: 8 },
            data: { progress: 85, startDate: '2026-11-01', endDate: '2026-11-20', assignee: 'DevOps Lead' },
          },
        ],
        edges: [
          { id: 'ff-e1', sourceNodeId: 'ff-bpmn-task', targetNodeId: 'ff-decision', sourceAnchor: 'right', targetAnchor: 'left', type: 'orthogonal', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow' },
          { id: 'ff-e2', sourceNodeId: 'ff-decision', targetNodeId: 'ff-erd-table', sourceAnchor: 'right', targetAnchor: 'left', type: 'orthogonal', lineStyle: 'solid', markerStart: 'none', markerEnd: 'crow-foot-many', label: '[Yes] Persist' },
        ],
      };

    // 2. C4 Software Architecture
    case 'c4':
      return {
        id: `page-c4-${timestamp}`,
        title: 'C4 Container & Cloud Architecture',
        diagramType: 'c4',
        description: 'Simon Brown C4 Model: Microservices, Single Page Apps, API Gateways, and Databases.',
        viewport: { x: 50, y: 50, zoom: 0.95 },
        nodes: [
          {
            id: 'c4-user',
            type: 'dfd-entity',
            label: 'Enterprise Customer\n[Person: Web Browser]',
            x: 60,
            y: 180,
            width: 170,
            height: 90,
            style: { fill: 'rgba(30, 41, 59, 0.9)', stroke: '#38bdf8', strokeWidth: 2, textColor: '#f8fafc', rounded: 8 },
            data: { c4Type: 'person' },
          },
          {
            id: 'c4-spa',
            type: 'c4-system',
            label: 'Single-Page Application\n[Container: React 19 / TypeScript]\nDelivers interactive diagramming canvas',
            x: 290,
            y: 160,
            width: 240,
            height: 120,
            style: { fill: 'rgba(30, 58, 138, 0.9)', stroke: '#3b82f6', strokeWidth: 2, textColor: '#bfdbfe', rounded: 8 },
            data: { c4Type: 'container' },
          },
          {
            id: 'c4-api',
            type: 'c4-system',
            label: 'REST API & Sync Engine\n[Container: Node.js / Express]\nHandles CRUD, RBAC & Offline sync',
            x: 590,
            y: 160,
            width: 240,
            height: 120,
            style: { fill: 'rgba(30, 58, 138, 0.9)', stroke: '#3b82f6', strokeWidth: 2, textColor: '#bfdbfe', rounded: 8 },
            data: { c4Type: 'container' },
          },
          {
            id: 'c4-db',
            type: 'erd-entity',
            label: 'Primary Cluster (PostgreSQL)',
            x: 890,
            y: 140,
            width: 230,
            height: 170,
            style: { fill: 'rgba(15, 23, 42, 0.95)', stroke: '#10b981', strokeWidth: 2, textColor: '#34d399', rounded: 6 },
            data: {
              tableName: 'PostgreSQL Database',
              fields: [
                { name: 'diagram_id', type: 'UUID', isPk: true },
                { name: 'document_json', type: 'JSONB', isPk: false },
                { name: 'version_snapshots', type: 'JSONB[]', isPk: false },
              ],
            },
          },
        ],
        edges: [
          { id: 'c4-e1', sourceNodeId: 'c4-user', targetNodeId: 'c4-spa', sourceAnchor: 'right', targetAnchor: 'left', type: 'straight', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow', label: 'HTTPS / WSS' },
          { id: 'c4-e2', sourceNodeId: 'c4-spa', targetNodeId: 'c4-api', sourceAnchor: 'right', targetAnchor: 'left', type: 'straight', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow', label: 'JSON REST / Bearer' },
          { id: 'c4-e3', sourceNodeId: 'c4-api', targetNodeId: 'c4-db', sourceAnchor: 'right', targetAnchor: 'left', type: 'straight', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow', label: 'TCP 5432 / SSL' },
        ],
      };

    // 3. Mind Map & Concept Map
    case 'mindmap':
      return {
        id: `page-mindmap-${timestamp}`,
        title: 'Cloud & AI Technology Strategy (Mind Map)',
        diagramType: 'mindmap',
        description: 'Radiating knowledge branches covering Multi-Model Architectures, Vector Stores, and Edge Runtimes.',
        viewport: { x: 50, y: 50, zoom: 0.95 },
        nodes: [
          {
            id: 'mm-core',
            type: 'mindmap-node',
            label: 'Enterprise AI &\nCloud Platform',
            x: 420,
            y: 200,
            width: 190,
            height: 90,
            style: { fill: 'rgba(147, 51, 234, 0.9)', stroke: '#c084fc', strokeWidth: 3, textColor: '#faf5ff', rounded: 9999 },
            data: { level: 0 },
          },
          {
            id: 'mm-b1',
            type: 'mindmap-node',
            label: '1. Model Governance\n• RBAC\n• Audit Logging',
            x: 120,
            y: 100,
            width: 180,
            height: 80,
            style: { fill: 'rgba(59, 130, 246, 0.85)', stroke: '#60a5fa', strokeWidth: 2, textColor: '#eff6ff', rounded: 20 },
            data: { level: 1 },
          },
          {
            id: 'mm-b2',
            type: 'mindmap-node',
            label: '2. Offline Persistence\n• IndexedDB Sync\n• Local Caching',
            x: 720,
            y: 100,
            width: 190,
            height: 80,
            style: { fill: 'rgba(16, 185, 129, 0.85)', stroke: '#34d399', strokeWidth: 2, textColor: '#ecfdf5', rounded: 20 },
            data: { level: 1 },
          },
          {
            id: 'mm-b3',
            type: 'mindmap-node',
            label: '3. Real-Time Collab\n• Live Cursors\n• Presence State',
            x: 120,
            y: 330,
            width: 180,
            height: 80,
            style: { fill: 'rgba(245, 158, 11, 0.85)', stroke: '#fbbf24', strokeWidth: 2, textColor: '#fffbeb', rounded: 20 },
            data: { level: 1 },
          },
          {
            id: 'mm-b4',
            type: 'mindmap-node',
            label: '4. REST API & GitHub\n• OpenAPI 3.0\n• Repo Bundling',
            x: 720,
            y: 330,
            width: 190,
            height: 80,
            style: { fill: 'rgba(236, 72, 153, 0.85)', stroke: '#f472b6', strokeWidth: 2, textColor: '#fdf2f8', rounded: 20 },
            data: { level: 1 },
          },
        ],
        edges: [
          { id: 'mm-e1', sourceNodeId: 'mm-core', targetNodeId: 'mm-b1', sourceAnchor: 'left', targetAnchor: 'right', type: 'curved', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow', color: '#60a5fa', strokeWidth: 2.5 },
          { id: 'mm-e2', sourceNodeId: 'mm-core', targetNodeId: 'mm-b2', sourceAnchor: 'right', targetAnchor: 'left', type: 'curved', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow', color: '#34d399', strokeWidth: 2.5 },
          { id: 'mm-e3', sourceNodeId: 'mm-core', targetNodeId: 'mm-b3', sourceAnchor: 'left', targetAnchor: 'right', type: 'curved', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow', color: '#fbbf24', strokeWidth: 2.5 },
          { id: 'mm-e4', sourceNodeId: 'mm-core', targetNodeId: 'mm-b4', sourceAnchor: 'right', targetAnchor: 'left', type: 'curved', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow', color: '#f472b6', strokeWidth: 2.5 },
        ],
      };

    // 4. Value Stream Mapping (VSM)
    case 'vsm':
      return {
        id: `page-vsm-${timestamp}`,
        title: 'Electronic Assembly Value Stream Map (VSM)',
        diagramType: 'vsm',
        description: 'Lean diagnostic map distinguishing value-added processing from non-value-added waiting times.',
        viewport: { x: 50, y: 50, zoom: 0.95 },
        nodes: [
          {
            id: 'vsm-s1',
            type: 'flow-process',
            label: '1. SMT Component Placement\nC/T: 32s | Uptime: 99.2%',
            x: 80,
            y: 160,
            width: 210,
            height: 90,
            style: { fill: 'rgba(217, 119, 6, 0.85)', stroke: '#fbbf24', strokeWidth: 2, textColor: '#fef3c7', rounded: 6 },
            data: { cycleTime: '32s' },
          },
          {
            id: 'vsm-inv-1',
            type: 'flow-decision',
            label: 'Buffer:\n150 Units\n(Wait: 2.5h)',
            x: 350,
            y: 165,
            width: 120,
            height: 80,
            style: { fill: 'rgba(180, 83, 9, 0.85)', stroke: '#f59e0b', strokeWidth: 2, textColor: '#ffffff' },
            data: {},
          },
          {
            id: 'vsm-s2',
            type: 'flow-process',
            label: '2. Automated Optical Inspection\nC/T: 18s | Yield: 99.8%',
            x: 530,
            y: 160,
            width: 220,
            height: 90,
            style: { fill: 'rgba(217, 119, 6, 0.85)', stroke: '#fbbf24', strokeWidth: 2, textColor: '#fef3c7', rounded: 6 },
            data: { cycleTime: '18s' },
          },
          {
            id: 'vsm-s3',
            type: 'flow-process',
            label: '3. Final Laser Packaging\nC/T: 25s | OEE: 94%',
            x: 820,
            y: 160,
            width: 200,
            height: 90,
            style: { fill: 'rgba(4, 120, 87, 0.85)', stroke: '#34d399', strokeWidth: 2, textColor: '#ecfdf5', rounded: 6 },
            data: { cycleTime: '25s' },
          },
        ],
        edges: [
          { id: 'vsm-e1', sourceNodeId: 'vsm-s1', targetNodeId: 'vsm-inv-1', sourceAnchor: 'right', targetAnchor: 'left', type: 'straight', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow', label: 'Push [FIFO]' },
          { id: 'vsm-e2', sourceNodeId: 'vsm-inv-1', targetNodeId: 'vsm-s2', sourceAnchor: 'right', targetAnchor: 'left', type: 'straight', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow' },
          { id: 'vsm-e3', sourceNodeId: 'vsm-s2', targetNodeId: 'vsm-s3', sourceAnchor: 'right', targetAnchor: 'left', type: 'straight', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow', label: 'Conveyor' },
        ],
      };

    // 5. Fishbone (Ishikawa Cause & Effect)
    case 'fishbone':
      return {
        id: `page-fishbone-${timestamp}`,
        title: 'Payment Gateway Latency Spike (Fishbone)',
        diagramType: 'fishbone',
        description: 'Root cause analysis using the 6M categories: Machine, Method, Material, Measurement, Milieu, Man.',
        viewport: { x: 50, y: 50, zoom: 0.95 },
        nodes: [
          {
            id: 'fb-head',
            type: 'flow-process',
            label: 'PROBLEM STATEMENT:\nAPI P99 Latency > 1200ms\nDuring Black Friday Peak',
            x: 840,
            y: 200,
            width: 220,
            height: 100,
            style: { fill: 'rgba(225, 29, 72, 0.9)', stroke: '#f43f5e', strokeWidth: 3, textColor: '#fff1f2', rounded: 8 },
            data: { isHead: true },
          },
          {
            id: 'fb-machine',
            type: 'flow-process',
            label: 'MACHINE (INFRA):\n• Connection pool exhaustion\n• Pod CPU throttling (k8s)',
            x: 200,
            y: 80,
            width: 230,
            height: 90,
            style: { fill: 'rgba(30, 41, 59, 0.9)', stroke: '#fb7185', strokeWidth: 2, textColor: '#ffe4e6', rounded: 6 },
            data: {},
          },
          {
            id: 'fb-method',
            type: 'flow-process',
            label: 'METHOD (CODE):\n• N+1 database queries\n• Synchronous fraud API call',
            x: 520,
            y: 80,
            width: 230,
            height: 90,
            style: { fill: 'rgba(30, 41, 59, 0.9)', stroke: '#fb7185', strokeWidth: 2, textColor: '#ffe4e6', rounded: 6 },
            data: {},
          },
          {
            id: 'fb-material',
            type: 'flow-process',
            label: 'MATERIAL (DATA):\n• Unindexed order history JSON\n• Payload bloat > 2MB',
            x: 200,
            y: 330,
            width: 230,
            height: 90,
            style: { fill: 'rgba(30, 41, 59, 0.9)', stroke: '#fb7185', strokeWidth: 2, textColor: '#ffe4e6', rounded: 6 },
            data: {},
          },
          {
            id: 'fb-measure',
            type: 'flow-process',
            label: 'MEASUREMENT:\n• Missing Prometheus alerts\n• Delayed log aggregation',
            x: 520,
            y: 330,
            width: 230,
            height: 90,
            style: { fill: 'rgba(30, 41, 59, 0.9)', stroke: '#fb7185', strokeWidth: 2, textColor: '#ffe4e6', rounded: 6 },
            data: {},
          },
        ],
        edges: [
          { id: 'fb-e1', sourceNodeId: 'fb-machine', targetNodeId: 'fb-head', sourceAnchor: 'right', targetAnchor: 'left', type: 'straight', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow', color: '#fb7185' },
          { id: 'fb-e2', sourceNodeId: 'fb-method', targetNodeId: 'fb-head', sourceAnchor: 'right', targetAnchor: 'left', type: 'straight', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow', color: '#fb7185' },
          { id: 'fb-e3', sourceNodeId: 'fb-material', targetNodeId: 'fb-head', sourceAnchor: 'right', targetAnchor: 'left', type: 'straight', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow', color: '#fb7185' },
          { id: 'fb-e4', sourceNodeId: 'fb-measure', targetNodeId: 'fb-head', sourceAnchor: 'right', targetAnchor: 'left', type: 'straight', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow', color: '#fb7185' },
        ],
      };

    // 6. UML Sequence Diagram
    case 'uml-sequence':
      return {
        id: `page-seq-${timestamp}`,
        title: 'OAuth 2.0 PKCE Flow (UML Sequence)',
        diagramType: 'uml-sequence',
        description: 'Chronological timeline of messages between Client SPA, Auth Server, and Resource API.',
        viewport: { x: 50, y: 50, zoom: 0.95 },
        nodes: [
          {
            id: 'seq-client',
            type: 'flow-process',
            label: 'Web Client\n(Browser SPA)',
            x: 100,
            y: 120,
            width: 160,
            height: 70,
            style: { fill: 'rgba(13, 148, 136, 0.85)', stroke: '#2dd4bf', strokeWidth: 2, textColor: '#f0fdfa', rounded: 6 },
            data: {},
          },
          {
            id: 'seq-auth',
            type: 'flow-process',
            label: 'Authorization Server\n(OAuth2 / OIDC)',
            x: 420,
            y: 120,
            width: 180,
            height: 70,
            style: { fill: 'rgba(30, 58, 138, 0.85)', stroke: '#3b82f6', strokeWidth: 2, textColor: '#eff6ff', rounded: 6 },
            data: {},
          },
          {
            id: 'seq-api',
            type: 'flow-process',
            label: 'Resource Gateway\n(Protected API)',
            x: 750,
            y: 120,
            width: 170,
            height: 70,
            style: { fill: 'rgba(88, 28, 135, 0.85)', stroke: '#a855f7', strokeWidth: 2, textColor: '#faf5ff', rounded: 6 },
            data: {},
          },
        ],
        edges: [
          { id: 'seq-e1', sourceNodeId: 'seq-client', targetNodeId: 'seq-auth', sourceAnchor: 'right', targetAnchor: 'left', type: 'straight', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow', label: '1. /authorize (code_challenge)' },
          { id: 'seq-e2', sourceNodeId: 'seq-auth', targetNodeId: 'seq-client', sourceAnchor: 'left', targetAnchor: 'right', type: 'straight', lineStyle: 'dashed', markerStart: 'none', markerEnd: 'arrow', label: '2. Auth Code (Redirect)' },
          { id: 'seq-e3', sourceNodeId: 'seq-client', targetNodeId: 'seq-auth', sourceAnchor: 'right', targetAnchor: 'left', type: 'straight', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow', label: '3. /token (code_verifier)' },
          { id: 'seq-e4', sourceNodeId: 'seq-auth', targetNodeId: 'seq-api', sourceAnchor: 'right', targetAnchor: 'left', type: 'straight', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow', label: '4. Bearer JWT Claim' },
        ],
      };

    // 7. UML State Machine
    case 'uml-state':
      return {
        id: `page-state-${timestamp}`,
        title: 'Order Lifecycle State Machine',
        diagramType: 'uml-state',
        description: 'Discrete lifecycle states, transitions, guard checks, and rollback behaviors.',
        viewport: { x: 50, y: 50, zoom: 0.95 },
        nodes: [
          {
            id: 'state-init',
            type: 'bpmn-event',
            label: 'Start',
            x: 80,
            y: 200,
            width: 50,
            height: 50,
            style: { fill: '#10b981', stroke: '#059669', strokeWidth: 2, textColor: '#fff', rounded: 999 },
            data: { eventType: 'start' },
          },
          {
            id: 'state-pending',
            type: 'flow-process',
            label: 'State: PendingPayment\nentry: LockInventory()\nexit: SendConfirmation()',
            x: 200,
            y: 180,
            width: 210,
            height: 90,
            style: { fill: 'rgba(109, 40, 217, 0.85)', stroke: '#a78bfa', strokeWidth: 2, textColor: '#f5f3ff', rounded: 12 },
            data: {},
          },
          {
            id: 'state-fulfilled',
            type: 'flow-process',
            label: 'State: InFulfillment\nentry: DispatchRobotics()',
            x: 520,
            y: 180,
            width: 200,
            height: 90,
            style: { fill: 'rgba(109, 40, 217, 0.85)', stroke: '#a78bfa', strokeWidth: 2, textColor: '#f5f3ff', rounded: 12 },
            data: {},
          },
          {
            id: 'state-done',
            type: 'bpmn-event',
            label: 'Delivered',
            x: 820,
            y: 200,
            width: 50,
            height: 50,
            style: { fill: '#ef4444', stroke: '#b91c1c', strokeWidth: 3, textColor: '#fff', rounded: 999 },
            data: { eventType: 'end' },
          },
        ],
        edges: [
          { id: 'st-e1', sourceNodeId: 'state-init', targetNodeId: 'state-pending', sourceAnchor: 'right', targetAnchor: 'left', type: 'straight', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow', label: 'submit()' },
          { id: 'st-e2', sourceNodeId: 'state-pending', targetNodeId: 'state-fulfilled', sourceAnchor: 'right', targetAnchor: 'left', type: 'straight', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow', label: 'payment_verified()' },
          { id: 'st-e3', sourceNodeId: 'state-fulfilled', targetNodeId: 'state-done', sourceAnchor: 'right', targetAnchor: 'left', type: 'straight', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow', label: 'carrier_scanned()' },
        ],
      };

    // Default Fallback
    default:
      return {
        id: `page-${type}-${timestamp}`,
        title: `New ${type.toUpperCase()} Diagram`,
        diagramType: type,
        description: `Starter interactive diagram for ${type.toUpperCase()} modeling standard.`,
        viewport: { x: 50, y: 50, zoom: 1 },
        nodes: [
          {
            id: `node-${type}-1`,
            type: 'flow-process',
            label: `${type.toUpperCase()} Step 1: Initialize System`,
            x: 100,
            y: 180,
            width: 220,
            height: 80,
            style: { fill: 'rgba(30, 58, 138, 0.85)', stroke: '#3b82f6', strokeWidth: 2, textColor: '#f8fafc', rounded: 8 },
            data: {},
          },
          {
            id: `node-${type}-2`,
            type: 'flow-decision',
            label: 'Verify Criteria?',
            x: 400,
            y: 175,
            width: 140,
            height: 90,
            style: { fill: 'rgba(180, 83, 9, 0.8)', stroke: '#f59e0b', strokeWidth: 2, textColor: '#ffffff' },
            data: {},
          },
          {
            id: `node-${type}-3`,
            type: 'flow-process',
            label: 'Complete & Execute Deliverable',
            x: 630,
            y: 180,
            width: 220,
            height: 80,
            style: { fill: 'rgba(4, 120, 87, 0.85)', stroke: '#34d399', strokeWidth: 2, textColor: '#ecfdf5', rounded: 8 },
            data: {},
          },
        ],
        edges: [
          { id: `e-${type}-1`, sourceNodeId: `node-${type}-1`, targetNodeId: `node-${type}-2`, sourceAnchor: 'right', targetAnchor: 'left', type: 'orthogonal', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow' },
          { id: `e-${type}-2`, sourceNodeId: `node-${type}-2`, targetNodeId: `node-${type}-3`, sourceAnchor: 'right', targetAnchor: 'left', type: 'orthogonal', lineStyle: 'solid', markerStart: 'none', markerEnd: 'arrow', label: 'Approved' },
        ],
      };
  }
}
