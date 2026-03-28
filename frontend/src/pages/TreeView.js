import '../styles/TreeView.css'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../firebase.js'
import BottomNav from '../components/BottomNav'
import ProjectTreeCanvas from '../components/ProjectTreeCanvas.js'
import {
  buildReactFlowState,
  extractFlowFromProject,
  getLinearTaskOrder,
  getNextTaskIndex,
  getLastCompletedPrefixIndex,
  canToggleTaskComplete,
} from '../utils/projectFlowData.js'

function TreeViewContent({ project, projectId, user, onBack }) {
  const navigate = useNavigate()
  const { metadata } = buildReactFlowState(project)
  const linearOrder = useMemo(() => {
    const { nodes, edges } = extractFlowFromProject(project)
    return getLinearTaskOrder(nodes, edges)
  }, [project])

  const completedIds = project.progress?.completedNodeIds ?? []
  const nextIndex = getNextTaskIndex(linearOrder, completedIds)

  const title =
    metadata?.title || project.title || 'Project'

  const handleToggleNode = useCallback(
    async (nodeId) => {
      const ids = project.progress?.completedNodeIds ?? []
      const markComplete = !ids.includes(nodeId)
      if (
        !canToggleTaskComplete(linearOrder, ids, nodeId, markComplete)
      ) {
        return
      }

      let nextIds
      if (markComplete) {
        const ni = getNextTaskIndex(linearOrder, ids)
        if (linearOrder[ni]?.id !== nodeId) return
        nextIds = linearOrder.slice(0, ni + 1).map((n) => n.id)
      } else {
        const lastP = getLastCompletedPrefixIndex(linearOrder, ids)
        if (linearOrder[lastP]?.id !== nodeId) return
        nextIds = linearOrder.slice(0, lastP).map((n) => n.id)
      }

      try {
        await updateDoc(doc(db, 'projects', projectId), {
          'progress.completedNodeIds': nextIds,
          'progress.nodesCompleted': nextIds.length,
          updatedAt: serverTimestamp(),
        })
      } catch (e) {
        console.error('TreeView update progress:', e)
      }
    },
    [linearOrder, project, projectId]
  )

  const isNodeInteractive = useCallback(
    (nodeId) => {
      const ids = project.progress?.completedNodeIds ?? []
      return (
        canToggleTaskComplete(linearOrder, ids, nodeId, true) ||
        canToggleTaskComplete(linearOrder, ids, nodeId, false)
      )
    },
    [linearOrder, project]
  )

  const streak =
    project.progress?.nodesCompleted ?? completedIds.length

  return (
    <div className="treeview-shell">
      <header className="treeview-shell__header">
        <button
          type="button"
          className="treeview-shell__back"
          onClick={() => (onBack ? onBack() : navigate(-1))}
        >
          ← Back
        </button>
        <div className="treeview-shell__title-pill">{title}</div>
        <div className="treeview-shell__header-right">
          <span className="treeview-shell__streak" title="Steps done this path">
            {streak}
            <span className="treeview-shell__streak-ico" aria-hidden>
              🔥
            </span>
          </span>
          <img
            className="treeview-shell__avatar"
            src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${user?.uid || 'PromptAI'}`}
            alt=""
          />
        </div>
      </header>

      <div className="treeview-shell__body">
        <aside className="treeview-sidebar">
          <h2 className="treeview-sidebar__heading">To-dos</h2>
          <p className="treeview-sidebar__hint">
            Complete from the bottom up — one step at a time.
          </p>
          <ul className="treeview-sidebar__list">
            {linearOrder.map((node, i) => {
              const done = completedIds.includes(node.id)
              const step = i + 1
              const isNext = i === nextIndex && !done
              const label = (node.data?.label || `Task ${step}`).slice(0, 80)
              const canUse = isNodeInteractive(node.id)

              return (
                <li key={node.id} className="treeview-sidebar__item">
                  <label
                    className={`treeview-sidebar__row${done ? ' treeview-sidebar__row--done' : ''}${isNext ? ' treeview-sidebar__row--next' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={done}
                      disabled={!canUse}
                      onChange={() => canUse && handleToggleNode(node.id)}
                      className="treeview-sidebar__check"
                    />
                    <span className="treeview-sidebar__step">{step}.</span>
                    <span className="treeview-sidebar__text">{label}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        </aside>

        <main className="treeview-main">
          {metadata?.ai_assessment && (
            <p className="treeview-main__blurb">{metadata.ai_assessment}</p>
          )}
          <ProjectTreeCanvas
            linearTasks={linearOrder}
            completedIds={completedIds}
            nextIndex={nextIndex}
            isNodeInteractive={isNodeInteractive}
            onNodeActivate={handleToggleNode}
          />
        </main>
      </div>
    </div>
  )
}

function TreeViewForProject({ projectId, user }) {
  const [project, setProject] = useState(null)
  const [loadState, setLoadState] = useState('loading')

  useEffect(() => {
    const ref = doc(db, 'projects', projectId)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists) {
          setProject(null)
          setLoadState('missing')
          return
        }
        const data = snap.data()
        if (data.userId !== user.uid) {
          setLoadState('denied')
          return
        }
        setProject({ id: snap.id, ...data })
        setLoadState('ready')
      },
      () => setLoadState('error')
    )
    return () => unsub()
  }, [projectId, user])

  useEffect(() => {
    if (!project || loadState !== 'ready') return
    const { nodes, metadata } = extractFlowFromProject(project)
    const total = metadata?.total_nodes ?? nodes.length
    if (total > 0 && (project.progress?.totalNodes ?? 0) === 0) {
      updateDoc(doc(db, 'projects', projectId), {
        'progress.totalNodes': total,
        updatedAt: serverTimestamp(),
      }).catch(() => {})
    }
  }, [project, projectId, loadState])

  if (loadState === 'loading') {
    return (
      <div className="treeview-page__state">Loading project roadmap…</div>
    )
  }
  if (loadState === 'missing') {
    return (
      <div className="treeview-page__state">
        This project could not be found.
      </div>
    )
  }
  if (loadState === 'denied') {
    return (
      <div className="treeview-page__state treeview-page__state--error">
        You do not have access to this project.
      </div>
    )
  }
  if (loadState === 'error') {
    return (
      <div className="treeview-page__state treeview-page__state--error">
        Something went wrong loading this project.
      </div>
    )
  }
  if (!project?.reactFlowData) {
    return (
      <div className="treeview-page__state">
        No roadmap yet. Generate one from the project wizard first.
      </div>
    )
  }
  const { nodes } = buildReactFlowState(project)
  if (nodes.length === 0) {
    return (
      <div className="treeview-page__state">
        Roadmap data is empty. Try generating the tree again.
      </div>
    )
  }

  return (
    <TreeViewContent project={project} projectId={projectId} user={user} />
  )
}

export default function TreeView() {
  const { projectId } = useParams()
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser)
    return () => unsub()
  }, [])

  let body
  if (user === undefined) {
    body = (
      <div className="treeview-page__state">Loading project roadmap…</div>
    )
  } else if (user === null) {
    body = (
      <div className="treeview-page__state">
        Sign in to view this roadmap.
      </div>
    )
  } else if (!projectId) {
    body = (
      <div className="treeview-page__state">Missing project id.</div>
    )
  } else {
    body = (
      <TreeViewForProject
        key={`${projectId}-${user.uid}`}
        projectId={projectId}
        user={user}
      />
    )
  }

  return (
    <div className="treeview-page treeview-page--mockup">
      {body}
      <BottomNav />
    </div>
  )
}
