import Head from "next/head"
import { env } from "../../lib/env"

interface MetaTagsProps {
  title?: string
  description?: string
  keywords?: string[]
  ogImage?: string
  ogType?: "website" | "article" | "profile"
  twitterCard?: "summary" | "summary_large_image" | "app" | "player"
  canonicalUrl?: string
  noIndex?: boolean
}

export function MetaTags({
  title = "OTW - On The Way | Food Delivery & Local Rides",
  description = "OTW delivers food, groceries, and provides local rides with community-driven service. Fast, reliable, and powered by the people.",
  keywords = [
    "food delivery",
    "grocery delivery",
    "local rides",
    "OTW",
    "On The Way",
    "community service",
    "delivery app",
  ],
  ogImage = `${env.WEBSITE_URL}/menu-hero.jpg`,
  ogType = "website",
  twitterCard = "summary_large_image",
  canonicalUrl,
  noIndex = false,
}: MetaTagsProps) {
  const fullTitle = title.includes("OTW") ? title : `${title} | OTW - On The Way`
  const fullCanonicalUrl = canonicalUrl || env.WEBSITE_URL

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />

      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="OTW - On The Way" />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={fullCanonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:creator" content="@OTWdelivery" />

      {/* No Index if specified */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Additional Meta Tags */}
      <meta name="application-name" content="OTW" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="OTW" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content="#c22126" />
    </Head>
  )
}
