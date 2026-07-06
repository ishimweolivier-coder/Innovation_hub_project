/** Diverse imagery — Black Rwandan / African entrepreneurs & professionals (Unsplash) */
export const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&q=80',
  authLogin: 'https://images.unsplash.com/photo-1573496358007-6fe62e3d9010?w=1200&q=80',
  authInvestor: 'https://images.unsplash.com/photo-1528901166007-3784c7dd3653?w=1200&q=80',
  startupAgriTech: 'https://images.unsplash.com/photo-1655720357872-ce227e4164ba?w=800&q=80',
  startupFinTech: 'https://images.unsplash.com/photo-1687422808565-929533931584?w=800&q=80',
  startupHealthTech: 'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=800&q=80',
  startupEdTech: 'https://images.unsplash.com/photo-1632215861513-130b66fe97f4?w=800&q=80',
  startupCreative: 'https://images.unsplash.com/photo-1573164573938-c9a3db2e84ff?w=800&q=80',
  oppGrant: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80',
  oppCompetition: 'https://images.unsplash.com/photo-1621905253185-95614217f357?w=800&q=80',
  oppScholarship: 'https://images.unsplash.com/photo-1666281269793-da06484657e8?w=800&q=80',
  oppIncubation: 'https://images.unsplash.com/photo-1687422808191-93810cd07ab0?w=800&q=80',
  eventWorkshop: 'https://images.unsplash.com/photo-1687422808278-d17b09489ed1?w=800&q=80',
  eventWeekend: 'https://images.unsplash.com/photo-1687422808248-f807f4ea2a2e?w=800&q=80',
  eventTraining: 'https://images.unsplash.com/photo-1573164713712-03790a178651?w=800&q=80',
}

export const CATEGORY_IMAGES = {
  AgriTech: IMAGES.startupAgriTech,
  FinTech: IMAGES.startupFinTech,
  HealthTech: IMAGES.startupHealthTech,
  EdTech: IMAGES.startupEdTech,
  CleanTech: IMAGES.startupAgriTech,
  'E-Commerce': IMAGES.startupCreative,
  SaaS: IMAGES.startupFinTech,
  'Social Impact': IMAGES.startupHealthTech,
  'Creative Industries': IMAGES.startupCreative,
  Other: IMAGES.hero,
}

export function categoryImage(category) {
  return CATEGORY_IMAGES[category] || IMAGES.hero
}
