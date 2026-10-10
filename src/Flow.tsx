import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Provision } from './data/provisions';
import dagre from 'dagre';

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 });

  nodes.forEach((node) => {
    // estimate dimensions based on text length
    const width = 120 + (node.data.label as string).length * 4;
    const height = 40;
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top' as any;
    node.sourcePosition = isHorizontal ? 'right' : 'bottom' as any;

    node.position = {
      x: nodeWithPosition.x - nodeWithPosition.width / 2,
      y: nodeWithPosition.y - nodeWithPosition.height / 2,
    };
    return node;
  });

  return { nodes, edges };
};

const getTypeEmoji = (type: string) => {
  if (type.includes('Φώτα')) return '💡';
  if (type.includes('Πρίζες')) return '🔌';
  if (type.includes('Υδραυλικά')) return '🚰';
  if (type.includes('Διακόσμηση')) return '🎨';
  if (type.includes('Ασφάλεια')) return '🔒';
  if (type.includes('Συντήρηση')) return '🔧';
  if (type.includes('Server Cabinet')) return '🖥️';
  return '📦';
};

type FlowProps = {
  provisions: Provision[];
  rooms: string[];
};

export default function Flow({ provisions, rooms }: FlowProps) {
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Central Hub
    nodes.push({
      id: 'hq',
      position: { x: 0, y: 0 },
      data: { label: '🏢 Pronies HQ' },
      style: { backgroundColor: '#4f46e5', color: '#fff', fontWeight: 'bold', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', border: 'none' },
    });

    rooms.forEach((room, i) => {
      const roomProvisions = provisions.filter(p => p.room === room);
      if (roomProvisions.length === 0) return;

      const roomId = `room-${i}`;
      nodes.push({
        id: roomId,
        position: { x: 0, y: 0 },
        data: { label: room },
        style: { backgroundColor: '#374151', color: '#e5e7eb', border: '2px solid #6366f1', borderRadius: '6px', padding: '6px 12px', fontSize: '12px' },
      });

      edges.push({
        id: `e-hq-${roomId}`,
        source: 'hq',
        target: roomId,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
      });

      // Group provisions by wall
      const walls = new Set(roomProvisions.map(p => p.wall || 'Γενικός Χώρος'));
      
      let wallIndex = 0;
      walls.forEach(wall => {
        const wallProvisions = roomProvisions.filter(p => (p.wall || 'Γενικός Χώρος') === wall);
        
        let sourceNodeForProvisions = roomId;
        
        // Create a wall node
        const wallId = `wall-${roomId}-${wallIndex}`;
        nodes.push({
          id: wallId,
          position: { x: 0, y: 0 },
          data: { label: `🧱 ${wall}` },
          style: { backgroundColor: '#312e81', color: '#c7d2fe', border: '1px solid #4338ca', borderRadius: '4px', padding: '4px 8px', fontSize: '10px' },
        });

        edges.push({
          id: `e-${roomId}-${wallId}`,
          source: roomId,
          target: wallId,
          style: { stroke: '#4338ca' },
        });

        sourceNodeForProvisions = wallId;
        
        // Arrange provisions under the wall node
        wallProvisions.forEach((prov) => {
          const provId = `prov-${prov.id}`;
          const typeEmoji = getTypeEmoji(prov.type);
          nodes.push({
            id: provId,
            position: { x: 0, y: 0 },
            data: { label: `${typeEmoji} ${prov.name}` },
            style: { backgroundColor: '#1f2937', color: '#9ca3af', border: '1px solid #4b5563', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', transition: 'opacity 0.3s' },
          });

          edges.push({
            id: `e-${sourceNodeForProvisions}-${provId}`,
            source: sourceNodeForProvisions,
            target: provId,
            animated: true,
            style: { stroke: '#4b5563', transition: 'opacity 0.3s' },
          });
        });
        
        wallIndex++;
      });
    });

    return getLayoutedElements(nodes, edges);
  }, [provisions, rooms]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state when props change
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setHighlightedNode(null);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Logic to highlight connected sub-trees
  useEffect(() => {
    if (!highlightedNode) {
      setNodes(nds => nds.map(n => ({ ...n, style: { ...n.style, opacity: 1 } })));
      setEdges(eds => eds.map(e => ({ ...e, style: { ...e.style, opacity: 1 } })));
      return;
    }

    // BFS to find all connected nodes (up and down the tree)
    const connectedNodes = new Set<string>();
    const queue = [highlightedNode];
    connectedNodes.add(highlightedNode);

    // Build adjacency list (undirected for highlighting the whole branch)
    const adjList: Record<string, string[]> = {};
    initialEdges.forEach((e: Edge) => {
      if (!adjList[e.source]) adjList[e.source] = [];
      if (!adjList[e.target]) adjList[e.target] = [];
      adjList[e.source].push(e.target);
      adjList[e.target].push(e.source);
    });

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = adjList[current] || [];
      neighbors.forEach(n => {
        if (!connectedNodes.has(n)) {
          connectedNodes.add(n);
          queue.push(n);
        }
      });
    }

    setNodes(nds => nds.map(n => ({
      ...n,
      style: { ...n.style, opacity: connectedNodes.has(n.id) ? 1 : 0.2 }
    })));

    setEdges(eds => eds.map(e => ({
      ...e,
      style: { ...e.style, opacity: (connectedNodes.has(e.source) && connectedNodes.has(e.target)) ? 1 : 0.1 }
    })));

  }, [highlightedNode, initialEdges, setNodes, setEdges]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setHighlightedNode(prev => prev === node.id ? null : node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setHighlightedNode(null);
  }, []);

  return (
    <div className="w-full h-[85vh] border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        colorMode="dark"
        minZoom={0.1}
      >
        <Controls />
        <MiniMap nodeStrokeColor="#6366f1" nodeColor="#374151" maskColor="rgba(0,0,0,0.8)" />
        <Background color="#374151" gap={16} />
      </ReactFlow>
    </div>
  );
}
