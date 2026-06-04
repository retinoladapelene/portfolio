import { Metadata } from 'next'
import GalleryClient from './GalleryClient'
import StructuredData from '@/components/seo/StructuredData'

export const metadata: Metadata = {
  title: "3D Art Gallery | Moonchaery Studio",
  description: "Explore a fully immersive 3D circular gallery featuring high-fidelity digital artworks and character designs by Moonchaery.",
  openGraph: {
    title: "Moonchaery 3D Virtual Gallery",
    description: "Step into an immersive artistic experience. Explore artworks in a curated 3D environment.",
    images: ['/gallery-preview.jpg'],
  }
}

export default function GalleryPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "VisualArtsEvent",
    "name": "Moonchaery 3D Virtual Gallery",
    "description": "An immersive 3D artistic experience showcasing digital artworks.",
    "startDate": new Date().toISOString(),
    "location": {
      "@type": "VirtualLocation",
      "url": "https://moonchaery-studio.vercel.app/gallery"
    },
    "organizer": {
      "@type": "Person",
      "name": "Moonchaery"
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
        "name": "Gallery",
        "item": "https://moonchaery-studio.vercel.app/gallery"
      }
    ]
  };

  return (
    <>
      <StructuredData data={schema} />
      <StructuredData data={breadcrumbSchema} />
      <GalleryClient />
    </>
  )
}
