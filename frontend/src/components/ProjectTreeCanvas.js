
export function layoutTreePositions(count, width, height) {
  if (count === 0) return []
  const padY = 52
  const usableH = height - 2 * padY
  const positions = []
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / Math.max(count - 1, 1)
    const y = height - padY - t * usableH
    const sway = Math.sin(i * 1.05) * 68 + (i % 2 === 0 ? 12 : -18)
    const x = width / 2 + sway
    positions.push({ x, y })
  }
  return positions
}

function organicBranchPath(x0, y0, x1, y1) {
  const midY = (y0 + y1) / 2
  const bulge = (x1 - x0) * 0.35 + (y0 - y1) * 0.08
  const cx1 = x0 + bulge
  const cy1 = midY + (x1 - x0) * 0.12
  const cx2 = x1 - bulge * 0.6
  const cy2 = midY - (x1 - x0) * 0.08
  return `M ${x0} ${y0} C ${cx1} ${cy1} ${cx2} ${cy2} ${x1} ${y1}`
}

export default function ProjectTreeCanvas({
  linearTasks,
  completedIds,
  nextIndex,
  isNodeInteractive, // still used to style nodes, not to gate clicks
  onNodeActivate,    // now = handleNodeSelect (opens detail panel)
}) {
  const w = 360
  const h = 520
  const positions = layoutTreePositions(linearTasks.length, w, h)
  const done = new Set(completedIds)

  return (
    <div className="tree-canvas">
      <svg
        className="tree-canvas__svg"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <linearGradient id="treeBranchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5E3C" />
            <stop offset="100%" stopColor="#A0722A" />
          </linearGradient>
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Branches */}
        {positions.length > 1 &&
          positions.slice(0, -1).map((p, i) => {
            const q = positions[i + 1]
            return (
              <path
                key={`br-${linearTasks[i].id}-${linearTasks[i + 1].id}`}
                d={organicBranchPath(p.x, p.y, q.x, q.y)}
                className="tree-canvas__branch"
                fill="none"
                stroke="url(#treeBranchGrad)"
                strokeWidth={10}
                strokeLinecap="round"
              />
            )
          })}

        {/* Nodes */}
        {linearTasks.map((node, i) => {
          const p        = positions[i]
          if (!p) return null
          const stepNum  = i + 1
          const isDone   = done.has(node.id)
          const isCurrent = i === nextIndex && !isDone
          // isInteractive still drives visual styling (pulse, opacity)
          const isInteractive = isNodeInteractive ? isNodeInteractive(node.id) : false
          const label    = (node.data?.label || 'Task').slice(0, 42)
          const r        = isCurrent ? 26 : 22

          return (
            <g
              key={node.id}
              className="tree-canvas__node-group"
              filter={isCurrent ? 'url(#nodeGlow)' : undefined}
            >
              {/* White halo ring */}
              <circle
                cx={p.x}
                cy={p.y}
                r={r + 4}
                className={`tree-canvas__node-ring${isCurrent ? ' tree-canvas__node-ring--current' : ''}`}
              />
              {/* Filled node — dimmed if locked */}
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                className={`tree-canvas__node-fill${isDone ? ' tree-canvas__node-fill--done' : ''}${!isInteractive && !isDone ? ' tree-canvas__node-fill--locked' : ''}`}
              />
              {/* Step number */}
              <text
                x={p.x}
                y={p.y + 5}
                textAnchor="middle"
                className="tree-canvas__node-num"
              >
                {stepNum}
              </text>

              {/* Label button — ALWAYS enabled, opens detail panel on click */}
              <foreignObject
                x={p.x - 90}
                y={p.y + r + 10}
                width={180}
                height={56}
                xmlns="http://www.w3.org/1999/xhtml"
              >
                <div className="tree-canvas__label-wrap">
                  <button
                    type="button"
                    className={`tree-canvas__label-btn${isCurrent ? ' tree-canvas__label-btn--pulse' : ''}${isDone ? ' tree-canvas__label-btn--done' : ''}`}
                    onClick={() => onNodeActivate(node.id)}
                    title="Tap to see steps"
                  >
                    {label}
                  </button>
                </div>
              </foreignObject>
            </g>
          )
        })}
      </svg>
    </div>
  )
}