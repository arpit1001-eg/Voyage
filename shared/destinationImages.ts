const destinationPhotos: Record<string, string> = {
  'kyoto-japan': 'photo-1493976040374-85c8e12f0c0e',
  'lofoten-norway': 'photo-1531366936337-7c912a4589a7',
  'rajasthan-india': 'photo-1599661046827-dacff0c0f09a',
  'patagonia-chile-argentina': 'photo-1464822759023-fed622ff2c3b',
  'amalfi-coast-italy': 'photo-1516483638261-f4dbaf036963',
  'bali-indonesia': 'photo-1537996194471-e657df975ab4',
  'iceland': 'photo-1476610182048-b716b8518aae',
  'meghalaya-india': 'photo-1544735716-392fe2489ffa',
  'vietnam': 'photo-1528127269322-539801943592',
  'morocco': 'photo-1539020140153-e479b8c22e70',
  'swiss-alps': 'photo-1501785888041-af3ef285b470',
  'ladakh-india': 'photo-1518005020951-eccb494ad742',
}

export const fallbackDestinationImage = (slug: string) => {
  const photo = destinationPhotos[slug]
  return photo ? `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1400&q=85` : ''
}
