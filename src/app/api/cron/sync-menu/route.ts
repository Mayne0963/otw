import { NextRequest, NextResponse } from 'next/server'
import { fetchAndNormalizeMenus } from '../../../../lib/scrapeMenus'
import { firestore } from '../../../../lib/firebaseAdmin'
import { MenuItem } from '../../../../lib/firestoreModels'

const MENU_COLLECTION = 'menuItems'
const SNAPSHOT_COLLECTION = 'menuSnapshots'

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  // Simple secret check for CRON jobs
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
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

    return NextResponse.json({ success: true, count: menuItems.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error occurred' }, { status: 500 })
  }
}