/**
 * Read roadmap graph from a Firestore project document.
 * Backend stores full AI JSON under `reactFlowData`, which includes nested
 * `reactFlowData: { nodes, edges }` plus `project_metadata`.
 */
export function extractFlowFromProject(doc) {
  if (!doc?.reactFlowData) {
    return { nodes: [], edges: [], metadata: null }
  }
  const outer = doc.reactFlowData
  const metadata = outer.project_metadata ?? null

  if (outer.reactFlowData && Array.isArray(outer.reactFlowData.nodes)) {
    return {
      nodes: outer.reactFlowData.nodes,
      edges: outer.reactFlowData.edges ?? [],
      metadata,
    }
  }

  if (Array.isArray(outer.nodes)) {
    return {
      nodes: outer.nodes,
      edges: outer.edges ?? [],
      metadata,
    }
  }

  return { nodes: [], edges: [], metadata }
}

export function applyNodeCompletion(nodes, completedIds = []) {
  const done = new Set(completedIds)
  return nodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      status: done.has(n.id)
        ? 'completed'
        : (n.data?.status ?? 'pending'),
    },
  }))
}

export function buildReactFlowState(project) {
  const { nodes: rawNodes, edges: rawEdges, metadata } =
    extractFlowFromProject(project)
  const completedIds = project.progress?.completedNodeIds ?? []
  const nodes = applyNodeCompletion(rawNodes, completedIds).map((n) => ({
    ...n,
    type: n.type || 'actionableTask',
    position: n.position ?? { x: 0, y: 0 },
  }))
  const edges = (rawEdges ?? []).map((e) => ({
    ...e,
    animated: e.animated !== false,
  }))
  return { nodes, edges, metadata }
}

/**
 * Single linear order for tasks (step 1 → step N). Follows edges from a root when
 * possible; otherwise sorts by y descending so step 1 is visually at the bottom.
 */
export function getLinearTaskOrder(nodes, edges) {
  if (!nodes?.length) return []
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]))
  const outgoing = new Map()
  const incoming = new Map()
  nodes.forEach((n) => {
    outgoing.set(n.id, [])
    incoming.set(n.id, 0)
  })
  for (const e of edges || []) {
    if (!byId[e.source] || !byId[e.target]) continue
    outgoing.get(e.source).push(e.target)
    incoming.set(e.target, (incoming.get(e.target) || 0) + 1)
  }

  const roots = nodes.filter((n) => incoming.get(n.id) === 0)
  roots.sort(
    (a, b) =>
      (a.position?.y ?? 0) - (b.position?.y ?? 0) ||
      (a.position?.x ?? 0) - (b.position?.x ?? 0)
  )

  const order = []
  const visited = new Set()

  const walkFrom = (startId) => {
    let cur = byId[startId]
    while (cur && !visited.has(cur.id)) {
      visited.add(cur.id)
      order.push(cur)
      const outs = outgoing.get(cur.id) || []
      if (!outs.length) break
      outs.sort(
        (a, b) =>
          (byId[a]?.position?.y ?? 0) - (byId[b]?.position?.y ?? 0)
      )
      cur = byId[outs[0]]
    }
  }

  if (roots.length) {
    for (const r of roots) {
      if (!visited.has(r.id)) walkFrom(r.id)
    }
  }

  const rest = nodes.filter((n) => !visited.has(n.id))
  rest.sort(
    (a, b) =>
      (b.position?.y ?? 0) - (a.position?.y ?? 0) ||
      (a.position?.x ?? 0) - (b.position?.x ?? 0)
  )
  order.push(...rest)

  return order
}

/** Index of first incomplete task in linear order (0-based), or order.length if all done. */
export function getNextTaskIndex(linearOrder, completedNodeIds = []) {
  const done = new Set(completedNodeIds)
  for (let i = 0; i < linearOrder.length; i++) {
    if (!done.has(linearOrder[i].id)) return i
  }
  return linearOrder.length
}

/** Longest prefix of linearOrder that is fully completed (index of last done, or -1). */
export function getLastCompletedPrefixIndex(linearOrder, completedNodeIds) {
  const done = new Set(completedNodeIds)
  let last = -1
  for (let i = 0; i < linearOrder.length; i++) {
    if (!done.has(linearOrder[i].id)) break
    last = i
  }
  return last
}

export function canToggleTaskComplete(
  linearOrder,
  completedNodeIds,
  nodeId,
  markComplete
) {
  const idx = linearOrder.findIndex((n) => n.id === nodeId)
  if (idx === -1) return false

  if (markComplete) {
    return idx === getNextTaskIndex(linearOrder, completedNodeIds)
  }
  const lastPrefix = getLastCompletedPrefixIndex(linearOrder, completedNodeIds)
  return lastPrefix >= 0 && idx === lastPrefix
}
