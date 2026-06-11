import { useEffect } from 'react'

type PageMetaProps = {
  title: string
  description?: string
  image?: string
  canonicalPath?: string
  type?: 'website' | 'book'
  jsonLd?: Record<string, unknown>
}

const SITE_NAME = 'Pictoria'

function upsertMeta(name: string, content: string, property = false) {
  const attr = property ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.content = content
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

export default function PageMeta({
  title,
  description,
  image,
  canonicalPath,
  type = 'website',
  jsonLd,
}: PageMetaProps) {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
    document.title = fullTitle

    if (description) {
      upsertMeta('description', description)
      upsertMeta('og:description', description, true)
      upsertMeta('twitter:description', description)
    }

    upsertMeta('og:title', fullTitle, true)
    upsertMeta('twitter:title', fullTitle)
    upsertMeta('og:type', type === 'book' ? 'book' : 'website', true)
    upsertMeta('og:site_name', SITE_NAME, true)

    if (image) {
      upsertMeta('og:image', image, true)
      upsertMeta('twitter:card', 'summary_large_image')
      upsertMeta('twitter:image', image)
    } else {
      upsertMeta('twitter:card', 'summary')
    }

    const origin = window.location.origin
    const canonical = canonicalPath ? `${origin}${canonicalPath}` : `${origin}${window.location.pathname}`
    upsertLink('canonical', canonical)
    upsertMeta('og:url', canonical, true)

    const jsonLdId = 'pictoria-page-jsonld'
    const existing = document.getElementById(jsonLdId)
    if (existing) existing.remove()

    if (jsonLd) {
      const script = document.createElement('script')
      script.id = jsonLdId
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }

    return () => {
      document.getElementById(jsonLdId)?.remove()
    }
  }, [title, description, image, canonicalPath, type, jsonLd])

  return null
}
