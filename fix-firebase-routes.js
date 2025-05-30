const fs = require('fs');
const path = require('path');

// List of all API routes that need to be disabled
const routesToDisable = [
  'src/app/api/admin/menu/search/route.ts',
  'src/app/api/user-profile/route.ts', 
  'src/app/api/delivery/route.ts',
  'src/app/api/cron/sync-menu/route.ts',
  'src/app/api/fetch-menu/route.ts',
  'src/app/api/webhooks/stripe/route.ts',
  'src/app/api/create-checkout-session/route.ts',
  'src/app/api/admin/menu/[id]/route.ts',
  'src/app/api/admin/menu/route.ts'
];

routesToDisable.forEach(routePath => {
  const fullPath = path.join(__dirname, routePath);
  
  if (fs.existsSync(fullPath)) {
    console.log(`Disabling: ${routePath}`);
    
    // Create a simple disabled route
    const disabledContent = `import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    error: "This feature is currently being set up. Please check back soon!" 
  }, { status: 503 });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ 
    error: "This feature is currently being set up. Please check back soon!" 
  }, { status: 503 });
}

export async function PUT(req: NextRequest) {
  return NextResponse.json({ 
    error: "This feature is currently being set up. Please check back soon!" 
  }, { status: 503 });
}

export async function DELETE(req: NextRequest) {
  return NextResponse.json({ 
    error: "This feature is currently being set up. Please check back soon!" 
  }, { status: 503 });
}
`;
    
    fs.writeFileSync(fullPath, disabledContent);
    console.log(`Disabled: ${routePath}`);
  } else {
    console.log(`File not found: ${routePath}`);
  }
});

console.log('All problematic routes have been disabled.');