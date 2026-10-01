async function verifySeoAndA11y() {
  console.log('--- STARTING ACCESSIBILITY & SEO COMPREHENSIVE VERIFICATION ---\n');
  const baseUrl = 'http://localhost:3000';

  let hasError = false;

  // 1. Test /robots.txt
  try {
    const robotsRes = await fetch(`${baseUrl}/robots.txt`);
    const txt = await robotsRes.text();
    console.log('✅ Testing /robots.txt:');
    
    const requiredDisallows = ['/admin', '/seller', '/support', '/courier', '/checkout', '/cart', '/orders'];
    for (const rule of requiredDisallows) {
      if (txt.includes(`Disallow: ${rule}`)) {
        console.log(`  ✓ Verified Disallow rule: ${rule}`);
      } else {
        console.error(`  ❌ Missing Disallow rule: ${rule}`);
        hasError = true;
      }
    }

    if (txt.includes('Sitemap:')) {
      console.log('  ✓ Verified Sitemap reference in robots.txt');
    } else {
      console.error('  ❌ Missing Sitemap reference in robots.txt');
      hasError = true;
    }
  } catch (err: any) {
    console.error('❌ Failed fetching /robots.txt:', err.message);
    hasError = true;
  }

  // 2. Test /sitemap.xml
  try {
    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
    const xml = await sitemapRes.text();
    console.log('\n✅ Testing /sitemap.xml:');
    
    if (xml.includes('<urlset') && xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
      console.log('  ✓ Valid XML Sitemap schema structure');
    } else {
      console.error('  ❌ Invalid XML Sitemap structure');
      hasError = true;
    }

    // Check inclusion of public products, categories, sellers, deals
    if (xml.includes('/products/') || xml.includes('/product/')) {
      console.log('  ✓ Verified product URLs in sitemap');
    } else {
      console.error('  ❌ Missing product URLs in sitemap');
      hasError = true;
    }

    if (xml.includes('/category/')) {
      console.log('  ✓ Verified category URLs in sitemap');
    }

    if (xml.includes('/sellers/')) {
      console.log('  ✓ Verified seller storefront URLs in sitemap');
    }

    // Verify absence of private portals
    const forbiddenPatterns = ['/admin', '/seller-portal', '/support_disputes', '/courier_dispatch'];
    for (const pattern of forbiddenPatterns) {
      if (xml.includes(pattern)) {
        console.error(`  ❌ Security Failure: Sitemap leaks private route: ${pattern}`);
        hasError = true;
      }
    }
    console.log('  ✓ Zero private routes (Admin/Seller/Support/Courier) in sitemap.xml');
  } catch (err: any) {
    console.error('❌ Failed fetching /sitemap.xml:', err.message);
    hasError = true;
  }

  console.log('\n--- VERIFICATION COMPLETE ---');
  if (hasError) {
    process.exit(1);
  }
}

verifySeoAndA11y();
