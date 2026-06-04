import { Metadata } from 'next'
import HomeClient from './HomeClient'
import StructuredData from '@/components/seo/StructuredData'

export const metadata: Metadata = {
  title: "Moonchaery Studio | High-Fidelity Character Design & Digital Art",
  description: "Bespoke digital masterpieces where high-fidelity character design meets ethereal artistic vision. Request your custom commission today.",
  openGraph: {
    title: "Moonchaery Studio | Digital Artist Portfolio",
    description: "Creating ethereal digital art and high-fidelity character designs.",
    images: ['/og-image.jpg'],
  }
}

export default function Home() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ArtGallery",
    "name": "Moonchaery Studio",
    "description": "High-fidelity digital art and character design studio by Moonchaery.",
    "url": "https://moonchaery-studio.vercel.app",
    "image": "https://moonchaery-studio.vercel.app/og-image.jpg",
    "author": {
      "@type": "Person",
      "name": "Moonchaery"
    },
    "genre": "Digital Art, Character Design, 3D Exhibition",
    "sameAs": [
      "https://www.instagram.com/moonchaery",
      "https://twitter.com/moonchaery",
      "https://www.artstation.com/moonchaery"
    ],
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Moonchaery Studio?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Moonchaery Studio is a high-fidelity digital art and character design studio that combines ethereal aesthetics with immersive 3D technology."
        }
      },
      {
        "@type": "Question",
        "name": "How do I request a digital art commission?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can request a commission directly through our integrated Order Form on the homepage."
        }
      }
    ]
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
      }
    ]
  };

  return (
    <>
      <StructuredData data={schema} />
      <StructuredData data={breadcrumbSchema} />
      <HomeClient />
    </>
  )
}
