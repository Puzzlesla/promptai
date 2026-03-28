import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
// Import your initialized Firebase db
import { db } from '../firebase' 
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import '../styles/Shop.css'

export default function Shop({ userId }) { // Assuming you pass the current user's ID
  const navigate = useNavigate()
  
  // 1. New State for Shop Items and Loading
  const [shopItems, setShopItems] = useState([])
  const [loading, setLoading] = useState(true)

  // User state (Ideally, you fetch this from the 'users' collection in another useEffect)
  const [xpBalance, setXpBalance]       = useState(2000)
  const [ownedItems, setOwnedItems]     = useState(['theme_default', 'avatar_default'])
  const [equippedTheme, setEquipped]    = useState('theme_default')
  const [equippedAvatar, setEquippedAv] = useState('avatar_default')

  // 2. Fetch Shop Items from Firestore
  useEffect(() => {
    const fetchShopItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'shopItems'))
        const itemsArray = querySnapshot.docs.map(doc => ({
          id: doc.id, 
          ...doc.data()
        }))
        setShopItems(itemsArray)
      } catch (error) {
        console.error("Error fetching shop items:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchShopItems()
  }, [])

  // 3. Update backend when purchasing
  const handlePurchase = async (item) => {
    if (xpBalance < item.price) return

    const newXpBalance = xpBalance - item.price
    const newOwnedItems = [...ownedItems, item.id]

    // Optimistic UI update
    setXpBalance(newXpBalance)
    
    try {
      // Update the database (assuming you have a users collection)
      const userRef = doc(db, 'users', userId)
      
      if (!item.consumable) {
        setOwnedItems(newOwnedItems)
        await updateDoc(userRef, {
          xpBalance: newXpBalance,
          ownedItems: newOwnedItems
        })
        
        if (item.category === 'theme') setEquipped(item.id)
        if (item.category === 'avatar') setEquippedAv(item.id)
      } else {
        await updateDoc(userRef, { xpBalance: newXpBalance })
        alert(`You bought a ${item.name}!`)
      }
    } catch (error) {
      console.error("Purchase failed:", error)
      // Revert state if backend update fails
      setXpBalance(xpBalance) 
      setOwnedItems(ownedItems)
    }
  }

  const handleEquip = (item) => {
    if (item.category === 'theme')  setEquipped(item.id)
    if (item.category === 'avatar') setEquippedAv(item.id)
    // Don't forget to sync this to Firestore too!
  }

  if (loading) return <div className="shop__loading">Loading Reward Center...</div>

  return (
    <div className='shop'>
      <div className='shop__inner'>
        <button className='shop__back' onClick={() => navigate(-1)}>← Back</button>

        <div className='shop__header'>
          {/* Header content stays the same */}
        </div>

        <div className='shop__grid'>
          {shopItems.map((item) => {
            const isOwned    = ownedItems.includes(item.id)
            const isEquipped = equippedTheme === item.id || equippedAvatar === item.id
            const canAfford  = xpBalance >= item.price

            return (
              <div key={item.id} className={`shop__card ${isOwned ? 'shop__card--owned' : ''} ${isEquipped ? 'shop__card--equipped' : ''}`}>
                <div className={`shop__preview shop__preview--${item.category}`}>
                  {isEquipped && <div className='shop__equipped-badge'>Equipped</div>}
                  <div className='shop__category-badge'>{item.category}</div>
                  {item.category === 'theme' && <ThemePreview variant={item.variant} />}
                  {item.category === 'avatar' && (
                    <div className='shop__avatar-circle' style={{ background: item.avatarBg }}>
                      {item.emoji}
                    </div>
                  )}
                </div>
                <div className='shop__card-body'>
                  <div className='shop__card-action'>
                    {!isOwned ? (
                      <button
                        className='shop__btn'
                        onClick={() => handlePurchase(item)}
                        disabled={!canAfford}
                      >
                        {canAfford ? 'Purchase' : 'Not enough XP'}
                      </button>
                    ) : (
                      <button
                        className='shop__btn'
                        onClick={() => handleEquip(item)}
                        disabled={isEquipped}
                      >
                        {isEquipped ? 'Equipped' : 'Equip'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ThemePreview({ variant }) {
  return (
    <div className={`shop__mini-node shop__mini-node--${variant}`}>
      <div style={{
        width: 40, height: 6, borderRadius: 3,
        background: variant === 'cyber' ? '#00e5ff' : 'rgba(255,255,255,0.6)'
      }} />
    </div>
  )
}