import { useHead, useSeoMeta } from '@unhead/vue'

export interface SeoOptions {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  schema?: any
  noindex?: boolean
}

const DEFAULT_OPTIONS = {
  title: 'CQIS - Catering Quotations & Invoicing System',
  description: 'Professional catering quotation software. Create branded event quotations and invoices in minutes.',
  image: 'https://cqis.urbanloos.com/og-image.jpg',
  url: 'https://cqis.urbanloos.com',
  type: 'website' as const,
}

export function useSeo(options: SeoOptions = {}) {
  const title = options.title ? `${options.title} | CQIS` : DEFAULT_OPTIONS.title
  const description = options.description || DEFAULT_OPTIONS.description
  const image = options.image || DEFAULT_OPTIONS.image
  const url = options.url || DEFAULT_OPTIONS.url
  const type = options.type || DEFAULT_OPTIONS.type

  // Basic Meta
  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogUrl: url,
    ogType: type,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
  })

  // Robots & Canonical
  const headConfig: any = {
    link: [
      { rel: 'canonical', href: url }
    ],
    meta: []
  }

  if (options.noindex) {
    headConfig.meta.push({ name: 'robots', content: 'noindex, nofollow' })
  }

  // JSON-LD Schema
  if (options.schema) {
    headConfig.script = [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(options.schema)
      }
    ]
  }

  useHead(headConfig)
}
