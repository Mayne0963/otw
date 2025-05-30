const fs = require('fs');
const path = require('path');

// List of API routes that use Firebase
const firebaseRoutes = [
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

firebaseRoutes.forEach(routePath => {
  const fullPath = path.join(__dirname, routePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Comment out Firebase imports
    content = content.replace(
      /import\s*{[^}]*}\s*from\s*['"][^'"]*firebaseAdmin['"];?/g,
      match => `// ${match}`
    );
    
    // Add temporary response at the beginning of POST/GET functions
    content = content.replace(
      /(export\s+async\s+function\s+(POST|GET|PUT|DELETE)\s*\([^)]*\)\s*{\s*try\s*{)/g,
      '$1\n    // Temporarily disabled - Firebase setup required\n    return NextResponse.json({ error: "This feature is currently being set up. Please check back soon!" }, { status: 503 });\n    //'
    );
    
    fs.writeFileSync(fullPath, content);
    console.log(`Updated: ${routePath}`);
  } else {
    console.log(`File not found: ${routePath}`);
  }
});

console.log('All Firebase routes have been temporarily disabled.');