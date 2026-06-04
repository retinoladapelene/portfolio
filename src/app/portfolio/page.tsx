import { Metadata } from 'next'
import PortfolioPageClient from './PortfolioClient'
import StructuredData from '@/components/seo/StructuredData'

export const metadata: Metadata = {
  title: "Project Archive | Moonchaery Studio",
  description: "Browse the complete collection of high-fidelity character designs, digital portraits, and artistic projects by Moonchaery Studio.",
  openGraph: {
    title: "Moonchaery Artistic Archive",
    description: "A curated collection of digital masterpieces and character design case studies.",
    images: ['/portfolio-og.jpg'],
  }
}

export default function PortfolioPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Moonchaery Artistic Archive",
    "description": "A curated collection of digital masterpieces and character design case studies.",
    "url": "https://moonchaery-studio.vercel.app/portfolio",
    "mainEntity": {
      "@type": "CreativeWorkSeries",
      "name": "Digital Character Designs",
      "author": {
        "@type": "Person",
        "name": "Moonchaery"
      }
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://moonchaery-studio.vercel.app"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Portfolio",
        "item": "https://moonchaery-studio.vercel.app/portfolio"
      }
    ]
  };

  return (
    <>
      <StructuredData data={schema} />
      <StructuredData data={breadcrumbSchema} />
      <PortfolioPageClient />
    </>
  )
}
