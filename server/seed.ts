import type { Destination, Post } from '../shared/types'

/**
 * First-run content: PLACEHOLDER destinations and posts. Replace them from /admin.
 * No prices are seeded on purpose; add your own in the admin.
 */
export const seedDestinations = (): Destination[] => [
  {
    id: 'destination-kyoto-japan', slug: 'kyoto-japan', name: 'Kyoto', country: 'Japan', region: 'East Asia',
    summary: 'Temples at dawn, tea houses and slow evenings in Japan’s old capital.',
    duration: '9 nights', bestSeason: 'Mar–May, Oct–Nov', priceFrom: '',
    highlights: ['Early-morning temple visits before the crowds', 'A private tea ceremony', 'Day trips to Nara and the countryside', 'Evenings in the Gion district'],
    itinerary: [
      { title: 'Arrive in Kyoto', text: 'Meet your guide, settle in and take a short orientation walk through the neighbourhood.' },
      { title: 'Temples and gardens', text: 'Start early at the major temples, then spend the afternoon in quieter gardens.' },
      { title: 'Tea and craft', text: 'A tea ceremony in the morning and a workshop with a local craftsperson in the afternoon.' },
      { title: 'Day trip to Nara', text: 'A relaxed day among the shrines and parks, returning for dinner in town.' },
    ],
    body: [
      'Kyoto rewards slowness. We build the days around early starts, long lunches and evenings with nothing scheduled.',
      'This is a sample itinerary: every journey is adjusted to your dates, pace and interests.',
    ],
    cover: '', wide: '', gallery: [], coordinates: { latitude: 35.0116, longitude: 135.7681 }, tone: { from: '#efe9e6', to: '#d6c7c0' }, published: true, order: 1,
  },
  {
    id: 'destination-lofoten-norway', slug: 'lofoten-norway', name: 'Lofoten', country: 'Norway', region: 'Northern Europe',
    summary: 'Fishing villages under mountains, with northern lights in winter and midnight sun in summer.',
    duration: '7 nights', bestSeason: 'Feb–Mar for aurora, Jun–Aug for midnight sun', priceFrom: '',
    highlights: ['Coastal drives between fishing villages', 'Guided hikes with sea views', 'Aurora viewing in winter', 'Stays in restored fishermen’s cabins'],
    itinerary: [
      { title: 'Arrive and settle', text: 'Pick up your car and drive to your first cabin on the coast.' },
      { title: 'Villages and viewpoints', text: 'A slow drive along the coast with stops at villages and beaches.' },
      { title: 'A guided hike', text: 'A full day on the trails with a local guide, ending with a hot meal.' },
      { title: 'Sea day', text: 'Time on the water, by boat or kayak depending on the season and conditions.' },
    ],
    body: [
      'Lofoten is about landscape and quiet. We keep the schedule loose so weather can decide the best day for each activity.',
      'This is a sample itinerary: every journey is adjusted to your dates, pace and interests.',
    ],
    cover: '', wide: '', gallery: [], coordinates: { latitude: 68.2085, longitude: 13.6077 }, tone: { from: '#e8ecee', to: '#bcc8cf' }, published: true, order: 2,
  },
  {
    id: 'destination-rajasthan-india', slug: 'rajasthan-india', name: 'Rajasthan', country: 'India', region: 'South Asia',
    summary: 'Forts, palaces and desert camps, travelled at a pace that leaves room to wander.',
    duration: '10 nights', bestSeason: 'Oct–Mar', priceFrom: '',
    highlights: ['Fort and palace visits with local historians', 'A night in a desert camp', 'Market walks and food experiences', 'Stays in restored havelis'],
    itinerary: [
      { title: 'Arrive in the Pink City', text: 'Check in and take an evening walk through the old city bazaars.' },
      { title: 'Forts and palaces', text: 'A full day at the major forts and palaces, timed to avoid the busiest hours.' },
      { title: 'Into the desert', text: 'Travel west and spend the night in a desert camp under the stars.' },
      { title: 'Lakes and old towns', text: 'Move on to the lake cities with time to explore on foot.' },
    ],
    body: [
      'Rajasthan can be rushed or savoured. We pick fewer places and spend longer in each, with guides who know the stories.',
      'This is a sample itinerary: every journey is adjusted to your dates, pace and interests.',
    ],
    cover: '', wide: '', gallery: [], coordinates: { latitude: 26.9124, longitude: 75.7873 }, tone: { from: '#f1e7e1', to: '#d9b9a8' }, published: true, order: 3,
  },
  {
    id: 'destination-patagonia-chile-argentina', slug: 'patagonia-chile-argentina', name: 'Patagonia', country: 'Chile and Argentina', region: 'South America',
    summary: 'Glaciers, granite towers and wide empty horizons at the bottom of the world.',
    duration: '12 nights', bestSeason: 'Nov–Mar', priceFrom: '',
    highlights: ['Day hikes in Torres del Paine and around El Chaltén', 'A glacier boat trip', 'Stays in remote lodges', 'Time for wildlife watching'],
    itinerary: [
      { title: 'Arrive in the south', text: 'Fly in, transfer to your first lodge and get a briefing on the days ahead.' },
      { title: 'Granite towers', text: 'A full day on the trail with a guide, with a shorter option for a slower pace.' },
      { title: 'Glacier day', text: 'Travel by boat to the glacier front and walk the nearby shore.' },
      { title: 'Across the border', text: 'Cross into Argentina and settle into the next base.' },
    ],
    body: [
      'Patagonia is big, and distances are real. We plan the transport carefully so that your time goes to the landscape, not the road.',
      'This is a sample itinerary: every journey is adjusted to your dates, pace and interests.',
    ],
    cover: '', wide: '', gallery: [], coordinates: { latitude: -50.9423, longitude: -73.4068 }, tone: { from: '#e7ecef', to: '#b9c5cc' }, published: true, order: 4,
  },
  {
    id: 'destination-amalfi-coast-italy', slug: 'amalfi-coast-italy', name: 'Amalfi Coast', country: 'Italy', region: 'Southern Europe',
    summary: 'Cliffside villages, lemon terraces and long lunches above the sea.',
    duration: '6 nights', bestSeason: 'May–Jun, Sep', priceFrom: '',
    highlights: ['Coastal walks on the old footpaths', 'A boat day along the coast', 'Cooking with a local family', 'Stays in small hillside hotels'],
    itinerary: [
      { title: 'Arrive on the coast', text: 'Private transfer to your hotel, with the afternoon free to explore.' },
      { title: 'Walk the Path of the Gods', text: 'A guided walk above the sea, finishing with lunch in a village.' },
      { title: 'Boat day', text: 'Spend the day on the water, swimming and stopping at small coves.' },
      { title: 'Cook and eat', text: 'A hands-on cooking session with a local family, followed by dinner together.' },
    ],
    body: [
      'The Amalfi Coast is busiest in high summer. We aim for the shoulder seasons and keep the itinerary light.',
      'This is a sample itinerary: every journey is adjusted to your dates, pace and interests.',
    ],
    cover: '', wide: '', gallery: [], coordinates: { latitude: 40.6281, longitude: 14.484 }, tone: { from: '#f0ece3', to: '#d8cfae' }, published: true, order: 5,
  },
  {
    id: 'destination-bali-indonesia', slug: 'bali-indonesia', name: 'Bali', country: 'Indonesia', region: 'Southeast Asia',
    summary: 'Volcanic mornings, village craft and green inland paths beyond the shoreline.',
    duration: '7–10 nights', bestSeason: 'Apr–Jun, Sep–Oct', priceFrom: '',
    highlights: ['Early walks through rice-growing villages', 'A locally guided food and market visit', 'Waterfall and highland day trips', 'Rest days between inland and coast'],
    itinerary: [
      { title: 'Find your bearings', text: 'Settle into a small inland stay and take a gentle walk close to home.' },
      { title: 'A village morning', text: 'Explore the local area with a guide, then leave the afternoon unplanned.' },
      { title: 'Green hills and water', text: 'Choose a nearby waterfall or highland walk after checking local conditions.' },
      { title: 'Follow your appetite', text: 'Visit a market and make room for a long, locally recommended lunch.' },
    ],
    body: ['Bali is more than a coastline. A slower route between inland villages and the sea can make room for everyday life as well as the headline views.', 'This sample is a starting point, not a live availability or price quote. Ask locally about access, weather, and cultural etiquette.'],
    cover: '', wide: '', gallery: [], coordinates: { latitude: -8.4095, longitude: 115.1889 }, tone: { from: '#e6eadb', to: '#b7c5a5' }, published: true, order: 6,
  },
  {
    id: 'destination-iceland', slug: 'iceland', name: 'Iceland', country: 'Iceland', region: 'Northern Europe',
    summary: 'Wide volcanic horizons, hot-spring pauses and a road trip shaped by the weather.',
    duration: '7–10 nights', bestSeason: 'May–Sep for long days', priceFrom: '',
    highlights: ['A flexible south-coast route', 'Geothermal bathing with local guidance', 'Short walks between long drives', 'Time for weather and road-condition checks'],
    itinerary: [
      { title: 'Arrive in Reykjavík', text: 'Settle in, pick up supplies, and keep the first evening close to town.' },
      { title: 'Out along the coast', text: 'Drive a manageable section of the south coast with stops when conditions allow.' },
      { title: 'A day for the elements', text: 'Choose a short trail or geothermal pause after checking current access and weather.' },
      { title: 'Return with room to spare', text: 'Leave generous time for the drive back and a final unhurried evening.' },
    ],
    body: ['In Iceland, the conditions are part of the itinerary. Keep driving days realistic, check official road and weather updates, and treat this outline as flexible.', 'This sample does not include confirmed transport, opening hours, or current prices.'],
    cover: '', wide: '', gallery: [], coordinates: { latitude: 64.1466, longitude: -21.9426 }, tone: { from: '#e4e9e9', to: '#b3c2c5' }, published: true, order: 7,
  },
  {
    id: 'destination-meghalaya-india', slug: 'meghalaya-india', name: 'Meghalaya', country: 'India', region: 'South Asia',
    summary: 'Cloud forests, living-root bridges and rain-shaped journeys in the Khasi hills.',
    duration: '5–7 nights', bestSeason: 'Oct–Apr for drier trails', priceFrom: '',
    highlights: ['Walks with local guides', 'Living-root bridge visits planned around fitness and conditions', 'Waterfall viewpoints after checking access', 'A slower base in Shillong or nearby villages'],
    itinerary: [
      { title: 'Settle into the hills', text: 'Arrive with daylight to spare and keep the first walk close to your stay.' },
      { title: 'A guided bridge walk', text: 'Choose a route with a local guide and check trail conditions before setting out.' },
      { title: 'Water, weather, and rest', text: 'Take a flexible day for a waterfall visit or a quieter village afternoon.' },
      { title: 'A final hill morning', text: 'Make time for a local breakfast and a short walk before moving on.' },
    ],
    body: ['Meghalaya rewards a plan that respects the terrain and season. Trails can involve steep steps and changing conditions, so choose routes with local guidance.', 'This sample is illustrative; verify access, weather, and transport locally.'],
    cover: '', wide: '', gallery: [], coordinates: { latitude: 25.5788, longitude: 91.8933 }, tone: { from: '#e2e9dc', to: '#aec2a6' }, published: true, order: 8,
  },
  {
    id: 'destination-vietnam', slug: 'vietnam', name: 'Vietnam', country: 'Vietnam', region: 'Southeast Asia',
    summary: 'Lantern-lit lanes, regional kitchens and a north-to-south route with room to linger.',
    duration: '10–14 nights', bestSeason: 'Varies by region', priceFrom: '',
    highlights: ['Choose fewer regions for a gentler pace', 'Neighbourhood food walks', 'A countryside day with a local guide', 'Time to account for long-distance travel'],
    itinerary: [
      { title: 'Start in one neighbourhood', text: 'Arrive, recover from the journey, and make your first evening a short wander.' },
      { title: 'Taste the everyday', text: 'Follow a local food guide and leave space to return to a favourite stall.' },
      { title: 'Beyond the city', text: 'Take one countryside day trip rather than changing bases again.' },
      { title: 'Keep a day open', text: 'Browse a market or revisit a place you liked without adding another transfer.' },
    ],
    body: ['Vietnam spans several climates and regions. Choose a season and a smaller route before deciding how much ground to cover.', 'Travel times and regional conditions vary; check current local guidance before booking transport.'],
    cover: '', wide: '', gallery: [], coordinates: { latitude: 16.0471, longitude: 108.2068 }, tone: { from: '#e8e4d3', to: '#b4bd91' }, published: true, order: 9,
  },
  {
    id: 'destination-morocco', slug: 'morocco', name: 'Morocco', country: 'Morocco', region: 'North Africa',
    summary: 'Medina mornings, mountain air and a journey that makes space for local rhythm.',
    duration: '8–12 nights', bestSeason: 'Mar–May, Sep–Nov', priceFrom: '',
    highlights: ['A guided first walk through the medina', 'Small workshops and local craft', 'A mountain stay with local advice', 'Flexible travel between regions'],
    itinerary: [
      { title: 'Arrive and get oriented', text: 'Check in, meet your local host, and take a short guided walk.' },
      { title: 'Craft and conversation', text: 'Visit a workshop and ask before photographing people or their work.' },
      { title: 'A change of landscape', text: 'Travel to a nearby mountain base with generous time for the journey.' },
      { title: 'Leave a little unplanned', text: 'Return to a favourite street or let a local recommendation shape the day.' },
    ],
    body: ['Morocco is a collection of distinct regions rather than a single quick stop. Pick fewer bases, make time for local context, and confirm transport details before setting out.', 'This is a demo itinerary; route and seasonal advice should be checked with current local sources.'],
    cover: '', wide: '', gallery: [], coordinates: { latitude: 31.6295, longitude: -7.9811 }, tone: { from: '#eee1d1', to: '#cda783' }, published: true, order: 10,
  },
  {
    id: 'destination-swiss-alps', slug: 'swiss-alps', name: 'Swiss Alps', country: 'Switzerland', region: 'Northern Europe',
    summary: 'Mountain rail, valley walks and quiet mornings between alpine villages.',
    duration: '6–9 nights', bestSeason: 'Jun–Sep for many high trails', priceFrom: '',
    highlights: ['Choose a valley as a base', 'Check lift and trail conditions before walks', 'Use local rail for slower point-to-point days', 'Balance high viewpoints with restful afternoons'],
    itinerary: [
      { title: 'Arrive in the valley', text: 'Settle into your base and ask locally which routes are open.' },
      { title: 'A walk at your pace', text: 'Choose a marked route suited to your experience and current conditions.' },
      { title: 'Take the slower train', text: 'Make a rail day with one planned stop and an easy return.' },
      { title: 'A mountain morning', text: 'Check weather and access before setting out; keep a lowland alternative in mind.' },
    ],
    body: ['The Alps are best approached with flexible plans. Trail conditions, altitude, and mountain transport availability change through the year.', 'This sample is not a safety assessment; verify conditions with local authorities and operators.'],
    cover: '', wide: '', gallery: [], coordinates: { latitude: 46.0207, longitude: 7.7491 }, tone: { from: '#e5e9e8', to: '#b2c4c6' }, published: true, order: 11,
  },
  {
    id: 'destination-ladakh-india', slug: 'ladakh-india', name: 'Ladakh', country: 'India', region: 'South Asia',
    summary: 'High-desert monasteries and wide mountain roads, planned with altitude and acclimatisation in mind.',
    duration: '7–10 nights', bestSeason: 'Jun–Sep, subject to conditions', priceFrom: '',
    highlights: ['Build in acclimatisation time', 'Travel with locally informed guides', 'Keep road days flexible', 'Respect monastery customs and photography guidance'],
    itinerary: [
      { title: 'Arrive and acclimatise', text: 'Keep the first days light and follow current medical and local altitude guidance.' },
      { title: 'A gentle monastery visit', text: 'Choose a nearby visit with a local guide and allow time for rest.' },
      { title: 'A flexible road day', text: 'Check current route conditions and avoid overloading the day.' },
      { title: 'A slower high-desert morning', text: 'Leave plans open to how you are feeling and what local conditions allow.' },
    ],
    body: ['Ladakh is a high-altitude destination. Acclimatisation, current health advice, road conditions, and local guidance matter more than a packed itinerary.', 'The suggested outline is not medical or safety advice. Confirm current conditions with qualified local sources.'],
    cover: '', wide: '', gallery: [], coordinates: { latitude: 34.1526, longitude: 77.5771 }, tone: { from: '#ece4d7', to: '#c9ae8b' }, published: true, order: 12,
  },
]

