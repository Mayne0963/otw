import { NextRequest, NextResponse } from 'next/server';
import { BestBuyService } from '@/lib/services/external-apis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'products') {
      const params: any = {};
      const q = searchParams.get('q');
      const categoryId = searchParams.get('categoryId');
      const format = searchParams.get('format') as 'json' | 'xml';
      const show = searchParams.get('show');
      const sort = searchParams.get('sort');
      const facet = searchParams.get('facet');
      const cursorMark = searchParams.get('cursorMark');
      const pageSize = searchParams.get('pageSize');
      const page = searchParams.get('page');

      if (q) {params.q = q;}
      if (categoryId) {params.categoryId = categoryId;}
      if (format) {params.format = format;}
      if (show) {params.show = show;}
      if (sort) {params.sort = sort;}
      if (facet) {params.facet = facet;}
      if (cursorMark) {params.cursorMark = cursorMark;}
      if (pageSize) {params.pageSize = parseInt(pageSize);}
      if (page) {params.page = parseInt(page);}

      const result = await BestBuyService.searchProducts(params);
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'product') {
      const sku = searchParams.get('sku');
      if (!sku) {
        return NextResponse.json(
          { success: false, error: 'SKU is required' },
          { status: 400 },
        );
      }

      const product = await BestBuyService.getProductDetails(parseInt(sku));
      return NextResponse.json({ success: true, data: product });
    }

    if (action === 'stores') {
      const params = {
        area: searchParams.get('area') || undefined,
        storeId: searchParams.get('storeId') ? parseInt(searchParams.get('storeId')!) : undefined,
        storeType: searchParams.get('storeType') || undefined,
        format: searchParams.get('format') as 'json' | 'xml' || undefined,
        show: searchParams.get('show') || undefined,
        sort: searchParams.get('sort') || undefined,
        page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
        pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : undefined,
      };

      const result = await BestBuyService.getStores(params);
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'availability') {
      const sku = searchParams.get('sku');
      const storeId = searchParams.get('storeId');

      if (!sku || !storeId) {
        return NextResponse.json(
          { success: false, error: 'Both SKU and Store ID are required' },
          { status: 400 },
        );
      }

      const availability = await BestBuyService.checkProductAvailability(
        parseInt(sku),
        parseInt(storeId),
      );
      return NextResponse.json({ success: true, data: availability });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use "products", "product", "stores", or "availability"' },
      { status: 400 },
    );
  } catch (error) {
    console.error('Best Buy API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}