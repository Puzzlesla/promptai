import '../styles/CompletedProjects.css'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import '../styles/Dashboard.css'
import { auth, db } from '../firebase.js'
import { signOut } from 'firebase/auth'
import BottomNav from '../components/BottomNav'
import tree1 from '../assets/tree1.svg'
import tree2 from '../assets/tree2.svg'

const treeSprites = [tree1, tree2]



/** Sum nodesCompleted across all completed projects */
function calcLifetimeXP(projects) {
  return projects.reduce((sum, p) => sum + (p.progress?.nodesCompleted ?? 0), 0)
}


function calcLongestStreak(logs) {
  if (!logs.length) return 0

  const dates = [...new Set(logs.map(l => l.date))].sort()

  let longest = 1
  let current = 1

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diffDays = (curr - prev) / (1000 * 60 * 60 * 24)

    if (diffDays === 1) {
      current++
      longest = Math.max(longest, current)
    } else if (diffDays > 1) {
      current = 1
    }
  }

  return longest
}

function formatMonthYear(isoStr) {
  if (!isoStr) return '—'
  return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}


export default function CompletedProjects() {
  const [projects,setProjects] = useState([])
  const [lifetimeXP,setLifetimeXP] = useState(0)
  const [longestStreak,setLongestStreak] = useState(0)
  const [loading,setLoading] = useState(true)
  const [user, setUser] = useState(auth.currentUser)
  // Removed unused activeNav state

  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u))
    return () => unsub()

    
  }, [])

  // Fetch completed projects + daily_logs
  useEffect(() => {
    if (!user) return

    

    async function load() {
      try {
        const pQuery = query(
          collection(db, 'projects'),
          where('userId',  '==', user.uid),
          where('status',  '==', 'completed')
        )
        const pSnap = await getDocs(pQuery)
        const completed = pSnap.docs.map(d => ({ id: d.id, ...d.data() }))

        const logsSnap = await getDocs(
          collection(db, 'users', user.uid, 'daily_logs')
        )
        const logs = logsSnap.docs.map(d => d.data())

        setProjects(completed)
        setLifetimeXP(calcLifetimeXP(completed))
        setLongestStreak(calcLongestStreak(logs))
      } catch (err) {
        console.error('CompletedProjects load error:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user])

  const sidebarItems = [
    { label: 'Settings', path: '/dashboard/settings'},
    { label: 'Statistics', path: '/dashboard/statistics'},
    { label: 'Shop', path: '/dashboard/shop'},
    { label: 'Sign Out', onClick: handleSignOut },
  ]

  return (
    <main className='cp'>

      {/* ── Left sidebar ── */}
      <aside className='cp__sidebar'>
        <div className='cp__avatar' aria-label='Profile'>
              <img
                src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${user?.uid || 'PromptAI'}`}
                alt='Profile avatar'
              />
          </div>
        {sidebarItems.map(item => (
          <button
            key={item.label}
            className='cp__sidebar-btn'
            onClick={item.onClick || (() => navigate(item.path))}
          >
            {item.label}
          </button>
        ))}
        
      </aside>

      {/* ── Main content ── */}
      <section className='cp__content'>

        {/* Stats banner */}
        
          <div className='cp__banner'>
            <div className='cp__stat'>
              <span className='cp__stat-emoji'>🏆</span>
              <span className='cp__stat-label'>Lifetime XP:</span>
              <span className='cp__stat-value'>
              {loading ? '—' : lifetimeXP.toLocaleString()}
            </span>
          </div>
          <div className='cp__divider' />
          <div className='cp__stat'>
            <span className='cp__stat-emoji'>📋</span>
            <span className='cp__stat-label'>Total Projects:</span>
            <span className='cp__stat-value'>
              {loading ? '—' : projects.length}
            </span>
          </div>
          <div className='cp__divider' />
          <div className='cp__stat'>
            <span className='cp__stat-emoji'>🔥</span>
            <span className='cp__stat-label'>Longest Streak:</span>
            <span className='cp__stat-value'>
              {loading ? '—' : `${longestStreak} Days`}
            </span>
          </div>
        </div>
        

        {/* Project grid */}
        {loading ? (
          <div className='cp__loading'>Loading your completed projects…</div>
        ) : projects.length === 0 ? (
          <div className='cp__empty'>
            <p>No completed projects yet.</p>
            <p>Finish a project to see it here! 🌳</p>
          </div>
        ) : (
          <div className='cp__grid'>
            {projects.map((project, i) => {
              const sprite   = treeSprites[i % treeSprites.length]
              const nodes    = project.progress?.nodesCompleted ?? 0
              const total    = project.progress?.totalNodes    ?? '?'
              const finished = formatMonthYear(project.progress?.completedAt)
              const tags     = project.metadata?.tags ?? []

              return (
                <article
                  key={project.id}
                  className='cp__card'
                  style={{ animationDelay: `${i * 0.07}s` }}
                  onClick={() => navigate(`/treeview/${project.id}`)}
                  role='button'
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && navigate(`/treeview/${project.id}`)}
                  aria-label={project.title}
                >
                  {/* Tree illustration area */}
                  <div className='cp__card-tree'>
                    <img
                      src={sprite}
                      alt=''
                      className='cp__card-sprite'
                      draggable={false}
                    />
                  </div>

                  {/* Card info */}
                  <div className='cp__card-info'>
                    <h3 className='cp__card-title'>
                      {project.title || 'Untitled Project'}
                    </h3>

                    {tags.length > 0 && (
                      <div className='cp__card-tags'>
                        {tags.slice(0, 3).map(tag => (
                          <span key={tag} className='cp__card-tag'>{tag}</span>
                        ))}
                      </div>
                    )}

                    <p className='cp__card-meta'>
                      Finished: <strong>{finished}</strong>
                    </p>
                    <p className='cp__card-meta'>
                      Nodes Completed: <strong>{nodes}/{total}</strong>
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* Bottom navigation bar */}
        <BottomNav />
      </section>
    </main>
  )
}