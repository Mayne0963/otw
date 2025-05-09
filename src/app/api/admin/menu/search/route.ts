import { NextRequest, NextResponse } from 'next/server'
import { auth, firestore } from '../../../../../lib/firebaseAdmin'
import { handleAPIError, apiErrors } from '../../../../../lib/utils/apiErrors'
import { z } from 'zod'

// Search query validation schema
const searchParamsSchema = z.object({
  q: z.string().optional(),
  type: z.enum(['classic', 'infused']).optional(),
  source: z.enum(['broskis', 'partner']).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  limit: z.number().min(1).max(100).default(50),
  page: z.number().min(1).default(1)
})

async function isAdmin(userId: string) {
  const userSnap = await firestore.collection('users').doc(userId).get()
  return userSnap.exists && userSnap.data().role === 'admin'
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw apiErrors.unauthorized()
    }

    const idToken = authHeader.split(' ')[1]
    const decoded = await auth.verifyIdToken(idToken)
    const userId = decoded.uid

    if (!(await isAdmin(userId))) {
      throw apiErrors.forbidden('Only admins can search menu items')
    }

    // Parse and validate query parameters
    const url = new URL(req.url)
    const rawParams = {
      q: url.searchParams.get('q'),
      type: url.searchParams.get('type'),
      source: url.searchParams.get('source'),
      minPrice: url.searchParams.get('minPrice') ? parseFloat(url.searchParams.get('minPrice')!) : undefined,
      maxPrice: url.searchParams.get('maxPrice') ? parseFloat(url.searchParams.get('maxPrice')!) : undefined,
      limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined,
      page: url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : undefined
    }

    const params = searchParamsSchema.parse(rawParams)
    
    if (params.minPrice !== undefined && params.maxPrice !== undefined && params.minPrice > params.maxPrice) {
      throw apiErrors.badRequest('minPrice cannot be greater than maxPrice')
    }

    // Build base query
    let baseQuery = firestore.collection('menuItems')
    if (params.type) baseQuery = baseQuery.where('type', '==', params.type)
    if (params.source) baseQuery = baseQuery.where('source', '==', params.source)
    
    // Execute query
    const snapshot = await baseQuery.get()
    
    // Filter results in memory for text search and price range
    let results = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item => {
        const matchesSearch = !params.q || 
          item.name.toLowerCase().includes(params.q.toLowerCase()) || 
          item.description?.toLowerCase().includes(params.q.toLowerCase())
        const matchesPrice = 
          (params.minPrice === undefined || item.price >= params.minPrice) &&
          (params.maxPrice === undefined || item.price <= params.maxPrice)
        return matchesSearch && matchesPrice
      })

    // Sort results by relevance if there's a search query
    if (params.q) {
      const query = params.q.toLowerCase()
      results.sort((a, b) => {
        const aNameMatch = a.name.toLowerCase().includes(query)
        const bNameMatch = b.name.toLowerCase().includes(query)
        if (aNameMatch && !bNameMatch) return -1
        if (!aNameMatch && bNameMatch) return 1
        return 0
      })
    }

    // Apply pagination
    const total = results.length
    const startIndex = (params.page - 1) * params.limit
    const endIndex = startIndex + params.limit
    const paginatedResults = results.slice(startIndex, endIndex)

    return NextResponse.json({
      items: paginatedResults,
      pagination: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit)
      },
      filters: {
        query: params.q,
        type: params.type,
        source: params.source,
        priceRange: {
          min: params.minPrice,
          max: params.maxPrice
        }
      }
    })
  } catch (err) {
    return handleAPIError(err)
  }
} 