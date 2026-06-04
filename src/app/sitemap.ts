import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://moonchaery.com'
  
  // Base routes
  const routes = [
    '',
    '/gallery',
    '/personal',
    '/portfolio',
    '/track',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  try {
    const supabase = await createClient()
    const { data: projects } = await supabase
      .from('projects')
      .select('id')

    const projectRoutes = (projects || []).map((project) => ({
      url: `${baseUrl}/portfolio/${project.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

    return [...routes, ...projectRoutes]
  } catch (e) {
    return routes
  }
}
