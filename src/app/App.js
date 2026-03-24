import { useEffect } from 'react'
import { Auth } from '../components/auth'
import { db } from '../firebase'
import { getDocs, collection} from 'firebase/firestore';
function App() {
  //const [shopItems, setShopItems] = useState([]);

  const shopItemsCollectionRef = collection(db, 'shopItems')

  useEffect(() => {
    const getShopItems = async () => {
    try {
      const data = await getDocs(shopItemsCollectionRef)
      console.log(data)
    } catch (error) {
      console.error('Error fetching shop items:', error)
    }
    };
    getShopItems()
  }, [shopItemsCollectionRef]);
  return <div className='App'><Auth /></div>
}

export default App
