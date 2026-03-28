import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase.js'
import { getDoc, doc } from 'firebase/firestore'
import '../styles/Stats.css'

export default function Stats({ userProp }) {
  const navigate = useNavigate()
  
  const [user, setUser] = useState(userProp || auth.currentUser)
  const [userStats, setUserStats] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (userProp) return
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u)
    })
    return () => unsub()
  }, [userProp])

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return 

      try {
  const targetId = user.uid || user.userId 
  console.log("Looking for user with ID:", targetId) // <-- Add this to debug!

  // Fetch the document directly by its ID
  const docRef = doc(db, 'users', targetId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    setUserStats(docSnap.data())
  } else {
    console.warn("User document not found in database.")
  }
} catch (error) {
        console.error("Error fetching user stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserStats()
  }, [user]) 

  if (loading && !userStats) {
    return <div className="stats__loading">Loading Profile...</div>
  }

  if (!userStats) {
    return <div className="stats__error">No stats available.</div>
  }

  // Helper to format the 'createdAt' field properly 
  // (Handles both Firestore Timestamps and standard ISO strings)
  const getJoinDate = (dateVal) => {
    if (!dateVal) return 'Recently'
    const dateObj = typeof dateVal.toDate === 'function' ? dateVal.toDate() : new Date(dateVal)
    return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  // Map to your new nested objects
  const lifetimeXP = userStats.gamification?.lifetimeXP || 0
  const currentStreak = userStats.gamification?.currentStreak || 0
  
  // Math for the progress bar
  const currentLevel       = Math.floor(lifetimeXP / 1000) + 1
  const xpIntoCurrentLevel = lifetimeXP % 1000
  const progressPercentage = (xpIntoCurrentLevel / 1000) * 100

  return (
    <div className='stats'>
      <div className='stats__inner'>

        <button className='stats__back' onClick={() => navigate(-1)}>← Back</button>
        <h1 className='stats__title'>Player Profile</h1>

        {/* ── Identity + level card ── */}
        <div className='stats__card stats__identity'>
          {/* Assuming avatar might be in inventory now, otherwise falling back to root/default */}
          <div className='stats__avatar'>{userStats.equippedAvatar || userStats.inventory?.equippedAvatar || '👤'}</div>

          <div className='stats__identity-info'>
            <h2 className='stats__display-name'>{userStats.displayName || 'Anonymous'}</h2>
            <p className='stats__join-date'>Joined {getJoinDate(userStats.createdAt)}</p>

            <div className='stats__level-row'>
              <span className='stats__level-label'>Level {currentLevel}</span>
              <span className='stats__level-xp'>{xpIntoCurrentLevel} / 1000 XP</span>
            </div>

            <div className='stats__bar-track'>
              <div
                className='stats__bar-fill'
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className='stats__bar-hint'>
              {1000 - xpIntoCurrentLevel} XP to Level {currentLevel + 1}
            </p>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className='stats__grid'>
          <div className='stats__stat-card'>
            <div className='stats__stat-icon stats__stat-icon--xp'>✨</div>
            <span className='stats__stat-value'>{lifetimeXP.toLocaleString()}</span>
            <span className='stats__stat-label'>Lifetime XP</span>
          </div>

          <div className='stats__stat-card'>
            <div className='stats__stat-icon stats__stat-icon--tasks'>✅</div>
            <span className='stats__stat-value'>{userStats.statistics?.totalNodesCompleted || 0}</span>
            <span className='stats__stat-label'>Nodes Conquered</span>
          </div>

          <div className='stats__stat-card'>
            <div className='stats__stat-icon stats__stat-icon--projects'>🧠</div>
            <span className='stats__stat-value'>{userStats.statistics?.totalProjects || 0}</span>
            <span className='stats__stat-label'>Trees Grown</span>
          </div>
        </div>

        {/* ── Streak widget ── */}
        <div className='stats__streak-card'>
          <div className='stats__streak-text'>
            <h3 className='stats__streak-heading'>Learning Streak</h3>
            <p className='stats__streak-sub'>Keep completing tasks daily to keep the fire alive!</p>
          </div>
          <div className='stats__streak-badge'>
            <span className='stats__streak-flame'>🔥</span>
            <span className='stats__streak-count'>{currentStreak}</span>
            <span className='stats__streak-unit'>Days</span>
          </div>
        </div>

      </div>
    </div>
  )
}