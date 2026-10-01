import React, { useEffect } from 'react';
import { Product, Seller } from '../../types';

export interface SEOBreadcrumb {
  name: string;
  url: string;
}

export interface SEOManagerProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'product' | 'profile';
  ogImage?: string;
  ogImageAlt?: string;
  keywords?: string[];
  noIndex?: boolean;
  syncBrowserUrl?: boolean;

  // Structured Data triggers
  productData?: Product & { seller?: Seller };
  sellerData?: Seller;
  breadcrumbs?: SEOBreadcrumb[];
}

const DEFAULT_ORIGIN = 'https://souqdesoq.com';
const BRAND_AR = 'سوق دسوق';
const BRAND_EN = 'Souq Desoq';
const DEFAULT_TITLE = 'Souq Desoq | سوق دسوق للأزياء والعطور والإكسسوارات';
const DEFAULT_DESC = 'سوق دسوق - المنصة الإلكترونية الرسمية للأزياء الراقية، العطور والمسك الأصلي، المجوهرات والإكسسوارات الفاخرة، والأحذية الإيطالية في مصر.';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1200';

/**
 * Normalizes relative URLs into absolute URLs for crawler compatibility (Googlebot, Bing, OpenGraph, Twitter).
 */
const toAbsoluteUrl = (url?: string): string => {
  if (!url) return DEFAULT_ORIGIN;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return `https:${url}`;

  let origin = DEFAULT_ORIGIN;
  try {
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      origin = window.location.origin;
    }
  } catch {}

  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${origin}${cleanPath}`;
};

/**
 * Formats page titles avoiding repetitive duplication of "| سوق دسوق".
 */
const formatTitle = (rawTitle?: string): string => {
  if (!rawTitle || !rawTitle.trim()) return DEFAULT_TITLE;
  const clean = rawTitle.trim();
  if (clean.includes(BRAND_AR) || clean.includes(BRAND_EN)) {
    return clean;
  }
  return `${clean} | ${BRAND_AR}`;
};

export const SEOManager: React.FC<SEOManagerProps> = ({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  ogImage,
  ogImageAlt,
  keywords,
  noIndex = false,
  syncBrowserUrl = false,
  productData,
  sellerData,
  breadcrumbs,
}) => {
  useEffect(() => {
    try {
      // 1. Title formatting
      const finalTitle = formatTitle(title);
      document.title = finalTitle;

      // 2. Canonical URL & Image resolution
      const rawCurrentUrl = typeof window !== 'undefined' && window.location ? window.location.href : DEFAULT_ORIGIN;
      const finalCanonical = canonicalUrl ? toAbsoluteUrl(canonicalUrl) : rawCurrentUrl;
      const finalImage = toAbsoluteUrl(ogImage || (productData?.images?.[0]) || (sellerData?.logo || sellerData?.banner) || DEFAULT_IMAGE);
      const finalImageAlt = ogImageAlt || (productData ? productData.titleAr : sellerData ? sellerData.name : 'سوق دسوق للتجارة الإلكترونية');
      const finalDesc = description || DEFAULT_DESC;

      // 3. Optional client-side URL synchronization for SPA crawlers & browsers
      if (syncBrowserUrl && typeof window !== 'undefined' && window.history && canonicalUrl) {
        try {
          const currentUrlObj = new URL(window.location.href);
          const targetUrlObj = new URL(finalCanonical);
          if (currentUrlObj.pathname !== targetUrlObj.pathname || currentUrlObj.search !== targetUrlObj.search) {
            window.history.replaceState({}, '', targetUrlObj.pathname + targetUrlObj.search);
          }
        } catch {
          // Ignore invalid URL parsing during synthetic tests
        }
      }

      // 4. Build Declarative Meta Map
      // Name-based meta tags
      const nameTags: Record<string, string | null> = {
        'description': finalDesc,
        'robots': noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        'googlebot': noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        'keywords': keywords?.length 
          ? keywords.join(', ')
          : 'سوق دسوق, أزياء دسوق, فساتين سواريه, عطور وبخور, مسك الختام, مجوهرات فضة, أحذية جلدية, عبايات خليجي, تسوق أونلاين مصر',
        // Twitter Card Meta
        'twitter:card': 'summary_large_image',
        'twitter:title': finalTitle,
        'twitter:description': finalDesc,
        'twitter:image': finalImage,
        'twitter:image:alt': finalImageAlt,
        'twitter:site': '@souqdesoq',
        'twitter:creator': '@souqdesoq',
      };

      // Property-based Open Graph meta tags
      const propertyTags: Record<string, string | null> = {
        'og:title': finalTitle,
        'og:description': finalDesc,
        'og:type': ogType,
        'og:url': finalCanonical,
        'og:image': finalImage,
        'og:image:secure_url': finalImage,
        'og:image:alt': finalImageAlt,
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:site_name': 'سوق دسوق - Souq Desoq',
        'og:locale': 'ar_EG',
        'og:locale:alternate': 'en_US',

        // Dynamic Product Open Graph tags (Facebook/Pinterest/WhatsApp product rich card)
        'product:price:amount': productData ? productData.priceEGP.toString() : null,
        'product:price:currency': productData ? 'EGP' : null,
        'product:availability': productData ? (productData.stock > 0 ? 'in stock' : 'out of stock') : null,
        'product:condition': productData ? 'new' : null,
        'product:retailer_item_id': productData ? productData.id : null,
        'product:brand': productData ? (productData.attributes?.brand || productData.seller?.name || BRAND_AR) : null,
        'product:category': productData ? productData.category : null,

        // Dynamic Profile Open Graph tags (Seller profile rich card)
        'profile:username': sellerData ? (sellerData.slug || sellerData.id) : null,
      };

      // 5. Update or Inject Canonical Link Tag
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        canonicalLink.setAttribute('data-seo-dynamic', 'true');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', finalCanonical);

      // 6. Reconcile Name-Based Meta Tags
      Object.entries(nameTags).forEach(([name, content]) => {
        let tag = document.querySelector(`meta[name="${name}"]`);
        if (content !== null && content !== undefined) {
          if (!tag) {
            tag = document.createElement('meta');
            tag.setAttribute('name', name);
            tag.setAttribute('data-seo-dynamic', 'true');
            document.head.appendChild(tag);
          }
          tag.setAttribute('content', content);
        } else if (tag && tag.getAttribute('data-seo-dynamic') === 'true') {
          tag.remove();
        }
      });

      // 7. Reconcile Property-Based Meta Tags (Open Graph & Open Graph Product)
      Object.entries(propertyTags).forEach(([prop, content]) => {
        let tag = document.querySelector(`meta[property="${prop}"]`);
        if (content !== null && content !== undefined) {
          if (!tag) {
            tag = document.createElement('meta');
            tag.setAttribute('property', prop);
            tag.setAttribute('data-seo-dynamic', 'true');
            document.head.appendChild(tag);
          }
          tag.setAttribute('content', content);
        } else if (tag && tag.getAttribute('data-seo-dynamic') === 'true') {
          // Remove obsolete product or profile tags when returning to general catalog
          tag.remove();
        }
      });

      // 8. Reconcile Structured Data (JSON-LD Schemas)
      const existingScripts = document.querySelectorAll('script[type="application/ld+json"].dynamic-seo-schema');
      existingScripts.forEach(el => el.remove());

      const schemas: any[] = [];

      // A. Organization Schema
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${DEFAULT_ORIGIN}/#organization`,
        'name': BRAND_AR,
        'alternateName': BRAND_EN,
        'url': DEFAULT_ORIGIN,
        'logo': toAbsoluteUrl('/favicon.ico'),
        'sameAs': [
          'https://facebook.com/souqdesoq',
          'https://instagram.com/souqdesoq',
          'https://twitter.com/souqdesoq'
        ],
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'الميدان الإبراهيمي، وسط البلد',
          'addressLocality': 'دسوق',
          'addressRegion': 'كفر الشيخ',
          'postalCode': '33611',
          'addressCountry': 'EG'
        },
        'contactPoint': {
          '@type': 'ContactPoint',
          'telephone': '+20-47-2510000',
          'contactType': 'customer service',
          'areaServed': 'EG',
          'availableLanguage': ['Arabic', 'English']
        }
      });

      // B. WebSite Schema with SearchAction
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${DEFAULT_ORIGIN}/#website`,
        'name': BRAND_AR,
        'url': DEFAULT_ORIGIN,
        'inLanguage': 'ar-EG',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${DEFAULT_ORIGIN}/?q={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        }
      });

      // C. BreadcrumbList Schema (if breadcrumbs provided)
      if (breadcrumbs && breadcrumbs.length > 0) {
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': breadcrumbs.map((crumb, idx) => ({
            '@type': 'ListItem',
            'position': idx + 1,
            'name': crumb.name,
            'item': toAbsoluteUrl(crumb.url)
          }))
        });
      }

      // D. Product Schema with Offer & Merchant Policy (Compliant with Google Search Rich Results)
      if (productData) {
        const productImages = (productData.images && productData.images.length > 0)
          ? productData.images.map(img => toAbsoluteUrl(img))
          : [finalImage];

        const productSchema: any = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          '@id': `${finalCanonical}#product`,
          'name': productData.titleAr,
          'alternateName': productData.titleEn || undefined,
          'image': productImages,
          'description': productData.descriptionAr,
          'sku': productData.id,
          'mpn': productData.id,
          'category': productData.category,
          'brand': {
            '@type': 'Brand',
            'name': productData.attributes?.brand || productData.seller?.name || 'صناعة محلية بدسوق'
          },
          'offers': {
            '@type': 'Offer',
            'url': finalCanonical,
            'priceCurrency': 'EGP',
            'price': productData.priceEGP,
            'priceValidUntil': '2027-12-31',
            'itemCondition': 'https://schema.org/NewCondition',
            'availability': productData.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            'seller': {
              '@type': 'Organization',
              'name': productData.seller?.name || 'تاجر سوق دسوق المعتمد',
              'url': productData.seller ? toAbsoluteUrl(`/sellers/${productData.seller.id}`) : DEFAULT_ORIGIN
            },
            'hasMerchantReturnPolicy': {
              '@type': 'MerchantReturnPolicy',
              'applicableCountry': 'EG',
              'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
              'merchantReturnDays': 14,
              'returnMethod': 'https://schema.org/ReturnByMail',
              'returnFees': 'https://schema.org/FreeReturn'
            },
            'shippingDetails': {
              '@type': 'OfferShippingDetails',
              'shippingRate': {
                '@type': 'MonetaryAmount',
                'value': 25,
                'currency': 'EGP'
              },
              'shippingDestination': {
                '@type': 'DefinedRegion',
                'addressCountry': 'EG'
              },
              'deliveryTime': {
                '@type': 'ShippingDeliveryTime',
                'handlingTime': {
                  '@type': 'QuantitativeValue',
                  'minValue': 0,
                  'maxValue': 1,
                  'unitCode': 'd'
                },
                'transitTime': {
                  '@type': 'QuantitativeValue',
                  'minValue': 1,
                  'maxValue': 3,
                  'unitCode': 'd'
                }
              }
            }
          }
        };

        if (productData.rating > 0) {
          productSchema.aggregateRating = {
            '@type': 'AggregateRating',
            'ratingValue': productData.rating,
            'reviewCount': productData.reviewCount || 1,
            'bestRating': '5',
            'worstRating': '1'
          };
        }

        schemas.push(productSchema);
      }

      // E. Store / LocalBusiness Schema for Seller Profile
      if (sellerData) {
        const sellerLogo = toAbsoluteUrl(sellerData.logo || sellerData.banner || DEFAULT_IMAGE);
        schemas.push({
          '@context': 'https://schema.org',
          '@type': ['Store', 'LocalBusiness'],
          '@id': `${toAbsoluteUrl(`/sellers/${sellerData.id}`)}#store`,
          'name': sellerData.name,
          'alternateName': sellerData.arabicName,
          'image': sellerLogo,
          'telephone': sellerData.phone,
          'priceRange': '$$',
          'currenciesAccepted': 'EGP',
          'paymentAccepted': 'Cash on Delivery, Desoq Pay, InstaPay, Vodafone Cash',
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': sellerData.address,
            'addressLocality': sellerData.city,
            'addressRegion': sellerData.desoqDistrict || 'كفر الشيخ',
            'postalCode': '33611',
            'addressCountry': 'EG'
          },
          'geo': {
            '@type': 'GeoCoordinates',
            'latitude': 31.1308,
            'longitude': 30.6478
          },
          ...(sellerData.rating > 0 ? {
            'aggregateRating': {
              '@type': 'AggregateRating',
              'ratingValue': sellerData.rating,
              'reviewCount': sellerData.reviewCount || 1,
              'bestRating': '5',
              'worstRating': '1'
            }
          } : {})
        });
      }

      // Inject JSON-LD Schema Tags
      schemas.forEach(schemaObj => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.className = 'dynamic-seo-schema';
        script.textContent = JSON.stringify(schemaObj);
        document.head.appendChild(script);
      });

      // 9. Signal Crawler & Automation Readiness on DOM root
      document.documentElement.setAttribute('data-seo-ready', 'true');
      document.documentElement.setAttribute('data-seo-type', ogType);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('seo:updated', {
            detail: {
              title: finalTitle,
              canonicalUrl: finalCanonical,
              ogType,
              hasProductData: Boolean(productData),
              hasSellerData: Boolean(sellerData),
            },
          })
        );
      }
    } catch (err) {
      console.warn('[SEOManager] Error optimizing SEO meta tags:', err);
    }

    return () => {
      try {
        const jsonLdElements = document.querySelectorAll('script[type="application/ld+json"].dynamic-seo-schema');
        jsonLdElements.forEach(el => el.remove());
      } catch {}
    };
  }, [
    title,
    description,
    canonicalUrl,
    ogType,
    ogImage,
    ogImageAlt,
    keywords,
    noIndex,
    syncBrowserUrl,
    productData,
    sellerData,
    breadcrumbs,
  ]);

  return null;
};
