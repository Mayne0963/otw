import { NextResponse } from 'next/server'
import { fetchAndNormalizeMenus } from '../../../lib/scrapeMenus'
import { firestore } from '../../../lib/firebaseAdmin'

const MENU_COLLECTION = 'menuItems'
const SNAPSHOT_COLLECTION = 'menuSnapshots'

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    // Scrape and normalize
    const menuItems = await fetchAndNormalizeMenus()

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
    const snap = await firestore.collection(SNAPSHOT_COLLECTION)
      .orderBy('createdAt', 'desc').limit(1).get()
    if (!snap.empty) {
      const data = snap.docs[0].data()
      return NextResponse.json({
        success: false,
        error: err.message,
        fallback: true,
        menuItems: data.menuItems,
      }, { status: 200 })
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}