export const seedPosts = (): Post[] => [
  {
    id: 'post-how-to-choose-when-to-go', slug: 'how-to-choose-when-to-go', title: 'How to choose when to go',
    excerpt: 'The best month is rarely the most popular one. A way to think about timing.', date: '2026-09-18', cover: '', published: true,
    body: [
      'The popular month is popular for a reason, but it comes with crowds and higher prices. The weeks just before or after often give you most of the good weather with far more space.',
      'Start with what you most want to see or do, then look at what the weather and crowds are like around it. A good planner will tell you honestly when a place is not at its best.',
      'If your dates are fixed, say so early. It is easier to shape a journey around constraints than to discover them late.',
    ],
  },
  {
    id: 'post-the-case-for-fewer-places', slug: 'the-case-for-fewer-places', title: 'The case for fewer places',
    excerpt: 'Why spending longer in one region usually makes a better trip.', date: '2026-08-12', cover: '', published: true,
    body: [
      'It is tempting to fit in everything. But every move between places costs half a day, and the tiredness it brings changes how much you enjoy the next stop.',
      'Fewer bases mean more time for the unplanned parts of a trip: the café you return to, the street you wander twice. Those are usually the memories that last.',
    ],
  },
  {
    id: 'post-what-to-tell-us-before-we-plan', slug: 'what-to-tell-us-before-we-plan', title: 'What to tell us before we plan a trip',
    excerpt: 'Five things that help us design a journey you will actually enjoy.', date: '2026-07-04', cover: '', published: true,
    body: [
      'Tell us who is travelling and how everyone likes to spend a day. A walker and a museum-lover can share a trip, but the pace needs to work for both.',
      'Tell us what you have loved on past trips, and what you did not. That is more useful than any list of places.',
    ],
  },
]
