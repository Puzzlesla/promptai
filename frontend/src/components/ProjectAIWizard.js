import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase.js'


export default function ProjectAIWizard({
  userId,
  title,
  visionPrompt,
  startDate,
  endDate,
  weeklyCommitmentHours,
  tags,
  documentUrls = [],
  onComplete,
}) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')
  const navigate = useNavigate()

  const handleStart = async () => {
    setStatus('creating')
    setError('')
    setProgress('Creating project...')
    try {
      
      const docRef = await addDoc(collection(db, 'projects'), {
        userId,
        schemaVersion: '1.0',
        title,
        visionPrompt,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        metadata: {
          startDate,
          endDate,
          weeklyCommitmentHours,
          tags,
          documentUrls,
        },
        progress: {
          nodesCompleted: 0,
          totalNodes: 0,
          growthStage: 0,
        },
      })
      const projectId = docRef.id
      setProgress('Generating roadmap...')
      setStatus('ai')
      
      const functions = getFunctions()
      const generateProjectTree = httpsCallable(functions, 'generateProjectTree')
      await generateProjectTree({
        userPrompt: visionPrompt,
        projectId,
      })
      setProgress('Updating project...')
      setStatus('done')
      if (onComplete) onComplete(projectId)
      else navigate(`/treeview/${projectId}`)
    } catch (err) {
      setError(err.message || 'Something went wrong')
      setStatus('error')
    }
  }

  return (
    <div style={{padding:32, maxWidth:480, margin:'0 auto', textAlign:'center'}}>
      {status === 'idle' && (
        <button className="add-project__start" onClick={handleStart}>
          Generate Project Roadmap
        </button>
      )}
      {status !== 'idle' && (
        <div>
          <div style={{marginBottom:16}}>{progress}</div>
          {status === 'error' && <div style={{color:'red'}}>{error}</div>}
          {status === 'done' && <div style={{color:'green'}}>Project created and AI roadmap generated!</div>}
        </div>
      )}
    </div>
  )
}
