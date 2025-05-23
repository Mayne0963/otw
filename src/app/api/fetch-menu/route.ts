import { NextResponse } from 'next/server'
import { fetchAndNormalizeMenus } from '../../../lib/scrapeMenus'
import { firestore } from '../../../lib/firebaseAdmin'
import { MenuItem } from '../../../lib/firestoreModels'

const MENU_COLLECTION = 'menuItems'
const SNAPSHOT_COLLECTION = 'menuSnapshots'

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    // Scrape and normalize
    const menuItems: MenuItem[] = await fetchAndNormalizeMenus()

    // Store in Firestore (overwrite all)
    const batch = firestore.batch()
    const menuRef = firestore.collection(MENU_COLLECTION)
    const snapshot = await menuRef.get()
    snapshot.docs.forEach(doc => batch.delete(doc.ref))
    menuItems.forEach(item => {
      const docRef = menuRef.doc()
      batch.set(docRef, item)
    })
    await batch.commit()

    // Store HTML snapshot for backup (optional)
    await firestore.collection(SNAPSHOT_COLLECTION).add({
      menuItems,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true, count: menuItems.length, menuItems })
  } catch (err: any) {
    // Fallback: return last known snapshot
    try {
      const snap = await firestore.collection(SNAPSHOT_COLLECTION)
        .orderBy('createdAt', 'desc').limit(1).get()
      
      if (!snap.empty && snap.docs.length > 0) {
        const doc = snap.docs[0]
        if (doc && doc.exists) {
          const data = doc.data() || {}
          
          // Safely check if data exists and has menuItems property
          const menuItems: MenuItem[] = data && 
            typeof data === 'object' && 
            'menuItems' in data && 
            Array.isArray(data.menuItems) ? 
              data.menuItems : [];
          
          return NextResponse.json({
            success: false,
            error: err?.message || 'Unknown error occurred',
            fallback: true,
            menuItems
          }, { status: 200 })
        }
      }
      
      // If we reach here, no valid snapshot was found
      console.error('Error fetching menu and no valid fallback found:', err)
      return NextResponse.json({ 
        success: false, 
        error: err?.message || 'Unknown error occurred',
        fallback: false
      }, { status: 500 })
    } catch (fallbackErr: any) {
      // Handle errors in the fallback mechanism itself
      console.error('Error in fallback mechanism:', fallbackErr)
      return NextResponse.json({ 
        success: false, 
        error: err?.message || 'Unknown error occurred',
        fallbackError: fallbackErr?.message || 'Error retrieving fallback data'
      }, { status: 500 })
    }
  }
}